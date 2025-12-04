# Supabase 마이그레이션 가이드

## 블로그 자동화 기능을 위한 테이블 생성

### 1. blog_schedules 테이블

자동 발행 스케줄 설정을 저장하는 테이블입니다.

```sql
CREATE TABLE IF NOT EXISTS blog_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blog_id TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  publish_time TEXT NOT NULL, -- HH:mm 형식 (예: "09:00")
  timezone TEXT NOT NULL DEFAULT 'Asia/Seoul',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  domain TEXT NOT NULL DEFAULT 'default',
  auto_generate BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, blog_id)
);

-- RLS 정책
ALTER TABLE blog_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own schedules"
  ON blog_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedules"
  ON blog_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules"
  ON blog_schedules FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules"
  ON blog_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_blog_schedules_user_blog ON blog_schedules(user_id, blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_schedules_enabled ON blog_schedules(enabled) WHERE enabled = true;
```

### 2. scheduled_posts 테이블

스케줄된 포스트를 저장하는 테이블입니다.

```sql
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blog_id TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  title TEXT,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'published', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scheduled posts"
  ON scheduled_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled posts"
  ON scheduled_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled posts"
  ON scheduled_posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled posts"
  ON scheduled_posts FOR DELETE
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_blog ON scheduled_posts(user_id, blog_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_at ON scheduled_posts(scheduled_at) WHERE status = 'pending';
```

### 3. keyword_analysis 테이블 (선택사항)

키워드 분석 결과를 저장하는 테이블입니다.

```sql
CREATE TABLE IF NOT EXISTS keyword_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  keyword TEXT NOT NULL,
  frequency INTEGER NOT NULL DEFAULT 0,
  document_count INTEGER NOT NULL DEFAULT 0,
  documents TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, domain, keyword)
);

-- RLS 정책
ALTER TABLE keyword_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own keyword analysis"
  ON keyword_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own keyword analysis"
  ON keyword_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own keyword analysis"
  ON keyword_analysis FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_user_domain ON keyword_analysis(user_id, domain);
CREATE INDEX IF NOT EXISTS idx_keyword_analysis_frequency ON keyword_analysis(frequency DESC);
```

### 4. keyword_suggestions 테이블 (Phase 2.7)

Google Search MCP로 수집된 키워드 제안을 저장하는 테이블입니다.

```sql
CREATE TABLE IF NOT EXISTS keyword_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  competition_level INTEGER,
  keyword_type TEXT CHECK (keyword_type IN ('large', 'medium', 'small', 'longtail')),
  related_keywords TEXT[] DEFAULT '{}',
  trending BOOLEAN DEFAULT false,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE keyword_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own keyword suggestions"
  ON keyword_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own keyword suggestions"
  ON keyword_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own keyword suggestions"
  ON keyword_suggestions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own keyword suggestions"
  ON keyword_suggestions FOR DELETE
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_keyword_suggestions_user ON keyword_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_keyword_suggestions_collected_at ON keyword_suggestions(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_keyword_suggestions_trending ON keyword_suggestions(trending) WHERE trending = true;
```

### 5. recommended_keywords 테이블 (Phase 2.7)

시스템이 자동으로 추천한 키워드를 저장하는 테이블입니다.

```sql
CREATE TABLE IF NOT EXISTS recommended_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  competition_level INTEGER,
  keyword_type TEXT CHECK (keyword_type IN ('large', 'medium', 'small', 'longtail')),
  final_score NUMERIC(5, 2) NOT NULL,
  search_volume_score NUMERIC(5, 2) NOT NULL,
  competition_score NUMERIC(5, 2) NOT NULL,
  blog_fit_score NUMERIC(5, 2) NOT NULL,
  recommendation TEXT CHECK (recommendation IN ('high', 'medium', 'low')) NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  feedback TEXT CHECK (feedback IN ('positive', 'negative')),
  collected_at TIMESTAMPTZ,
  recommended_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, keyword)
);

-- RLS 정책
ALTER TABLE recommended_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recommended keywords"
  ON recommended_keywords FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommended keywords"
  ON recommended_keywords FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommended keywords"
  ON recommended_keywords FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recommended keywords"
  ON recommended_keywords FOR DELETE
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_recommended_keywords_user ON recommended_keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_recommended_keywords_final_score ON recommended_keywords(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_recommended_keywords_recommendation ON recommended_keywords(recommendation);
CREATE INDEX IF NOT EXISTS idx_recommended_keywords_used ON recommended_keywords(used) WHERE used = false;
```

## 마이그레이션 실행 방법

1. Supabase Dashboard 접속
2. SQL Editor 열기
3. 위의 SQL 스크립트를 복사하여 실행
4. 테이블이 정상적으로 생성되었는지 확인

## 참고사항

- 모든 테이블은 RLS(Row Level Security)가 활성화되어 있습니다.
- 사용자는 자신의 데이터만 조회/수정/삭제할 수 있습니다.
- `blog_schedules`와 `scheduled_posts`는 필수 테이블입니다.
- `keyword_analysis`는 선택사항이며, 향후 키워드 분석 결과를 저장하는 데 사용됩니다.

