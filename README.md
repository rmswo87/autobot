# Autobot

자동화된 콘텐츠 생성 및 관리 플랫폼

## 🚀 빠른 시작

### 로컬 개발

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경 변수 설정**
   `.env.local` 파일을 생성하고 다음 내용을 추가하세요:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_API_URL=http://localhost:3000/api
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

## 📦 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 디렉토리에 생성됩니다.

## 🌐 Vercel 배포

### 배포 전 준비사항

1. **GitHub 레포지토리에 푸시**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Vercel 프로젝트 생성**
   - [Vercel Dashboard](https://vercel.com/dashboard)에서 "New Project" 클릭
   - GitHub 레포지토리 `rmswo87/autobot` 선택
   - Framework Preset: **Vite** 선택 (또는 자동 감지)
   - Root Directory: `./` (기본값)

3. **환경 변수 설정**
   Vercel 프로젝트 설정에서 다음 환경 변수를 추가하세요:
   - `VITE_SUPABASE_URL`: `https://zlxewiendvczathlaueu.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpseGV3aWVuZHZjemF0aGxhdWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzY1NjgsImV4cCI6MjA4MDI1MjU2OH0.5YthNPk02Y0gnwK7ap9rpku0ip_Gm8gHw-P5VGVdxFg`
   - `VITE_API_URL` (선택사항)
   
   상세 가이드: [VERCEL_ENV_SETUP.md](./docs/VERCEL_ENV_SETUP.md)

4. **배포**
   - "Deploy" 버튼 클릭
   - 배포 완료 후 제공되는 URL 확인

### 환경 변수 설정 가이드

Vercel 대시보드에서:
1. 프로젝트 선택
2. Settings > Environment Variables
3. 다음 변수 추가:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## 📁 프로젝트 구조

```
src/
├── app/              # 앱 진입점 및 라우팅
├── features/         # 기능별 모듈
│   ├── auth/         # 인증 모듈
│   ├── settings/     # 설정 모듈
│   ├── blogger/      # 블로거 모듈
│   ├── music/        # 음원 모듈
│   └── youtube/      # 유튜브 모듈
└── shared/           # 공유 모듈
    ├── components/   # 공통 컴포넌트
    ├── services/     # 공통 서비스
    └── types/        # 공통 타입
```

## 🛠️ 기술 스택

- **Frontend**: React 19, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui
- **Routing**: React Router v7
- **State Management**: React Query, Context API
- **Authentication**: Supabase Auth
- **Notifications**: Sonner

## 📚 문서

- [개발 계획서](./docs/DEVELOPMENT_PLAN.md)
- [아키텍처 설계](./docs/ARCHITECTURE.md)
- [세션 연속성 문서](./docs/SESSION_CONTINUITY.md)
- [API 키 관리](./docs/API_KEYS.md)
- [Vercel 환경 변수 설정](./docs/VERCEL_ENV_SETUP.md)
- [Supabase OAuth 설정](./docs/SUPABASE_OAUTH_SETUP.md)

## 📝 라이선스

MIT
