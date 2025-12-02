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
  
  // 프로덕션에서도 앱이 크래시되지 않도록 경고만 출력
  // (환경 변수가 없어도 앱은 실행되지만 인증은 작동하지 않음)
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

