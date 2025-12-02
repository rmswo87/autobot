# Autobot 아키텍처 설계 문서

## 📋 문서 개요

이 문서는 Autobot 프로젝트의 전체 아키텍처를 설명하는 상세 설계 문서입니다.

**최종 수정일**: 2024-12-02  
**버전**: 1.0.0

---

## 🏗️ 전체 아키텍처 개요

### 계층형 아키텍처 (Layered Architecture)

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│              (React Components, Pages)                  │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                    Application Layer                    │
│            (Hooks, State Management)                    │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                     Domain Layer                        │
│              (Services, Business Logic)                 │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                  Infrastructure Layer                   │
│        (API Clients, Storage, External Services)        │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 프론트엔드 아키텍처

### 컴포넌트 계층 구조

```
App (최상위)
├── Providers (Context Providers)
│   ├── AuthProvider
│   ├── QueryProvider (React Query)
│   └── ThemeProvider
│
├── Routes (라우팅)
│   ├── Public Routes
│   │   ├── /login
│   │   └── /signup
│   │
│   └── Protected Routes
│       ├── /dashboard
│       ├── /settings
│       ├── /blogger
│       ├── /music
│       └── /youtube
│
└── Pages (페이지 컴포넌트)
    ├── LoginPage
    ├── DashboardPage
    ├── SettingsPage
    └── ...
```

### 상태 관리 전략

#### 1. 서버 상태 (Server State)
- **도구**: React Query (@tanstack/react-query)
- **용도**: API 데이터 캐싱, 동기화, 백그라운드 업데이트
- **위치**: `src/shared/services/api/`

#### 2. 클라이언트 상태 (Client State)
- **도구**: Zustand
- **용도**: UI 상태, 폼 상태, 모달 상태
- **위치**: `src/shared/stores/`

#### 3. 전역 상태 (Global State)
- **도구**: React Context
- **용도**: 인증 상태, 테마 설정
- **위치**: `src/features/*/contexts/`

---

## ⚙️ 백엔드 아키텍처

### 모듈 구조

```
backend/
├── app/                    # 앱 설정
│   ├── app.ts             # Express 앱 설정
│   └── server.ts          # 서버 시작
│
├── modules/               # 기능별 모듈
│   ├── auth/
│   │   ├── controllers/   # 요청 처리
│   │   ├── services/      # 비즈니스 로직
│   │   ├── routes/        # 라우트 정의
│   │   └── middleware/    # 미들웨어
│   │
│   └── ...
│
├── shared/                # 공유 모듈
│   ├── middleware/        # 공통 미들웨어
│   ├── utils/             # 유틸리티
│   └── types/             # 타입 정의
│
└── workers/               # 백그라운드 워커
    ├── scheduler.ts        # 스케줄러
    └── queue.ts           # 작업 큐
```

### API 설계 원칙

#### RESTful API 설계
- **리소스 기반 URL**: `/api/blogger/posts`, `/api/music`
- **HTTP 메서드**: GET, POST, PUT, DELETE
- **상태 코드**: 표준 HTTP 상태 코드 사용

#### 에러 처리
```typescript
// 표준 에러 응답 형식
{
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": {}
  }
}
```

---

## 🔐 보안 아키텍처

### 인증 및 인가 플로우

```
1. 사용자 로그인
   ↓
2. JWT 토큰 발급 (Access Token + Refresh Token)
   ↓
3. Access Token을 헤더에 포함하여 API 요청
   ↓
4. 미들웨어에서 토큰 검증
   ↓
5. 토큰 만료 시 Refresh Token으로 갱신
```

### API 키 관리

#### 암호화 저장
- **알고리즘**: AES-256-GCM
- **키 관리**: 환경 변수에서 암호화 키 로드
- **저장 위치**: 데이터베이스 (암호화된 상태)

#### 접근 제어
- **RLS (Row Level Security)**: 사용자는 자신의 API 키만 접근 가능
- **마스킹**: 화면 표시 시 마스킹 처리

---

## 🗄️ 데이터베이스 아키텍처

### 테이블 구조

```
users (Supabase Auth)
  ├── user_api_keys (1:1)
  ├── blogger_accounts (1:N)
  ├── blog_posts (1:N, via blogger_accounts)
  ├── music (1:N)
  ├── youtube_videos (1:N)
  └── scheduled_jobs (1:N)
```

### 데이터베이스 설계 원칙

1. **정규화**: 중복 데이터 최소화
2. **인덱싱**: 자주 조회되는 컬럼에 인덱스 생성
3. **RLS**: Row Level Security로 데이터 접근 제어
4. **마이그레이션**: 버전 관리된 스키마 변경

---

## 🔄 데이터 플로우

### 블로그 포스트 생성 플로우

