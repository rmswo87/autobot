# Supabase OAuth 문제 해결 가이드

## 🚨 "provider is not enabled" 에러 해결

### 에러 메시지
```json
{
  "code": 400,
  "error_code": "validation_failed",
  "msg": "Unsupported provider: provider is not enabled"
}
```

### 원인
Supabase 대시보드에서 OAuth 프로바이더가 활성화되지 않았습니다.

### 해결 방법 (단계별)

#### Step 1: Supabase 대시보드 접속
1. https://supabase.com/dashboard/project/zlxewiendvczathlaueu 접속
2. 왼쪽 사이드바에서 **Authentication** 클릭
3. **Providers** 메뉴 클릭

#### Step 2: 프로바이더 활성화 확인

각 프로바이더(Google, GitHub, Kakao)에 대해:

1. 프로바이더 카드 찾기
2. **Enable [Provider]** 토글이 **켜져 있는지** 확인 (파란색/활성화 상태)
3. 토글이 꺼져 있다면 클릭하여 활성화

#### Step 3: 설정 정보 입력

각 프로바이더에 다음 정보를 입력:

**Google:**
- Client ID: `docs/API_KEYS.md` 파일에서 확인
- Client Secret: `docs/API_KEYS.md` 파일에서 확인

**GitHub:**
- Client ID: `docs/API_KEYS.md` 파일에서 확인
- Client Secret: `docs/API_KEYS.md` 파일에서 확인

**Kakao:**
- Client ID: `docs/API_KEYS.md` 파일에서 확인
- Client Secret: `docs/API_KEYS.md` 파일에서 확인

> 💡 **참고**: 실제 값은 `docs/API_KEYS.md` 파일에 있습니다.

#### Step 4: 저장 확인

1. 각 프로바이더 설정 후 **Save** 버튼 클릭
2. 페이지 상단에 "Settings saved" 메시지 확인
3. 프로바이더 카드에 **"Enabled"** 배지가 표시되는지 확인

#### Step 5: 테스트

1. 애플리케이션으로 돌아가기
2. 소셜 로그인 버튼 클릭
3. OAuth 인증 페이지로 정상 리다이렉트되는지 확인

---

## 🔍 추가 확인 사항

### 1. 프로바이더 상태 확인

Supabase 대시보드에서:
- 각 프로바이더 카드에 **"Enabled"** 배지가 보여야 함
- 토글이 파란색(활성화) 상태여야 함

### 2. 설정 값 확인

- Client ID와 Client Secret에 공백이나 특수문자가 없는지 확인
- 값이 정확히 복사되었는지 확인 (앞뒤 공백 제거)

### 3. Redirect URL 확인

각 OAuth 프로바이더의 콘솔에서:
- Redirect URL이 `https://zlxewiendvczathlaueu.supabase.co/auth/v1/callback`로 설정되어 있는지 확인

---

## 📝 체크리스트

설정 완료 후 다음을 확인하세요:

- [ ] Google OAuth 토글이 활성화됨
- [ ] GitHub OAuth 토글이 활성화됨
- [ ] Kakao OAuth 토글이 활성화됨
- [ ] 각 프로바이더에 Client ID와 Secret이 입력됨
- [ ] 각 프로바이더 설정 후 Save 버튼 클릭함
- [ ] 프로바이더 카드에 "Enabled" 배지가 표시됨
- [ ] OAuth 로그인 버튼 클릭 시 정상 작동함

---

**문제가 계속되면 Supabase 대시보드에서 프로바이더를 비활성화했다가 다시 활성화해보세요.**

