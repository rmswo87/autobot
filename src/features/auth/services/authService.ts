import { supabase, validateSupabaseConfig } from '@/shared/services/supabase'
import type { LoginCredentials, SignupCredentials, User } from '../types'

export const authService = {
  async login(credentials: LoginCredentials) {
    console.log('[DEBUG] login() called:', {
      email: credentials.email,
      hasPassword: !!credentials.password,
    })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      console.log('[DEBUG] login() result:', {
        hasData: !!data,
        hasError: !!error,
        errorMessage: error?.message,
        userId: data?.user?.id,
      })

      if (error) {
        console.error('[ERROR] login() error:', error)
        // 사용자 친화적인 에러 메시지로 변환
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.')
        }
        throw new Error(error.message || '로그인에 실패했습니다.')
      }
      
      console.log('[DEBUG] login() successful')
      return data
    } catch (error) {
      console.error('[ERROR] login() exception:', error)
      throw error
    }
  },

  async signup(credentials: SignupCredentials) {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
        },
      },
    })

    if (error) {
      // 사용자 친화적인 에러 메시지로 변환
      if (error.message.includes('already registered')) {
        throw new Error('이미 등록된 이메일입니다.')
      }
      if (error.message.includes('Password')) {
        throw new Error('비밀번호는 최소 6자 이상이어야 합니다.')
      }
      if (error.message.includes('email')) {
        throw new Error('유효한 이메일 주소를 입력해주세요.')
      }
      throw new Error(error.message || '회원가입에 실패했습니다.')
    }
    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser(): Promise<User | null> {
    const startTime = Date.now()
    console.log('[DEBUG] getCurrentUser() called', {
      timestamp: new Date().toISOString(),
    })
    
    try {
      console.log('[DEBUG] Calling supabase.auth.getUser()...')
      
      // 타임아웃 설정 (5초)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('getUser() timeout after 5 seconds'))
        }, 5000)
      })
      
      const getUserPromise = supabase.auth.getUser()
      console.log('[DEBUG] getUser() promise created, waiting for response...')
      
      // Promise.race로 타임아웃과 함께 실행
      const result = await Promise.race([getUserPromise, timeoutPromise])
      const { data: { user }, error } = result
      const duration = Date.now() - startTime
      
      console.log('[DEBUG] getCurrentUser() result:', {
        hasUser: !!user,
        hasError: !!error,
        errorMessage: error?.message || 'no-error',
        errorCode: error?.status || 'no-code',
        userId: user?.id || 'no-id',
        userEmail: user?.email || 'no-email',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      })
      
      if (error) {
        console.log('[DEBUG] getCurrentUser() - Error received:', {
          message: error.message,
          status: error.status,
          name: error.name,
        })
        
        // 인증되지 않은 경우는 에러가 아니라 null 반환
        if (error.message.includes('JWT') || error.message.includes('session') || error.message.includes('token')) {
          console.log('[DEBUG] getCurrentUser() - No valid session/token, returning null')
          return null
        }
        console.error('[ERROR] getCurrentUser() error:', {
          error,
          message: error.message,
          status: error.status,
        })
        throw error
      }
      
      if (!user) {
        console.log('[DEBUG] getCurrentUser() - No user in response, returning null')
        return null
      }
      
      // Supabase user 객체를 우리의 User 타입으로 변환
      const transformedUser = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.user_metadata?.full_name || undefined,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString(),
      }
      
      console.log('[DEBUG] getCurrentUser() - Returning user:', {
        id: transformedUser.id,
        email: transformedUser.email,
        hasName: !!transformedUser.name,
      })
      
      console.log('[DEBUG] getCurrentUser() - Successfully transformed user, returning:', {
        id: transformedUser.id,
        email: transformedUser.email,
        hasName: !!transformedUser.name,
        timestamp: new Date().toISOString(),
      })
      
      return transformedUser
    } catch (error) {
      const duration = Date.now() - startTime
      console.error('[ERROR] getCurrentUser() exception:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'unknown-error',
        errorName: error instanceof Error ? error.name : 'unknown',
        errorStack: error instanceof Error ? error.stack : 'no-stack',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      })
      
      // 타임아웃 에러인 경우 특별 처리
      if (error instanceof Error && error.message.includes('timeout')) {
        console.error('[ERROR] getUser() request timed out - possible network issue')
      }
      
      return null
    }
  },

  async getSession() {
    console.log('[DEBUG] getSession() called')
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('[DEBUG] getSession() result:', {
        hasSession: !!session,
        hasError: !!error,
        errorMessage: error?.message,
        sessionUserId: session?.user?.id,
      })
      
      if (error) {
        console.error('[ERROR] getSession() error:', error)
        throw error
      }
      return session
    } catch (error) {
      console.error('[ERROR] getSession() exception:', error)
      throw error
    }
  },

  async signInWithGoogle() {
    validateSupabaseConfig()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) throw error
    return data
  },

  async signInWithGithub() {
    validateSupabaseConfig()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) throw error
    return data
  },

  async signInWithKakao() {
    validateSupabaseConfig()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) throw error
    return data
  },
}

