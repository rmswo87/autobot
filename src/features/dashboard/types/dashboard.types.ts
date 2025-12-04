/**
 * 대시보드 관련 타입 정의
 */

export interface DashboardStats {
  blogPostsCount: number
  musicCount: number
  youtubeVideosCount: number
  thisMonthActivity: number
}

export interface RecentActivity {
  id: string
  type: 'blog' | 'music' | 'youtube'
  title: string
  createdAt: string
  status?: string
}

export interface DashboardData {
  stats: DashboardStats
  recentActivities: RecentActivity[]
}

