# Autobot 개발 계획서

## 📋 문서 개요

이 문서는 Autobot 프로젝트의 모듈화된 개발 계획을 중앙 집중식으로 관리하기 위한 **통합 마스터 문서**입니다.

**최종 수정일**: 2024-12-03 (저녁 세션 - 비용 최소화 전략: 무료 이미지 라이브러리 우선, FFmpeg+MediaFX 활용)  
**버전**: 3.4.0  
**관리자**: Development Team  
**핵심 원칙**: 고품질 자동화 (단순 양산이 아닌 최적화된 콘텐츠) + 멀티 테넌트 SaaS

### ⚠️ 중요: 중앙집중식 문서 관리

**이 문서가 마스터 문서입니다.** 모든 체크리스트, Phase별 진행 상황, 우선순위는 이 문서에서만 관리합니다.

**다른 문서들은 이 문서를 참조합니다:**
- `SESSION_CONTINUITY.md` - 이 문서의 현재 상태 요약
- `CURRENT_STATUS.md` - 이 문서의 Phase별 완료 상태 요약
- `ARCHITECTURE.md` - 아키텍처 설계 (고유 내용, 이 문서 참조)
- `PROJECT_STRUCTURE.md` - 프로젝트 구조 (고유 내용, 이 문서 참조)
- `MODULE_DEPENDENCIES.md` - 모듈 의존성 (고유 내용, 이 문서 참조)

**작업 시:**
1. ✅ **체크리스트 업데이트**: 이 문서(`DEVELOPMENT_PLAN.md`)에서만 업데이트
2. ✅ **Phase 진행 상황**: 이 문서에서만 업데이트
3. ✅ **다른 문서 업데이트**: 이 문서 변경 후 필요 시 관련 문서 업데이트

### 통합된 문서
- ✅ `QUALITY_AUTOMATION_PLAN.md` - 고품질 자동화 계획 (Phase 2.5, 3, 4) - **Deprecated**
- ✅ `FFMPEG_IMPLEMENTATION_PLAN.md` - FFmpeg 구현 상세 (Phase 3에 통합) - **Deprecated**
- ✅ `MULTI_TENANT_ARCHITECTURE.md` - 멀티 테넌트 아키텍처 (아키텍처 원칙에 통합) - **Deprecated**

---

## 🎯 프로젝트 아키텍처 원칙

### 핵심 원칙
1. **고품질 자동화**: 단순 양산이 아닌 최적화된 고품질 콘텐츠 생성
2. **멀티 테넌트**: 각 고객이 개인의 API를 입력하여 사용하는 배포용 SaaS
3. **학습 기반**: 성공 사례 분석 및 패턴 학습을 통한 지속적 개선
4. **모듈화**: 모든 기능을 작은 단위의 독립적인 모듈로 분리
5. **중앙 집중식 관리**: 모든 의존성과 경로를 중앙에서 관리
6. **의존성 투명성**: 각 모듈의 의존관계를 명확히 문서화
7. **재사용성**: 중복 코드 제거, 공통 모듈 활용
8. **테스트 가능성**: 각 모듈은 독립적으로 테스트 가능해야 함

### 멀티 테넌트 원칙
- **데이터 격리**: 각 사용자의 데이터는 완전히 분리 (Supabase RLS)
- **API 키 관리**: 사용자별 API 키를 암호화하여 안전하게 저장 및 사용
- **확장성**: 다수의 사용자가 동시에 사용 가능한 구조
- **보안**: API 키 암호화 저장, 사용 시 복호화, 메모리에서 즉시 제거

### 품질 기준
- **Lighthouse**: 100점 (또는 근접)
- **SEO**: 최적화된 키워드 및 메타 태그
- **사용자 경험**: 빠른 로딩, 반응형 디자인
- **콘텐츠 품질**: AI 저품질 콘텐츠가 아닌 최적화된 콘텐츠

---

## 📁 프로젝트 구조 설계

### 전체 디렉토리 구조

