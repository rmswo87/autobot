import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { bloggerOAuthService } from '../services'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export function BloggerOAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        // 에러 확인
        if (error) {
          setStatus('error')
          setErrorMessage(error === 'access_denied' 
            ? '인증이 취소되었습니다.' 
            : `인증 오류: ${error}`)
          return
        }

        // State 검증 (CSRF 방지)
        const savedState = sessionStorage.getItem('oauth_state')
        if (!state || state !== savedState) {
          setStatus('error')
          setErrorMessage('인증 상태가 일치하지 않습니다. 다시 시도해주세요.')
          return
        }

        // Code 확인
        if (!code) {
          setStatus('error')
          setErrorMessage('인증 코드를 받지 못했습니다.')
          return
        }

        // Authorization Code를 Access Token으로 교환
        const token = await bloggerOAuthService.exchangeCodeForToken(code)
        
        // 토큰 저장
        await bloggerOAuthService.saveToken(token)

        // State 제거
        sessionStorage.removeItem('oauth_state')

        setStatus('success')

        // 2초 후 블로거 페이지로 리다이렉트
        setTimeout(() => {
          navigate('/blogger')
        }, 2000)
      } catch (error) {
        console.error('OAuth callback error:', error)
        setStatus('error')
        setErrorMessage(
          error instanceof Error 
            ? error.message 
            : '인증 처리 중 오류가 발생했습니다.'
        )
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Google 인증 처리 중</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                인증을 처리하고 있습니다...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <p className="text-sm text-green-600 font-medium">
                인증이 완료되었습니다!
              </p>
              <p className="text-xs text-muted-foreground">
                블로거 페이지로 이동합니다...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <XCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-destructive font-medium">
                인증 실패
              </p>
              <p className="text-xs text-muted-foreground text-center">
                {errorMessage}
              </p>
              <Button
                onClick={() => navigate('/blogger')}
                variant="outline"
                className="mt-4"
              >
                블로거 페이지로 돌아가기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

