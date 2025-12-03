# 멀티 테넌트 아키텍처 설계

**작성일**: 2024-12-03  
**버전**: 1.0.0  
**목적**: 각 고객이 개인의 API를 사용하는 배포용 SaaS 구조 설계

---

## 🎯 멀티 테넌트 원칙

### 핵심 원칙
1. **데이터 격리**: 각 사용자의 데이터는 완전히 분리
2. **API 키 관리**: 사용자별 API 키를 안전하게 저장 및 사용
3. **확장성**: 다수의 사용자가 동시에 사용 가능
4. **보안**: API 키 암호화 저장 및 안전한 사용

---

## 📊 데이터 모델

### 사용자 API 키 테이블 (Supabase)

```sql
-- user_api_keys 테이블 (기존)
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

### 블로그 설정 테이블

```sql
CREATE TABLE user_blog_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blog_id TEXT NOT NULL,  -- Blogger 블로그 ID
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
```

### 음원 프로젝트 테이블

```sql
CREATE TABLE music_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  music_count INTEGER DEFAULT 10,  -- 10-20개
  total_duration INTEGER,  -- 초 단위 (30분 = 1800초, 1시간 = 3600초)
  mood TEXT,  -- 분위기
  genre TEXT,  -- 장르
  status TEXT DEFAULT 'draft',  -- draft, generating, completed, uploaded
  youtube_video_id TEXT,
  distrokid_track_ids TEXT[],  -- 배열
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 API 키 관리

### 암호화 저장

```typescript
// shared/services/encryption.ts
import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.VITE_ENCRYPTION_KEY || 'default-key'

export function encryptApiKey(apiKey: string): string {
  return CryptoJS.AES.encrypt(apiKey, ENCRYPTION_KEY).toString()
}

export function decryptApiKey(encryptedKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}
```

### API 키 사용 패턴

```typescript
// features/blogger/services/bloggerService.ts
import { apiKeyService } from '@/features/settings/services'
import { decryptApiKey } from '@/shared/services/encryption'

export async function optimizeBlog(blogId: string) {
  // 1. 사용자 API 키 가져오기
  const apiKeys = await apiKeyService.getApiKeys()
  if (!apiKeys?.google_api_key) {
    throw new Error('Google API 키가 설정되지 않았습니다.')
  }
  
  // 2. API 키 복호화
  const decryptedKey = decryptApiKey(apiKeys.google_api_key)
  
  // 3. API 호출 시 사용
  const blogger = new BloggerAPI(decryptedKey)
  // ... 최적화 작업
}
```

---

## 🏗️ 서비스 레이어 구조

### 사용자별 API 컨텍스트

```typescript
// shared/contexts/UserApiContext.tsx
interface UserApiContextType {
  apiKeys: UserApiKeys | null
  isLoading: boolean
  refreshApiKeys: () => Promise<void>
  hasApiKey: (keyType: ApiKeyType) => boolean
}

export function UserApiProvider({ children }: { children: ReactNode }) {
  // 사용자 API 키 관리
}
```

### 서비스 레이어 패턴

모든 외부 API 호출 서비스는 사용자 API 키를 받아서 사용:

```typescript
// features/blogger/services/bloggerService.ts
export const bloggerService = {
  async optimizeBlog(blogId: string, userApiKey: string) {
    // 사용자 API 키 사용
  }
}

// features/music/services/musicService.ts
export const musicService = {
  async generatePlaylist(config: PlaylistConfig, userSunoApiKey: string) {
    // 사용자 Suno API 키 사용
  }
}
```

---

## 🔄 워크플로우

### Lighthouse 최적화 워크플로우

```
1. 사용자가 "내 블로그 최적화하기" 버튼 클릭
2. 시스템이 사용자의 Blogger API 키 조회
3. API 키 유효성 검증
4. 블로그 분석 (Lighthouse 실행)
5. 최적화 계획 수립
6. 최적화 실행 (사용자 API 키 사용)
7. 결과 저장 및 리포트 생성
```

### 음원 플레이리스트 생성 워크플로우

```
1. 사용자가 플레이리스트 설정 입력
   - 음원 개수: 10-20개
   - 총 길이: 30분 또는 1시간
   - 분위기/장르 선택
2. 시스템이 사용자의 Suno API 키 조회
3. 음원 생성 (10-20개)
4. 이미지/영상 자동 생성 (각 음원별)
5. FFmpeg로 영상 합성
6. 사용자의 YouTube API 키로 업로드
7. DistroKid 자동화 (사용자 자격증명 사용)
```

---

## 🛡️ 보안 고려사항

### 1. API 키 암호화
- 저장 시 암호화
- 사용 시 복호화
- 메모리에서 즉시 제거

### 2. RLS (Row Level Security)
- Supabase RLS로 데이터 격리
- 사용자는 자신의 데이터만 접근 가능

### 3. API 키 검증
- 저장 전 유효성 검증
- 사용 전 재검증

### 4. 로깅 및 모니터링
- API 키 사용 로그 (암호화된 형태)
- 이상 사용 패턴 감지

---

## 📝 구현 체크리스트

### Phase 1: 멀티 테넌트 기반 구조
- [ ] API 키 암호화/복호화 모듈
- [ ] 사용자별 API 키 관리 UI
- [ ] 서비스 레이어에 사용자 API 키 주입 패턴
- [ ] RLS 정책 설정

### Phase 2: 각 기능별 멀티 테넌트 적용
- [ ] Blogger 최적화: 사용자 API 키 사용
- [ ] 음원 생성: 사용자 Suno API 키 사용
- [ ] YouTube 업로드: 사용자 YouTube API 키 사용
- [ ] DistroKid: 사용자 자격증명 사용

---

**최종 업데이트**: 2024-12-03

