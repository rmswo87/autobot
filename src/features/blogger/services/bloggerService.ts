import { apiKeyService } from '@/features/settings/services'
import { bloggerOAuthService } from './bloggerOAuthService'
import type {
  BloggerBlog,
  BloggerPost,
  CreatePostRequest,
  UpdatePostRequest,
  BloggerApiResponse,
} from '../types'

const BLOGGER_API_BASE_URL = 'https://www.googleapis.com/blogger/v3'

/**
 * 사용자 API 키로 Google Blogger API 호출
 */
async function getApiKey(): Promise<string> {
  const apiKeys = await apiKeyService.getApiKeys()
  if (!apiKeys?.google_api_key) {
    throw new Error('Google API Key가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요.')
  }
  return apiKeys.google_api_key
}

/**
 * OAuth Access Token 가져오기 (우선순위: OAuth > API Key)
 */
async function getAccessToken(): Promise<string | null> {
  try {
    const token = await bloggerOAuthService.getToken()
    return token?.access_token || null
  } catch (error) {
    console.error('Error getting OAuth token:', error)
    return null
  }
}

/**
 * Google Blogger API v3 클라이언트
 */
export const bloggerService = {
  /**
   * 사용자의 블로그 목록 조회
   * OAuth 토큰이 필수입니다. API 키만으로는 자신의 블로그 목록을 조회할 수 없습니다.
   */
  async getBlogs(): Promise<BloggerBlog[]> {
    try {
      // OAuth 토큰 확인 (필수)
      const accessToken = await getAccessToken()
      
      if (!accessToken) {
        throw new Error(
          '블로그 목록 조회를 위해서는 Google 계정 연결(OAuth 인증)이 필요합니다.\n\n' +
          '블로거 페이지에서 "Google 계정 연결" 버튼을 클릭하여 인증을 진행해주세요.'
        )
      }

      // OAuth 토큰으로 자신의 블로그 목록 조회
      const response = await fetch(
        `${BLOGGER_API_BASE_URL}/users/self/blogs`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
        console.error('Blogger API Error (OAuth):', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            'OAuth 토큰이 만료되었거나 유효하지 않습니다. 블로거 페이지에서 "Google 계정 연결" 버튼을 클릭하여 다시 인증해주세요.'
          )
        }

        throw new Error(
          `블로그 목록을 불러오는데 실패했습니다. (상태 코드: ${response.status}, 에러: ${errorData.error?.message || response.statusText})`
        )
      }

      const data: BloggerApiResponse<BloggerBlog> = await response.json()
      return data.items || []
    } catch (error) {
      console.error('Error fetching blogs:', error)
      throw error
    }
  },

  /**
   * 특정 블로그 정보 조회
   */
  async getBlog(blogId: string): Promise<BloggerBlog> {
    try {
      const apiKey = await getApiKey()

      const response = await fetch(
        `${BLOGGER_API_BASE_URL}/blogs/${blogId}?key=${apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
        
        if (response.status === 401 || response.status === 403) {
          throw new Error('API 키가 유효하지 않거나 권한이 없습니다.')
        }
        
        if (response.status === 404) {
          throw new Error('블로그를 찾을 수 없습니다.')
        }
        
        throw new Error(
          error.error?.message || `블로그 정보를 불러오는데 실패했습니다. (상태 코드: ${response.status})`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching blog:', error)
      throw error
    }
  },

  /**
   * 블로그의 포스트 목록 조회
   */
  async getPosts(blogId: string, maxResults: number = 10): Promise<BloggerPost[]> {
    try {
      const apiKey = await getApiKey()

      const response = await fetch(
        `${BLOGGER_API_BASE_URL}/blogs/${blogId}/posts?key=${apiKey}&maxResults=${maxResults}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
        
        if (response.status === 401 || response.status === 403) {
          throw new Error('API 키가 유효하지 않거나 권한이 없습니다.')
        }
        
        if (response.status === 404) {
          throw new Error('블로그 또는 게시물을 찾을 수 없습니다.')
        }
        
        throw new Error(
          error.error?.message || `게시물 목록을 불러오는데 실패했습니다. (상태 코드: ${response.status})`
        )
      }

      const data: BloggerApiResponse<BloggerPost> = await response.json()
      return data.items || []
    } catch (error) {
      console.error('Error fetching posts:', error)
      throw error
    }
  },

  /**
   * 특정 포스트 조회
   */
  async getPost(blogId: string, postId: string): Promise<BloggerPost> {
    try {
      const apiKey = await getApiKey()

      const response = await fetch(
        `${BLOGGER_API_BASE_URL}/blogs/${blogId}/posts/${postId}?key=${apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
        
        if (response.status === 401 || response.status === 403) {
          throw new Error('API 키가 유효하지 않거나 권한이 없습니다.')
        }
        
        if (response.status === 404) {
          throw new Error('게시물을 찾을 수 없습니다.')
        }
        
        throw new Error(
          error.error?.message || `게시물을 불러오는데 실패했습니다. (상태 코드: ${response.status})`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching post:', error)
      throw error
    }
  },

  /**
   * 새 포스트 생성
   * OAuth 2.0 인증이 필요합니다.
   */
  async createPost(request: CreatePostRequest): Promise<BloggerPost> {
    try {
      // OAuth 토큰 확인 (필수)
      const accessToken = await getAccessToken()
      
      if (!accessToken) {
        throw new Error(
          '포스트 생성을 위해서는 Google 계정 연결(OAuth 인증)이 필요합니다.\n\n' +
          '블로거 페이지에서 "Google 계정 연결" 버튼을 클릭하여 인증을 진행해주세요.'
        )
      }

      const apiKey = await getApiKey()

      const response = await fetch(
        `${BLOGGER_API_BASE_URL}/blogs/${request.blogId}/posts?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title: request.title,
            content: request.content,
            labels: request.labels,
            publish: request.publish || false,
            customMetaData: request.customMetaData,
            readerComments: request.readerComments,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
        console.error('Blogger API Error (createPost):', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            'OAuth 토큰이 만료되었거나 유효하지 않습니다. 블로거 페이지에서 "Google 계정 연결" 버튼을 클릭하여 다시 인증해주세요.'
          )
        }

        throw new Error(
          errorData.error?.message || `포스트 생성에 실패했습니다. (상태 코드: ${response.status})`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  },

  /**
   * 포스트 수정
   * OAuth 2.0 인증이 필요합니다.
   */
  async updatePost(request: UpdatePostRequest): Promise<BloggerPost> {
    try {
      // OAuth 토큰 확인 (필수)
      const accessToken = await getAccessToken()
      
      if (!accessToken) {
        throw new Error(
          '포스트 수정을 위해서는 Google 계정 연결(OAuth 인증)이 필요합니다.\n\n' +
          '블로거 페이지에서 "Google 계정 연결" 버튼을 클릭하여 인증을 진행해주세요.'
        )
      }

      const apiKey = await getApiKey()

      const response = await fetch(
        `${BLOGGER_API_BASE_URL}/blogs/${request.blogId}/posts/${request.postId}?key=${apiKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title: request.title,
            content: request.content,
            labels: request.labels,
            publish: request.publish,
            customMetaData: request.customMetaData,
            readerComments: request.readerComments,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
        console.error('Blogger API Error (updatePost):', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            'OAuth 토큰이 만료되었거나 유효하지 않습니다. 블로거 페이지에서 "Google 계정 연결" 버튼을 클릭하여 다시 인증해주세요.'
          )
        }

        throw new Error(
          errorData.error?.message || `포스트 수정에 실패했습니다. (상태 코드: ${response.status})`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating post:', error)
      throw error
    }
  },
}

