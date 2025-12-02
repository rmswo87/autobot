# Vercel 환경 변수 상세 설정 가이드

## 🎯 목표

Vercel에 배포된 Autobot 프로젝트가 정상 작동하도록 필요한 모든 환경 변수를 설정합니다.

---

## 📋 필수 환경 변수 목록

### 1. Supabase 설정 (필수)

#### VITE_SUPABASE_URL
- **용도**: Supabase 프로젝트 URL
- **값**: `https://zlxewiendvczathlaueu.supabase.co`
- **설명**: Supabase 프로젝트의 API 엔드포인트 URL

#### VITE_SUPABASE_ANON_KEY
- **용도**: Supabase 공개 API 키 (클라이언트 사이드에서 사용)
- **값**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpseGV3aWVuZHZjemF0aGxhdWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzY1NjgsImV4cCI6MjA4MDI1MjU2OH0.5YthNPk02Y0gnwK7ap9rpku0ip_Gm8gHw-P5VGVdxFg`
- **설명**: 인증 및 데이터베이스 접근에 사용되는 공개 키

---

## 🔧 Vercel 대시보드에서 설정하기

### Step 1: Vercel 프로젝트 접속

1. 브라우저에서 https://vercel.com/dashboard 접속
2. 로그인 (GitHub 계정으로 로그인)
3. 프로젝트 목록에서 **autobot** 프로젝트 클릭

### Step 2: 환경 변수 설정 페이지 이동

1. 프로젝트 대시보드에서 상단 메뉴의 **Settings** 클릭
2. 왼쪽 사이드바에서 **Environment Variables** 클릭

### Step 3: 첫 번째 환경 변수 추가

1. **Add New** 버튼 클릭
2. 다음 정보 입력:
   ```
   Key: VITE_SUPABASE_URL
   Value: https://zlxewiendvczathlaueu.supabase.co
   ```
3. **Environment** 섹션에서 다음을 모두 체크:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. **Save** 버튼 클릭

### Step 4: 두 번째 환경 변수 추가

1. 다시 **Add New** 버튼 클릭
2. 다음 정보 입력:
   ```
   Key: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpseGV3aWVuZHZjemF0aGxhdWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzY1NjgsImV4cCI6MjA4MDI1MjU2OH0.5YthNPk02Y0gnwK7ap9rpku0ip_Gm8gHw-P5VGVdxFg
   ```
3. **Environment** 섹션에서 다음을 모두 체크:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. **Save** 버튼 클릭

### Step 5: 환경 변수 확인

설정 완료 후 환경 변수 목록에 다음 2개가 표시되어야 합니다:

```
✅ VITE_SUPABASE_URL
✅ VITE_SUPABASE_ANON_KEY
```

---

## 🚀 재배포

### 방법 1: 자동 재배포 (권장)

환경 변수를 추가하면 Vercel이 자동으로 재배포를 시작합니다.
- 배포 상태는 **Deployments** 탭에서 확인 가능
- 보통 1-2분 소요

### 방법 2: 수동 재배포

1. **Deployments** 탭으로 이동
2. 최신 배포 항목의 **⋯** (점 3개) 메뉴 클릭
3. **Redeploy** 선택
4. 확인 대화상자에서 **Redeploy** 클릭

---

## ✅ 설정 확인

### 1. 배포 완료 확인

1. **Deployments** 탭에서 최신 배포 상태 확인
2. **Ready** 상태가 되면 배포 완료

### 2. 사이트 접속 확인

1. 배포된 사이트 URL 클릭 (예: `https://autobot-cyan.vercel.app`)
2. 브라우저 개발자 도구 열기 (F12)
3. **Console** 탭 확인
4. 다음 에러가 **없어야** 함:
   ```
   ❌ 🚨 Supabase environment variables are missing!
   ```

### 3. 기능 테스트

1. 로그인 페이지 접속
2. 구글/깃허브/카카오 로그인 버튼 클릭
3. 정상적으로 OAuth 페이지로 리다이렉트되는지 확인
4. `placeholder.supabase.co`로 리다이렉트되지 않아야 함

---

## 🔍 문제 해결

### 문제 1: 여전히 환경 변수 에러가 나타남

**원인**: 재배포가 완료되지 않았거나 환경 변수가 제대로 설정되지 않음

**해결 방법**:
1. Vercel 대시보드에서 환경 변수가 정확히 입력되었는지 확인
2. **Deployments** 탭에서 재배포가 완료되었는지 확인
3. 브라우저 캐시 클리어 (Ctrl+Shift+Delete)
4. 하드 리프레시 (Ctrl+Shift+R)

### 문제 2: `placeholder.supabase.co`로 리다이렉트됨

**원인**: 환경 변수가 빌드 시점에 주입되지 않음

**해결 방법**:
1. 환경 변수 이름이 정확한지 확인 (`VITE_` 접두사 필수)
2. 환경 변수 값에 공백이나 특수문자가 없는지 확인
3. 재배포 실행

### 문제 3: 배포는 성공했지만 화면이 보이지 않음

**원인**: 환경 변수 누락으로 인한 런타임 에러

**해결 방법**:
1. 브라우저 콘솔에서 에러 메시지 확인
2. 위의 환경 변수 설정 가이드 따라 설정
3. 재배포

---

## 📝 참고사항

### Vite 환경 변수 규칙

- 환경 변수는 **빌드 시점**에 주입됩니다
- `VITE_` 접두사가 있어야 클라이언트에서 접근 가능합니다
- 환경 변수를 변경한 후에는 **반드시 재배포**해야 합니다

### 환경별 설정

- **Production**: 실제 사용자에게 배포되는 환경
- **Preview**: Pull Request마다 생성되는 미리보기 환경
- **Development**: 로컬 개발 환경 (Vercel CLI 사용 시)

모든 환경에 동일한 환경 변수를 설정하는 것을 권장합니다.

---

## 🎉 완료

환경 변수 설정이 완료되면:
- ✅ Supabase 인증이 정상 작동
- ✅ OAuth 로그인 (구글, 깃허브, 카카오) 정상 작동
- ✅ 데이터베이스 연결 정상 작동

---

**최종 업데이트**: 2024-12-03

