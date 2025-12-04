/**
 * 자동 키워드 추천 시스템
 * 
 * 매일 수집된 키워드 중에서 최적의 키워드를 자동으로 추천
 */

import { calculateKeywordScores, filterRecommendedKeywords, type KeywordScore, type BlogAnalysis } from './keywordScoringService'
import { searchKeywords } from './keywordSearchService'
import { supabase } from '@/shared/services/supabase/client'

export interface RecommendedKeyword extends KeywordScore {
  id?: string
  userId?: string
  collectedAt?: Date
  recommendedAt?: Date
  used?: boolean
  usedAt?: Date
  feedback?: 'positive' | 'negative' | null
}

export interface KeywordRecommendationOptions {
  domain?: string
  minScore?: number
  maxResults?: number
  prioritizeLongtail?: boolean
  blogAnalysis?: BlogAnalysis
}

/**
 * 키워드 추천 생성
 */
export async function generateKeywordRecommendations(
  query: string,
  options: KeywordRecommendationOptions = {}
): Promise<RecommendedKeyword[]> {
  const {
    minScore = 50,
    maxResults = 20,
    prioritizeLongtail = true,
    blogAnalysis,
  } = options
  
  // 1. 키워드 검색
  const searchResults = await searchKeywords({
    query,
    maxResults: maxResults * 2, // 필터링을 위해 더 많이 가져옴
    includeRelated: true,
  })
  
  // 2. 검색 결과를 Metrics로 변환
  const metricsMap = new Map(
    searchResults.map((result) => [
      result.keyword,
      {
        keyword: result.keyword,
        searchVolume: result.searchVolume,
        competitionLevel: result.competitionLevel,
      },
    ])
  )
  
  // 3. 키워드 점수 계산
  const keywords = searchResults.map((r) => r.keyword)
  const scores = calculateKeywordScores(keywords, metricsMap, blogAnalysis)
  
  // 4. 추천 키워드 필터링
  const filtered = filterRecommendedKeywords(scores, {
    minScore,
    keywordType: prioritizeLongtail ? ['longtail', 'small', 'medium'] : undefined,
  })
  
  // 5. RecommendedKeyword 형식으로 변환
  const recommendations: RecommendedKeyword[] = filtered.slice(0, maxResults).map((score) => ({
    ...score,
    collectedAt: new Date(),
    recommendedAt: new Date(),
    used: false,
  }))
  
  return recommendations
}

/**
 * 추천 키워드 저장 (Supabase)
 */
export async function saveKeywordRecommendations(
  userId: string,
  recommendations: RecommendedKeyword[]
): Promise<void> {
  const records = recommendations.map((rec) => ({
    user_id: userId,
    keyword: rec.keyword,
    search_volume: rec.metrics.searchVolume,
    competition_level: rec.metrics.competitionLevel,
    keyword_type: rec.metrics.keywordType,
    final_score: rec.finalScore,
    search_volume_score: rec.searchVolumeScore,
    competition_score: rec.competitionScore,
    blog_fit_score: rec.blogFitScore,
    recommendation: rec.recommendation,
    collected_at: rec.collectedAt?.toISOString(),
    recommended_at: rec.recommendedAt?.toISOString(),
  }))
  
  const { error } = await supabase
    .from('recommended_keywords')
    .upsert(records, { onConflict: 'user_id,keyword' })
  
  if (error) {
    console.error('Error saving keyword recommendations:', error)
    throw error
  }
}

/**
 * 사용자별 추천 키워드 조회
 */
export async function getUserRecommendedKeywords(
  userId: string,
  options: {
    used?: boolean
    recommendation?: 'high' | 'medium' | 'low'
    limit?: number
  } = {}
): Promise<RecommendedKeyword[]> {
  const { used, recommendation, limit = 50 } = options
  
  let query = supabase
    .from('recommended_keywords')
    .select('*')
    .eq('user_id', userId)
    .order('final_score', { ascending: false })
    .limit(limit)
  
  if (used !== undefined) {
    query = query.eq('used', used)
  }
  
  if (recommendation) {
    query = query.eq('recommendation', recommendation)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching recommended keywords:', error)
    throw error
  }
  
  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    keyword: row.keyword,
    metrics: {
      keyword: row.keyword,
      searchVolume: row.search_volume,
      competitionLevel: row.competition_level,
      keywordType: row.keyword_type,
    },
    finalScore: row.final_score,
    searchVolumeScore: row.search_volume_score,
    competitionScore: row.competition_score,
    blogFitScore: row.blog_fit_score,
    recommendation: row.recommendation,
    collectedAt: row.collected_at ? new Date(row.collected_at) : undefined,
    recommendedAt: row.recommended_at ? new Date(row.recommended_at) : undefined,
    used: row.used || false,
    usedAt: row.used_at ? new Date(row.used_at) : undefined,
    feedback: row.feedback,
  }))
}

/**
 * 추천 키워드 사용 표시
 */
export async function markKeywordAsUsed(
  userId: string,
  keywordId: string
): Promise<void> {
  const { error } = await supabase
    .from('recommended_keywords')
    .update({
      used: true,
      used_at: new Date().toISOString(),
    })
    .eq('id', keywordId)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error marking keyword as used:', error)
    throw error
  }
}

/**
 * 롱테일 키워드 우선 추천
 */
export async function recommendLongtailKeywords(
  baseKeywords: string[],
  options: KeywordRecommendationOptions = {}
): Promise<RecommendedKeyword[]> {
  // 롱테일 키워드 생성 (기본 키워드 + 접미사)
  const suffixes = [
    '이란?',
    '사용법',
    '하는 방법',
    '완벽 가이드',
    '초보자 가이드',
    '설치 방법',
    '활용법',
    '비교',
    '장단점',
    '추천',
  ]
  
  const longtailKeywords: string[] = []
  
  for (const baseKeyword of baseKeywords) {
    for (const suffix of suffixes) {
      longtailKeywords.push(`${baseKeyword} ${suffix}`)
    }
  }
  
  // 롱테일 키워드 추천 생성
  const recommendations: RecommendedKeyword[] = []
  
  for (const keyword of longtailKeywords) {
    const recs = await generateKeywordRecommendations(keyword, {
      ...options,
      prioritizeLongtail: true,
      maxResults: 1,
    })
    
    if (recs.length > 0 && recs[0].metrics.keywordType === 'longtail') {
      recommendations.push(recs[0])
    }
  }
  
  // 점수 순으로 정렬
  return recommendations.sort((a, b) => b.finalScore - a.finalScore)
}

/**
 * 트렌드 반영 추천 키워드
 */
export async function recommendTrendingKeywords(
  domain?: string,
  options: KeywordRecommendationOptions = {}
): Promise<RecommendedKeyword[]> {
  // TODO: Google Trends API 연동
  // 현재는 기본 추천 반환
  return generateKeywordRecommendations(domain || 'trending', {
    ...options,
    maxResults: 10,
  })
}

