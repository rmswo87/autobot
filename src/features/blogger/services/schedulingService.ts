/**
 * 자동 발행 스케줄링 서비스
 * 매일 같은 시간에 블로그 포스트를 자동으로 발행
 */

import { supabase } from '@/shared/services/supabase'

export interface ScheduleConfig {
  blogId: string
  enabled: boolean
  publishTime: string // HH:mm 형식 (예: "09:00")
  timezone?: string // 기본값: "Asia/Seoul"
  keywords: string[]
  domain?: string
  autoGenerate: boolean // 완전 자동화 모드
}

export interface ScheduledPost {
  id: string
  blogId: string
  scheduledAt: Date
  title?: string
  content?: string
  keywords: string[]
  status: 'pending' | 'published' | 'failed'
  createdAt: Date
}

/**
 * 스케줄 설정 저장
 */
export async function saveScheduleConfig(config: ScheduleConfig): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('blog_schedules')
    .upsert({
      user_id: user.id,
      blog_id: config.blogId,
      enabled: config.enabled,
      publish_time: config.publishTime,
      timezone: config.timezone || 'Asia/Seoul',
      keywords: config.keywords,
      domain: config.domain || 'default',
      auto_generate: config.autoGenerate,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,blog_id',
    })

  if (error) {
    // 테이블이 없을 때는 사용자 친화적 에러 메시지
    if (error.code === '42P01') {
      throw new Error(
        '자동 발행 기능을 사용하려면 Supabase 마이그레이션이 필요합니다.\n\n' +
        'docs/SUPABASE_MIGRATIONS.md 파일의 SQL 스크립트를 실행해주세요.'
      )
    }
    console.error('Error saving schedule config:', error)
    throw error
  }
}

/**
 * 스케줄 설정 조회
 */
export async function getScheduleConfig(blogId: string): Promise<ScheduleConfig | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('blog_schedules')
    .select('*')
    .eq('user_id', user.id)
    .eq('blog_id', blogId)
    .single()

  if (error) {
    // 테이블이 없을 때는 조용히 null 반환 (마이그레이션 필요)
    if (error.code === 'PGRST116' || error.code === '42P01') {
      return null
    }
    console.error('Error getting schedule config:', error)
    return null
  }

  if (!data) return null

  return {
    blogId: data.blog_id,
    enabled: data.enabled,
    publishTime: data.publish_time,
    timezone: data.timezone,
    keywords: data.keywords || [],
    domain: data.domain || 'default',
    autoGenerate: data.auto_generate || false,
  }
}

/**
 * 다음 발행 시간 계산
 */
export function calculateNextPublishTime(publishTime: string, timezone: string = 'Asia/Seoul'): Date {
  const [hours, minutes] = publishTime.split(':').map(Number)
  const now = new Date()
  
  // 오늘 해당 시간
  const today = new Date(now)
  today.setHours(hours, minutes, 0, 0)

  // 이미 지났으면 내일로
  if (today <= now) {
    today.setDate(today.getDate() + 1)
  }

  return today
}

/**
 * 스케줄된 포스트 생성
 */
export async function createScheduledPost(
  blogId: string,
  scheduledAt: Date,
  keywords: string[]
): Promise<ScheduledPost> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('scheduled_posts')
    .insert({
      user_id: user.id,
      blog_id: blogId,
      scheduled_at: scheduledAt.toISOString(),
      keywords,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating scheduled post:', error)
    throw error
  }

  return {
    id: data.id,
    blogId: data.blog_id,
    scheduledAt: new Date(data.scheduled_at),
    keywords: data.keywords || [],
    status: data.status,
    createdAt: new Date(data.created_at),
  }
}

