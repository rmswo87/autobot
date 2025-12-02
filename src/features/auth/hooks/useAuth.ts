import { useState, useEffect } from 'react'
import { supabase } from '@/shared/services/supabase'
import { authService } from '../services'
import type { User } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // 초기 사용자 로드
    loadUser()

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          if (session) {
            const currentUser = await authService.getCurrentUser()
            setUser(currentUser)
            setIsAuthenticated(!!currentUser)
          } else {
            setUser(null)
            setIsAuthenticated(false)
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
          setUser(null)
          setIsAuthenticated(false)
        } finally {
          setIsLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      setIsAuthenticated(!!currentUser)
    } catch (error) {
      console.error('Failed to load user:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await authService.login({ email, password })
      await loadUser()
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name?: string) => {
    setIsLoading(true)
    try {
      await authService.signup({ email, password, name })
      await loadUser()
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setIsLoading(true)
    try {
      await authService.signInWithGoogle()
      // OAuth는 리다이렉트되므로 여기서는 처리하지 않음
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGithub = async () => {
    setIsLoading(true)
    try {
      await authService.signInWithGithub()
      // OAuth는 리다이렉트되므로 여기서는 처리하지 않음
    } catch (error) {
      console.error('Github login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithKakao = async () => {
    setIsLoading(true)
    try {
      await authService.signInWithKakao()
      // OAuth는 리다이렉트되므로 여기서는 처리하지 않음
    } catch (error) {
      console.error('Kakao login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    signInWithGoogle,
    signInWithGithub,
    signInWithKakao,
  }
}

