# Autobot 프로젝트 설정 가이드

## 📋 문서 개요

이 문서는 Autobot 프로젝트의 초기 설정 및 개발 환경 구축을 위한 가이드입니다.

**최종 수정일**: 2024-12-02  
**버전**: 1.0.0

---

## 1. 프로젝트 구조 확인

### 현재 프로젝트 구조
```
Autobot/
├── src/                    # 프론트엔드 소스
│   ├── app/               # 앱 진입점 및 라우팅
│   ├── features/          # 기능별 모듈
│   ├── shared/            # 공유 모듈
│   └── lib/               # 라이브러리 설정
├── docs/                  # 문서
└── backend/               # 백엔드 (추가 예정)
```

---

## 2. 필수 사전 요구사항

### 2.1 개발 환경
- **Node.js**: 18.0.0 이상
- **npm**: 9.0.0 이상
- **Git**: 최신 버전
- **VS Code** 또는 **Cursor**: 권장 IDE

### 2.2 계정 및 API 키 (사용자가 설정 페이지에서 입력)
- Google Cloud Platform 계정 (Blogger, YouTube API용)
- Supabase 계정 (데이터베이스)
- Suno API 키 (기본값: `aebfcc2909ac4b4f890f5edc38f266f2`)
- Context7 MCP API 키
- OpenAI API 키 (선택사항, 가사 생성용)

---

## 3. 로컬 개발 환경 설정

### 3.1 프로젝트 클론 및 의존성 설치

```bash
# 프로젝트 디렉토리로 이동
cd Autobot

# 의존성 설치
npm install
```

### 3.2 환경 변수 설정

#### 프론트엔드 환경 변수 (`.env.local`)

`.env.local` 파일을 프로젝트 루트에 생성:

```env
# Supabase 설정
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API 엔드포인트
VITE_API_URL=http://localhost:3000/api
```

**참고**: 사용자의 API 키는 설정 페이지에서 입력하므로 환경 변수에는 공통 설정만 포함됩니다.

### 3.3 개발 서버 실행

```bash
# 개발 서버 시작
npm run dev
```

서버는 기본적으로 `http://localhost:5173`에서 실행됩니다.

---

## 4. Supabase 설정

### 4.1 프로젝트 생성

