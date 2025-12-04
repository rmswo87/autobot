import type { ApiGuide, ApiKeyType } from '../types/api-guide.types'

/**
 * 각 API 키 발급 가이드 데이터
 */
export const apiGuides: ApiGuide[] = [
  {
    id: 'google_api_key',
    name: 'Google API Key',
    description: 'Google Blogger API 및 YouTube API 사용을 위한 API 키입니다.',
    steps: [
      'Google Cloud Console (https://console.cloud.google.com)에 접속',
      '프로젝트 생성 또는 기존 프로젝트 선택',
      'API 및 서비스 > 사용자 인증 정보로 이동',
      '"사용자 인증 정보 만들기" > "API 키" 선택',
      '생성된 API 키를 복사하여 아래 입력란에 붙여넣기',
      'API 키 제한 설정 (선택사항): Blogger API v3, YouTube Data API v3 허용',
    ],
    signUpUrl: 'https://console.cloud.google.com',
    apiKeyUrl: 'https://console.cloud.google.com/apis/credentials',
    documentationUrl: 'https://developers.google.com/blogger/docs/3.0/using',
    isRequired: true,
  },
  {
    id: 'google_client_id',
    name: 'Google Client ID',
    description: 'OAuth 인증을 위한 Google Client ID입니다. 블로그 목록 조회 및 게시물 작성에 필요합니다.',
    steps: [
      'Google Cloud Console (https://console.cloud.google.com)에 접속',
      '프로젝트 선택 (또는 새 프로젝트 생성)',
      'API 및 서비스 > 사용자 인증 정보로 이동',
      '"사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 선택',
      '애플리케이션 유형: "웹 애플리케이션" 선택',
      '이름 입력 (예: "Autobot Blogger OAuth")',
      '⚠️ 중요: "승인된 리디렉션 URI" 섹션에서 다음 URI를 정확히 추가:',
      '  - 개발 환경: http://localhost:5173/blogger/oauth/callback',
      '  - 프로덕션 환경: https://autobot-cyan.vercel.app/blogger/oauth/callback',
      '  (두 URI 모두 추가하는 것을 권장합니다)',
      '  ⚠️ 주의: URI는 정확히 일치해야 합니다. 대소문자, 슬래시(/) 모두 정확히 입력하세요.',
      '  ⚠️ 주의: URI 끝에 슬래시(/)를 추가하지 마세요.',
      '"만들기" 버튼 클릭',
      '생성된 Client ID를 복사하여 아래 입력란에 붙여넣기',
      '⚠️ 참고: Client Secret도 함께 생성되므로 함께 저장하세요',
    ],
    importantNotes: [
      '리디렉션 URI는 정확히 일치해야 합니다. 대소문자, 슬래시(/) 모두 정확히 입력하세요.',
      '프로덕션 환경의 정확한 도메인을 확인하여 입력하세요.',
      'OAuth 동의 화면이 설정되어 있어야 합니다 (처음 생성 시 자동으로 설정됨).',
    ],
    signUpUrl: 'https://console.cloud.google.com',
    apiKeyUrl: 'https://console.cloud.google.com/apis/credentials',
    documentationUrl: 'https://developers.google.com/identity/protocols/oauth2',
    isRequired: true,
  },
  {
    id: 'google_client_secret',
    name: 'Google Client Secret',
    description: 'OAuth 인증을 위한 Google Client Secret입니다. Client ID와 함께 생성됩니다.',
    steps: [
      'Google Cloud Console에서 OAuth 클라이언트 ID 생성 시 자동으로 생성됨',
      'Client ID 생성 후 같은 화면에서 Client Secret 확인',
      '⚠️ 중요: Client Secret은 한 번만 표시됩니다. 반드시 복사하여 안전하게 보관하세요',
      'Client Secret을 복사하여 아래 입력란에 붙여넣기',
      '⚠️ 주의: Client Secret은 절대 공개되지 않도록 주의하세요',
      '⚠️ 참고: Client Secret을 잃어버린 경우, OAuth 클라이언트를 삭제하고 새로 생성해야 합니다',
    ],
    importantNotes: [
      'Client Secret은 보안이 매우 중요합니다. 절대 Git에 커밋하거나 공개하지 마세요.',
      'Client ID와 Client Secret은 함께 사용되므로 둘 다 정확히 입력해야 합니다.',
    ],
    signUpUrl: 'https://console.cloud.google.com',
    apiKeyUrl: 'https://console.cloud.google.com/apis/credentials',
    documentationUrl: 'https://developers.google.com/identity/protocols/oauth2',
    isRequired: true,
  },
  {
    id: 'suno_api_key',
    name: 'Suno API Key',
    description: 'AI 음원 생성을 위한 Suno API 키입니다.',
    steps: [
      'MusicAPI.ai (https://musicapi.ai)에 접속',
      '회원가입 또는 로그인',
      '대시보드 > API Keys로 이동',
      '"Create API Key" 버튼 클릭',
      '생성된 API Key를 복사하여 아래 입력란에 붙여넣기',
      '⚠️ 참고: 기본 API 키가 제공되지만, 사용자별 API 키 사용을 권장합니다',
    ],
    signUpUrl: 'https://musicapi.ai',
    apiKeyUrl: 'https://musicapi.ai/dashboard/apikey',
    documentationUrl: 'https://musicapi.ai/docs',
    isRequired: true,
  },
  {
    id: 'context7_api_key',
    name: 'Context7 API Key',
    description:
      '고품질 콘텐츠 생성을 위한 Context7 API 키입니다. 블로그 및 유튜브 콘텐츠의 품질 최적화와 자료 수집에 사용됩니다.',
    steps: [
      'Context7 (https://context7.com/sign-in)에 접속',
      '회원가입 또는 로그인 (무료 계정 생성 가능)',
      '대시보드에서 "Create API Key" 버튼 클릭',
      '생성된 API Key를 복사하여 아래 입력란에 붙여넣기',
      '⚠️ 참고: Context7는 고품질 콘텐츠 생성을 위해 필요한 서비스입니다',
    ],
    signUpUrl: 'https://context7.com/sign-in',
    apiKeyUrl: 'https://context7.com',
    documentationUrl: 'https://context7.com/docs',
    isRequired: true,
  },
  {
    id: 'openai_api_key',
    name: 'OpenAI API Key',
    description: '이미지 생성(DALL-E) 및 고급 콘텐츠 생성을 위한 OpenAI API 키입니다. (선택사항)',
    steps: [
      'OpenAI Platform (https://platform.openai.com)에 접속',
      '회원가입 또는 로그인',
      'API Keys 메뉴로 이동',
      '"Create new secret key" 버튼 클릭',
      '생성된 API Key를 복사하여 아래 입력란에 붙여넣기',
      '⚠️ 주의: API Key는 한 번만 표시되므로 안전하게 보관하세요',
    ],
    signUpUrl: 'https://platform.openai.com',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    documentationUrl: 'https://platform.openai.com/docs',
    isRequired: false,
  },
]

/**
 * API 키 타입별 가이드 조회
 */
export function getApiGuide(apiKeyType: ApiKeyType): ApiGuide | undefined {
  return apiGuides.find((guide) => guide.id === apiKeyType)
}