```
1. 사용자 입력 (키워드, 주제)
   ↓
2. 프론트엔드: ContentGenerator 컴포넌트
   ↓
3. API 호출: POST /api/content/generate
   ↓
4. 백엔드: contentService.generate()
   ├── 사용자 API 키 조회 (암호화 해제)
   ├── Context7 MCP API 호출
   └── 콘텐츠 반환
   ↓
5. 프론트엔드: 콘텐츠 표시 및 편집
   ↓
6. 예약 발행 설정
   ↓
7. API 호출: POST /api/blogger/posts/schedule
   ↓
8. 백엔드: 작업 큐에 추가
   ↓
9. 스케줄러 워커: 지정 시간에 발행
```

### 음원 생성 및 YouTube 업로드 플로우

```
1. 사용자 입력 (태그, 키워드, 분위기)
   ↓
2. 프론트엔드: MusicGenerator 컴포넌트
   ↓
3. API 호출: POST /api/music/generate
   ↓
4. 백엔드: sunoService.generate()
   ├── 사용자 API 키 조회
   ├── Suno API 호출
   └── 음원 정보 반환
   ↓
5. 프론트엔드: 음원 미리듣기
   ↓
6. YouTube 업로드 선택
   ↓
7. API 호출: POST /api/youtube/videos
   ↓
8. 백엔드: videoService.create()
   ├── 비디오 파일 생성 (음원 + 이미지)
   ├── 썸네일 생성
   └── YouTube API 업로드
```

---

## 🧩 모듈 설계 원칙

### 단일 책임 원칙 (SRP)
- 각 모듈은 하나의 책임만 가짐
- 예: `authService`는 인증만 담당

### 의존성 역전 원칙 (DIP)
- 고수준 모듈은 저수준 모듈에 의존하지 않음
- 인터페이스를 통한 의존성 주입

### 개방-폐쇄 원칙 (OCP)
- 확장에는 열려있고 수정에는 닫혀있음
- 새로운 기능은 기존 코드 수정 없이 추가

---

## 🔌 외부 서비스 통합

### API 통합 패턴

#### 1. Adapter Pattern
```typescript
// 외부 API를 내부 인터페이스로 래핑
interface ContentGenerator {
  generate(keywords: string[]): Promise<Content>;
}

class Context7Adapter implements ContentGenerator {
  async generate(keywords: string[]): Promise<Content> {
    // Context7 MCP API 호출
  }
}
```

#### 2. Strategy Pattern
```typescript
// 여러 콘텐츠 생성 전략
interface ContentStrategy {
  generate(keywords: string[]): Promise<Content>;
}

class Context7Strategy implements ContentStrategy { }
class OpenAIStrategy implements ContentStrategy { }
```

---

## 📊 성능 최적화 전략

### 프론트엔드
1. **코드 스플리팅**: React.lazy()로 라우트별 코드 분할
2. **이미지 최적화**: WebP 형식, lazy loading
3. **캐싱**: React Query의 자동 캐싱 활용
4. **메모이제이션**: useMemo, useCallback 활용

### 백엔드
1. **데이터베이스 쿼리 최적화**: 인덱스 활용, N+1 문제 해결
2. **캐싱**: Redis를 활용한 API 응답 캐싱
3. **비동기 처리**: 작업 큐를 통한 비동기 작업 처리
4. **연결 풀링**: 데이터베이스 연결 풀 관리

---

## 🧪 테스트 아키텍처

### 테스트 피라미드

```
        ┌─────────┐
       │   E2E    │  (적음)
      └─────────┘
     ┌─────────────┐
    │ Integration  │  (중간)
   └─────────────┘
  ┌───────────────────┐
 │     Unit Tests     │  (많음)
└───────────────────┘
```

### 테스트 전략
- **단위 테스트**: 각 모듈의 독립적 테스트
- **통합 테스트**: 모듈 간 상호작용 테스트
- **E2E 테스트**: 전체 플로우 테스트

---

## 🚀 배포 아키텍처

### 배포 구조

```
┌─────────────────┐
│   Vercel/Netlify│  (프론트엔드)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Railway/Render │  (백엔드)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Supabase     │  (데이터베이스)
└─────────────────┘
```

### 환경 변수 관리
- **프론트엔드**: Vercel/Netlify 환경 변수 설정
- **백엔드**: Railway/Render 환경 변수 설정
- **민감 정보**: Secrets Manager 활용

---

## 📝 다음 단계

1. **API_REFERENCE.md 작성** - 상세 API 문서
2. **TESTING_STRATEGY.md 작성** - 테스트 전략 상세화
3. **DEPLOYMENT.md 작성** - 배포 가이드

---

## 📝 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2024-12-02 | 1.0.0 | 초기 문서 작성 | Development Team |

