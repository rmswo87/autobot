import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 환경 변수 검증
const isProduction = import.meta.env.PROD

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 
    '🚨 Supabase environment variables are missing!\n\n' +
    'Please set the following environment variables:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY\n\n' +
    (isProduction 
      ? 'For Vercel: Go to Settings > Environment Variables and add them.\n' +
        'Then redeploy your project.'
      : 'For local: Create .env.local file with these variables.')
  
  console.error(errorMessage)
  
  // 프로덕션에서는 에러를 던져서 명확히 알림
  if (isProduction) {
    throw new Error('Supabase environment variables are required in production')
  }
  
  // 개발 환경에서는 경고만
  console.warn('⚠️ Using placeholder values. Authentication will not work.')
}

// 환경 변수가 없으면 더미 클라이언트 생성 (개발 환경에서만)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// 환경 변수 검증 헬퍼 함수
export function validateSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase configuration is missing. ' +
      'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
    )
  }
}

