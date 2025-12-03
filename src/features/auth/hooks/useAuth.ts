import { useState, useEffect } from 'react'
import { supabase } from '@/shared/services/supabase'
import { authService } from '../services'
import type { User } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let isMounted = true
    let loadingTimeout: NodeJS.Timeout | null = null
    let isInitialized = false

    // 타임아웃 설정 (10초 후 강제로 로딩 해제 - 안전장치)
    loadingTimeout = setTimeout(() => {
      if (isMounted && !isInitialized) {
        console.warn('Auth initialization timeout - forcing loading state to false')
        setIsLoading(false)
        isInitialized = true
      }
    }, 10000)

    // 인증 상태 변경 감지 (초기 이벤트 포함)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        try {
          if (session) {
            // 세션이 있으면 사용자 정보 가져오기
            const currentUser = await authService.getCurrentUser()
            if (isMounted) {
              setUser(currentUser)
              setIsAuthenticated(!!currentUser)
            }
            
            // OAuth 로그인 성공 시 알림 (SIGNED_IN 이벤트만, OAuth에서 온 경우)
            if (event === 'SIGNED_IN') {
              // URL에 hash fragment가 있으면 OAuth 콜백임
              const isOAuthCallback = window.location.hash.includes('access_token') || 
                                     window.location.search.includes('code')
              
              if (isOAuthCallback) {
                // 동적 import로 toast 사용
                const { toast } = await import('sonner')
                toast.success('로그인 성공!', {
                  description: '환영합니다!',
                  duration: 2000,
                })
              }
            }
          } else {
            // 세션이 없으면 인증되지 않은 상태
            if (isMounted) {
              setUser(null)
              setIsAuthenticated(false)
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
          if (isMounted) {
            setUser(null)
            setIsAuthenticated(false)
          }
        } finally {
          // 초기화 완료 처리
          if (isMounted && !isInitialized) {
            isInitialized = true
            setIsLoading(false)
            if (loadingTimeout) {
              clearTimeout(loadingTimeout)
              loadingTimeout = null
            }
          }
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
      if (loadingTimeout) clearTimeout(loadingTimeout)
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

