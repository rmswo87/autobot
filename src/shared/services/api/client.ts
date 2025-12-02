import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// API 클라이언트 인스턴스 생성
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request Interceptor: 토큰 추가
  client.interceptors.request.use(
    (config) => {
      // TODO: 토큰 가져오기 (Phase 1에서 구현)
      // const token = getAuthToken()
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`
      // }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response Interceptor: 에러 처리
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    async (error) => {
      // TODO: 토큰 만료 처리 (Phase 1에서 구현)
      // if (error.response?.status === 401) {
      //   // 토큰 갱신 또는 로그아웃
      // }
      return Promise.reject(error)
    }
  )

  return client
}

// API 클라이언트 인스턴스 export
export const apiClient = createApiClient()

// 편의 함수들
export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),
}

