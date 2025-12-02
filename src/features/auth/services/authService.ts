import { supabase, validateSupabaseConfig } from '@/shared/services/supabase'
import type { LoginCredentials, SignupCredentials, User } from '../types'

export const authService = {
  async login(credentials: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      // 사용자 친화적인 에러 메시지로 변환
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.')
      }
      throw new Error(error.message || '로그인에 실패했습니다.')
    }
    return data
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
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        // 인증되지 않은 경우는 에러가 아니라 null 반환
        if (error.message.includes('JWT') || error.message.includes('session')) {
          return null
        }
        throw error
      }
      
      if (!user) return null
      
      // Supabase user 객체를 우리의 User 타입으로 변환
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.user_metadata?.full_name || undefined,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString(),
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
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

