import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 환경 변수가 없을 때 경고만 출력하고 더미 클라이언트 생성
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase environment variables are missing.\n' +
    'Please create .env.local file with:\n' +
    'VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=your-anon-key\n' +
    '\n' +
    'The app will continue to run, but authentication features will not work.'
  )
}

// 더미 URL과 키로 클라이언트 생성 (에러 방지용)
// 실제 사용 시에는 환경 변수를 설정해야 합니다
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

