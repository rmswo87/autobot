# 모듈 의존성 맵

## 📋 문서 개요

이 문서는 Autobot 프로젝트의 모든 모듈 간 의존관계를 중앙에서 관리하는 마스터 맵입니다.

**최종 수정일**: 2024-12-02  
**버전**: 1.0.0

---

## 🗺️ 전체 의존성 그래프

```
┌─────────────────────────────────────────────────────────────┐
│                        App Layer                            │
│  app/App.tsx, app/routes.tsx, app/providers.tsx            │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─────────────────┬─────────────────┬──────────────┐
             ▼                 ▼                 ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   auth       │  │   settings   │  │   blogger    │  │    music     │
│  feature     │  │   feature    │  │   feature    │  │   feature    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │                  │
       └─────────────────┴──────────────────┴──────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │    Shared Layer      │
              │  components, hooks,  │
              │  services, utils     │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  External Libraries  │
              │  react, axios, etc   │
              └──────────────────────┘
```

---

## 📦 모듈별 상세 의존성

### 1. 인증 모듈 (auth)

**경로**: `src/features/auth/`

#### 의존하는 모듈 (Dependencies)
```
auth/
├── shared/services/api/client.ts          # API 클라이언트
├── shared/services/storage/storageService.ts  # 토큰 저장
├── shared/components/ui/Button.tsx      # UI 컴포넌트
├── shared/components/ui/Input.tsx        # UI 컴포넌트
├── shared/utils/validators.ts            # 유효성 검사
└── shared/types/api.types.ts             # API 타입
```

#### 의존받는 모듈 (Dependents)
```
app/routes.tsx                            # 라우팅
app/providers.tsx                         # AuthProvider
features/settings/components/SettingsPage.tsx  # 인증 확인
features/blogger/components/BloggerConnect.tsx  # 인증 확인
features/youtube/components/YouTubeConnect.tsx   # 인증 확인
```

#### 내부 의존성
```
auth/
├── components/LoginForm.tsx
│   ├── hooks/useLogin.ts
│   ├── services/authService.ts
│   └── shared/components/ui/*
│
├── hooks/useAuth.ts
│   ├── services/authService.ts
│   └── shared/services/storage/storageService.ts
│
└── services/authService.ts
    ├── shared/services/api/client.ts
    └── shared/types/api.types.ts
```

---

### 2. 설정 모듈 (settings)

**경로**: `src/features/settings/`

#### 의존하는 모듈
```
settings/
├── shared/services/api/client.ts          # API 클라이언트
├── shared/components/ui/*                # UI 컴포넌트
├── shared/utils/validators.ts             # 유효성 검사
├── features/auth/hooks/useAuth.ts        # 인증 확인 (간접)
└── backend/src/shared/utils/encryption.ts  # 암호화 (백엔드)
```

#### 의존받는 모듈
```
features/blogger/services/bloggerService.ts  # API 키 조회
features/music/services/sunoService.ts       # API 키 조회
features/youtube/services/youtubeService.ts  # API 키 조회
```

#### 내부 의존성
```
settings/
├── components/SettingsPage.tsx
│   ├── components/ApiKeyForm.tsx
│   └── hooks/useApiKeys.ts
│
├── components/ApiKeyForm.tsx
│   ├── components/ApiKeyInput.tsx
│   ├── hooks/useApiKeys.ts
│   └── shared/components/ui/*
│
└── services/apiKeyService.ts
    ├── shared/services/api/client.ts
    └── backend/src/shared/utils/encryption.ts
```

---

### 3. 블로거 모듈 (blogger)

**경로**: `src/features/blogger/`

#### 의존하는 모듈
```
blogger/
├── shared/services/api/client.ts          # API 클라이언트
├── shared/components/ui/*                # UI 컴포넌트
├── features/settings/services/apiKeyService.ts  # API 키 조회 (간접)
└── features/auth/hooks/useAuth.ts        # 인증 확인
```

#### 의존받는 모듈
```
app/routes.tsx                            # 라우팅
```

#### 내부 의존성
```
blogger/
├── components/BlogPostCreate.tsx
│   ├── components/ContentGenerator.tsx
│   ├── components/ImageGenerator.tsx
│   ├── components/PostPreview.tsx
│   ├── hooks/useContentGeneration.ts
│   └── hooks/useScheduling.ts
│
├── services/bloggerService.ts
│   ├── shared/services/api/client.ts
│   └── features/settings/services/apiKeyService.ts (간접)
│
└── services/contentService.ts
    ├── shared/services/api/client.ts
    └── features/settings/services/apiKeyService.ts (간접)
```

---

### 4. 음원 모듈 (music)

**경로**: `src/features/music/`

#### 의존하는 모듈
```
music/
├── shared/services/api/client.ts          # API 클라이언트
├── shared/components/ui/*                # UI 컴포넌트
├── features/settings/services/apiKeyService.ts  # API 키 조회 (간접)
└── features/auth/hooks/useAuth.ts        # 인증 확인
```

#### 의존받는 모듈
```
features/youtube/services/videoService.ts  # 음원 데이터 사용
app/routes.tsx                              # 라우팅
```

#### 내부 의존성
```
music/
├── components/MusicCreate.tsx
│   ├── components/MusicGenerator.tsx
│   ├── components/LyricsEditor.tsx
│   ├── hooks/useMusicGeneration.ts
│   └── shared/components/ui/*
│
├── services/musicService.ts
│   ├── shared/services/api/client.ts
│   └── features/settings/services/apiKeyService.ts (간접)
│
└── services/sunoService.ts
    ├── shared/services/api/client.ts
    └── features/settings/services/apiKeyService.ts (간접)
```

