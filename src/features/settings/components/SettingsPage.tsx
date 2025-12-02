import { useState, useEffect } from 'react'
import { useAuthContext } from '@/features/auth/contexts'
import { apiKeyService } from '../services'
import type { ApiKeyFormData } from '../types'
import { Button } from '@/shared/components/ui'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Label } from '@/shared/components/ui/label'

export function SettingsPage() {
  const { user } = useAuthContext()
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
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>설정</CardTitle>
          <CardDescription>
            API 키를 설정하여 서비스를 사용하세요. 각 API 키는 암호화되어 저장됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google_api_key">Google API Key</Label>
                <Input
                  id="google_api_key"
                  type="password"
                  value={formData.google_api_key}
                  onChange={handleChange('google_api_key')}
                  placeholder="Google API Key를 입력하세요"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_client_id">Google Client ID</Label>
                <Input
                  id="google_client_id"
                  type="password"
                  value={formData.google_client_id}
                  onChange={handleChange('google_client_id')}
                  placeholder="Google Client ID를 입력하세요"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_client_secret">Google Client Secret</Label>
                <Input
                  id="google_client_secret"
                  type="password"
                  value={formData.google_client_secret}
                  onChange={handleChange('google_client_secret')}
                  placeholder="Google Client Secret을 입력하세요"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="suno_api_key">Suno API Key</Label>
                <Input
                  id="suno_api_key"
                  type="password"
                  value={formData.suno_api_key}
                  onChange={handleChange('suno_api_key')}
                  placeholder="Suno API Key를 입력하세요"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="context7_api_key">Context7 API Key</Label>
                <Input
                  id="context7_api_key"
                  type="password"
                  value={formData.context7_api_key}
                  onChange={handleChange('context7_api_key')}
                  placeholder="Context7 API Key를 입력하세요"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="openai_api_key">OpenAI API Key (선택사항)</Label>
                <Input
                  id="openai_api_key"
                  type="password"
                  value={formData.openai_api_key}
                  onChange={handleChange('openai_api_key')}
                  placeholder="OpenAI API Key를 입력하세요"
                  disabled={isSaving}
                />
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

