# Vercel 환경 변수 설정 가이드

## 📋 개요

Vercel에 배포된 Autobot 프로젝트에 필요한 환경 변수를 설정하는 방법입니다.

---

## 🔧 Vercel 대시보드에서 환경 변수 설정

### 1. Vercel 프로젝트 접속

1. https://vercel.com/dashboard 접속
2. **autobot** 프로젝트 선택
3. **Settings** → **Environment Variables** 메뉴로 이동

### 2. 환경 변수 추가

다음 환경 변수들을 추가하세요:

#### 필수 환경 변수

| 변수 이름 | 값 | 참고 |
|---------|-----|------|
| `VITE_SUPABASE_URL` | `https://zlxewiendvczathlaueu.supabase.co` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | `YOUR_SUPABASE_ANON_KEY` | `docs/API_KEYS.md`에서 확인 |

#### 선택적 환경 변수

| 변수 이름 | 값 | 설명 |
|---------|-----|------|
| `VITE_API_URL` | `http://localhost:3000/api` | 백엔드 API URL (나중에 설정) |

### 3. 환경 변수 적용 범위

각 환경 변수에 대해 적용 범위를 선택하세요:
- ✅ **Production** (프로덕션)
- ✅ **Preview** (프리뷰)
- ✅ **Development** (개발)

### 4. 재배포

환경 변수를 추가한 후:
1. **Deployments** 탭으로 이동
2. 최신 배포의 **⋯** 메뉴 클릭
3. **Redeploy** 선택
4. 또는 자동으로 재배포되도록 설정 가능

---

## 🔍 환경 변수 확인

배포 후 환경 변수가 제대로 로드되었는지 확인:

1. 배포된 사이트 접속
2. 브라우저 개발자 도구 → Console
3. Supabase 관련 경고가 없어야 함

---

## 📝 참고사항

- 환경 변수는 빌드 시점에 주입됩니다
- 환경 변수를 변경한 후에는 재배포가 필요합니다
- 프로덕션 환경 변수는 보안에 주의하세요

---

**최종 업데이트**: 2024-12-02