```
Autobot/
├── docs/                          # 📚 문서 관리
│   ├── DEVELOPMENT_PLAN.md        # 이 문서 (마스터 계획서)
│   ├── ARCHITECTURE.md            # 아키텍처 설계 문서
│   ├── MODULE_DEPENDENCIES.md     # 모듈 의존성 맵
│   ├── API_REFERENCE.md           # API 참조 문서
│   ├── TESTING_STRATEGY.md        # 테스트 전략
│   └── DEPLOYMENT.md              # 배포 가이드
│
├── src/                           # 🎨 프론트엔드 소스
│   ├── app/                       # 앱 진입점 및 라우팅
│   │   ├── App.tsx                # 메인 앱 컴포넌트
│   │   ├── routes.tsx             # 라우트 정의
│   │   └── providers.tsx          # 전역 프로바이더
│   │
│   ├── features/                  # 기능별 모듈 (Feature-based)
│   │   ├── auth/                  # 인증 기능 모듈
│   │   │   ├── components/        # 컴포넌트
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── SignupForm.tsx
│   │   │   ├── hooks/             # 커스텀 훅
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useLogin.ts
│   │   │   ├── services/          # 서비스 레이어
│   │   │   │   └── authService.ts
│   │   │   ├── types/             # 타입 정의
│   │   │   │   └── auth.types.ts
│   │   │   ├── utils/             # 유틸리티
│   │   │   │   └── tokenUtils.ts
│   │   │   ├── __tests__/         # 테스트 파일
│   │   │   │   ├── authService.test.ts
│   │   │   │   └── LoginForm.test.tsx
│   │   │   └── index.ts           # 모듈 진입점 (barrel export)
│   │   │
│   │   ├── settings/               # 설정 기능 모듈
│   │   │   ├── components/
│   │   │   │   ├── SettingsPage.tsx
│   │   │   │   └── ApiKeyForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useApiKeys.ts
│   │   │   ├── services/
│   │   │   │   └── apiKeyService.ts
│   │   │   ├── types/
│   │   │   │   └── settings.types.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── blogger/                # 블로거 기능 모듈
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── __tests__/
│   │   │
│   │   ├── music/                  # 음원 생성 기능 모듈
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── __tests__/
│   │   │
│   │   └── youtube/                # 유튜브 기능 모듈
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── types/
│   │       └── __tests__/
│   │
│   ├── shared/                     # 공유 모듈 (재사용 가능)
│   │   ├── components/            # 공통 컴포넌트
│   │   │   ├── ui/                 # shadcn/ui 컴포넌트
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/             # 레이아웃 컴포넌트
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   └── common/             # 일반 공통 컴포넌트
│   │   │       ├── LoadingSpinner.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       └── ...
│   │   │
│   │   ├── hooks/                  # 공통 훅
│   │   │   ├── useDebounce.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   └── ...
│   │   │
│   │   ├── services/               # 공통 서비스
│   │   │   ├── api/                # API 클라이언트
│   │   │   │   ├── client.ts       # axios 인스턴스
│   │   │   │   ├── interceptors.ts
│   │   │   │   └── types.ts
│   │   │   ├── storage/            # 스토리지 서비스
│   │   │   │   └── storageService.ts
│   │   │   ├── encryption/        # 암호화 서비스
│   │   │   │   └── encryptionService.ts
│   │   │   └── ffmpeg/            # FFmpeg 서비스 (서버 사이드)
│   │   │       └── ffmpegService.ts
│   │   │
│   │   ├── utils/                  # 공통 유틸리티
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── ...
│   │   │
│   │   ├── types/                  # 공통 타입
│   │   │   ├── api.types.ts
│   │   │   ├── common.types.ts
│   │   │   └── ...
│   │   │
│   │   └── constants/              # 상수
│   │       ├── routes.ts
│   │       ├── apiEndpoints.ts
│   │       └── ...
│   │
│   ├── lib/                        # 라이브러리 설정
│   │   ├── utils.ts                # shadcn/ui utils
│   │   └── ...
│   │
│   ├── assets/                     # 정적 자산
│   │   ├── images/
│   │   ├── icons/
│   │   └── ...
│   │
│   └── __mocks__/                  # 테스트용 모킹 데이터
│       └── ...
│
├── backend/                        # ⚙️ 백엔드 소스
│   ├── src/
│   │   ├── app/                    # 앱 설정
│   │   │   ├── app.ts              # Express 앱 설정
│   │   │   └── server.ts           # 서버 시작
│   │   │
│   │   ├── modules/                 # 기능별 모듈 (Feature-based)
│   │   │   ├── auth/                # 인증 모듈
│   │   │   │   ├── controllers/    # 컨트롤러
│   │   │   │   │   └── authController.ts
│   │   │   │   ├── services/       # 서비스 레이어
│   │   │   │   │   └── authService.ts
│   │   │   │   ├── routes/         # 라우트
│   │   │   │   │   └── authRoutes.ts
│   │   │   │   ├── middleware/     # 미들웨어
│   │   │   │   │   └── authMiddleware.ts
│   │   │   │   ├── types/          # 타입 정의
│   │   │   │   │   └── auth.types.ts
│   │   │   │   ├── utils/          # 유틸리티
│   │   │   │   │   └── jwtUtils.ts
│   │   │   │   └── __tests__/      # 테스트
│   │   │   │       └── authService.test.ts
│   │   │   │
│   │   │   ├── settings/           # 설정 모듈
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   ├── routes/
│   │   │   │   └── __tests__/
│   │   │   │
│   │   │   ├── blogger/            # 블로거 모듈
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   ├── routes/
│   │   │   │   └── __tests__/
│   │   │   │
│   │   │   ├── music/              # 음원 모듈
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   ├── routes/
│   │   │   │   └── __tests__/
│   │   │   │
│   │   │   └── youtube/           # 유튜브 모듈
│   │   │       ├── controllers/
│   │   │       ├── services/
│   │   │       ├── routes/
│   │   │       └── __tests__/
│   │   │
│   │   ├── shared/                 # 공유 모듈
│   │   │   ├── middleware/         # 공통 미들웨어
│   │   │   │   ├── errorHandler.ts
│   │   │   │   ├── logger.ts
│   │   │   │   └── ...
│   │   │   ├── utils/             # 공통 유틸리티
│   │   │   │   ├── encryption.ts   # 암호화 유틸
│   │   │   │   ├── validators.ts
│   │   │   │   └── ...
│   │   │   ├── types/              # 공통 타입
│   │   │   │   └── ...
│   │   │   └── constants/          # 상수
│   │   │       └── ...
│   │   │
│   │   ├── database/               # 데이터베이스
│   │   │   ├── migrations/         # 마이그레이션
│   │   │   ├── seeds/             # 시드 데이터
│   │   │   └── schema.sql        # 스키마 정의
│   │   │
│   │   └── workers/               # 백그라운드 워커
│   │       ├── scheduler.ts        # 스케줄러 워커
│   │       └── queue.ts            # 작업 큐
│   │
│   ├── __tests__/                  # 통합 테스트
│   └── __mocks__/                  # 모킹 데이터
│
├── tests/                          # 🧪 E2E 테스트
│   ├── e2e/
│   │   └── ...
│   └── fixtures/
│       └── ...
│
├── scripts/                        # 📜 스크립트
│   ├── setup.sh                    # 프로젝트 설정 스크립트
│   ├── build.sh                    # 빌드 스크립트
│   └── ...
│
├── .github/                        # GitHub 설정
│   └── workflows/
│       └── ci.yml
│
├── .env.example                    # 환경 변수 예시
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔗 모듈 의존성 규칙

### 의존성 방향 (Dependency Direction)

```
┌─────────────────────────────────────────┐
│           App Layer                     │
│  (routes, providers, App.tsx)          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Features Layer                  │
│  (auth, settings, blogger, music, etc)  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Shared Layer                    │
│  (components, hooks, services, utils)  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         External Libraries              │
│  (react, axios, shadcn/ui, etc)        │
└─────────────────────────────────────────┘
```

### 허용되는 의존성
- ✅ Features → Shared
- ✅ Features → External Libraries
- ✅ Shared → External Libraries
- ✅ App → Features
- ✅ App → Shared

### 금지되는 의존성
- ❌ Shared → Features (순환 의존성 방지)
- ❌ Features → Features (직접 의존 금지, App을 통해서만)
- ❌ Lower Layer → Upper Layer

---

## 📝 모듈별 상세 설계

### 1. 인증 모듈 (auth)

**경로**: `src/features/auth/`

**책임**:
- 사용자 로그인/회원가입
- 세션 관리
- 토큰 관리

**의존성**:
- `shared/services/api/client.ts` - API 클라이언트
- `shared/services/storage/storageService.ts` - 토큰 저장
- `shared/components/ui/*` - UI 컴포넌트

**파일 구조**:
```
auth/
├── components/
│   ├── LoginForm.tsx          # 로그인 폼
│   ├── SignupForm.tsx         # 회원가입 폼
│   └── AuthGuard.tsx          # 인증 가드 컴포넌트
├── hooks/
│   ├── useAuth.ts             # 인증 상태 훅
│   ├── useLogin.ts            # 로그인 훅
│   └── useLogout.ts           # 로그아웃 훅
├── services/
│   └── authService.ts         # 인증 서비스
├── types/
│   └── auth.types.ts          # 타입 정의
├── utils/
│   └── tokenUtils.ts          # 토큰 유틸리티
├── __tests__/
│   ├── authService.test.ts
│   └── LoginForm.test.tsx
└── index.ts                   # Barrel export
```

**의존성 맵**:
```
authService.ts
  ├── api/client.ts (shared)
  └── storageService.ts (shared)

LoginForm.tsx
  ├── useLogin.ts (auth)
  ├── Button.tsx (shared/ui)
  └── Input.tsx (shared/ui)

useAuth.ts
  ├── authService.ts (auth)
  └── storageService.ts (shared)
```

---

### 2. 설정 모듈 (settings)

**경로**: `src/features/settings/`

**책임**:
- API 키 관리
- 사용자 설정 관리
- 설정 페이지 UI

**의존성**:
- `shared/services/api/client.ts`
- `shared/components/ui/*`
- `shared/utils/validators.ts`

**파일 구조**:
```
settings/
├── components/
│   ├── SettingsPage.tsx        # 설정 페이지
│   ├── ApiKeyForm.tsx          # API 키 입력 폼
│   ├── ApiKeyInput.tsx         # API 키 입력 필드 (마스킹)
│   └── ApiKeyValidator.tsx     # API 키 검증 컴포넌트
├── hooks/
│   ├── useApiKeys.ts           # API 키 관리 훅
│   └── useApiKeyValidation.ts  # API 키 검증 훅
├── services/
│   └── apiKeyService.ts        # API 키 서비스
├── types/
│   └── settings.types.ts      # 타입 정의
├── __tests__/
│   └── apiKeyService.test.ts
└── index.ts
```

**의존성 맵**:
```
apiKeyService.ts
  ├── api/client.ts (shared)
  └── encryption.ts (backend/shared/utils)

ApiKeyForm.tsx
  ├── useApiKeys.ts (settings)
  ├── Input.tsx (shared/ui)
  └── Button.tsx (shared/ui)
```

---

### 3. 블로거 모듈 (blogger)

**경로**: `src/features/blogger/`

**책임**:
- Blogger 계정 연동 (사용자별 API 키 사용)
- 블로그 포스트 생성
- 콘텐츠 생성 및 관리
- Lighthouse 블로그 최적화 (Phase 2.5)
- 예약 발행

**의존성**:
- `shared/services/api/client.ts`
- `features/settings` - API 키 조회 (간접)
- `shared/components/ui/*`
- `shared/services/encryption/` - API 키 복호화

**파일 구조**:
```
blogger/
├── components/
│   ├── BloggerConnect.tsx          # 계정 연결
│   ├── BlogPostCreate.tsx          # 포스트 생성
│   ├── BlogOptimizationPage.tsx    # Lighthouse 최적화 페이지
│   ├── ContentGenerator.tsx        # 콘텐츠 생성기
│   ├── ImageGenerator.tsx          # 이미지 생성기
│   ├── PostPreview.tsx            # 미리보기
│   └── ScheduleForm.tsx            # 예약 폼
├── hooks/
│   ├── useBlogger.ts               # 블로거 훅
│   ├── useContentGeneration.ts     # 콘텐츠 생성 훅
│   ├── useBlogOptimization.ts      # 최적화 훅
│   └── useScheduling.ts            # 예약 훅
├── services/
│   ├── bloggerService.ts           # 블로거 서비스
│   ├── contentService.ts           # 콘텐츠 서비스
│   ├── lighthouseService.ts        # Lighthouse 분석 서비스
│   └── optimizationService.ts      # 최적화 실행 서비스
├── types/
│   └── blogger.types.ts
├── __tests__/
└── index.ts
```

---

### 4. 음원 모듈 (music)

**경로**: `src/features/music/`

**책임**:
- Suno API 연동 (사용자별 API 키 사용)
- 음원 생성 (10-20개 묶음)
- 가사 생성
- 음원 관리
- 플레이리스트 영상 생성 (FFmpeg 통합)

**의존성**:
- `shared/services/api/client.ts`
- `features/settings` - API 키 조회
- `shared/services/ffmpeg/` - 영상 합성
- `shared/components/ui/*`

**파일 구조**:
```
music/
├── components/
│   ├── MusicCreate.tsx              # 음원 생성 폼
│   ├── MusicGenerator.tsx           # 음원 생성기
│   ├── MusicList.tsx                # 음원 목록
│   ├── MusicPlayer.tsx              # 음원 플레이어
│   ├── LyricsEditor.tsx             # 가사 편집기
│   └── PlaylistVideoCreator.tsx     # 플레이리스트 영상 생성
├── hooks/
│   ├── useMusic.ts                  # 음원 훅
│   ├── useMusicGeneration.ts        # 음원 생성 훅
│   └── usePlaylistVideo.ts          # 플레이리스트 영상 훅
├── services/
│   ├── musicService.ts              # 음원 서비스
│   ├── sunoService.ts               # Suno API 서비스
│   ├── playlistAnalyzer.ts          # 플레이리스트 분석
│   ├── playlistVideoService.ts      # 플레이리스트 영상 생성
│   └── distrokidService.ts          # DistroKid 자동화
├── types/
│   └── music.types.ts
├── __tests__/
└── index.ts
```

---

### 5. 유튜브 모듈 (youtube)

**경로**: `src/features/youtube/`

**책임**:
- YouTube 계정 연동 (사용자별 API 키 사용)
- 비디오 업로드
- 플레이리스트 생성
- 썸네일 생성
- 쇼츠 자동화 (Phase 4)
- 성과 분석 대시보드

**의존성**:
- `shared/services/api/client.ts`
- `features/settings` - API 키 조회
- `features/music` - 음원 데이터
- `shared/components/ui/*`

**파일 구조**:
```
youtube/
├── components/
│   ├── YouTubeConnect.tsx           # 계정 연결
│   ├── VideoUpload.tsx              # 비디오 업로드
│   ├── PlaylistCreator.tsx          # 플레이리스트 생성
│   ├── ThumbnailGenerator.tsx      # 썸네일 생성기
│   ├── ShortsCreator.tsx           # 쇼츠 생성기
│   └── AnalyticsDashboard.tsx      # 성과 분석 대시보드
├── hooks/
│   ├── useYouTube.ts               # 유튜브 훅
│   ├── useVideoUpload.ts           # 업로드 훅
│   └── useAnalytics.ts             # 분석 훅
├── services/
│   ├── youtubeService.ts           # 유튜브 서비스
│   ├── videoService.ts             # 비디오 서비스
│   ├── shortsService.ts            # 쇼츠 서비스
│   └── analyticsService.ts         # 분석 서비스
├── types/
│   └── youtube.types.ts
├── __tests__/
└── index.ts
```

---

## 🎯 품질 보장 전략 (Quality Assurance Strategy)

### ⚠️ 핵심 원칙: 고품질 자동화

**문제 인식**: 
- 단순 자동화는 저품질 콘텐츠를 양산할 수 있음
- 비용 대비 낮은 조회수는 의미 없음
- 사용자들이 정말 볼 콘텐츠를 만들어야 함

**해결 방안**: 
- **성공 사례 분석 시스템** 구축 (필수)
- **패턴 학습 및 적용** (ML/AI 기반)
- **품질 검증 시스템** (자동 + 수동)
- **지속적 개선** (A/B 테스트, 피드백 루프)

---

### 1. 성공 사례 분석 시스템 (Success Case Analysis System)

#### 1.1 유튜브 성공 사례 분석

**목적**: 조회수가 높고 구독자 대비 조회수가 높은 영상의 패턴 분석

**분석 항목**:

1. **썸네일 분석**
   - [ ] 색상 패턴 분석 (어떤 색상 조합이 클릭률이 높은가?)
   - [ ] 텍스트 배치 및 폰트 분석
   - [ ] 얼굴/객체 배치 패턴
   - [ ] 감정 표현 분석 (놀람, 호기심, 긴장 등)
   - [ ] 대비 및 명도 분석
   - [ ] 클릭률(CTR)과 썸네일 요소의 상관관계

2. **후킹 전략 분석**
   - [ ] 첫 3초 컷 분석 (어떤 장면이 가장 효과적인가?)
   - [ ] 첫 15초 스크립트 분석 (어떤 문구가 이탈률을 낮추는가?)
   - [ ] 음악/효과음 타이밍 분석
   - [ ] 자막 타이밍 및 스타일 분석
   - [ ] 이탈률 구간 분석 (어디서 이탈하는가?)

3. **콘텐츠 구성 분석**
   - [ ] 영상 구조 분석 (도입부 → 본문 → 결론)
   - [ ] 컷 전환 패턴 (빠른 전환 vs 느린 전환)
   - [ ] 화면 구성 분석 (1인 화면, 2인 화면, 배경 등)
   - [ ] 자막 스타일 및 위치 분석
   - [ ] 음악/효과음 사용 패턴

4. **메타데이터 분석**
   - [ ] 제목 패턴 분석 (길이, 키워드, 감정어 등)
   - [ ] 설명란 구조 분석 (타임스탬프, 링크 배치 등)
   - [ ] 태그 분석 (어떤 태그가 검색에 유리한가?)
   - [ ] 업로드 시간대 분석 (언제 업로드하면 조회수가 높은가?)

5. **성과 지표 분석**
   - [ ] 조회수 대비 좋아요 비율
   - [ ] 조회수 대비 댓글 비율
   - [ ] 평균 시청 시간
   - [ ] 구독자 전환률
   - [ ] 공유 횟수

**구현 필요**:
- [ ] YouTube Analytics API 연동
- [ ] 성공 영상 데이터 수집 시스템
- [ ] 썸네일 이미지 분석 (컴퓨터 비전)
- [ ] 스크립트 텍스트 분석 (NLP)
- [ ] 패턴 추출 알고리즘 (ML)
- [ ] 패턴 데이터베이스 구축 (Supabase)

#### 1.2 블로그 성공 사례 분석

**목적**: 조회수가 높고 SEO 성과가 좋은 블로그 글의 패턴 분석

**분석 항목**:

1. **제목 분석**
   - [ ] 제목 길이 및 구조
   - [ ] 키워드 배치 (앞, 중간, 뒤)
   - [ ] 감정어 사용 패턴
   - [ ] 숫자/리스트 사용 패턴
   - [ ] 클릭률과 제목 요소의 상관관계

2. **본문 구조 분석**
   - [ ] H2 태그 배치 및 키워드 포함
   - [ ] 문단 길이 및 구조
   - [ ] 이미지 배치 및 밀도
   - [ ] 리스트/표 사용 패턴
   - [ ] 내부 링크 구조

3. **SEO 요소 분석**
   - [ ] 메타 설명 최적화
   - [ ] 이미지 Alt 텍스트
   - [ ] 키워드 밀도
   - [ ] 외부 링크 배치
   - [ ] 내부 링크 구조

4. **가독성 분석**
   - [ ] 문장 길이
   - [ ] 문단 길이
   - [ ] 폰트 크기 및 스타일
   - [ ] 줄 간격
   - [ ] 색상 대비

**구현 필요**:
- [ ] 블로그 글 데이터 수집 시스템
- [ ] 텍스트 분석 (NLP)
- [ ] 구조 분석 알고리즘
- [ ] 패턴 추출 및 저장

---

### 2. 패턴 학습 및 적용 시스템 (Pattern Learning & Application)

#### 2.1 학습 데이터 구축

**필수 데이터**:
- [ ] 성공 영상 100개 이상 수집
- [ ] 실패 영상 100개 이상 수집 (대조군)
- [ ] 각 영상의 성과 지표 수집
- [ ] 썸네일, 스크립트, 메타데이터 저장

#### 2.2 패턴 추출 알고리즘

**ML/AI 활용**:
- [ ] 썸네일 이미지 분석 (컴퓨터 비전)
- [ ] 텍스트 패턴 분석 (NLP)
- [ ] 성과 지표와 패턴의 상관관계 분석
- [ ] 패턴 점수화 시스템

#### 2.3 자동 적용 시스템

**자동 생성 시 패턴 적용**:
- [ ] 성공 패턴 기반 썸네일 생성
- [ ] 성공 패턴 기반 제목 생성
- [ ] 성공 패턴 기반 스크립트 생성
- [ ] 성공 패턴 기반 편집 스타일 적용

---

### 3. 품질 검증 시스템 (Quality Verification System)

#### 3.1 자동 품질 검증

**검증 항목**:
- [ ] 썸네일 품질 점수 (성공 패턴 매칭도)
- [ ] 제목 품질 점수 (클릭률 예측)
- [ ] 콘텐츠 품질 점수 (가독성, 구조)
- [ ] SEO 품질 점수 (키워드, 메타 태그)
- [ ] 최소 품질 기준 통과 여부

**품질 기준**:
- 썸네일 점수: 70점 이상 (100점 만점)
- 제목 점수: 70점 이상
- 콘텐츠 점수: 70점 이상
- SEO 점수: 70점 이상

**미통과 시**:
- 자동 재생성 (최대 3회)
- 사용자에게 알림 및 수동 검토 요청

#### 3.2 수동 검토 시스템

**사용자 검토**:
- [ ] 생성된 콘텐츠 미리보기
- [ ] 품질 점수 표시
- [ ] 수정 요청 기능
- [ ] 승인 후 발행

---

### 4. 지속적 개선 시스템 (Continuous Improvement)

#### 4.1 A/B 테스트

**테스트 항목**:
- [ ] 썸네일 스타일 A vs B
- [ ] 제목 패턴 A vs B
- [ ] 편집 스타일 A vs B
- [ ] 업로드 시간대 A vs B

**결과 분석**:
- [ ] 성과 지표 비교
- [ ] 승리 패턴 저장
- [ ] 패턴 데이터베이스 업데이트

#### 4.2 피드백 루프

**피드백 수집**:
- [ ] 실제 조회수 데이터 수집
- [ ] 사용자 피드백 수집
- [ ] 실패 사례 분석
- [ ] 패턴 개선

---

### 5. 현실성 있는 접근 방법

#### 5.1 단계적 구현

**Phase 1: 분석 시스템 구축** (필수)
- 성공 사례 수집 및 분석
- 패턴 추출 알고리즘 개발
- 품질 검증 시스템 구축

**Phase 2: 자동 생성 시스템** (분석 완료 후)
- 분석된 패턴 기반 자동 생성
- 품질 검증 통과 후 발행

**Phase 3: 지속적 개선** (운영 중)
- A/B 테스트
- 피드백 루프
- 패턴 업데이트

#### 5.2 비용 대비 효과

**현실적인 기대치**:
- 초기에는 수동 검토 필수
- 점진적으로 자동화율 증가
- 품질이 보장된 콘텐츠만 자동 발행

**비용 관리**:
- API 비용 최적화 (필요한 경우만 호출)
- 품질 검증 통과 시에만 발행
- 실패 사례 학습으로 재시도 감소

---

### 6. 블로그 자동화 품질 보장

#### 6.1 블로그 글 품질 기준

**필수 요소**:
- [ ] SEO 최적화 (키워드, 메타 태그)
- [ ] 가독성 (문장 길이, 문단 구조)
- [ ] 구조화 (H2 태그, 리스트, 표)
- [ ] 이미지 최적화 (Alt 텍스트, 크기)
- [ ] 내부/외부 링크 구조

#### 6.2 이미지 자동화 품질

**이미지 생성 기준**:
- [ ] 키워드와 관련성
- [ ] 해상도 및 품질
- [ ] Alt 텍스트 자동 생성
- [ ] 파일 크기 최적화

**현실성**:
- AI 이미지 생성은 가능하지만, 품질이 일정하지 않을 수 있음
- 수동 검토 또는 품질 필터링 필요
- 고품질 이미지 라이브러리 활용 고려

---

### 7. 유튜브 자동화 현실성 평가

#### 7.1 기술적 현실성

**가능한 것**:
- ✅ 음원 생성 (Suno API)
- ✅ 이미지 생성 (DALL-E, Midjourney)
- ✅ 영상 합성 (FFmpeg)
- ✅ 자동 업로드 (YouTube API)
- ✅ 메타데이터 자동 생성

**제한사항**:
- ⚠️ 썸네일 품질: AI 생성은 가능하지만, 성공 패턴 학습 필요
- ⚠️ 편집 품질: 자동 편집은 기본적인 수준, 고급 편집은 수동 필요
- ⚠️ 스크립트 품질: AI 생성은 가능하지만, 후킹 전략 학습 필요

#### 7.2 품질 보장 현실성

**현실적인 접근**:
1. **초기**: 성공 사례 분석 및 패턴 학습 (2-3개월)
2. **중기**: 패턴 기반 자동 생성 + 수동 검토 (1-2개월)
3. **장기**: 품질 검증 통과 시 자동 발행 (지속적 개선)

**핵심 성공 요인**:
- 성공 사례 분석의 정확도
- 패턴 학습 알고리즘의 효과
- 품질 검증 시스템의 엄격성
- 지속적 개선 시스템

---

## 📝 체계적인 콘텐츠 생성 전략 (Systematic Content Generation Strategy)

### ⚠️ 핵심 원칙: 체계적이고 효율적인 콘텐츠 구성

**목적**: 초기에는 수동 검토를 통해 바로 개발을 진행하고, 지속적으로 개선하여 완전 자동화를 달성

---

### 1. 콘텐츠 구성 요소별 전략

#### 1.1 썸네일 생성 전략 (무료 이미지 + 편집)

**목적**: 클릭률(CTR)을 높이는 고품질 썸네일 자동 생성 (비용 최소화)

**⚠️ 핵심**: 플레이리스트 썸네일은 단순한 배경 이미지 + 텍스트 오버레이로 충분합니다.

**생성 프로세스**:

1. **무료 이미지 라이브러리에서 배경 이미지 검색** (우선)
   - [ ] Unsplash/Pexels/Pixabay API 연동
   - [ ] 키워드 기반 이미지 검색
     - 예: "sky clouds", "cozy winter", "jazz music", "playlist"
   - [ ] 적합한 이미지 다운로드 및 저장
   - [ ] 이미지 라이브러리에 저장 (재사용)

2. **간단한 이미지 편집** (무료)
   - [ ] YouTube 썸네일 규격으로 리사이즈 (1280x720px)
   - [ ] 텍스트 오버레이 추가 (Canvas API 또는 Sharp)
     - 제목 키워드 포함
     - 폰트 스타일 및 색상 적용
     - 예: "Playlist", "JAZZ", "Cozy", "Winter"
   - [ ] 색상 대비 최적화
   - [ ] 필터 적용 (밝기, 대비, 채도 조정)

3. **성공 패턴 분석 기반 스타일 적용**
   - [ ] 성공한 썸네일 패턴 분석 (텍스트 배치, 색상)
   - [ ] 텍스트 오버레이 위치 및 스타일 자동 적용
   - [ ] 색상 스키마 자동 선택

4. **품질 검증**
   - [ ] 텍스트 가독성 검증
   - [ ] 색상 대비 검증
   - [ ] YouTube 규격 준수 확인

5. **AI 이미지 생성** (선택적, 최소한)
   - [ ] 무료 이미지로 해결 불가능한 특수한 경우만
   - [ ] Nano Banana, Hixfield, DALL-E 3 중 선택
   - [ ] 목표: 일일 0-1장 이하

**구현 파일**:
- `features/youtube/services/thumbnailGenerator.ts` (무료 이미지 + 편집)
- `shared/services/image/freeImageService.ts` (Unsplash/Pexels/Pixabay)
- `shared/services/image/imageEditor.ts` (Canvas API, Sharp)
- `features/youtube/services/thumbnailPatternAnalyzer.ts` (성공 패턴 분석)

**비용**: 월간 $0-15 (무료 이미지 95-98% 활용 시)

#### 1.2 제목 생성 전략

**목적**: 클릭률을 높이는 최적화된 제목 자동 생성

**생성 프로세스**:

1. **키워드 기반 제목 생성**
   - [ ] 핵심 키워드 추출 (키워드 분석기 활용)
   - [ ] 롱테일 키워드 우선 포함
   - [ ] 감정어 추가 (놀람, 호기심, 긴장 등)

2. **성공 패턴 적용**
   - [ ] 성공한 제목 패턴 분석
   - [ ] 제목 길이 최적화 (30-60자)
   - [ ] 숫자/리스트 패턴 활용
   - [ ] 질문형 제목 활용

3. **플랫폼별 최적화**
   - [ ] YouTube: 첫 60자에 핵심 키워드
   - [ ] 블로그: SEO 최적화 (30-60자)
   - [ ] SNS: 간결하고 임팩트 있는 제목

4. **A/B 테스트 준비**
   - [ ] 여러 제목 후보 생성 (3-5개)
   - [ ] 사용자 선택 또는 자동 선택
   - [ ] 성과 추적 및 학습

**구현 파일**:
- `features/blogger/services/titleGenerator.ts`
- `features/youtube/services/titleGenerator.ts`

#### 1.3 내용 구성 전략

**목적**: 가독성과 SEO를 모두 만족하는 고품질 콘텐츠 생성

**블로그 글 구성**:

1. **구조화된 본문 생성**
   - [ ] 도입부 (Hook): 첫 문단에 핵심 키워드 포함
   - [ ] 본문 (Body): H2 태그로 섹션 구분
     - 첫 번째 H2에 주요 키워드 포함
     - 각 섹션 3-5문단
     - 리스트/표 활용
   - [ ] 결론 (Conclusion): 요약 및 CTA

2. **키워드 자연스러운 배치**
   - [ ] 형태소 분석기 활용
   - [ ] 키워드 밀도 최적화 (1-2%)
   - [ ] 키워드 스터핑 방지
   - [ ] LSI 키워드 활용

3. **이미지 적재적소 배치**
   - [ ] 섹션별 이미지 배치 전략
     - 도입부: 1장 (메인 이미지)
     - 각 H2 섹션: 1-2장
     - 결론: 1장
   - [ ] 총 6-8장 이미지 배치
   - [ ] 이미지 Alt 텍스트 자동 생성 (키워드 포함)

4. **가독성 최적화**
   - [ ] 문장 길이: 15-20단어 권장
   - [ ] 문단 길이: 3-5문장
   - [ ] 줄 간격 및 폰트 크기
   - [ ] 색상 대비

**유튜브 영상 구성**:

1. **스크립트 생성**
   - [ ] 첫 3초 후킹 (놀람, 호기심, 긴장)
   - [ ] 첫 15초 핵심 내용 제시
   - [ ] 본문 구조화 (도입 → 본문 → 결론)
   - [ ] 자막 타이밍 계산

2. **편집 패턴 적용**
   - [ ] 성공한 편집 패턴 분석
   - [ ] 컷 전환 타이밍
   - [ ] 자막 스타일 및 위치
   - [ ] 음악/효과음 배치

**구현 파일**:
- `features/blogger/services/contentGenerator.ts`
- `features/youtube/services/scriptGenerator.ts`

#### 1.4 태그 생성 전략

**목적**: 검색 노출을 높이는 최적화된 태그 자동 생성

**생성 프로세스**:

1. **키워드 기반 태그 생성**
   - [ ] 핵심 키워드에서 태그 추출
   - [ ] 롱테일 키워드 태그화
   - [ ] 관련 키워드 태그 추가

2. **플랫폼별 태그 최적화**
   - [ ] YouTube: 5-10개 태그 (검색량 높은 순)
   - [ ] 블로그: 카테고리 + 키워드 태그
   - [ ] SNS: 해시태그 (트렌드 반영)

3. **태그 검증**
   - [ ] 중복 태그 제거
   - [ ] 검색량 확인
   - [ ] 경쟁 강도 확인

**구현 파일**:
- `features/blogger/services/tagGenerator.ts`
- `features/youtube/services/tagGenerator.ts`

#### 1.5 블로그 카테고리 선정 전략

**목적**: 적절한 카테고리로 분류하여 타겟 독자에게 도달

**선정 프로세스**:

1. **키워드 기반 카테고리 매칭**
   - [ ] 핵심 키워드 분석
   - [ ] 키워드-카테고리 매핑 테이블
   - [ ] 가장 관련성 높은 카테고리 선택

2. **다중 카테고리 지원**
   - [ ] 주 카테고리 1개
   - [ ] 부 카테고리 1-2개 (선택)

3. **카테고리별 최적화**
   - [ ] 카테고리별 인기 키워드 활용
   - [ ] 카테고리별 글 구조 패턴 적용

**구현 파일**:
- `features/blogger/services/categorySelector.ts`

#### 1.6 형태소 패턴 분석 및 적용

**목적**: 자연스러운 한국어 문장 생성

**분석 및 적용 프로세스**:

1. **형태소 패턴 분석**
   - [ ] 성공한 블로그 글 형태소 분석
   - [ ] 자주 사용되는 형태소 패턴 추출
   - [ ] 의미 있는 형태소 vs 의미 없는 형태소 구분

2. **패턴 적용**
   - [ ] 키워드 기반 문장 생성 시 패턴 활용
   - [ ] 자연스러운 문장 구조 생성
   - [ ] 반복 패턴 방지

3. **품질 검증**
   - [ ] 형태소 패턴 매칭도 점수
   - [ ] 가독성 점수
   - [ ] 자연스러움 점수

**구현 파일**:
- `features/blogger/services/morphemePatternAnalyzer.ts`
- `features/blogger/services/morphemePatternApplier.ts`

---

### 2. 이미지 생성 및 관리 전략 (Image Generation & Management Strategy)

#### 2.1 이미지 생성 전략 (비용 최소화 우선)

**⚠️ 핵심 인사이트**: 플레이리스트 썸네일과 영상은 단순한 구성이므로 고가의 AI 이미지 생성이 필요하지 않습니다.

**일일 이미지 필요량**:
- 롱폼 영상 썸네일: 1장
- 숏폼 영상 썸네일: 2장
- 블로그 게시글 이미지: 6-8장 × 4개 블로그 = 24-32장
- **총 일일 필요량: 27-35장**

**플레이리스트 썸네일/영상 특성 분석**:
- 단순한 배경 이미지 (하늘, 구름, 풍경 등)
- 텍스트 오버레이 ("Playlist", "JAZZ", "Cozy" 등)
- 고정된 이미지 + 음원 (영상의 경우)
- **→ 무료 이미지 라이브러리 + 간단한 편집으로 충분**

**비용 효율적인 이미지 생성 전략 (우선순위 순)**:

**1순위: 무료 이미지 라이브러리 활용 (추천) ⭐**
- **Unsplash API**: 무료, 고품질 사진
- **Pexels API**: 무료, 다양한 카테고리
- **Pixabay API**: 무료, 상업적 사용 가능
- **비용**: $0
- **품질**: ⭐⭐⭐⭐⭐ (실제 사진)
- **적용**: 플레이리스트 썸네일, 블로그 이미지, SNS 이미지

**2순위: 간단한 이미지 편집 (무료)**
- **Canvas API** (브라우저): 텍스트 오버레이, 필터 적용
- **Sharp** (Node.js): 리사이즈, 크롭, 필터
- **FFmpeg + MediaFX**: 영상 합성, 효과 추가
- **비용**: $0 (오픈소스)
- **적용**: 텍스트 오버레이, 필터, 리사이즈, 영상 합성

**3순위: AI 이미지 생성 (선택적, 최소한)**
- **사용 시점**: 무료 이미지로 해결 불가능한 특수한 경우만
- **옵션**: Nano Banana, Hixfield, DALL-E 3 (비용 확인 후 선택)
- **목표**: 일일 신규 생성 5장 이하

**최종 추천 전략**:
1. **무료 이미지 라이브러리 우선 사용** (80-90%)
2. **간단한 편집으로 변형** (텍스트 오버레이, 필터)
3. **AI 생성은 최소한으로** (10-20%, 특수 케이스만)
4. **예상 비용**: 월간 $0-30 (AI 생성 최소화 시)

#### 2.2 이미지 재사용 시스템 (Image Reuse System)

**목적**: 이미지 재사용을 통해 비용 절감 및 효율성 향상

**재사용 전략**:

1. **이미지 라이브러리 구축**
   - [ ] 생성된 이미지 Supabase Storage 저장
   - [ ] 이미지 메타데이터 저장 (키워드, 카테고리, 사용 횟수)
   - [ ] 이미지 검색 시스템 (키워드 기반)

2. **재사용 우선순위**
   - [ ] 1순위: 동일 키워드/카테고리 이미지 재사용
   - [ ] 2순위: 유사 키워드 이미지 재사용
   - [ ] 3순위: 새 이미지 생성

3. **재사용 시나리오**
   - [ ] 블로그 → 백링크 (SNS): 동일 이미지 재사용
   - [ ] 블로그 → 블로그: 유사 주제 이미지 재사용
   - [ ] 영상 썸네일 → 블로그: 스타일 재사용

4. **이미지 변형 시스템**
   - [ ] 기존 이미지 리사이즈 (다양한 크기)
   - [ ] 텍스트 오버레이 추가/제거
   - [ ] 필터 적용 (밝기, 대비, 색상)

**구현 파일**:
- `shared/services/image/imageLibraryService.ts`
- `shared/services/image/imageReuseService.ts`
- `shared/services/image/imageTransformer.ts`

**데이터베이스 스키마**:
```sql
-- 이미지 라이브러리 테이블
CREATE TABLE image_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  keywords TEXT[],  -- 관련 키워드
  category TEXT,  -- 카테고리
  content_type TEXT,  -- 'thumbnail', 'blog', 'social'
  usage_count INTEGER DEFAULT 0,  -- 사용 횟수
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 이미지 사용 이력 테이블
CREATE TABLE image_usage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_id UUID REFERENCES image_library(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,  -- 'blog', 'youtube', 'social'
  content_id TEXT,  -- 블로그 포스트 ID, 유튜브 영상 ID 등
  usage_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.3 비용 효율적인 이미지 생성 전략 (무료 우선)

**전략 1: 무료 이미지 라이브러리 우선 사용 (핵심) ⭐**
- **목표**: 일일 신규 AI 생성 0-5장 이하
- **방법**:
  1. Unsplash/Pexels/Pixabay에서 키워드 기반 검색
  2. 적합한 이미지 다운로드 및 저장
  3. 간단한 편집 (텍스트 오버레이, 필터)으로 변형
  4. 이미지 라이브러리에 저장 및 재사용

**전략 2: 이미지 재사용 최대화**
- **목표**: 동일/유사 이미지 재사용률 80-90%
- **방법**:
  - 이미지 라이브러리 우선 검색
  - 키워드/카테고리 기반 매칭
  - 텍스트 오버레이만 변경하여 재사용

**전략 3: 간단한 이미지 편집으로 변형**
- **목표**: 1장의 이미지를 여러 용도로 활용
- **방법**:
  - 텍스트 오버레이 추가/제거
  - 필터 적용 (밝기, 대비, 색상)
  - 리사이즈 및 크롭
  - Canvas API 또는 Sharp 활용

**전략 4: FFmpeg + MediaFX로 영상 합성**
- **목표**: 고정 이미지 + 음원 → 영상 (비용 $0)
- **방법**:
  - 무료 이미지 라이브러리에서 배경 이미지
  - FFmpeg로 이미지 + 오디오 합성
  - MediaFX로 효과 추가 (필요 시)

**예상 비용 (무료 이미지 라이브러리 우선 전략)**:

| 시나리오 | 무료 이미지 | AI 생성 | 월간 비용 |
|---------|------------|--------|----------|
| **무료 우선 90%** | 24-32장 | 3-4장 | $5-15 (AI 최소) |
| **무료 우선 95%** | 26-33장 | 1-2장 | $2-8 (AI 최소) |
| **무료 우선 98%** | 27-34장 | 0-1장 | $0-5 (AI 거의 없음) |

**목표**: 무료 이미지 라이브러리 95-98% 활용 → 월간 $0-15

**구현 우선순위**:
1. **무료 이미지 라이브러리 API 연동** (즉시)
2. **이미지 편집 시스템** (Canvas API, Sharp)
3. **이미지 재사용 시스템**
4. **AI 이미지 생성** (선택적, 최소한)

---

### 3. 지속적 개선 시스템 (Continuous Improvement System)

#### 3.1 초기 단계: 수동 검토 기반 학습

**프로세스**:

1. **자동 생성 → 수동 검토 → 피드백 수집**
   - [ ] 시스템이 콘텐츠 자동 생성
   - [ ] 사용자가 수동 검토 및 수정
   - [ ] 수정 사항 피드백 수집
   - [ ] 패턴 학습 및 개선

2. **피드백 데이터 수집**
   - [ ] 수정된 제목 저장
   - [ ] 수정된 썸네일 저장
   - [ ] 수정된 내용 저장
   - [ ] 수정 이유 태깅

3. **패턴 학습**
   - [ ] 사용자 선호 패턴 분석
   - [ ] 자주 수정되는 항목 식별
   - [ ] 개선 우선순위 결정

#### 3.2 중기 단계: 반자동화

**프로세스**:

1. **품질 점수 기반 자동 승인**
   - [ ] 품질 점수 80점 이상: 자동 승인
   - [ ] 품질 점수 70-80점: 사용자 검토
   - [ ] 품질 점수 70점 미만: 자동 재생성

2. **A/B 테스트**
   - [ ] 여러 버전 생성
   - [ ] 사용자 선택 또는 자동 선택
   - [ ] 성과 추적

#### 3.3 장기 단계: 완전 자동화

**프로세스**:

1. **품질 검증 통과 시 자동 발행**
   - [ ] 모든 품질 기준 통과 시 자동 승인
   - [ ] 예외 케이스만 사용자 검토

2. **지속적 개선**
   - [ ] 실제 성과 데이터 수집
   - [ ] 실패 사례 분석
   - [ ] 패턴 업데이트

---

### 4. 일일 콘텐츠 생성 워크플로우

**일일 콘텐츠 목표**:
- 롱폼 영상: 1개 (1시간 플레이리스트)
- 숏폼 영상: 2개
- 블로그 게시글: 4개 (블로그당 1개)
- 썸네일: 3장 (롱폼 1 + 숏폼 2)
- 블로그 이미지: 24-32장 (게시글당 6-8장)

**워크플로우**:

```
1. 키워드 수집 및 분석 (자동)
   ↓
2. 콘텐츠 계획 수립 (자동)
   - 롱폼 영상 주제
   - 숏폼 영상 주제 2개
   - 블로그 게시글 주제 4개
   ↓
3. 이미지 준비 (자동, 무료 우선)
   - 무료 이미지 라이브러리 검색 (Unsplash/Pexels/Pixabay)
   - 이미지 라이브러리에서 재사용 가능한 이미지 검색
   - 간단한 편집 (텍스트 오버레이, 필터)으로 변형
   - 부족한 경우만 AI 생성 (최소한)
   ↓
4. 콘텐츠 생성 (자동)
   - 제목 생성
   - 내용 생성
   - 태그 생성
   - 썸네일 생성
   ↓
5. 품질 검증 (자동)
   - 품질 점수 계산
   - 미통과 시 재생성
   ↓
6. 수동 검토 (초기 단계)
   - 사용자 검토 및 수정
   - 피드백 수집
   ↓
7. 발행 (자동 또는 수동 승인)
   - 블로그 자동 발행
   - 유튜브 자동 업로드
   - 백링크 자동 배포
   ↓
8. 성과 추적 (자동)
   - 조회수 수집
   - 성과 분석
   - 패턴 업데이트
```

---

### 5. 구현 우선순위

#### Phase 1: 기본 콘텐츠 생성 시스템 (즉시 진행)
- [ ] 제목 생성기
- [ ] 내용 생성기
- [ ] 태그 생성기
- [ ] 카테고리 선정기
- [ ] 형태소 패턴 분석기

#### Phase 2: 이미지 관리 시스템 (즉시 진행, 무료 우선)
- [ ] 무료 이미지 라이브러리 API 연동 (Unsplash/Pexels/Pixabay) ⭐ 최우선
- [ ] 이미지 라이브러리 구축 (Supabase Storage)
- [ ] 이미지 재사용 시스템
- [ ] 이미지 편집 시스템 (Canvas API, Sharp)
  - 텍스트 오버레이
  - 필터 적용
  - 리사이즈 및 크롭
- [ ] FFmpeg + MediaFX 영상 합성 (고정 이미지 + 음원)
- [ ] AI 이미지 생성 API 연동 (선택적, 최소한)

#### Phase 3: 품질 검증 시스템 (Phase 1, 2 완료 후)
- [ ] 품질 점수 계산 시스템
- [ ] 자동 재생성 시스템
- [ ] 수동 검토 UI

#### Phase 4: 지속적 개선 시스템 (운영 중)
- [ ] 피드백 수집 시스템
- [ ] 패턴 학습 시스템
- [ ] A/B 테스트 시스템

---

## 🧪 테스트 전략

### 테스트 파일 위치 규칙

1. **단위 테스트**: 각 모듈의 `__tests__/` 폴더
   - `src/features/auth/__tests__/authService.test.ts`
   - `src/features/settings/__tests__/apiKeyService.test.ts`

2. **통합 테스트**: `backend/src/__tests__/` 또는 `tests/integration/`
   - API 엔드포인트 테스트
   - 모듈 간 통합 테스트

3. **E2E 테스트**: `tests/e2e/`
   - 전체 플로우 테스트

### 테스트 파일 네이밍
- `*.test.ts` - 단위 테스트
- `*.test.tsx` - 컴포넌트 테스트
- `*.spec.ts` - 통합 테스트
- `*.e2e.ts` - E2E 테스트

---

## 📦 더미 데이터 및 테스트 파일

### 더미 데이터 위치
- `src/__mocks__/` - 프론트엔드 모킹 데이터
- `backend/src/__mocks__/` - 백엔드 모킹 데이터
- `tests/fixtures/` - 테스트 픽스처

### 더미 데이터 파일 예시
```
__mocks__/
├── api/
│   ├── auth.mock.ts            # 인증 API 모킹
│   └── blogger.mock.ts        # 블로거 API 모킹
├── data/
│   ├── users.mock.ts           # 사용자 더미 데이터
│   └── blogPosts.mock.ts       # 블로그 포스트 더미 데이터
└── handlers/
    └── apiHandlers.ts          # MSW 핸들러
```

---

## 🔍 코드 리뷰 체크리스트

### 모듈 추가 시 확인사항

- [ ] 모듈이 단일 책임 원칙을 따르는가?
- [ ] 의존성 방향이 올바른가? (하위 → 상위만 허용)
- [ ] 순환 의존성이 없는가?
- [ ] 테스트 파일이 작성되었는가?
- [ ] 타입 정의가 명확한가?
- [ ] Barrel export (`index.ts`)가 있는가?
- [ ] 문서화가 되어 있는가?

### 코드 품질 체크리스트

- [ ] 함수/컴포넌트가 100줄 이하인가?
- [ ] 중복 코드가 없는가?
- [ ] 공통 로직이 `shared/`로 추출되었는가?
- [ ] 에러 처리가 적절한가?
- [ ] 타입 안정성이 보장되는가?

---

## 📊 모듈 의존성 관리

### 의존성 그래프 생성

각 모듈은 `MODULE_DEPENDENCIES.md`에 문서화되어야 합니다.

**예시**:
```markdown
## auth 모듈 의존성

### 의존하는 모듈
- shared/services/api/client.ts
- shared/services/storage/storageService.ts
- shared/components/ui/Button.tsx

### 의존받는 모듈
- app/routes.tsx (라우팅)
- features/settings (인증 확인)
```

---

## 🗄️ 멀티 테넌트 데이터 모델

### 사용자 API 키 테이블 (Supabase)

```sql
-- user_api_keys 테이블
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Google APIs
  google_api_key TEXT,  -- 암호화 저장
  google_client_id TEXT,  -- 암호화 저장
  google_client_secret TEXT,  -- 암호화 저장
  
  -- Blogger API
  blogger_api_key TEXT,  -- 암호화 저장
  
  -- YouTube API
  youtube_api_key TEXT,  -- 암호화 저장
  
  -- 음원 생성
  suno_api_key TEXT,  -- 암호화 저장
  
  -- 이미지/영상 생성
  openai_api_key TEXT,  -- 암호화 저장 (DALL-E)
  midjourney_api_key TEXT,  -- 암호화 저장
  nano_banana_api_key TEXT,  -- 암호화 저장 (Nano Banana)
  hixfield_api_key TEXT,  -- 암호화 저장 (Hixfield)
  
  -- 콘텐츠 생성
  context7_api_key TEXT,  -- 암호화 저장
  
  -- DistroKid (자격증명)
  distrokid_email TEXT,  -- 암호화 저장
  distrokid_password TEXT,  -- 암호화 저장
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys"
  ON user_api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON user_api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON user_api_keys FOR UPDATE
  USING (auth.uid() = user_id);
```

### 추가 테이블

```sql
-- 블로그 설정 테이블
CREATE TABLE user_blog_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blog_id TEXT NOT NULL,
  blog_url TEXT NOT NULL,
  blog_name TEXT,
  optimization_enabled BOOLEAN DEFAULT true,
  last_optimized_at TIMESTAMP,
  lighthouse_score_before INTEGER,
  lighthouse_score_after INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, blog_id)
);

-- 음원 프로젝트 테이블
CREATE TABLE music_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  music_count INTEGER DEFAULT 10,  -- 10-20개
  total_duration INTEGER,  -- 초 단위
  mood TEXT,
  genre TEXT,
  status TEXT DEFAULT 'draft',  -- draft, generating, completed, uploaded
  youtube_video_id TEXT,
  distrokid_track_ids TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 성과 분석 데이터 테이블
CREATE TABLE analytics_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,  -- 'blog', 'youtube', 'music'
  content_id TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id, date)
);

-- 이미지 라이브러리 테이블 (이미지 재사용 시스템)
CREATE TABLE image_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,  -- Supabase Storage 경로
  keywords TEXT[],  -- 관련 키워드 배열
  category TEXT,  -- 카테고리
  content_type TEXT NOT NULL,  -- 'thumbnail', 'blog', 'social', 'youtube'
  original_prompt TEXT,  -- 생성 시 사용한 프롬프트
  usage_count INTEGER DEFAULT 0,  -- 사용 횟수
  last_used_at TIMESTAMP,  -- 마지막 사용 시간
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 이미지 사용 이력 테이블
CREATE TABLE image_usage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_id UUID REFERENCES image_library(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,  -- 'blog', 'youtube', 'social'
  content_id TEXT,  -- 블로그 포스트 ID, 유튜브 영상 ID 등
  usage_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS 정책 (이미지 라이브러리)
ALTER TABLE image_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own images"
  ON image_library FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own images"
  ON image_library FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own images"
  ON image_library FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS 정책 (이미지 사용 이력)
ALTER TABLE image_usage_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own image usage"
  ON image_usage_history FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own image usage"
  ON image_usage_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 🚀 개발 단계별 체크리스트

### Phase 1: 기본 인증 및 API 키 관리 ✅ 완료

#### 1.1 프로젝트 구조 설정 ✅
- [x] 디렉토리 구조 생성
- [x] Barrel export 파일 생성
- [x] 경로 별칭 설정 (`tsconfig.json`, `vite.config.ts`)
- [x] ESLint 규칙 설정

#### 1.2 공유 모듈 구축 ✅
- [x] `shared/services/api/client.ts` - API 클라이언트
- [x] `shared/services/storage/storageService.ts` - 스토리지 서비스
- [x] `shared/components/ui/*` - UI 컴포넌트 추가
- [x] `shared/utils/validators.ts` - 유효성 검사 유틸
- [x] `shared/types/api.types.ts` - API 타입

#### 1.3 인증 모듈 구현 ✅
- [x] `features/auth/services/authService.ts`
- [x] `features/auth/hooks/useAuth.ts`
- [x] `features/auth/components/LoginForm.tsx`
- [x] `features/auth/components/SignupForm.tsx`
- [x] OAuth 로그인 (Google, GitHub, Kakao)

#### 1.4 설정 모듈 구현 ✅
- [x] `features/settings/services/apiKeyService.ts`
- [x] `features/settings/hooks/useApiKeys.ts`
- [x] `features/settings/components/SettingsPage.tsx`
- [x] `features/settings/components/ApiKeyForm.tsx`

#### 1.5 대시보드 레이아웃 ✅
- [x] 헤더 및 네비게이션
- [x] 사이드바 메뉴
- [x] 기본 대시보드 페이지 (UI)

#### 1.6 인프라 ✅
- [x] Vercel 배포
- [x] Supabase OAuth 설정
- [x] GitHub 레포지토리 연동

---

### Phase 1.4.5: 랜딩페이지 구현 ✅ 완료

#### 우선순위: 높음

- [x] 랜딩페이지 컴포넌트 생성
- [x] 메인 페이지(/)를 랜딩페이지로 설정
- [x] 인증 상태에 따른 리다이렉트 로직 (인증된 사용자는 /dashboard로)
- [x] 현대적이고 매력적인 UI 디자인
- [x] 주요 기능 소개 섹션
- [x] CTA 버튼 (로그인/회원가입)

### Phase 1.5: 대시보드 데이터 연동 ✅ 완료

#### 우선순위: 높음

- [x] Supabase에서 통계 데이터 조회
- [x] 블로그 게시물 수 집계
- [x] 음원 생성 수 집계
- [x] 유튜브 영상 수 집계
- [x] 최근 활동 목록 구현
- [x] 시간순 정렬 및 타입별 아이콘

---

### Phase 1.6: 성과 분석 대시보드 ❌ 미시작

#### 우선순위: 높음 (신규 요청)

- [ ] 그래프 라이브러리 추가 (recharts 또는 chart.js)
- [ ] YouTube Analytics API 연동 (사용자별 API)
- [ ] 조회수 데이터 수집 및 저장
- [ ] 일별/주별/월별 조회수 그래프
- [ ] 성과 비교 로직 (지난달 vs 이번달)
- [ ] 연도별 섹션
- [ ] 지표 카드 구현 (총 조회수, 평균, 최고 등)
- [ ] 트렌드 분석

---

### Phase 2: 블로거 모듈 기본 구조 ⏳ 진행 중

#### 우선순위: 높음

- [x] 타입 정의 (`BloggerPost`, `BloggerBlog` 등)
- [x] 서비스 레이어 (`bloggerService.ts`)
- [x] Google Blogger API v3 연동 (사용자별 API 키 사용)
- [x] 블로그 목록 컴포넌트
- [x] 블로그 포스트 목록 조회
- [x] 게시물 작성/수정 UI (OAuth 2.0 인증 완료)
- [x] 자동 포스트 생성 기능 (키워드 기반)
- [x] 완전 자동화 모드 (스케줄링)
- [ ] API 키 암호화/복호화 통합 (향후 구현)

**참고**: 포스트 생성 및 수정은 OAuth 2.0 인증이 필요합니다. OAuth 인증이 완료되어 포스트 작성/수정이 가능합니다.

---

### Phase 2.6: 키워드 분석기 및 형태소 분석기 ✅ 완료 (2024-12-03)

#### 우선순위: 높음

**목표**: 블로그 콘텐츠 최적화를 위한 키워드 및 형태소 분석 도구 제공

#### 기능 요구사항

1. **키워드 분석기** ✅
   - [x] 문서 수집 기능 (여러 문서 입력)
   - [x] 키워드 추출 및 빈도 분석
   - [x] 문서별 키워드 집계
   - [x] 도메인별 인기 키워드 패턴 매칭
   - [x] 키워드 빈도 시각화 (Bar Chart, Pie Chart)
   - [x] 상위 키워드 선택 기능
   - [x] 필터링 옵션 (최소 빈도, 최소 문서 수)
   - [x] 키워드 분석 결과를 자동 생성 폼에 전달

2. **형태소 분석기** ✅
   - [x] 텍스트 형태소 추출
   - [x] 형태소 빈도 분석
   - [x] 반복 패턴 감지
   - [x] 의미 없는 형태소 자동 감지
   - [x] 의미 없는 형태소 제거 기능
   - [x] 형태소 빈도 시각화 (Bar Chart)
   - [x] 제거된 형태소 목록 표시

3. **UI/UX** ✅
   - [x] 독립적인 분석기 페이지 (`/blogger/keyword-analyzer`, `/blogger/morpheme-analyzer`)
   - [x] BloggerPage에서 분석기 접근 버튼
   - [x] 직관적인 차트 시각화 (recharts)
   - [x] 실시간 분석 결과 표시
   - [x] 분석 결과를 자동 생성 폼에 연동

#### 기술 스택
- **recharts**: 차트 시각화 라이브러리
- **TypeScript**: 타입 안정성
- **React Hook Form**: 폼 관리

#### 구현 완료 사항
- ✅ `KeywordAnalyzer.tsx`: 키워드 분석 UI 컴포넌트
- ✅ `MorphemeAnalyzer.tsx`: 형태소 분석 UI 컴포넌트
- ✅ `keywordAnalysisService.ts`: 키워드 분석 로직
- ✅ 라우팅 추가 (`/blogger/keyword-analyzer`, `/blogger/morpheme-analyzer`)
- ✅ BloggerPage에 분석기 접근 버튼 추가

#### 향후 개선 사항
- [ ] 서버 사이드 형태소 분석기 연동 (한국어 형태소 분석 정확도 향상)
- [ ] 키워드 분석 결과 저장 (Supabase)
- [ ] 문서 수집 자동화 (웹 크롤링, RSS 피드 등)
- [ ] 키워드 트렌드 분석 (시간대별 변화)
- [ ] 의미 없는 형태소 패턴 학습 (ML 기반)

---

### Phase 2.7: 키워드/형태소 분석기 고도화 및 백링크 자동화 ❌ 미시작 (2024-12-03 저녁 세션 요청)

#### 우선순위: 최우선 ⚠️

**목적**: 완전 자동화된 블로그 콘텐츠 생성 및 배포 시스템 구축

**핵심 가치**: 사용자가 키워드를 찾아서 보고하는 것이 아니라, 시스템이 자동으로 최적 키워드를 찾아서 추천하고, 블로그 글을 자동 생성하여 여러 플랫폼에 배포하는 완전 자동화 시스템

**상세 내용**: `SESSION_CONTINUITY.md`의 "Phase 2.7" 섹션 참조

#### 주요 기능

1. **키워드 분석기 고도화**
   - [ ] Google Search MCP Server 연동
   - [ ] 자동 키워드 검색 스케줄러
   - [ ] 키워드 점수 시스템 (대형/소형, 경쟁율 분석)
   - [ ] 최적 키워드 자동 추천

2. **형태소 분석기 고도화**
   - [ ] 형태소 분석 서버 연동
   - [ ] 자동 블로그 글 재구성
   - [ ] SEO 최적화 자동 적용

3. **백링크 자동화**
   - [ ] 6개 플랫폼 자동 배포 (LinkedIn, Medium, Facebook, Instagram, Threads, Reddit)
   - [ ] 플랫폼별 콘텐츠 형식 변환
   - [ ] 배포 상태 추적

**예상 시간**: 4-7주

---

### Phase 2.5: Lighthouse 블로그 최적화 자동화 ❌ 미시작

#### 우선순위: 높음

**목표**: 사용자 블로그를 Lighthouse 100점(또는 근접)으로 최적화

#### 기능 요구사항

1. **블로그 분석**
   - [ ] Lighthouse CI 설정
   - [ ] 현재 Lighthouse 점수 측정
   - [ ] 문제점 진단
   - [ ] 개선 가능 항목 식별

2. **자동 최적화**
   - [ ] 이미지 최적화 (WebP 변환, 압축)
   - [ ] CSS/JS 최소화 및 번들링
   - [ ] 메타 태그 최적화
   - [ ] 폰트 최적화 (preload, subset)
   - [ ] 레이지 로딩 적용
   - [ ] 캐싱 전략 적용

3. **최적화 실행**
   - [ ] "내 블로그 최적화하기" 버튼 UI
   - [ ] 단계별 진행 상황 표시
   - [ ] 최적화 전/후 비교 리포트
   - [ ] 사용자별 최적화 히스토리 저장

4. **멀티 테넌트 API 관리**
   - [ ] 사용자별 Google Blogger API 입력
   - [ ] API 키 암호화 저장
   - [ ] API 키 유효성 검증

#### 기술 스택
- **Lighthouse CI**: 자동화된 Lighthouse 측정
- **Puppeteer/Playwright**: 브라우저 자동화
- **ImageMagick/Sharp**: 이미지 최적화
- **Google Blogger API v3**: 블로그 수정

#### 구현 파일
- `features/blogger/services/lighthouseService.ts`
- `features/blogger/services/optimizationService.ts`
- `features/blogger/components/BlogOptimizationPage.tsx`

---

### Phase 3: 유튜브 음원 플레이리스트 자동화 (고품질) ❌ 미시작

#### 우선순위: 중간

**⚠️ 중요: 품질 보장이 핵심입니다**

**현실성 검토**: 유튜브 자동화는 기술적으로 가능하지만, **품질이 핵심**입니다. 저품질 콘텐츠는 조회수가 낮고 의미가 없습니다. 따라서 **성공 사례 분석 및 학습 시스템이 필수**입니다.

**목표**: 10-20개 음원을 30분-1시간 플레이리스트로 자동 생성 및 업로드 (고품질 기준 충족)

#### 기능 요구사항

**⚠️ 필수 전제 조건**: Phase 3 시작 전에 "품질 보장 전략" 섹션의 "성공 사례 분석 시스템" 구축이 완료되어야 합니다.

1. **성공 사례 분석 (필수)**
   - [ ] 유튜브 성공 영상 100개 이상 수집
   - [ ] 썸네일 패턴 분석
   - [ ] 후킹 전략 분석
   - [ ] 콘텐츠 구성 분석
   - [ ] 메타데이터 패턴 분석
   - [ ] 패턴 데이터베이스 구축

2. **플레이리스트 분석**
   - [ ] YouTube URL 입력
   - [ ] 플레이리스트 메타데이터 추출
   - [ ] 음원 목록 및 타이밍 분석
   - [ ] 썸네일 스타일 분석
   - [ ] 태그 및 설명 분석

2. **음원 생성 및 조합**
   - [ ] 가사 생성/미생성 옵션
   - [ ] 분위기/장르 선택
   - [ ] 성별/보컬 스타일 선택
   - [ ] 일관된 분위기 유지 알고리즘
   - [ ] **10-20개 음원 묶음 생성** (30분-1시간 플레이리스트)
   - [ ] 음원 간 자연스러운 전환 처리

3. **이미지 준비 (무료 이미지 라이브러리 활용)**
   - [ ] Unsplash/Pexels에서 배경 이미지 다운로드
   - [ ] 키워드 기반 이미지 검색 (예: "sky", "clouds", "cozy", "jazz")
   - [ ] 이미지 저장 및 메타데이터 저장
   - [ ] 텍스트 오버레이 추가 (Canvas API 또는 Sharp)
     - "Playlist", "JAZZ", "Cozy" 등 텍스트
     - 폰트 스타일 및 색상 적용
   - [ ] 이미지 리사이즈 (YouTube 규격: 1920x1080)

4. **FFmpeg + MediaFX 영상 합성 (비용 $0)**
   - [ ] 여러 음원을 하나의 오디오로 조합
   - [ ] 고정된 이미지 + 오디오 → 영상 합성
     - 단일 이미지 또는 여러 이미지 순환
     - 각 음원 구간에 이미지 전환 (선택적)
   - [ ] 전환 효과 적용 (fade, crossfade 등)
   - [ ] MediaFX로 추가 효과 (필요 시)
   - [ ] YouTube 최적화 (H.264, 1080p, 비트레이트 최적화)
   - **비용**: $0 (FFmpeg + MediaFX는 오픈소스)

5. **자동 업로드**
   - [ ] YouTube API 연동 (사용자별 API)
   - [ ] 설명란 자동 생성
   - [ ] 각 음원 시작 지점 타임스탬프
   - [ ] 수익 안내 고지 자동 추가
   - [ ] 태그 최적화

6. **품질 검증 시스템**
   - [ ] 썸네일 품질 점수 검증 (70점 이상)
   - [ ] 제목 품질 점수 검증 (70점 이상)
   - [ ] 콘텐츠 품질 점수 검증 (70점 이상)
   - [ ] SEO 품질 점수 검증 (70점 이상)
   - [ ] 미통과 시 자동 재생성 (최대 3회)
   - [ ] 사용자 수동 검토 시스템

7. **DistroKid 자동화**
   - [ ] Puppeteer/Playwright로 브라우저 자동화
   - [ ] 로그인 자동화
   - [ ] 음원 업로드 자동화
   - [ ] 배포 플랫폼 선택

#### 기술 스택
- **YouTube Data API v3**: 플레이리스트 분석, 업로드 (사용자별 API)
- **Suno API**: 음원 생성 (사용자별 API)
- **DALL-E/Midjourney API**: 썸네일 및 영상용 이미지 생성 (사용자별 API)
- **FFmpeg 6.0+**: 음원 편집, 영상 합성
- **Context7 MCP**: 고품질 콘텐츠 생성 (사용자별 API)
- **Puppeteer/Playwright**: DistroKid 자동화

#### 구현 파일
- `shared/services/ffmpeg/ffmpegService.ts` - FFmpeg 서비스 모듈
- `features/music/services/playlistAnalyzer.ts` - 플레이리스트 분석
- `features/music/services/playlistVideoService.ts` - 영상 생성 워크플로우
- `features/music/services/distrokidService.ts` - DistroKid 자동화
- `features/youtube/services/uploadService.ts` - 업로드 서비스

#### FFmpeg 주요 기능
- `combineAudios()`: 여러 음원을 하나의 오디오로 조합
- `createVideoFromAudioAndImages()`: 오디오 + 이미지들을 영상으로 합성
- `optimizeForYouTube()`: YouTube 업로드 최적화

---

### Phase 4: 유튜브 쇼츠 자동화 (고품질) ❌ 미시작

#### 우선순위: 낮음

**⚠️ 중요: 품질 보장이 핵심입니다**

**현실성 검토**: 쇼츠 자동화는 기술적으로 가능하지만, **품질이 핵심**입니다. 특히 쇼츠는 첫 3초가 중요하며, 후킹 전략이 성공을 좌우합니다.

**목표**: 고품질 쇼츠 자동 생성 (성공 패턴 기반)

#### 기능 요구사항

**⚠️ 필수 전제 조건**: Phase 4 시작 전에 "품질 보장 전략" 섹션의 "성공 사례 분석 시스템" 구축이 완료되어야 합니다.

1. **성공 사례 분석 (필수)**
   - [ ] 성공한 쇼츠 100개 이상 수집
   - [ ] 첫 3초 컷 분석 (후킹 전략)
   - [ ] 편집 패턴 추출 (컷 전환, 타이밍)
   - [ ] 썸네일 패턴 분석 (쇼츠 특화)
   - [ ] 제목/태그 패턴 분석
   - [ ] 자막 스타일 및 타이밍 분석
   - [ ] 음악/효과음 사용 패턴 분석
   - [ ] 패턴 데이터베이스 구축

2. **콘텐츠 분석**
   - [ ] 성공한 쇼츠 분석 (위 항목 참조)
   - [ ] 편집 패턴 추출
   - [ ] 썸네일 패턴 분석
   - [ ] 제목/태그 패턴 분석

2. **콘텐츠 생성**
   - [ ] 스크립트 생성 (썰채널)
   - [ ] 음원 선택 및 편집
   - [ ] 자동 편집 (컷, 전환)
   - [ ] 자막 생성

3. **최적화**
   - [ ] 썸네일 최적화
   - [ ] 제목 최적화 (키워드)
   - [ ] 태그 최적화
   - [ ] 설명 최적화

4. **품질 검증 시스템**
   - [ ] 썸네일 품질 점수 검증 (70점 이상)
   - [ ] 제목 품질 점수 검증 (70점 이상)
   - [ ] 첫 3초 후킹 품질 점수 검증 (80점 이상) ⚠️ 쇼츠 핵심
   - [ ] 편집 품질 점수 검증 (70점 이상)
   - [ ] 미통과 시 자동 재생성 (최대 3회)
   - [ ] 사용자 수동 검토 시스템

5. **자동 업로드**
   - [ ] YouTube Shorts API
   - [ ] 최적화된 메타데이터
   - [ ] 자동 스케줄링

#### 기술 스택
- **YouTube Shorts API**: 업로드
- **FFmpeg**: 비디오 편집
- **OpenAI/Claude**: 스크립트 생성
- **Whisper API**: 자막 생성
- **Context7 MCP**: 고품질 콘텐츠 생성

---

### Phase 1.7: API 키 발급 가이드 구현 ✅ 완료

#### 우선순위: 높음

- [x] API 가이드 타입 및 데이터 정의
- [x] API 가이드 페이지 컴포넌트 생성
- [x] 설정 페이지에 물음표 버튼 추가 (각 API 키 옆)
- [x] 라우팅 추가 및 빌드 확인
- [x] Context7 API 가이드 포함 (고품질 콘텐츠 생성 설명)

### Phase 1.8: 멀티 테넌트 API 키 관리 개선 ⏳ 진행 중

#### 우선순위: 중간

- [ ] API 키 암호화/복호화 모듈 구현
- [ ] 서비스 레이어에 사용자 API 키 주입 패턴
- [ ] API 키 유효성 검증
- [ ] RLS 정책 확인 및 강화
- [ ] API 키 사용 로그 (암호화된 형태)

---

## 📚 문서화 규칙

### 각 모듈은 다음 문서를 포함해야 함

1. **README.md** (선택사항, 복잡한 모듈만)
   - 모듈 개요
   - 사용 방법
   - 예제 코드

2. **타입 정의** (`types/*.types.ts`)
   - 모든 타입은 명확히 정의
   - JSDoc 주석 포함

3. **의존성 문서화** (`MODULE_DEPENDENCIES.md`에 기록)
   - 의존하는 모듈
   - 의존받는 모듈

---

## 🔄 리팩토링 가이드

### 리팩토링이 필요한 시점

1. **중복 코드 발견**: 공통 로직을 `shared/`로 추출
2. **모듈이 너무 커짐**: 기능별로 분리
3. **의존성이 복잡해짐**: 의존성 그래프 재검토
4. **테스트가 어려움**: 모듈 분리 및 의존성 주입

### 리팩토링 체크리스트

- [ ] 기존 테스트가 통과하는가?
- [ ] 의존성 방향이 올바른가?
- [ ] 문서가 업데이트되었는가?
- [ ] 다른 모듈에 영향이 없는가?

---

---

## 🎯 우선순위 요약

### 즉시 진행 (우선순위 1) ⚠️ 최우선

1. **Phase 2.7: 키워드/형태소 분석기 고도화 및 백링크 자동화** ❌ 미시작
   - Google Search MCP Server 연동
   - 키워드 점수 시스템
   - 자동 키워드 추천
   - 형태소 분석기 고도화
   - 백링크 자동화 (6개 플랫폼)
   - 예상 시간: 4-7주
   - **상세 내용**: `SESSION_CONTINUITY.md`의 "Phase 2.7" 섹션 참조

2. **품질 보장 전략 구축** (Phase 3, 4 전 필수) ❌ 미시작
   - 성공 사례 분석 시스템
   - 패턴 학습 및 적용 시스템
   - 품질 검증 시스템
   - 지속적 개선 시스템
   - 예상 시간: 2-3개월
   - **⚠️ 중요**: Phase 3, 4 시작 전 반드시 완료 필요

### 단기 (우선순위 2)

3. **랜딩페이지 구현** (Phase 1.4.5) ✅ 완료
   - 메인 페이지를 랜딩페이지로 설정
   - 인증 상태에 따른 자동 리다이렉트
   - 현대적이고 매력적인 UI

4. **대시보드 데이터 연동** (Phase 1.5) ✅ 완료
   - 실제 통계 데이터 표시
   - 최근 활동 목록
   - 시간순 정렬 및 타입별 아이콘

5. **성과 분석 대시보드** (Phase 1.6)
   - 조회수 그래프 및 지표
   - 월별/연도별 비교
   - 예상 시간: 4-6시간

### 단기 (우선순위 2)
3. **블로거 모듈 기본 구조** (Phase 2) ⏳ 진행 중
   - Google Blogger API 연동 ✅
   - 블로그 목록 조회 ✅
   - 포스트 목록 조회 ✅
   - 게시물 작성/수정 UI (OAuth 2.0 필요 - 향후 구현)

4. **Lighthouse 최적화** (Phase 2.5)
   - 분석 모듈
   - 최적화 실행
   - UI 구현
   - 예상 시간: 2주

### 중기 (우선순위 3) ⚠️ 품질 보장 전략 완료 후 진행

6. **음원 플레이리스트 자동화** (Phase 3)
   - **전제 조건**: 품질 보장 전략 구축 완료 필수
   - 성공 사례 분석 (썸네일, 후킹, 콘텐츠 구성)
   - 플레이리스트 분석
   - 음원 생성 개선 (10-20개 묶음)
   - FFmpeg 영상 합성
   - 품질 검증 시스템
   - 자동 업로드
   - 예상 시간: 4-6주 (품질 보장 전략 포함 시 6-9주)

6. **API 키 발급 가이드 구현** (Phase 1.7) ✅ 완료
   - 각 API 키별 발급 가이드 페이지
   - 설정 페이지에서 가이드로 이동하는 버튼
   - Context7 API 가이드 포함

7. **멀티 테넌트 API 키 관리 개선** (Phase 1.8)
   - 암호화/복호화 모듈
   - 서비스 레이어 패턴
   - 예상 시간: 2-3시간

### 장기 (우선순위 4) ⚠️ 품질 보장 전략 완료 후 진행

8. **유튜브 쇼츠 자동화** (Phase 4)
   - **전제 조건**: 품질 보장 전략 구축 완료 필수
   - 성공 사례 분석 (첫 3초 후킹, 편집 패턴, 썸네일)
   - 쇼츠 분석
   - 콘텐츠 생성
   - 자동 편집
   - 품질 검증 시스템 (특히 첫 3초 후킹)
   - 예상 시간: 4-5주 (품질 보장 전략 포함 시 6-8주)

---

## 🛠️ 기술 스택

### 프론트엔드
- **React 19.2.0**: UI 프레임워크
- **TypeScript**: 타입 안정성
- **Vite 7.2.4**: 빌드 도구
- **React Router DOM 7.9.6**: 라우팅
- **Tanstack Query 5.90.11**: 데이터 페칭
- **Tailwind CSS 4.1.17**: 스타일링
- **Shadcn/ui**: UI 컴포넌트
- **Sonner**: Toast 알림
- **recharts/chart.js**: 차트 라이브러리 (성과 분석)

### 백엔드/서비스
- **Supabase**: 인증, 데이터베이스
- **Google Blogger API v3**: 블로그 관리 (사용자별 API)
- **YouTube Data API v3**: 영상 업로드 (사용자별 API)
- **YouTube Analytics API**: 성과 분석 (사용자별 API)
- **Suno API**: 음원 생성 (사용자별 API)
- **FFmpeg 6.0+**: 영상/오디오 처리
- **Context7 MCP**: 고품질 콘텐츠 생성 (사용자별 API)
- **이미지 생성 및 편집** (비용 최소화 우선):
  - **무료 이미지 라이브러리** (우선 사용) ⭐:
    - **Unsplash API**: 무료, 고품질 사진
    - **Pexels API**: 무료, 다양한 카테고리
    - **Pixabay API**: 무료, 상업적 사용 가능
  - **이미지 편집 도구** (무료):
    - **Canvas API**: 브라우저 기반 이미지 편집 (텍스트 오버레이, 필터)
    - **Sharp**: Node.js 이미지 처리 (리사이즈, 크롭, 필터)
  - **AI 이미지 생성 API** (선택적, 최소한):
    - **Nano Banana API**: 비용 효율적 (특수 케이스만)
    - **Hixfield API**: 전문적 이미지 생성 (특수 케이스만)
    - **DALL-E 3**: 안정적 고품질 (대안)
- **Lighthouse CI**: 블로그 성능 분석
- **Puppeteer/Playwright**: 브라우저 자동화 (DistroKid)

### 배포
- **Vercel**: 프론트엔드 배포
- **GitHub**: 버전 관리 (rmswo87/autobot)

---

## 📚 문서 참조 구조

### 중앙집중식 문서 관리

이 문서(`DEVELOPMENT_PLAN.md`)가 **마스터 문서**입니다. 모든 체크리스트와 Phase별 진행 상황은 이 문서에서만 관리합니다.

```
DEVELOPMENT_PLAN.md (마스터 문서) ⭐
├── 체크리스트 (모든 Phase)
├── Phase별 진행 상황
├── 우선순위 요약
└── 기술 스택

다른 문서들 (이 문서 참조)
├── SESSION_CONTINUITY.md → 이 문서의 현재 상태 요약
├── CURRENT_STATUS.md → 이 문서의 Phase별 완료 상태 요약
├── ARCHITECTURE.md → 아키텍처 설계 (고유 내용)
├── PROJECT_STRUCTURE.md → 프로젝트 구조 (고유 내용)
└── MODULE_DEPENDENCIES.md → 모듈 의존성 (고유 내용)
```

### 문서 업데이트 가이드

**작업 시 업데이트 순서:**

1. **체크리스트 완료 시**
   - ✅ `DEVELOPMENT_PLAN.md`의 해당 Phase 체크리스트 업데이트
   - ✅ 필요 시 `CURRENT_STATUS.md` 업데이트 (Phase 완료 상태 반영)

2. **Phase 진행 상황 변경 시**
   - ✅ `DEVELOPMENT_PLAN.md`의 Phase 상태 업데이트 (✅ 완료 / ⏳ 진행 중 / ❌ 미시작)
   - ✅ `SESSION_CONTINUITY.md`의 "완료된 작업" 섹션 업데이트
   - ✅ `CURRENT_STATUS.md`의 "다음 단계" 섹션 업데이트

3. **우선순위 변경 시**
   - ✅ `DEVELOPMENT_PLAN.md`의 "우선순위 요약" 섹션 업데이트
   - ✅ `SESSION_CONTINUITY.md`의 "당장 해야 할 작업" 섹션 업데이트

4. **아키텍처 변경 시**
   - ✅ `DEVELOPMENT_PLAN.md`의 "프로젝트 아키텍처 원칙" 업데이트
   - ✅ `ARCHITECTURE.md` 업데이트 (상세 설계)
   - ✅ `MODULE_DEPENDENCIES.md` 업데이트 (의존성 변경)

5. **프로젝트 구조 변경 시**
   - ✅ `DEVELOPMENT_PLAN.md`의 "프로젝트 구조 설계" 업데이트
   - ✅ `PROJECT_STRUCTURE.md` 업데이트 (실제 구조)

### 관련 문서

#### 필수 읽기
- **SESSION_CONTINUITY.md**: 세션 연속성 가이드 ⭐ (이 문서의 요약)
- **DOCUMENT_UPDATE_GUIDE.md**: 문서 업데이트 가이드 ⭐ (작업 시 필수)
- **API_KEYS.md**: API 키 관리 (민감 정보)

#### 참고 문서
- **ARCHITECTURE.md**: 아키텍처 설계 (이 문서 참조)
- **PROJECT_STRUCTURE.md**: 프로젝트 구조 (이 문서 참조)
- **MODULE_DEPENDENCIES.md**: 모듈 의존성 (이 문서 참조)
- **CURRENT_STATUS.md**: 현재 상태 요약 (이 문서 참조)
- **ffmpeg.md**: n8n 기반 영상 생성 참고

#### Deprecated 문서 (참고용)
- **QUALITY_AUTOMATION_PLAN.md**: 고품질 자동화 계획 (이 문서에 통합됨)
- **FFMPEG_IMPLEMENTATION_PLAN.md**: FFmpeg 구현 상세 (이 문서에 통합됨)
- **MULTI_TENANT_ARCHITECTURE.md**: 멀티 테넌트 아키텍처 (이 문서에 통합됨)

---

## 📝 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2024-12-02 | 1.0.0 | 초기 문서 작성 | Development Team |
| 2024-12-03 | 2.0.0 | 고품질 자동화 계획 추가 (Phase 2.5, 3, 4) | Development Team |
| 2024-12-03 | 3.0.0 | 개발 계획서 통합 완료 - 멀티 테넌트 아키텍처, Phase별 체크리스트, 우선순위 명확화 | Development Team |
| 2024-12-03 | 3.1.0 | 중앙집중식 문서 관리 구조 구축 - 문서 참조 구조 및 업데이트 가이드 추가 | Development Team |
| 2024-12-03 | 3.2.0 | Phase 2.7 추가, 품질 보장 전략 강화 - 성공 사례 분석 시스템, 품질 검증 시스템 추가 | Development Team |
| 2024-12-03 | 3.3.0 | 체계적인 콘텐츠 생성 전략 추가 - 썸네일/제목/내용/태그/카테고리 생성 전략, 이미지 재사용 시스템, 비용 효율적 이미지 관리 전략 | Development Team |
| 2024-12-03 | 3.4.0 | 비용 최소화 전략 강화 - 무료 이미지 라이브러리(Unsplash/Pexels/Pixabay) 우선 사용, FFmpeg+MediaFX 영상 합성, AI 이미지 생성 최소화 (월간 $0-15 목표) | Development Team |

