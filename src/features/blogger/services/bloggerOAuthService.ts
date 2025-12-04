import { apiKeyService } from '@/features/settings/services'
import { supabase } from '@/shared/services/supabase'

const GOOGLE_OAUTH_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const BLOGGER_SCOPE = 'https://www.googleapis.com/auth/blogger'

export interface OAuthToken {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope?: string
  expires_at?: number // 토큰 만료 시간 (타임스탬프)
}

/**
 * Google OAuth 2.0 인증 서비스
 */
export const bloggerOAuthService = {
  /**
   * OAuth 인증 URL 생성
   */
  async getAuthUrl(): Promise<string> {
    const apiKeys = await apiKeyService.getApiKeys()
    if (!apiKeys?.google_client_id) {
      throw new Error('Google Client ID가 설정되지 않았습니다. 설정 페이지에서 입력해주세요.')
    }

    const redirectUri = `${window.location.origin}/blogger/oauth/callback`
    const state = crypto.randomUUID() // CSRF 방지용 state
    const params = new URLSearchParams({
      client_id: apiKeys.google_client_id,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: BLOGGER_SCOPE,
      access_type: 'offline', // refresh token 받기 위해 필요
      prompt: 'consent', // 항상 동의 화면 표시 (refresh token 받기 위해)
      state,
    })

    // state를 sessionStorage에 저장 (콜백에서 검증용)
    sessionStorage.setItem('oauth_state', state)

    return `${GOOGLE_OAUTH_AUTH_URL}?${params.toString()}`
  },

  /**
   * Authorization Code를 Access Token으로 교환
   */
  async exchangeCodeForToken(code: string): Promise<OAuthToken> {
    const apiKeys = await apiKeyService.getApiKeys()
    if (!apiKeys?.google_client_id || !apiKeys?.google_client_secret) {
      throw new Error('Google Client ID 또는 Client Secret이 설정되지 않았습니다.')
    }

    const redirectUri = `${window.location.origin}/blogger/oauth/callback`

    const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: apiKeys.google_client_id,
        client_secret: apiKeys.google_client_secret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`토큰 교환 실패: ${error.error || response.statusText}`)
    }

    const tokenData: OAuthToken = await response.json()
    
    // expires_at 계산 (현재 시간 + expires_in 초)
    tokenData.expires_at = Date.now() + (tokenData.expires_in * 1000)

    return tokenData
  },

  /**
   * Refresh Token으로 Access Token 갱신
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthToken> {
    const apiKeys = await apiKeyService.getApiKeys()
    if (!apiKeys?.google_client_id || !apiKeys?.google_client_secret) {
      throw new Error('Google Client ID 또는 Client Secret이 설정되지 않았습니다.')
    }

    const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: apiKeys.google_client_id,
        client_secret: apiKeys.google_client_secret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`토큰 갱신 실패: ${error.error || response.statusText}`)
    }

    const tokenData: OAuthToken = await response.json()
    tokenData.expires_at = Date.now() + (tokenData.expires_in * 1000)

    return tokenData
  },

  /**
   * OAuth 토큰 저장 (Supabase)
   * 참고: blog_id와 blog_name은 나중에 블로그 목록을 가져온 후 업데이트
   */
  async saveToken(token: OAuthToken, blogId?: string, blogName?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // 기존 레코드 확인
    const { data: existing } = await supabase
      .from('blogger_accounts')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const tokenData = {
      user_id: user.id,
      blog_id: blogId || 'temp', // 임시 값, 나중에 업데이트
      blog_name: blogName || 'Google Blogger', // 임시 값
      access_token: token.access_token,
      refresh_token: token.refresh_token || '',
      expires_at: token.expires_at ? new Date(token.expires_at).toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    if (existing) {
      // 업데이트
      const { error } = await supabase
        .from('blogger_accounts')
        .update(tokenData)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating OAuth token:', error)
        throw error
      }
    } else {
      // 삽입
      const { error } = await supabase
        .from('blogger_accounts')
        .insert(tokenData)

      if (error) {
        console.error('Error saving OAuth token:', error)
        throw error
      }
    }
  },

  /**
   * 저장된 OAuth 토큰 조회
   */
  async getToken(): Promise<OAuthToken | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('blogger_accounts')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting OAuth token:', error)
      return null
    }

    if (!data || !data.access_token) {
      return null
    }

    // 토큰이 만료되었는지 확인
    if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
      // Refresh token으로 갱신 시도
      if (data.refresh_token) {
        try {
          const newToken = await this.refreshAccessToken(data.refresh_token)
          await this.saveToken(newToken)
          return newToken
        } catch (error) {
          console.error('Error refreshing token:', error)
          return null
        }
      }
      return null
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_at 
        ? Math.floor((new Date(data.expires_at).getTime() - Date.now()) / 1000)
        : 3600,
      token_type: 'Bearer',
      scope: BLOGGER_SCOPE,
      expires_at: data.expires_at ? new Date(data.expires_at).getTime() : undefined,
    }
  },

  /**
   * OAuth 토큰 삭제 (연동 해제)
   */
  async revokeToken(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('blogger_accounts')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error revoking token:', error)
      throw error
    }
  },
}

