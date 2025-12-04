/**
 * 블로그 글 자동 재구성 서비스
 * 
 * 형태소 분석을 통해 키워드를 자연스럽게 포함한 블로그 글을 자동으로 재구성
 */

import type { RecommendedKeyword } from './keywordRecommendationService'

export interface BlogReconstructionRequest {
  originalContent: string
  keywords: RecommendedKeyword[]
  targetLength?: number
  optimizeSEO?: boolean
  includeImages?: boolean
}

export interface ReconstructedBlog {
  title: string
  content: string
  h2Tags: string[]
  metaDescription: string
  suggestedImages: string[]
  keywords: string[]
  seoScore: number
}

/**
 * 블로그 글 자동 재구성
 */
export async function reconstructBlogPost(
  request: BlogReconstructionRequest
): Promise<ReconstructedBlog> {
  const {
    originalContent,
    keywords,
    targetLength = 2000,
    optimizeSEO = true,
    includeImages = true,
  } = request

  // 1. 키워드 추출 및 우선순위 정렬
  const sortedKeywords = keywords
    .sort((a, b) => b.finalScore - a.finalScore)
    .map((k) => k.keyword)

  // 2. SEO 최적화된 제목 생성
  const title = generateSEOTitle(sortedKeywords)

  // 3. 본문 재구성
  const reconstructedContent = await reconstructContent({
    originalContent,
    keywords: sortedKeywords,
    targetLength,
    optimizeSEO,
  })

  // 4. H2 태그 최적화
  const h2Tags = generateOptimizedH2Tags(sortedKeywords, reconstructedContent)

  // 5. 메타 설명 생성
  const metaDescription = generateMetaDescription(
    reconstructedContent,
    sortedKeywords
  )

  // 6. 이미지 제안
  const suggestedImages = includeImages
    ? generateImageSuggestions(sortedKeywords)
    : []

  // 7. SEO 점수 계산
  const seoScore = calculateSEOScore({
    title,
    content: reconstructedContent,
    h2Tags,
    keywords: sortedKeywords,
    metaDescription,
  })

  return {
    title,
    content: reconstructedContent,
    h2Tags,
    metaDescription,
    suggestedImages,
    keywords: sortedKeywords,
    seoScore,
  }
}

/**
 * SEO 최적화된 제목 생성
 */
function generateSEOTitle(keywords: string[]): string {
  // 주요 키워드를 앞쪽에 배치
  const mainKeyword = keywords[0] || '주제'
  
  // 제목 길이: 30-60자 권장
  let title = mainKeyword

  // 두 번째 키워드가 있으면 추가
  if (keywords.length > 1 && title.length < 40) {
    title += ` ${keywords[1]}`
  }

  // 클릭 유도 문구 추가 (길이 여유가 있을 때)
  if (title.length < 50) {
    const clickPhrases = ['완벽 가이드', '초보자 가이드', '이란?', '사용법']
    const phrase = clickPhrases[Math.floor(Math.random() * clickPhrases.length)]
    title += ` ${phrase}`
  }

  // 최대 길이 제한
  if (title.length > 60) {
    title = title.substring(0, 57) + '...'
  }

  return title
}

/**
 * 본문 재구성
 */
async function reconstructContent(params: {
  originalContent: string
  keywords: string[]
  targetLength: number
  optimizeSEO: boolean
}): Promise<string> {
  const { originalContent, keywords, targetLength, optimizeSEO } = params

  // 1. 원본 콘텐츠를 문단 단위로 분리
  const paragraphs = originalContent.split(/\n\n+/).filter((p) => p.trim().length > 0)

  // 2. 키워드를 자연스럽게 포함하도록 재구성
  let reconstructed = ''

  // 첫 번째 문단에 주요 키워드 포함
  if (paragraphs.length > 0) {
    const firstParagraph = paragraphs[0]
    const mainKeyword = keywords[0]
    
    if (mainKeyword && !firstParagraph.includes(mainKeyword)) {
      reconstructed += `<p>${mainKeyword}에 대해 알아보겠습니다. ${firstParagraph}</p>\n\n`
    } else {
      reconstructed += `<p>${firstParagraph}</p>\n\n`
    }
  }

  // 나머지 문단 처리
  for (let i = 1; i < paragraphs.length; i++) {
    let paragraph = paragraphs[i]

    // 키워드 밀도 최적화 (과도한 키워드 삽입 방지)
    if (optimizeSEO && i < keywords.length) {
      const keyword = keywords[i]
      if (keyword && !paragraph.includes(keyword)) {
        // 키워드를 자연스럽게 포함
        paragraph = insertKeywordNaturally(paragraph, keyword)
      }
    }

    reconstructed += `<p>${paragraph}</p>\n\n`
  }

  // 목표 길이에 맞춰 조정
  if (reconstructed.length < targetLength) {
    // 부족한 경우 키워드 기반 내용 추가
    reconstructed += generateAdditionalContent(keywords, targetLength - reconstructed.length)
  } else if (reconstructed.length > targetLength * 1.2) {
    // 너무 긴 경우 축약
    reconstructed = truncateContent(reconstructed, targetLength)
  }

  return reconstructed
}

/**
 * 키워드를 자연스럽게 문단에 삽입
 */
