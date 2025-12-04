import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, CheckCircle2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { getApiGuide } from '../data/apiGuides'
import type { ApiKeyType } from '../types'

export function ApiGuidePage() {
  const { apiKeyType } = useParams<{ apiKeyType: string }>()
  const guide = apiKeyType ? getApiGuide(apiKeyType as ApiKeyType) : null

  if (!guide) {
    return (
      <div className="space-y-6">
        <div>
          <Link to="/settings">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              설정으로 돌아가기
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">API 가이드를 찾을 수 없습니다</h1>
          <p className="text-muted-foreground mt-2">
            요청하신 API 가이드가 존재하지 않습니다.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/settings">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            설정으로 돌아가기
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{guide.name} 발급 가이드</h1>
        <p className="text-muted-foreground mt-2">{guide.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>발급 방법</CardTitle>
          <CardDescription>
            아래 단계를 따라 {guide.name}을 발급받으세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 단계별 안내 */}
            <div className="space-y-4">
              {guide.steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm leading-relaxed">{step}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 링크 버튼 */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <a href={guide.signUpUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  회원가입/로그인
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
              {guide.apiKeyUrl && (
                <a href={guide.apiKeyUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    API 키 발급 페이지
                    <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                </a>
              )}
              {guide.documentationUrl && (
                <a href={guide.documentationUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    공식 문서
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              )}
            </div>

            {/* 중요 안내 */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    중요 안내
                  </p>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li>API 키는 안전하게 보관하세요. 절대 공개되지 않도록 주의하세요.</li>
                    <li>
                      {guide.isRequired
                        ? '이 API 키는 필수입니다. 서비스 사용을 위해 반드시 발급받아야 합니다.'
                        : '이 API 키는 선택사항입니다. 필요에 따라 발급받으세요.'}
                    </li>
                    <li>API 키 발급 후 설정 페이지로 돌아가서 입력하세요.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 추가 중요 안내 (importantNotes) */}
            {guide.importantNotes && guide.importantNotes.length > 0 && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      ⚠️ 추가 확인 사항
                    </p>
                    <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                      {guide.importantNotes.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

