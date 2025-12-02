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

    // 타임아웃 설정 (3초 후 강제로 로딩 해제 - 안전장치)
    loadingTimeout = setTimeout(() => {
      if (isMounted && !isInitialized) {
        console.warn('Auth initialization timeout - forcing loading state to false')
        setIsLoading(false)
        isInitialized = true
      }
    }, 3000)

    // 초기 세션 확인
    const initializeAuth = async () => {
      try {
        // 먼저 세션 확인
        const session = await authService.getSession()
        
        if (session) {
          // 세션이 있으면 사용자 정보 가져오기
          const currentUser = await authService.getCurrentUser()
          if (isMounted) {
            setUser(currentUser)
            setIsAuthenticated(!!currentUser)
          }
        } else {
          // 세션이 없으면 인증되지 않은 상태
          if (isMounted) {
            setUser(null)
            setIsAuthenticated(false)
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        // 에러 발생 시에도 로딩 상태 해제
        if (isMounted) {
          setUser(null)
          setIsAuthenticated(false)
        }
      } finally {
        // 항상 로딩 상태 해제
        if (isMounted) {
          isInitialized = true
          setIsLoading(false)
          if (loadingTimeout) {
            clearTimeout(loadingTimeout)
            loadingTimeout = null
          }
        }
      }
    }

    // 즉시 초기화 시작
    initializeAuth()

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        try {
          if (session) {
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
          if (isMounted && !isInitialized) {
            // 초기화가 완료되지 않았을 때만 로딩 상태 업데이트
            isInitialized = true
            setIsLoading(false)
            if (loadingTimeout) clearTimeout(loadingTimeout)
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

