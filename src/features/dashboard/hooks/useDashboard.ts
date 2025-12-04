import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/features/auth/contexts'
import { getDashboardStats, getRecentActivities } from '../services'
import type { DashboardStats, RecentActivity } from '../types'

/**
 * 대시보드 통계 데이터 훅
 */
export function useDashboardStats() {
  const { user } = useAuthContext()

  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats', user?.id],
    queryFn: () => getDashboardStats(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5분간 캐시
  })
}

/**
 * 최근 활동 목록 훅
 */
export function useRecentActivities(limit: number = 10) {
  const { user } = useAuthContext()

  return useQuery<RecentActivity[]>({
    queryKey: ['dashboard', 'recent-activities', user?.id, limit],
    queryFn: () => getRecentActivities(user!.id, limit),
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2분간 캐시
  })
}

