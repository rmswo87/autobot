/**
 * 키워드 점수 시스템 서비스
 * 
 * 대형/소형 키워드 분류, 경쟁율 분석, 점수 계산 로직
 */

export interface KeywordMetrics {
  keyword: string
  searchVolume?: number // 월 검색량
  competitionLevel?: number // 경쟁 강도 (0-100)
  keywordType?: 'large' | 'medium' | 'small' | 'longtail' // 키워드 유형
  wordCount?: number // 단어 수
}

export interface KeywordScore {
  keyword: string
  metrics: KeywordMetrics
  finalScore: number // 최종 점수 (0-100)
  searchVolumeScore: number // 검색량 점수 (0-30)
  competitionScore: number // 경쟁 강도 점수 (0-40)
  blogFitScore: number // 내 블로그 적합도 점수 (0-30)
  recommendation: 'high' | 'medium' | 'low' // 추천 등급
}

export interface BlogAnalysis {
  domainAuthority?: number // 도메인 권위도 (0-100)
  averagePostLength?: number // 평균 포스트 길이
  backlinkCount?: number // 백링크 수
  recentPostPerformance?: number // 최근 포스트 성과 (0-100)
}

/**
 * 키워드 유형 분류
 */
export function classifyKeywordType(keyword: string, searchVolume?: number): KeywordMetrics['keywordType'] {
  const wordCount = keyword.split(/\s+/).length
  
  // 롱테일 키워드: 3단어 이상
  if (wordCount >= 3) {
    return 'longtail'
  }
  
  // 검색량 기반 분류
  if (searchVolume !== undefined) {
    if (searchVolume >= 10000) return 'large'
    if (searchVolume >= 1000) return 'medium'
    return 'small'
  }
  
  // 검색량이 없으면 단어 수로 판단
  if (wordCount === 1) return 'large'
  if (wordCount === 2) return 'medium'
  return 'small'
}

/**
 * 검색량 점수 계산 (0-30점)
 */
export function calculateSearchVolumeScore(searchVolume?: number): number {
  if (!searchVolume) return 10 // 검색량 정보가 없으면 중간 점수
  
  // 검색량이 너무 높으면 경쟁이 치열할 수 있음
  // 검색량이 너무 낮으면 트래픽이 적음
  // 최적 범위: 1,000 ~ 10,000
  
  if (searchVolume >= 10000) {
    // 대형 키워드: 점수 감소 (경쟁 치열)
    return Math.max(15, 30 - (searchVolume / 10000) * 5)
  }
  
  if (searchVolume >= 1000) {
    // 중형 키워드: 최적 범위
    return 25 + (searchVolume / 1000) * 0.5
  }
  
  if (searchVolume >= 100) {
    // 소형 키워드: 적당한 점수
    return 15 + (searchVolume / 100) * 0.5
  }
  
  // 매우 소형 키워드: 낮은 점수
  return Math.max(5, searchVolume / 10)
}

/**
 * 경쟁 강도 점수 계산 (0-40점)
 * 경쟁이 낮을수록 높은 점수
 */
export function calculateCompetitionScore(
  competitionLevel?: number,
  keywordType?: KeywordMetrics['keywordType']
): number {
  if (competitionLevel === undefined) {
    // 경쟁 정보가 없으면 키워드 유형으로 추정
    if (keywordType === 'longtail') return 35 // 롱테일은 경쟁 낮음
    if (keywordType === 'small') return 30
    if (keywordType === 'medium') return 20
    return 15 // 대형 키워드는 경쟁 높음
  }
  
  // 경쟁 강도가 낮을수록 높은 점수
  // 0-30점: 낮은 경쟁 → 35-40점
  // 31-60점: 중간 경쟁 → 20-35점
  // 61-100점: 높은 경쟁 → 5-20점
  
  if (competitionLevel <= 30) {
    return 35 + (30 - competitionLevel) / 30 * 5 // 35-40점
  }
  
  if (competitionLevel <= 60) {
    return 20 + (60 - competitionLevel) / 30 * 15 // 20-35점
  }
  
  return Math.max(5, 20 - (competitionLevel - 60) / 40 * 15) // 5-20점
}

