import { supabase } from '@/shared/services/supabase'
import type { UserApiKeys, ApiKeyFormData } from '../types'

export const apiKeyService = {
  async getApiKeys(): Promise<UserApiKeys | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_api_keys')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async saveApiKeys(keys: ApiKeyFormData): Promise<UserApiKeys> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_api_keys')
      .upsert({
        user_id: user.id,
        ...keys,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * API 키 유효성 검증
   * @param type API 키 타입 ('google_api_key', 'suno_api_key', 'context7_api_key', 'openai_api_key')
   * @param key API 키 값
   * @returns 유효성 검증 결과
   */
  async validateApiKey(type: string, key: string): Promise<{ valid: boolean; message?: string }> {
    if (!key || key.trim().length === 0) {
      return { valid: false, message: 'API 키를 입력해주세요.' }
    }

    // 기본 길이 검증
    if (key.trim().length < 10) {
      return { valid: false, message: 'API 키가 너무 짧습니다.' }
    }

    // 타입별 형식 검증
    switch (type) {
      case 'google_api_key':
        // Google API Key는 보통 "AIzaSy"로 시작하고 39자 정도
        if (!/^AIzaSy[0-9A-Za-z_-]{33}$/.test(key.trim())) {
          // 형식이 맞지 않아도 실제 API 호출로 검증하도록 허용
          // return { valid: false, message: 'Google API Key 형식이 올바르지 않습니다.' }
        }
        break

      case 'suno_api_key':
        // Suno API Key는 32자 hex 문자열
        if (!/^[a-f0-9]{32}$/i.test(key.trim())) {
          return { valid: false, message: 'Suno API Key 형식이 올바르지 않습니다. (32자 hex 문자열)' }
        }
        break

      case 'context7_api_key':
        // Context7 API Key는 "ctx7sk-"로 시작
        if (!/^ctx7sk-[a-f0-9-]{36}$/i.test(key.trim())) {
          return { valid: false, message: 'Context7 API Key 형식이 올바르지 않습니다.' }
        }
        break

      case 'openai_api_key':
        // OpenAI API Key는 "sk-"로 시작
        if (!/^sk-[a-zA-Z0-9]{20,}$/.test(key.trim())) {
          return { valid: false, message: 'OpenAI API Key 형식이 올바르지 않습니다.' }
        }
        break
    }

    return { valid: true }
  },

  /**
   * Google API Key 실제 검증 (API 호출로 검증)
   */
  async validateGoogleApiKey(apiKey: string): Promise<{ valid: boolean; message?: string }> {
    try {
      // 간단한 API 호출로 검증 (Blogger API의 users/self/blogs 엔드포인트 사용)
      const response = await fetch(
        `https://www.googleapis.com/blogger/v3/users/self/blogs?key=${apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status === 401 || response.status === 403) {
        return {
          valid: false,
          message: 'API 키가 유효하지 않거나 권한이 없습니다. Google Cloud Console에서 API 키를 확인해주세요.',
        }
      }

      if (response.status === 400) {
        const error = await response.json().catch(() => ({}))
        return {
          valid: false,
          message: error.error?.message || 'API 키 형식이 올바르지 않습니다.',
        }
      }

      if (!response.ok) {
        return {
          valid: false,
          message: `API 키 검증 중 오류가 발생했습니다. (상태 코드: ${response.status})`,
        }
      }

      return { valid: true }
    } catch (error) {
      console.error('Error validating Google API key:', error)
      return {
        valid: false,
        message: 'API 키 검증 중 네트워크 오류가 발생했습니다.',
      }
    }
  },
}

