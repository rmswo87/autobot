// API 엔드포인트 상수 정의

const API_BASE = '/api'

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    SIGNUP: `${API_BASE}/auth/signup`,
    LOGOUT: `${API_BASE}/auth/logout`,
    ME: `${API_BASE}/auth/me`,
    REFRESH: `${API_BASE}/auth/refresh`,
  },

  // Settings
  SETTINGS: {
    API_KEYS: `${API_BASE}/settings/api-keys`,
    VALIDATE_API_KEY: `${API_BASE}/settings/api-keys/validate`,
  },

  // Blogger
  BLOGGER: {
    ACCOUNTS: `${API_BASE}/blogger/accounts`,
    POSTS: `${API_BASE}/blogger/posts`,
    SCHEDULE: (id: string) => `${API_BASE}/blogger/posts/${id}/schedule`,
  },

  // Music
  MUSIC: {
    GENERATE: `${API_BASE}/music/generate`,
    LIST: `${API_BASE}/music`,
    DETAIL: (id: string) => `${API_BASE}/music/${id}`,
  },

  // YouTube
  YOUTUBE: {
    CHANNELS: `${API_BASE}/youtube/channels`,
    VIDEOS: `${API_BASE}/youtube/videos`,
    PLAYLISTS: `${API_BASE}/youtube/playlists`,
  },
} as const