/**
 * 내 블로그 적합도 점수 계산 (0-30점)
 */
export function calculateBlogFitScore(
  keyword: string,
  blogAnalysis?: BlogAnalysis
): number {
  let score = 15 // 기본 점수
  
  // 도메인 권위도 반영
  if (blogAnalysis?.domainAuthority) {
    const daScore = blogAnalysis.domainAuthority / 100 * 10 // 최대 10점
    score += daScore
  }
  
  // 최근 포스트 성과 반영
  if (blogAnalysis?.recentPostPerformance) {
    const performanceScore = blogAnalysis.recentPostPerformance / 100 * 10 // 최대 10점
    score += performanceScore
  }
  
  // 롱테일 키워드는 적합도 높음
  const wordCount = keyword.split(/\s+/).length
  if (wordCount >= 3) {
    score += 5 // 롱테일 보너스
  }
  
  return Math.min(30, score)
}

/**
 * 키워드 점수 계산
 */
export function calculateKeywordScore(
  keyword: string,
  metrics: KeywordMetrics,
  blogAnalysis?: BlogAnalysis
): KeywordScore {
  // 키워드 유형 분류
  const keywordType = metrics.keywordType || classifyKeywordType(keyword, metrics.searchVolume)
  
  // 각 점수 계산
  const searchVolumeScore = calculateSearchVolumeScore(metrics.searchVolume)
  const competitionScore = calculateCompetitionScore(metrics.competitionLevel, keywordType)
  const blogFitScore = calculateBlogFitScore(keyword, blogAnalysis)
  
  // 최종 점수 계산
  const finalScore = searchVolumeScore + competitionScore + blogFitScore
  
  // 추천 등급 결정
  let recommendation: 'high' | 'medium' | 'low'
  if (finalScore >= 70) {
    recommendation = 'high'
  } else if (finalScore >= 50) {
    recommendation = 'medium'
  } else {
    recommendation = 'low'
  }
  
  return {
    keyword,
    metrics: {
      ...metrics,
      keywordType,
    },
    finalScore: Math.round(finalScore * 10) / 10, // 소수점 1자리
    searchVolumeScore: Math.round(searchVolumeScore * 10) / 10,
    competitionScore: Math.round(competitionScore * 10) / 10,
    blogFitScore: Math.round(blogFitScore * 10) / 10,
    recommendation,
  }
}

/**
 * 여러 키워드 점수 계산 및 정렬
 */
export function calculateKeywordScores(
  keywords: string[],
  metricsMap: Map<string, KeywordMetrics>,
  blogAnalysis?: BlogAnalysis
): KeywordScore[] {
  const scores = keywords.map((keyword) => {
    const metrics = metricsMap.get(keyword) || { keyword }
    return calculateKeywordScore(keyword, metrics, blogAnalysis)
  })
  
  // 점수 높은 순으로 정렬
  return scores.sort((a, b) => b.finalScore - a.finalScore)
}

/**
 * 추천 키워드 필터링
 */
export function filterRecommendedKeywords(
  scores: KeywordScore[],
  options: {
    minScore?: number
    recommendation?: 'high' | 'medium' | 'low'
    keywordType?: KeywordMetrics['keywordType'][]
  } = {}
): KeywordScore[] {
  const {
    minScore = 50,
    recommendation,
    keywordType,
  } = options
  
  return scores.filter((score) => {
    // 최소 점수 필터
    if (score.finalScore < minScore) return false
    
    // 추천 등급 필터
    if (recommendation && score.recommendation !== recommendation) return false
    
    // 키워드 유형 필터
    if (keywordType && !keywordType.includes(score.metrics.keywordType!)) return false
    
    return true
  })
}

