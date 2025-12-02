// 라우트 상수 정의

export const ROUTES = {
  // Public
  LOGIN: '/login',
  SIGNUP: '/signup',

  // Protected
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  BLOGGER: '/blogger',
  MUSIC: '/music',
  YOUTUBE: '/youtube',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

