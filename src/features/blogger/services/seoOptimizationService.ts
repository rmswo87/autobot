/**
 * SEO 최적화 서비스
 * 
 * 블로그 글의 SEO 요소를 자동으로 최적화
 */

export interface SEOOptimizationResult {
  title: string
  metaDescription: string
  h2Tags: string[]
  keywords: string[]
  imageAltTexts: string[]
  internalLinks: string[]
  seoScore: number
  recommendations: string[]
}

export interface SEOOptimizationRequest {
  title: string
  content: string
  keywords: string[]
  targetUrl?: string
}

/**
 * SEO 최적화 실행
 */
export function optimizeSEO(
  request: SEOOptimizationRequest
): SEOOptimizationResult {
  const { title, content, keywords, targetUrl } = request

  // 1. 제목 최적화
  const optimizedTitle = optimizeTitle(title, keywords)

  // 2. 메타 설명 생성
  const metaDescription = generateMetaDescription(content, keywords)

  // 3. H2 태그 최적화
  const h2Tags = optimizeH2Tags(content, keywords)

  // 4. 이미지 Alt 텍스트 생성
  const imageAltTexts = generateImageAltTexts(content, keywords)

  // 5. 내부 링크 제안
  const internalLinks = suggestInternalLinks(content, keywords, targetUrl)

  // 6. SEO 점수 계산
  const seoScore = calculateSEOScore({
    title: optimizedTitle,
    content,
    h2Tags,
    keywords,
    metaDescription,
    imageAltTexts,
  })

  // 7. 개선 권장사항 생성
  const recommendations = generateRecommendations({
    title: optimizedTitle,
    content,
    h2Tags,
    keywords,
    metaDescription,
    seoScore,
  })

  return {
    title: optimizedTitle,
    metaDescription,
    h2Tags,
    keywords,
    imageAltTexts,
    internalLinks,
    seoScore,
    recommendations,
  }
}

/**
 * 제목 최적화
 */
function optimizeTitle(title: string, keywords: string[]): string {
  let optimized = title

  // 주요 키워드가 제목에 포함되어 있는지 확인
  if (keywords.length > 0 && !optimized.includes(keywords[0])) {
    // 키워드를 앞쪽에 추가
    optimized = `${keywords[0]} ${optimized}`
  }

  // 길이 최적화 (30-60자)
  if (optimized.length > 60) {
    optimized = optimized.substring(0, 57) + '...'
  } else if (optimized.length < 30 && keywords.length > 0) {
    // 너무 짧으면 키워드 추가
    const remaining = 30 - optimized.length
    if (keywords.length > 1 && remaining > keywords[1].length) {
      optimized += ` ${keywords[1]}`
    }
  }

  return optimized
}

/**
 * 메타 설명 생성
 */
function generateMetaDescription(content: string, keywords: string[]): string {
  // HTML 태그 제거
  const textContent = content.replace(/<[^>]+>/g, '').trim()

  // 첫 문단 사용
  let description = textContent.substring(0, 150).trim()

  // 주요 키워드 포함 확인
  if (keywords.length > 0 && !description.includes(keywords[0])) {
    description = `${keywords[0]}에 대한 정보입니다. ${description}`
  }

  // 길이 제한 (120-160자)
  if (description.length > 160) {
    description = description.substring(0, 157) + '...'
  } else if (description.length < 120) {
    // 부족하면 내용 추가
    const remaining = textContent.substring(150, 150 + (120 - description.length))
    description += remaining
  }

  return description
}

/**
 * H2 태그 최적화
 */
function optimizeH2Tags(content: string, keywords: string[]): string[] {
  const h2Tags: string[] = []

  // 기존 H2 태그 추출
  const existingH2s = content.match(/<h2[^>]*>(.*?)<\/h2>/gi) || []

  // 첫 번째 H2에 주요 키워드 포함 확인
  if (existingH2s.length > 0) {
    const firstH2 = existingH2s[0]
    if (keywords.length > 0 && !firstH2.includes(keywords[0])) {
      // 키워드 포함하도록 수정
      const h2Content = firstH2.replace(/<[^>]+>/g, '')
      h2Tags.push(`<h2>${keywords[0]}: ${h2Content}</h2>`)
    } else {
      h2Tags.push(firstH2)
    }
  } else if (keywords.length > 0) {
    // H2 태그가 없으면 생성
    h2Tags.push(`<h2>${keywords[0]}</h2>`)
  }

  // 나머지 H2 태그 추가
  for (let i = 1; i < existingH2s.length && i < 5; i++) {
    h2Tags.push(existingH2s[i])
  }

  // 키워드 기반 H2 추가 (부족한 경우)
  if (h2Tags.length < 3 && keywords.length > 1) {
    for (const keyword of keywords.slice(1, 4 - h2Tags.length)) {
      h2Tags.push(`<h2>${keyword}</h2>`)
    }
  }

  return h2Tags
}

/**
 * 이미지 Alt 텍스트 생성
 */