function insertKeywordNaturally(paragraph: string, keyword: string): string {
  // 문장 끝에 자연스럽게 추가
  const sentences = paragraph.split(/[.!?。！？]/).filter((s) => s.trim().length > 0)
  
  if (sentences.length > 0) {
    const lastSentence = sentences[sentences.length - 1]
    if (!lastSentence.includes(keyword)) {
      sentences[sentences.length - 1] = `${lastSentence} ${keyword}에 대해 더 알아보겠습니다.`
    }
  }

  return sentences.join('. ') + '.'
}

/**
 * 추가 콘텐츠 생성
 */
function generateAdditionalContent(keywords: string[], targetLength: number): string {
  let additional = ''

  for (const keyword of keywords.slice(1, 4)) {
    if (additional.length >= targetLength) break

    additional += `<h2>${keyword}</h2>\n\n`
    additional += `<p>${keyword}에 대한 상세한 내용을 다루겠습니다. `
    additional += `${keyword}의 특징과 활용 방법을 알아보겠습니다.</p>\n\n`
  }

  return additional
}

/**
 * 콘텐츠 축약
 */
function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content

  // 문단 단위로 축약
  const paragraphs = content.split(/\n\n+/)
  let truncated = ''
  
  for (const paragraph of paragraphs) {
    if (truncated.length + paragraph.length > maxLength) {
      break
    }
    truncated += paragraph + '\n\n'
  }

  return truncated.trim()
}

/**
 * 최적화된 H2 태그 생성
 */
function generateOptimizedH2Tags(keywords: string[], content: string): string[] {
  const h2Tags: string[] = []

  // 첫 번째 H2에 주요 키워드 포함
  if (keywords.length > 0) {
    h2Tags.push(`<h2>${keywords[0]}</h2>`)
  }

  // 나머지 키워드로 H2 생성
  for (const keyword of keywords.slice(1, 5)) {
    h2Tags.push(`<h2>${keyword}</h2>`)
  }

  // 콘텐츠에서 기존 H2 태그 추출
  const existingH2s = content.match(/<h2[^>]*>(.*?)<\/h2>/gi) || []
  for (const h2 of existingH2s.slice(0, 3)) {
    if (!h2Tags.includes(h2)) {
      h2Tags.push(h2)
    }
  }

  return h2Tags
}

/**
 * 메타 설명 생성
 */
function generateMetaDescription(
  content: string,
  keywords: string[]
): string {
  // 콘텐츠의 첫 문단 사용
  const firstParagraph = content
    .replace(/<[^>]+>/g, '') // HTML 태그 제거
    .substring(0, 150)
    .trim()

  // 키워드 포함
  const mainKeyword = keywords[0] || ''
  let description = firstParagraph

  if (mainKeyword && !description.includes(mainKeyword)) {
    description = `${mainKeyword}에 대한 정보입니다. ${description}`
  }

  // 최대 160자 제한
  if (description.length > 160) {
    description = description.substring(0, 157) + '...'
  }

  return description
}

/**
 * 이미지 제안 생성
 */
function generateImageSuggestions(keywords: string[]): string[] {
  return keywords.slice(0, 3).map((keyword) => 
    `https://images.unsplash.com/photo-...?q=${encodeURIComponent(keyword)}`
  )
}

/**
 * SEO 점수 계산 (0-100점)
 */
function calculateSEOScore(params: {
  title: string
  content: string
  h2Tags: string[]
  keywords: string[]
  metaDescription: string
}): number {
  const { title, content, h2Tags, keywords, metaDescription } = params
  let score = 0

  // 1. 제목 최적화 (20점)
  if (title.length >= 30 && title.length <= 60) score += 20
  else if (title.length >= 20 && title.length <= 70) score += 15
  else score += 10

  if (keywords.length > 0 && title.includes(keywords[0])) score += 5

  // 2. H2 태그 최적화 (20점)
  if (h2Tags.length >= 3) score += 20
  else if (h2Tags.length >= 2) score += 15
  else if (h2Tags.length >= 1) score += 10

  if (h2Tags.length > 0 && h2Tags[0].includes(keywords[0] || '')) score += 5

  // 3. 키워드 밀도 (20점)
  const contentText = content.replace(/<[^>]+>/g, '')
  const keywordCount = keywords.reduce((count, keyword) => {
    const regex = new RegExp(keyword, 'gi')
    return count + (contentText.match(regex) || []).length
  }, 0)
  
  const keywordDensity = (keywordCount / contentText.length) * 100
  if (keywordDensity >= 1 && keywordDensity <= 3) score += 20 // 최적 밀도
  else if (keywordDensity >= 0.5 && keywordDensity <= 5) score += 15
  else score += 10

  // 4. 콘텐츠 길이 (20점)
  if (contentText.length >= 1500) score += 20
  else if (contentText.length >= 1000) score += 15
  else if (contentText.length >= 500) score += 10
  else score += 5

  // 5. 메타 설명 (20점)
  if (metaDescription.length >= 120 && metaDescription.length <= 160) score += 20
  else if (metaDescription.length >= 100 && metaDescription.length <= 180) score += 15
  else score += 10

  if (keywords.length > 0 && metaDescription.includes(keywords[0])) score += 5

  return Math.min(100, score)
}

