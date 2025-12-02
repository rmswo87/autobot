# Vercel 환경 변수 빠른 설정 가이드

## 🚨 중요: 환경 변수 설정 필수!

현재 Vercel에 환경 변수가 설정되지 않아 OAuth 로그인이 작동하지 않습니다.

## ⚡ 빠른 설정 (5분)

### 1. Vercel 대시보드 접속
https://vercel.com/dashboard → **autobot** 프로젝트 선택

### 2. 환경 변수 추가
**Settings** → **Environment Variables** → **Add New**

#### 필수 환경 변수 2개 추가:

**첫 번째 변수:**
- Key: `VITE_SUPABASE_URL`
- Value: `https://zlxewiendvczathlaueu.supabase.co`
- Environment: ✅ Production, ✅ Preview, ✅ Development

**두 번째 변수:**
- Key: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpseGV3aWVuZHZjemF0aGxhdWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzY1NjgsImV4cCI6MjA4MDI1MjU2OH0.5YthNPk02Y0gnwK7ap9rpku0ip_Gm8gHw-P5VGVdxFg`
- Environment: ✅ Production, ✅ Preview, ✅ Development

### 3. 재배포
1. **Deployments** 탭으로 이동
2. 최신 배포의 **⋯** 메뉴 클릭
3. **Redeploy** 선택
4. 또는 자동 재배포 대기 (환경 변수 추가 시 자동 재배포됨)

## ✅ 확인 방법

재배포 완료 후:
1. 배포된 사이트 접속
2. 브라우저 개발자 도구 → Console 열기
3. Supabase 관련 에러가 없어야 함
4. 구글 로그인 버튼 클릭 → 정상 작동 확인

## 🔍 문제 해결

여전히 `placeholder.supabase.co`로 리다이렉트되는 경우:
1. 환경 변수가 제대로 추가되었는지 확인
2. 재배포가 완료되었는지 확인 (배포 로그 확인)
3. 브라우저 캐시 클리어 후 다시 시도

---

**설정 후 즉시 재배포하면 OAuth 로그인이 정상 작동합니다!**