---

### 5. 유튜브 모듈 (youtube)

**경로**: `src/features/youtube/`

#### 의존하는 모듈
```
youtube/
├── shared/services/api/client.ts          # API 클라이언트
├── shared/components/ui/*                # UI 컴포넌트
├── features/settings/services/apiKeyService.ts  # API 키 조회 (간접)
├── features/music/services/musicService.ts     # 음원 데이터
└── features/auth/hooks/useAuth.ts        # 인증 확인
```

#### 의존받는 모듈
```
app/routes.tsx                            # 라우팅
```

#### 내부 의존성
```
youtube/
├── components/VideoUpload.tsx
│   ├── components/ThumbnailGenerator.tsx
│   ├── hooks/useVideoUpload.ts
│   └── features/music/services/musicService.ts
│
├── services/youtubeService.ts
│   ├── shared/services/api/client.ts
│   └── features/settings/services/apiKeyService.ts (간접)
│
└── services/videoService.ts
    ├── shared/services/api/client.ts
    ├── features/music/services/musicService.ts
    └── features/settings/services/apiKeyService.ts (간접)
```

---

### 6. 공유 모듈 (shared)

**경로**: `src/shared/`

#### 의존하는 모듈
```
shared/
├── External Libraries
│   ├── react
│   ├── react-dom
│   ├── axios
│   ├── @tanstack/react-query
│   └── shadcn/ui components
└── (다른 shared 모듈 - 제한적)
```

#### 의존받는 모듈
```
모든 features 모듈
app 모듈
```

#### 내부 의존성
```
shared/
├── services/api/client.ts
│   ├── axios
│   └── shared/types/api.types.ts
│
├── services/storage/storageService.ts
│   └── (브라우저 API)
│
└── components/ui/*
    └── shared/lib/utils.ts
```

---

## 🔄 순환 의존성 체크

### 금지된 의존성 패턴

❌ **순환 의존성 예시**:
```
auth → settings → auth  (금지!)
blogger → music → blogger  (금지!)
```

✅ **올바른 의존성 패턴**:
```
auth → shared
settings → shared
blogger → shared
music → shared
youtube → shared
```

### 의존성 해결 방법

**문제**: `blogger`가 `music`의 데이터가 필요할 때

**해결책 1**: App Layer를 통한 데이터 전달
```
app/routes.tsx
  ├── blogger (props로 데이터 전달)
  └── music (데이터 생성)
```

**해결책 2**: Shared Service를 통한 데이터 공유
```
shared/services/dataStore.ts
  ├── blogger (데이터 읽기)
  └── music (데이터 쓰기)
```

---

## 📊 의존성 복잡도 분석

### 낮은 복잡도 (Good) ✅
- `auth` → `shared` (단순)
- `settings` → `shared` (단순)

### 중간 복잡도 (Acceptable) ⚠️
- `blogger` → `shared` + `settings` (간접)
- `music` → `shared` + `settings` (간접)

### 높은 복잡도 (Review Needed) 🔴
- `youtube` → `shared` + `settings` + `music`
  - **해결책**: `music` 데이터는 props나 shared service로 전달

---

## 🔍 의존성 검증 규칙

### 자동 검증 체크리스트

1. **순환 의존성 검사**
   ```bash
   # madge를 사용한 순환 의존성 검사
   npx madge --circular src/
   ```

2. **의존성 방향 검사**
   - Features → Shared ✅
   - Shared → Features ❌
   - Features → Features (직접) ❌

3. **의존성 문서화 검사**
   - 모든 모듈이 이 문서에 기록되어 있는가?
   - 변경 시 문서가 업데이트되었는가?

---

## 📝 의존성 변경 프로세스

### 모듈에 의존성 추가 시

1. **의존성 방향 확인**
   - 허용된 방향인가?
   - 순환 의존성이 발생하지 않는가?

2. **문서 업데이트**
   - `MODULE_DEPENDENCIES.md` 업데이트
   - 의존성 그래프 업데이트

3. **코드 리뷰**
   - 의존성이 필요한가?
   - 공통 로직으로 추출할 수 없는가?

4. **테스트**
   - 의존성 변경 후 테스트 통과 확인

---

## 🛠️ 의존성 관리 도구

### 추천 도구

1. **madge** - 의존성 그래프 시각화
   ```bash
   npm install -D madge
   npx madge --image graph.png src/
   ```

2. **dependency-cruiser** - 의존성 규칙 검증
   ```bash
   npm install -D dependency-cruiser
   npx depcruise src/
   ```

3. **ts-prune** - 사용하지 않는 export 찾기
   ```bash
   npm install -D ts-prune
   npx ts-prune
   ```

---

## 📋 모듈별 의존성 요약표

| 모듈 | 의존하는 모듈 수 | 의존받는 모듈 수 | 복잡도 | 상태 |
|------|-----------------|-----------------|--------|------|
| auth | 6 | 4 | 낮음 | ✅ |
| settings | 5 | 3 | 낮음 | ✅ |
| blogger | 4 | 1 | 중간 | ⚠️ |
| music | 4 | 1 | 중간 | ⚠️ |
| youtube | 5 | 1 | 높음 | 🔴 |
| shared | 5 | 모든 모듈 | 낮음 | ✅ |

---

## 🔄 다음 단계

1. **의존성 그래프 시각화** - madge를 사용한 그래프 생성
2. **의존성 규칙 설정** - dependency-cruiser 설정
3. **CI/CD 통합** - 의존성 검증을 CI에 추가

---

## 📝 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2024-12-02 | 1.0.0 | 초기 문서 작성 | Development Team |

