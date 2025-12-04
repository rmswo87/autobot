/**
 * 키워드 분석 및 형태소 분석 서비스
 * 
 * 참고: 한국어 형태소 분석은 서버 사이드에서 실행되어야 하므로,
 * 향후 백엔드 API를 통해 구현됩니다.
 * 현재는 기본적인 키워드 추출 및 분석 로직을 제공합니다.
 */

export interface KeywordFrequency {
  keyword: string
  frequency: number
  documentCount: number // 몇 개의 문서에서 등장했는지
  documents: string[] // 문서 ID 목록
}

export interface KeywordAnalysisResult {
  keywords: KeywordFrequency[]
  topKeywords: KeywordFrequency[] // 상위 N개 키워드
  domainKeywords: KeywordFrequency[] // 도메인별 인기 키워드
  totalDocuments: number
}

export interface DocumentKeyword {
  documentId: string
  keywords: string[]
  keywordCounts: Record<string, number>
}

/**
 * 도메인별 인기 키워드 패턴
 */
export const DOMAIN_KEYWORD_PATTERNS: Record<string, string[]> = {
  ai: [
    '~이란?',
    '~란?',
    '~란 무엇인가',
    '~사용법',
    '~하는 방법',
    '~완벽 가이드',
    '~초보자 가이드',
    '~설치 방법',
    '~활용법',
    '~비교',
  ],
  tech: [
    '~이란?',
    '~사용법',
    '~설치 방법',
    '~완벽 가이드',
    '~비교',
    '~장단점',
    '~추천',
  ],
  default: [
    '~이란?',
    '~사용법',
    '~하는 방법',
    '~완벽 가이드',
  ],
}

/**
 * 키워드 추출 (기본 - 향후 형태소 분석으로 대체)
 */
export function extractKeywords(text: string): string[] {
  // 기본적인 키워드 추출 (공백, 구두점으로 분리)
  // 향후 형태소 분석으로 대체 예정
  const words = text
    .replace(/[^\w\s가-힣]/g, ' ') // 특수문자 제거
    .split(/\s+/)
    .filter((word) => word.length >= 2) // 2글자 이상만
    .filter((word) => !isStopWord(word)) // 불용어 제거

  return [...new Set(words)] // 중복 제거
}

/**
 * 불용어 목록
 */
const STOP_WORDS = [
  '그리고', '그런데', '하지만', '그러나', '또한', '또', '또는',
  '이것', '저것', '그것', '이런', '저런', '그런',
  '있다', '없다', '되다', '하다', '이다',
  '의', '을', '를', '에', '에서', '로', '으로',
  '가', '이', '와', '과', '도', '만', '까지',
]

function isStopWord(word: string): boolean {
  return STOP_WORDS.includes(word)
}

/**
 * 문서별 키워드 집계
 */
export function aggregateDocumentKeywords(
  documents: DocumentKeyword[]
): KeywordFrequency[] {
  const keywordMap = new Map<string, {
    frequency: number
    documentIds: Set<string>
  }>()

  // 문서별 키워드 집계
  for (const doc of documents) {
    for (const [keyword, count] of Object.entries(doc.keywordCounts)) {
      if (!keywordMap.has(keyword)) {
        keywordMap.set(keyword, {
          frequency: 0,
          documentIds: new Set(),
        })
      }
      const entry = keywordMap.get(keyword)!
      entry.frequency += count
      entry.documentIds.add(doc.documentId)
    }
  }

  // KeywordFrequency 배열로 변환
  const keywords: KeywordFrequency[] = Array.from(keywordMap.entries()).map(
    ([keyword, data]) => ({
      keyword,
      frequency: data.frequency,
      documentCount: data.documentIds.size,
      documents: Array.from(data.documentIds),
    })
  )

  // 빈도순 정렬
  return keywords.sort((a, b) => b.frequency - a.frequency)
}

/**
 * 키워드 분석 결과 생성
 */
export function analyzeKeywords(
  documents: DocumentKeyword[],
  options: {
    topN?: number
    minFrequency?: number
    minDocumentCount?: number
    domain?: string
  } = {}
): KeywordAnalysisResult {
  const {
    topN = 20,
    minFrequency = 2,
    minDocumentCount = 1,
    domain = 'default',
  } = options

  const allKeywords = aggregateDocumentKeywords(documents)

  // 필터링
  const filteredKeywords = allKeywords.filter(
    (kw) =>
      kw.frequency >= minFrequency && kw.documentCount >= minDocumentCount
  )

  // 상위 N개 키워드
  const topKeywords = filteredKeywords.slice(0, topN)

  // 도메인별 인기 키워드 패턴 매칭
  const domainPatterns = DOMAIN_KEYWORD_PATTERNS[domain] || DOMAIN_KEYWORD_PATTERNS.default
  const domainKeywords = filteredKeywords.filter((kw) =>
    domainPatterns.some((pattern) => kw.keyword.includes(pattern.replace('~', '')))
  )

  return {
    keywords: filteredKeywords,
    topKeywords,
    domainKeywords,
    totalDocuments: documents.length,
  }
}

/**
 * 키워드 기반 제목 생성
 * 원칙: 키워드를 단어 단위로 끊고, 앞쪽에 중요 키워드 포커스
 */
export function generateTitleFromKeywords(
  keywords: string[],
  pattern?: string
): string {
  if (keywords.length === 0) {
    return ''
  }

  // 중요 키워드 (빈도가 높은 순서대로)
  const importantKeywords = keywords.slice(0, 3) // 상위 3개

  // 도메인 패턴이 있으면 적용
  if (pattern) {
    const keyword = importantKeywords[0] || keywords[0]
    return pattern.replace('~', keyword)
  }

  // 기본: 키워드를 단어 단위로 끊어서 앞쪽에 배치
  const titleParts: string[] = []
  
  // 중요 키워드 먼저 배치
  for (const keyword of importantKeywords) {
    // 키워드를 단어 단위로 분리 (공백, 하이픈 등으로)
    const words = keyword.split(/[\s\-_]+/).filter(Boolean)
    titleParts.push(...words)
  }

  // 나머지 키워드 추가
  for (const keyword of keywords.slice(importantKeywords.length)) {
    const words = keyword.split(/[\s\-_]+/).filter(Boolean)
    titleParts.push(...words.slice(0, 2)) // 최대 2개 단어만
  }

  // 제목 생성 (최대 200자)
  let title = titleParts.join(' ')
  if (title.length > 200) {
    title = title.substring(0, 197) + '...'
  }

  return title
}

/**
 * H2 태그에 키워드 포함
 */
export function generateH2WithKeyword(keyword: string): string {
  return `<h2>${keyword}</h2>`
}