1. [Supabase](https://supabase.com) 접속
2. 새 프로젝트 생성
3. 프로젝트 이름: "autobot"
4. 데이터베이스 비밀번호 설정

### 4.2 데이터베이스 스키마 생성

Supabase SQL Editor에서 다음 SQL 실행:

```sql
-- 사용자 API 키 테이블 (가장 중요!)
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  google_client_id TEXT,
  google_client_secret TEXT,
  google_api_key TEXT,
  suno_api_key TEXT DEFAULT 'aebfcc2909ac4b4f890f5edc38f266f2',
  context7_api_key TEXT,
  openai_api_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 블로거 계정 테이블
CREATE TABLE blogger_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blog_id TEXT NOT NULL,
  blog_name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 블로그 포스트 테이블
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blogger_account_id UUID REFERENCES blogger_accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[],
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  images JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 음원 테이블
CREATE TABLE music (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tags TEXT[],
  lyrics TEXT,
  mood TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'mixed')),
  duration INTEGER,
  audio_url TEXT,
  image_url TEXT,
  suno_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- YouTube 비디오 테이블
CREATE TABLE youtube_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  music_id UUID REFERENCES music(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  youtube_id TEXT,
  type TEXT CHECK (type IN ('shorts', 'longform', 'playlist')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 작업 스케줄 테이블
CREATE TABLE scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('blog_post', 'youtube_video', 'playlist')),
  target_id UUID NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX idx_blogger_accounts_user_id ON blogger_accounts(user_id);
CREATE INDEX idx_blog_posts_blogger_account_id ON blog_posts(blogger_account_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_music_user_id ON music(user_id);
CREATE INDEX idx_youtube_videos_user_id ON youtube_videos(user_id);
CREATE INDEX idx_scheduled_jobs_user_id ON scheduled_jobs(user_id);
CREATE INDEX idx_scheduled_jobs_status ON scheduled_jobs(status);
CREATE INDEX idx_scheduled_jobs_scheduled_at ON scheduled_jobs(scheduled_at);

-- RLS 활성화
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogger_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE music ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Users can manage own API keys" ON user_api_keys
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own blogger accounts" ON blogger_accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own blog posts" ON blog_posts
  FOR ALL USING (auth.uid() = (SELECT user_id FROM blogger_accounts WHERE id = blogger_account_id));

CREATE POLICY "Users can manage own music" ON music
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own youtube videos" ON youtube_videos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own scheduled jobs" ON scheduled_jobs
  FOR ALL USING (auth.uid() = user_id);
```

### 4.3 환경 변수 확인

Supabase 프로젝트 설정에서 다음 정보 확인:
- **Project URL**: `.env.local`의 `VITE_SUPABASE_URL`
- **Anon Key**: `.env.local`의 `VITE_SUPABASE_ANON_KEY`
- **Service Role Key**: 백엔드에서만 사용 (나중에 설정)

---

## 5. 외부 API 설정

### 5.1 Google Cloud Platform 설정

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성
3. **Blogger API v3** 활성화
4. **YouTube Data API v3** 활성화
5. OAuth 2.0 클라이언트 ID 생성
6. API 키 생성

**참고**: 사용자가 설정 페이지에서 자신의 API 키를 입력합니다.

### 5.2 Suno API 설정

- **API 엔드포인트**: https://musicapi.ai
- **기본 API 키**: `aebfcc2909ac4b4f890f5edc38f266f2`
- **대시보드**: https://musicapi.ai/dashboard/apikey

**참고**: 사용자가 설정 페이지에서 자신의 API 키로 변경할 수 있습니다.

### 5.3 Context7 MCP 설정

1. Context7 MCP 계정 생성
2. API 키 발급
3. 사용자가 설정 페이지에서 입력

### 5.4 OpenAI API 설정 (선택사항)

1. [OpenAI Platform](https://platform.openai.com) 접속
2. API 키 발급
3. 사용자가 설정 페이지에서 입력

---

## 6. 개발 워크플로우

### 6.1 코드 작성 규칙

1. **모듈화**: 모든 기능을 `features/` 폴더의 독립적인 모듈로 작성
2. **Barrel Export**: 각 모듈은 `index.ts`로 export
3. **타입 정의**: 모든 타입은 `types/` 폴더에 정의
4. **의존성 방향**: Features → Shared → External만 허용

### 6.2 파일 생성 체크리스트

새 모듈 추가 시:
- [ ] 디렉토리 구조 생성 (`components/`, `hooks/`, `services/`, `types/`)
- [ ] `index.ts` (Barrel export) 생성
- [ ] 타입 정의 파일 생성
- [ ] 테스트 파일 생성 (`__tests__/`)
- [ ] `MODULE_DEPENDENCIES.md` 업데이트

---

## 7. 빌드 및 배포

### 7.1 개발 빌드

```bash
# 개발 서버 실행
npm run dev
```

### 7.2 프로덕션 빌드

```bash
# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

### 7.3 린트

```bash
# 린트 실행
npm run lint
```

---

## 8. 문제 해결

### 8.1 경로 별칭 오류

**증상**: `@/features/*` 등의 경로를 인식하지 못함

**해결책**:
1. `tsconfig.json`과 `vite.config.ts` 확인
2. IDE 재시작
3. `npm run dev` 재실행

### 8.2 환경 변수 로드 안 됨

**증상**: `import.meta.env.VITE_*` 값이 undefined

**해결책**:
1. `.env.local` 파일이 루트에 있는지 확인
2. 환경 변수 이름이 `VITE_`로 시작하는지 확인
3. 개발 서버 재시작

### 8.3 Supabase 연결 오류

**증상**: Supabase 클라이언트 연결 실패

**해결책**:
1. `.env.local`의 Supabase URL과 Key 확인
2. Supabase 프로젝트가 활성화되어 있는지 확인
3. RLS 정책 확인

---

## 9. 다음 단계

프로젝트 설정이 완료되면 다음 단계로 진행:

1. **Phase 1: 인증 모듈 구현**
   - `src/features/auth/` 모듈 개발
   - 로그인/회원가입 기능

2. **Phase 2: 설정 모듈 구현**
   - `src/features/settings/` 모듈 개발
   - API 키 관리 기능

---

## 📚 참고 문서

- `docs/DEVELOPMENT_PLAN.md` - 개발 계획서
- `docs/ARCHITECTURE.md` - 아키텍처 설계
- `docs/MODULE_DEPENDENCIES.md` - 모듈 의존성 맵
- `docs/PROJECT_STRUCTURE.md` - 프로젝트 구조

---

**최종 업데이트**: 2024-12-02  
**버전**: 1.0.0
