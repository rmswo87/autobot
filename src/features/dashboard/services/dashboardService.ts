import { supabase } from '@/shared/services/supabase/client'
import type { DashboardStats, RecentActivity } from '../types'

/**
 * 대시보드 통계 데이터 조회
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  try {
    // 현재 월의 시작일과 종료일 계산
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // 1. 블로그 게시물 수 조회
    // 직접 조인을 지원하지 않으므로, blogger_accounts를 먼저 조회
    const { data: bloggerAccounts } = await supabase
      .from('blogger_accounts')
      .select('id')
      .eq('user_id', userId)

    const bloggerAccountIds = bloggerAccounts?.map((acc) => acc.id) || []

    const { count: blogPostsCountActual } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .in('blogger_account_id', bloggerAccountIds)

    // 2. 음원 생성 수 조회
    const { count: musicCount } = await supabase
      .from('music')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // 3. 유튜브 영상 수 조회
    const { count: youtubeVideosCount } = await supabase
      .from('youtube_videos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // 4. 이번 달 활동 수 조회
    const { count: thisMonthBlogPosts } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .in('blogger_account_id', bloggerAccountIds)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString())

    const { count: thisMonthMusic } = await supabase
      .from('music')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString())

    const { count: thisMonthYoutube } = await supabase
      .from('youtube_videos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString())

    const thisMonthActivity =
      (thisMonthBlogPosts || 0) + (thisMonthMusic || 0) + (thisMonthYoutube || 0)

    return {
      blogPostsCount: blogPostsCountActual || 0,
      musicCount: musicCount || 0,
      youtubeVideosCount: youtubeVideosCount || 0,
      thisMonthActivity,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    // 에러 발생 시 기본값 반환
    return {
      blogPostsCount: 0,
      musicCount: 0,
      youtubeVideosCount: 0,
      thisMonthActivity: 0,
    }
  }
}

/**
 * 최근 활동 목록 조회
 */
export async function getRecentActivities(
  userId: string,
  limit: number = 10
): Promise<RecentActivity[]> {
  try {
    // blogger_accounts 조회
    const { data: bloggerAccounts } = await supabase
      .from('blogger_accounts')
      .select('id')
      .eq('user_id', userId)

    const bloggerAccountIds = bloggerAccounts?.map((acc) => acc.id) || []

    // 블로그 게시물 조회
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('id, title, created_at, status')
      .in('blogger_account_id', bloggerAccountIds)
      .order('created_at', { ascending: false })
      .limit(limit)

    // 음원 조회
    const { data: music } = await supabase
      .from('music')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    // 유튜브 영상 조회
    const { data: youtubeVideos } = await supabase
      .from('youtube_videos')
      .select('id, title, created_at, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    // 모든 활동을 하나의 배열로 합치고 시간순 정렬
    const activities: RecentActivity[] = []

    if (blogPosts) {
      blogPosts.forEach((post) => {
        activities.push({
          id: post.id,
          type: 'blog',
          title: post.title,
          createdAt: post.created_at,
          status: post.status,
        })
      })
    }

    if (music) {
      music.forEach((m) => {
        activities.push({
          id: m.id,
          type: 'music',
          title: m.title,
          createdAt: m.created_at,
        })
      })
    }

    if (youtubeVideos) {
      youtubeVideos.forEach((video) => {
        activities.push({
          id: video.id,
          type: 'youtube',
          title: video.title,
          createdAt: video.created_at,
          status: video.status,
        })
      })
    }

    // 시간순 정렬 (최신순)
    activities.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // limit만큼만 반환
    return activities.slice(0, limit)
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return []
  }
}

