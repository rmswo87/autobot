/**
 * 블로거 관련 타입 정의
 */

/**
 * Google Blogger API v3 Blog 타입
 */
export interface BloggerBlog {
  id: string
  name: string
  description?: string
  url: string
  published?: string
  updated?: string
  posts?: {
    totalItems: number
    selfLink: string
  }
  pages?: {
    totalItems: number
    selfLink: string
  }
}

/**
 * Google Blogger API v3 Post 타입
 */
export interface BloggerPost {
  id: string
  blog: {
    id: string
  }
  published?: string
  updated?: string
  url?: string
  selfLink?: string
  title: string
  content: string
  author?: {
    id: string
    displayName: string
    url?: string
  }
  labels?: string[]
  location?: {
    name: string
    lat: number
    lng: number
    span: string
  }
  status?: 'LIVE' | 'DRAFT' | 'SCHEDULED'
  customMetaData?: string
  readerComments?: 'ALLOW' | 'DONT_ALLOW'
  blogId?: string
}

/**
 * 블로그 포스트 생성 요청 타입
 */
export interface CreatePostRequest {
  blogId: string
  title: string
  content: string
  labels?: string[]
  publish?: boolean
  customMetaData?: string
  readerComments?: 'ALLOW' | 'DONT_ALLOW'
}

/**
 * 블로그 포스트 수정 요청 타입
 */
export interface UpdatePostRequest {
  postId: string
  blogId: string
  title?: string
  content?: string
  labels?: string[]
  publish?: boolean
  customMetaData?: string
  readerComments?: 'ALLOW' | 'DONT_ALLOW'
}

/**
 * Blogger API 응답 타입
 */
export interface BloggerApiResponse<T> {
  kind: string
  items?: T[]
  nextPageToken?: string
  etag?: string
}

