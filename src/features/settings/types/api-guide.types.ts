/**
 * API 가이드 관련 타입 정의
 */

export type ApiKeyType =
  | 'google_api_key'
  | 'google_client_id'
  | 'google_client_secret'
  | 'suno_api_key'
  | 'context7_api_key'
  | 'openai_api_key'

export interface ApiGuide {
  id: ApiKeyType
  name: string
  description: string
  steps: string[]
  importantNotes?: string[] // 중요 안내 사항
  signUpUrl: string
  apiKeyUrl?: string
  documentationUrl?: string
  isRequired: boolean
}