function generateImageAltTexts(content: string, keywords: string[]): string[] {
  const altTexts: string[] = []
  const images = content.match(/<img[^>]+>/gi) || []

  for (const img of images) {
    // 기존 alt 속성 확인
    const altMatch = img.match(/alt=["']([^"']+)["']/i)
    
    if (altMatch) {
      altTexts.push(altMatch[1])
    } else {
      // alt 속성이 없으면 키워드 기반 생성
      const mainKeyword = keywords[0] || '이미지'
      altTexts.push(`${mainKeyword} 관련 이미지`)
    }
  }

  return altTexts
}

/**
 * 내부 링크 제안
 */
function suggestInternalLinks(
  content: string,
  keywords: string[],
  targetUrl?: string
): string[] {
  const links: string[] = []

  // 키워드 기반 내부 링크 제안
  for (const keyword of keywords.slice(0, 3)) {
    if (targetUrl) {
      links.push(`${targetUrl}/${encodeURIComponent(keyword)}`)
    } else {
      links.push(`/blog/${encodeURIComponent(keyword)}`)
    }
  }

  return links
}

/**
 * SEO 점수 계산
 */
function calculateSEOScore(params: {
  title: string
  content: string
  h2Tags: string[]
  keywords: string[]
  metaDescription: string
  imageAltTexts: string[]
}): number {
  const { title, content, h2Tags, keywords, metaDescription, imageAltTexts } = params
  let score = 0

  // 제목 최적화 (20점)
  if (title.length >= 30 && title.length <= 60) score += 20
  else if (title.length >= 20 && title.length <= 70) score += 15
  else score += 10

  // H2 태그 (20점)
  if (h2Tags.length >= 3) score += 20
  else if (h2Tags.length >= 2) score += 15
  else if (h2Tags.length >= 1) score += 10

  // 키워드 밀도 (20점)
  const contentText = content.replace(/<[^>]+>/g, '')
  const keywordCount = keywords.reduce((count, keyword) => {
    const regex = new RegExp(keyword, 'gi')
    return count + (contentText.match(regex) || []).length
  }, 0)
  
  const keywordDensity = (keywordCount / contentText.length) * 100
  if (keywordDensity >= 1 && keywordDensity <= 3) score += 20
  else if (keywordDensity >= 0.5 && keywordDensity <= 5) score += 15
  else score += 10

  // 메타 설명 (20점)
  if (metaDescription.length >= 120 && metaDescription.length <= 160) score += 20
  else if (metaDescription.length >= 100 && metaDescription.length <= 180) score += 15
  else score += 10

  // 이미지 Alt 텍스트 (20점)
  if (imageAltTexts.length > 0) {
    const hasAltTexts = imageAltTexts.every((alt) => alt.length > 0)
    if (hasAltTexts) score += 20
    else score += 10
  }

  return Math.min(100, score)
}

/**
 * 개선 권장사항 생성
 */
function generateRecommendations(params: {
  title: string
  content: string
  h2Tags: string[]
  keywords: string[]
  metaDescription: string
  seoScore: number
}): string[] {
  const { title, content, h2Tags, keywords, metaDescription, seoScore } = params
  const recommendations: string[] = []

  // 제목 개선
  if (title.length < 30) {
    recommendations.push('제목을 30자 이상으로 늘려주세요.')
  } else if (title.length > 60) {
    recommendations.push('제목을 60자 이하로 줄여주세요.')
  }

  if (keywords.length > 0 && !title.includes(keywords[0])) {
    recommendations.push(`제목에 주요 키워드 "${keywords[0]}"를 포함해주세요.`)
  }

  // H2 태그 개선
  if (h2Tags.length < 3) {
    recommendations.push('H2 태그를 최소 3개 이상 추가해주세요.')
  }

  if (h2Tags.length > 0 && keywords.length > 0 && !h2Tags[0].includes(keywords[0])) {
    recommendations.push('첫 번째 H2 태그에 주요 키워드를 포함해주세요.')
  }

  // 콘텐츠 길이
  const contentText = content.replace(/<[^>]+>/g, '')
  if (contentText.length < 1000) {
    recommendations.push('콘텐츠를 1000자 이상으로 늘려주세요.')
  }

  // 메타 설명
  if (metaDescription.length < 120) {
    recommendations.push('메타 설명을 120자 이상으로 늘려주세요.')
  } else if (metaDescription.length > 160) {
    recommendations.push('메타 설명을 160자 이하로 줄여주세요.')
  }

  // 키워드 밀도
  const keywordCount = keywords.reduce((count, keyword) => {
    const regex = new RegExp(keyword, 'gi')
    return count + (contentText.match(regex) || []).length
  }, 0)
  
  const keywordDensity = (keywordCount / contentText.length) * 100
  if (keywordDensity < 1) {
    recommendations.push('키워드 밀도를 1% 이상으로 늘려주세요.')
  } else if (keywordDensity > 3) {
    recommendations.push('키워드 밀도를 3% 이하로 줄여주세요. (과도한 키워드 삽입)')
  }

  return recommendations
}

