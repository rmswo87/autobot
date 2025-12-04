import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/contexts'
import { LoadingSpinner } from './LoadingSpinner'

interface AuthRedirectProps {
  children: React.ReactNode
  redirectTo?: string
}

/**
 * 인증된 사용자를 자동으로 리다이렉트하는 컴포넌트
 * 랜딩페이지에서 사용하여 인증된 사용자를 대시보드로 보냄
 */
export function AuthRedirect({ 
  children, 
  redirectTo = '/dashboard' 
}: AuthRedirectProps) {
  const { isAuthenticated, isLoading } = useAuthContext()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}

