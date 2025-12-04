/**
 * 콘텐츠 자동 생성 서비스
 * Context7 MCP를 활용한 고품질 콘텐츠 생성
 */

import type { KeywordAnalysisResult } from './keywordAnalysisService'
import { generateTitleFromKeywords, generateH2WithKeyword } from './keywordAnalysisService'

export interface ContentGenerationRequest {
  keywords: string[]
  domain?: string
  keywordAnalysis?: KeywordAnalysisResult
  targetLength?: number // 목표 글자 수
  includeImage?: boolean
}

export interface GeneratedContent {
  title: string
  content: string
  h2Tags: string[]
  suggestedImages: string[]
  labels: string[]
}

/**
 * Context7 MCP를 활용한 콘텐츠 생성
 * 
 * 참고: 실제 구현 시 Context7 MCP 서버를 통해 콘텐츠를 생성합니다.
 * 현재는 기본 구조만 제공합니다.
 */
export async function generateContentWithContext7(
  request: ContentGenerationRequest
): Promise<GeneratedContent> {
  const { keywords, domain = 'default', includeImage = true } = request

  // 1. 키워드 기반 제목 생성
  const title = generateTitleFromKeywords(keywords, getDomainPattern(domain))

  // 2. 첫 번째 H2 태그에 키워드 포함
  const mainKeyword = keywords[0] || '주제'
  const firstH2 = generateH2WithKeyword(mainKeyword)

  // 3. Context7 MCP를 통한 콘텐츠 생성
  // TODO: 실제 Context7 MCP 호출 구현
  const content = await generateContentBody({
    keywords,
    domain,
    mainKeyword,
    includeImage,
  })

  // 4. H2 태그 목록 생성
  const h2Tags = [firstH2]
  if (keywords.length > 1) {
    for (const keyword of keywords.slice(1, 4)) {
      h2Tags.push(generateH2WithKeyword(keyword))
    }
  }

  // 5. 이미지 제안
  const suggestedImages = includeImage
    ? keywords.slice(0, 3).map((kw) => `이미지: ${kw} 관련`)
    : []

  // 6. 태그 생성
  const labels = keywords.slice(0, 5)

  return {
    title,
    content,
    h2Tags,
    suggestedImages,
    labels,
  }
}

/**
 * 도메인별 패턴 가져오기
 */
function getDomainPattern(domain: string): string | undefined {
  const patterns: Record<string, string | undefined> = {
    ai: '~이란?',
    tech: '~이란?',
    default: undefined,
  }
  return patterns[domain] ?? patterns.default
}

/**
 * 콘텐츠 본문 생성
 * 
 * TODO: Context7 MCP를 통해 실제 고품질 콘텐츠 생성
 */
async function generateContentBody(params: {
  keywords: string[]
  domain: string
  mainKeyword: string
  includeImage: boolean
}): Promise<string> {
  const { keywords, mainKeyword, includeImage } = params

  // 임시 콘텐츠 (실제로는 Context7 MCP 호출)
  let content = `<h2>${mainKeyword}</h2>\n\n`
  
  content += `<p>${mainKeyword}에 대해 자세히 알아보겠습니다.</p>\n\n`
  
  if (keywords.length > 1) {
    content += `<h2>${keywords[1]}</h2>\n\n`
    content += `<p>${keywords[1]}에 대한 내용입니다.</p>\n\n`
  }

  if (includeImage) {
    content += `<img src="https://via.placeholder.com/800x400?text=${encodeURIComponent(mainKeyword)}" alt="${mainKeyword}" />\n\n`
  }

  content += `<p>이 글에서는 ${keywords.join(', ')}에 대해 다룹니다.</p>\n\n`
  content += `<h2>결론</h2>\n\n`
  content += `<p>${mainKeyword}에 대한 내용을 정리했습니다.</p>`

  // TODO: Context7 MCP 호출로 대체
  // const context7Response = await context7MCP.generateContent({
  //   keywords,
  //   domain,
  //   targetLength,
  //   includeImage,
  // })
  // return context7Response.content

  return content
}

/**
 * 롱테일 키워드 전략
 * 조금씩 늘려가는 전략
 */
export function getLongTailKeywords(baseKeywords: string[]): string[] {
  const longTailVariations: string[] = []
  
  for (const keyword of baseKeywords) {
    longTailVariations.push(`${keyword} 초보자`)
    longTailVariations.push(`${keyword} 입문`)
    longTailVariations.push(`${keyword} 기초`)
    longTailVariations.push(`${keyword} 완벽 가이드`)
  }

  return longTailVariations
}

