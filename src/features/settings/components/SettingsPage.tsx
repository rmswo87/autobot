import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/contexts'
import { apiKeyService } from '../services'
import type { ApiKeyFormData } from '../types'
import { Button } from '@/shared/components/ui'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Label } from '@/shared/components/ui/label'
import { HelpCircle, Eye, EyeOff } from 'lucide-react'

export function SettingsPage() {
  useAuthContext() // 인증 확인용
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<ApiKeyFormData>({
    google_client_id: '',
    google_client_secret: '',
    google_api_key: '',
    suno_api_key: '',
    context7_api_key: '',
    openai_api_key: '',
  })

  // 각 API 키 필드의 보이기/숨기기 상태
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({
    google_api_key: false,
    google_client_id: false,
    google_client_secret: false,
    suno_api_key: false,
    context7_api_key: false,
    openai_api_key: false,
  })

  const toggleShowApiKey = (key: string) => {
    setShowApiKeys((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const keys = await apiKeyService.getApiKeys()
      if (keys) {
        setFormData({
          google_client_id: keys.google_client_id || '',
          google_client_secret: keys.google_client_secret || '',
          google_api_key: keys.google_api_key || '',
          suno_api_key: keys.suno_api_key || '',
          context7_api_key: keys.context7_api_key || '',
          openai_api_key: keys.openai_api_key || '',
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API 키를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Google API Key가 입력된 경우 실제 검증 수행
      if (formData.google_api_key && formData.google_api_key.trim().length > 0) {
        const validation = await apiKeyService.validateGoogleApiKey(formData.google_api_key)
        if (!validation.valid) {
          setError(validation.message || 'Google API Key가 유효하지 않습니다.')
          setIsSaving(false)
          return
        }
      }

      // 다른 API 키들의 기본 형식 검증
      if (formData.suno_api_key && formData.suno_api_key.trim().length > 0) {
        const validation = await apiKeyService.validateApiKey('suno_api_key', formData.suno_api_key)
        if (!validation.valid) {
          setError(validation.message || 'Suno API Key 형식이 올바르지 않습니다.')
          setIsSaving(false)
          return
        }
      }

      if (formData.context7_api_key && formData.context7_api_key.trim().length > 0) {
        const validation = await apiKeyService.validateApiKey('context7_api_key', formData.context7_api_key)
        if (!validation.valid) {
          setError(validation.message || 'Context7 API Key 형식이 올바르지 않습니다.')
          setIsSaving(false)
          return
        }
      }

      if (formData.openai_api_key && formData.openai_api_key.trim().length > 0) {
        const validation = await apiKeyService.validateApiKey('openai_api_key', formData.openai_api_key)
        if (!validation.valid) {
          setError(validation.message || 'OpenAI API Key 형식이 올바르지 않습니다.')
          setIsSaving(false)
          return
        }
      }

      await apiKeyService.saveApiKeys(formData)
      setSuccess('API 키가 성공적으로 저장되었습니다.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API 키 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: keyof ApiKeyFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">설정</h1>
        <p className="text-muted-foreground mt-2">
          API 키를 설정하여 서비스를 사용하세요.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>API 키 관리</CardTitle>
          <CardDescription>
            각 API 키는 암호화되어 저장됩니다. 서비스 사용을 위해 필요한 API 키를 입력하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="google_api_key">Google API Key</Label>
                  <Link to="/settings/api-guide/google_api_key">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      title="발급 가이드 보기"
                    >
                      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="google_api_key"
                    type={showApiKeys.google_api_key ? 'text' : 'password'}
                    value={formData.google_api_key}
                    onChange={handleChange('google_api_key')}
                    placeholder="Google API Key를 입력하세요"
                    disabled={isSaving}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => toggleShowApiKey('google_api_key')}
                    disabled={isSaving}
                  >
                    {showApiKeys.google_api_key ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="google_client_id">Google Client ID</Label>
                  <Link to="/settings/api-guide/google_client_id">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      title="발급 가이드 보기"
                    >
                      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="google_client_id"
                    type={showApiKeys.google_client_id ? 'text' : 'password'}
                    value={formData.google_client_id}
                    onChange={handleChange('google_client_id')}
                    placeholder="Google Client ID를 입력하세요"
                    disabled={isSaving}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => toggleShowApiKey('google_client_id')}
                    disabled={isSaving}
                  >
                    {showApiKeys.google_client_id ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="google_client_secret">Google Client Secret</Label>
                  <Link to="/settings/api-guide/google_client_secret">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      title="발급 가이드 보기"
                    >
                      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="google_client_secret"
                    type={showApiKeys.google_client_secret ? 'text' : 'password'}
                    value={formData.google_client_secret}
                    onChange={handleChange('google_client_secret')}
                    placeholder="Google Client Secret을 입력하세요"
                    disabled={isSaving}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => toggleShowApiKey('google_client_secret')}
                    disabled={isSaving}
                  >
                    {showApiKeys.google_client_secret ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="suno_api_key">Suno API Key</Label>
                  <Link to="/settings/api-guide/suno_api_key">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      title="발급 가이드 보기"
                    >
                      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="suno_api_key"
                    type={showApiKeys.suno_api_key ? 'text' : 'password'}
                    value={formData.suno_api_key}
                    onChange={handleChange('suno_api_key')}
                    placeholder="Suno API Key를 입력하세요"
                    disabled={isSaving}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => toggleShowApiKey('suno_api_key')}
                    disabled={isSaving}
                  >
                    {showApiKeys.suno_api_key ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="context7_api_key">Context7 API Key</Label>
                  <Link to="/settings/api-guide/context7_api_key">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      title="발급 가이드 보기"
                    >
                      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="context7_api_key"
                    type={showApiKeys.context7_api_key ? 'text' : 'password'}
                    value={formData.context7_api_key}
                    onChange={handleChange('context7_api_key')}
                    placeholder="Context7 API Key를 입력하세요"
                    disabled={isSaving}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => toggleShowApiKey('context7_api_key')}
                    disabled={isSaving}
                  >
                    {showApiKeys.context7_api_key ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="openai_api_key">OpenAI API Key (선택사항)</Label>
                  <Link to="/settings/api-guide/openai_api_key">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      title="발급 가이드 보기"
                    >
                      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="openai_api_key"
                    type={showApiKeys.openai_api_key ? 'text' : 'password'}
                    value={formData.openai_api_key}
                    onChange={handleChange('openai_api_key')}
                    placeholder="OpenAI API Key를 입력하세요"
                    disabled={isSaving}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => toggleShowApiKey('openai_api_key')}
                    disabled={isSaving}
                  >
                    {showApiKeys.openai_api_key ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

