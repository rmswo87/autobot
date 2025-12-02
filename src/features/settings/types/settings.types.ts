export interface UserApiKeys {
  id?: string
  user_id?: string
  google_client_id?: string | null
  google_client_secret?: string | null
  google_api_key?: string | null
  suno_api_key?: string | null
  context7_api_key?: string | null
  openai_api_key?: string | null
  created_at?: string
  updated_at?: string
}

export interface ApiKeyFormData {
  google_client_id: string
  google_client_secret: string
  google_api_key: string
  suno_api_key: string
  context7_api_key: string
  openai_api_key?: string
}

