import { supabase } from '@/shared/services/supabase'
import type { UserApiKeys, ApiKeyFormData } from '../types'

export const apiKeyService = {
  async getApiKeys(): Promise<UserApiKeys | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_api_keys')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async saveApiKeys(keys: ApiKeyFormData): Promise<UserApiKeys> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_api_keys')
      .upsert({
        user_id: user.id,
        ...keys,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async validateApiKey(type: string, key: string): Promise<boolean> {
    // TODO: 각 API 키 유효성 검증 로직 구현
    // 현재는 기본 검증만 수행
    return key.length > 0
  },
}

