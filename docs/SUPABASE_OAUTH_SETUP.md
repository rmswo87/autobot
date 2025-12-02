# Supabase OAuth 설정 가이드

## 📋 설정 개요

이 문서는 Supabase에서 OAuth 프로바이더(Google, GitHub, Kakao)를 설정하는 방법을 안내합니다.

---

## 🔧 Supabase 대시보드 설정

### 1. Supabase 프로젝트 접속

1. https://supabase.com/dashboard/project/zlxewiendvczathlaueu 접속
2. **Authentication** → **Providers** 메뉴로 이동

### 2. Google OAuth 설정

1. **Google** 프로바이더 찾기
2. **Enable Google** 토글 활성화
3. 다음 정보 입력 (실제 값은 `docs/API_KEYS.md` 참조):
   - **Client ID (for OAuth)**: `YOUR_GOOGLE_CLIENT_ID`
   - **Client Secret (for OAuth)**: `YOUR_GOOGLE_CLIENT_SECRET`
4. **Save** 클릭

### 3. GitHub OAuth 설정

1. **GitHub** 프로바이더 찾기
2. **Enable GitHub** 토글 활성화
3. 다음 정보 입력 (실제 값은 `docs/API_KEYS.md` 참조):
   - **Client ID (for OAuth)**: `YOUR_GITHUB_CLIENT_ID`
   - **Client Secret (for OAuth)**: `YOUR_GITHUB_CLIENT_SECRET`
4. **Save** 클릭

### 4. Kakao OAuth 설정

1. **Kakao** 프로바이더 찾기
2. **Enable Kakao** 토글 활성화
3. 다음 정보 입력 (실제 값은 `docs/API_KEYS.md` 참조):
   - **Client ID (for OAuth)**: `YOUR_KAKAO_REST_API_KEY`
   - **Client Secret (for OAuth)**: `YOUR_KAKAO_CLIENT_SECRET`
4. **Save** 클릭

---

## 🔗 Redirect URL 설정

### Supabase Redirect URL

각 OAuth 프로바이더의 Redirect URL은 자동으로 설정됩니다:
- `https://zlxewiendvczathlaueu.supabase.co/auth/v1/callback`

### OAuth 프로바이더별 Redirect URL 설정

#### Google Cloud Console
1. https://console.cloud.google.com/ 접속
2. 프로젝트 선택
3. **APIs & Services** → **Credentials**
4. OAuth 2.0 Client ID 선택
5. **Authorized redirect URIs**에 추가:
   ```
   https://zlxewiendvczathlaueu.supabase.co/auth/v1/callback
   ```

#### GitHub
1. https://github.com/settings/developers 접속
2. OAuth App 선택
3. **Authorization callback URL**에 추가:
   ```
   https://zlxewiendvczathlaueu.supabase.co/auth/v1/callback
   ```

#### Kakao Developers
1. https://developers.kakao.com/ 접속
2. 내 애플리케이션 선택
3. **플랫폼** → **Web 플랫폼 등록**
4. **Redirect URI**에 추가:
   ```
   https://zlxewiendvczathlaueu.supabase.co/auth/v1/callback
   ```

---

## 🌐 Vercel 배포 후 추가 설정

Vercel 배포가 완료되면 배포된 URL을 Supabase에 추가해야 합니다.

### Supabase URL Configuration

1. **Authentication** → **URL Configuration**
2. **Site URL**에 Vercel URL 추가:
   ```
   https://your-app.vercel.app
   ```
3. **Redirect URLs**에 추가:
   ```
   https://your-app.vercel.app/**
   https://your-app.vercel.app/dashboard
   ```

---

## ✅ 설정 확인

설정이 완료되면 다음을 확인하세요:

1. ✅ Google OAuth 활성화됨
2. ✅ GitHub OAuth 활성화됨
3. ✅ Kakao OAuth 활성화됨
4. ✅ 각 프로바이더의 Redirect URL이 올바르게 설정됨
5. ✅ Vercel 배포 후 Site URL 및 Redirect URLs 추가됨

---

## 🧪 테스트

설정 완료 후 로그인/회원가입 페이지에서 소셜 로그인 버튼을 클릭하여 테스트하세요.

---

**최종 업데이트**: 2024-12-02

