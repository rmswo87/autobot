# 인증 디버깅 체크리스트

## 배포 후 확인 사항

배포가 완료되면 브라우저 콘솔(F12)을 열고 다음을 확인하세요.

### 1. 환경 변수 확인 ✅
콘솔에서 다음 로그를 찾으세요:
```
[DEBUG] Supabase Client Initialization: { hasUrl: true, hasKey: true, ... }
```

**확인 사항:**
- `hasUrl: true` 여야 함
- `hasKey: true` 여야 함
- `urlPrefix`가 `https://zlxewiendvczathlaueu.supabase.co`로 시작해야 함
- `isPlaceholder: false` 여야 함

**문제가 있다면:**
- Vercel 환경 변수 설정 확인
- `VITE_SUPABASE_URL`과 `VITE_SUPABASE_ANON_KEY`가 제대로 설정되었는지 확인

---

### 2. Supabase 클라이언트 초기화 확인 ✅
콘솔에서 다음 로그를 찾으세요:
```
[DEBUG] Supabase client created: { url: "...", isPlaceholder: false }
```

**확인 사항:**
- `isPlaceholder: false` 여야 함
- `url`이 실제 Supabase URL이어야 함

---

### 3. 인증 상태 변경 이벤트 확인 ✅
콘솔에서 다음 로그를 찾으세요:
```
[DEBUG] useAuth useEffect started
[DEBUG] Setting up onAuthStateChange listener
[DEBUG] onAuthStateChange triggered: { event: "...", hasSession: ..., ... }
```

**확인 사항:**
- `onAuthStateChange triggered` 로그가 나타나야 함
- `event` 값 확인 (보통 `INITIAL_SESSION` 또는 `SIGNED_IN`)
- `hasSession` 값 확인

**문제가 있다면:**
- `hasSession: false`이고 로그인했는데도 세션이 없다면:
  - 네트워크 탭에서 Supabase 요청 확인
  - 쿠키/로컬 스토리지 확인

---

### 4. getSession() 응답 확인 ✅
콘솔에서 다음 로그를 찾으세요:
```
[DEBUG] getSession() called
[DEBUG] getSession() result: { hasSession: ..., hasError: ..., ... }
```

**확인 사항:**
- `hasError: false` 여야 함
- 로그인 후에는 `hasSession: true` 여야 함

**문제가 있다면:**
- `hasError: true`이면 `errorMessage` 확인
- 네트워크 탭에서 `/auth/v1/session` 요청 확인

---

### 5. getCurrentUser() 응답 확인 ✅
콘솔에서 다음 로그를 찾으세요:
```
[DEBUG] getCurrentUser() called
[DEBUG] getCurrentUser() result: { hasUser: ..., hasError: ..., userId: ..., ... }
```

**확인 사항:**
- `hasError: false` 여야 함
- 로그인 후에는 `hasUser: true` 여야 함
- `userId`가 있어야 함

**문제가 있다면:**
- `hasError: true`이면 `errorMessage` 확인
- 네트워크 탭에서 `/auth/v1/user` 요청 확인

---

### 6. 네트워크 요청 확인 ✅
브라우저 개발자 도구의 **Network 탭**을 열고 다음을 확인하세요:

**확인할 요청:**
1. `https://zlxewiendvczathlaueu.supabase.co/auth/v1/session`
   - Status: `200 OK` 여야 함
   - Response에 `access_token`이 있어야 함

2. `https://zlxewiendvczathlaueu.supabase.co/auth/v1/user`
   - Status: `200 OK` 여야 함
   - Response에 사용자 정보가 있어야 함

**문제가 있다면:**
- `401 Unauthorized`: 인증 토큰이 없거나 만료됨
- `403 Forbidden`: 권한 문제
- `500 Internal Server Error`: Supabase 서버 문제
- `CORS error`: CORS 설정 문제

---

## 일반적인 문제 해결

### 문제 1: 환경 변수가 placeholder로 표시됨
**해결:**
1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. `VITE_SUPABASE_URL`과 `VITE_SUPABASE_ANON_KEY` 확인
3. 값이 올바른지 확인
4. **재배포 필요**

### 문제 2: onAuthStateChange 이벤트가 발생하지 않음
**가능한 원인:**
- Supabase 클라이언트가 placeholder로 초기화됨
- 네트워크 연결 문제
- 브라우저 쿠키/로컬 스토리지 차단

**해결:**
- 환경 변수 확인
- 브라우저 쿠키/로컬 스토리지 확인
- 네트워크 탭에서 Supabase 요청 확인

### 문제 3: 세션이 있지만 사용자 정보를 가져오지 못함
**가능한 원인:**
- JWT 토큰 만료
- Supabase RLS 정책 문제

**해결:**
- 로그아웃 후 다시 로그인
- Supabase 대시보드에서 RLS 정책 확인

---

## 다음 단계

1. 배포 완료 후 브라우저 콘솔 열기 (F12)
2. 위의 체크리스트 순서대로 확인
3. 각 단계에서 발견된 문제를 기록
4. 문제가 발견되면 해당 섹션의 해결 방법 시도

