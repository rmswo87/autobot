import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { FileText, Music, Youtube, TrendingUp, Clock, Loader2, Settings, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { useDashboardStats, useRecentActivities } from '../hooks'
import { apiKeyService } from '@/features/settings/services'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: recentActivities, isLoading: activitiesLoading } = useRecentActivities(10)
  const [apiKeys, setApiKeys] = useState<{
    google_api_key: boolean
    suno_api_key: boolean
    context7_api_key: boolean
    openai_api_key: boolean
  } | null>(null)
  const [apiKeysLoading, setApiKeysLoading] = useState(true)

  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const keys = await apiKeyService.getApiKeys()
        setApiKeys({
          google_api_key: !!keys?.google_api_key,
          suno_api_key: !!keys?.suno_api_key,
          context7_api_key: !!keys?.context7_api_key,
          openai_api_key: !!keys?.openai_api_key,
        })
      } catch (error) {
        console.error('Error loading API keys:', error)
        setApiKeys({
          google_api_key: false,
          suno_api_key: false,
          context7_api_key: false,
          openai_api_key: false,
        })
      } finally {
        setApiKeysLoading(false)
      }
    }
    loadApiKeys()
  }, [])

  const statsData = [
    {
      title: '블로그 게시물',
      value: stats?.blogPostsCount ?? 0,
      description: '발행된 게시물 수',
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      title: '생성된 음원',
      value: stats?.musicCount ?? 0,
      description: '생성된 음원 수',
      icon: Music,
      color: 'text-purple-600',
    },
    {
      title: '유튜브 영상',
      value: stats?.youtubeVideosCount ?? 0,
      description: '업로드된 영상 수',
      icon: Youtube,
      color: 'text-red-600',
    },
    {
      title: '이번 달 활동',
      value: stats?.thisMonthActivity ?? 0,
      description: '이번 달 생성된 콘텐츠',
      icon: TrendingUp,
      color: 'text-green-600',
    },
  ]

  // 활동 타입별 아이콘 매핑
  const getActivityIcon = (type: 'blog' | 'music' | 'youtube') => {
    switch (type) {
      case 'blog':
        return FileText
      case 'music':
        return Music
      case 'youtube':
        return Youtube
      default:
        return Clock
    }
  }

  // 활동 타입별 색상 매핑
  const getActivityColor = (type: 'blog' | 'music' | 'youtube') => {
    switch (type) {
      case 'blog':
        return 'text-blue-600'
      case 'music':
        return 'text-purple-600'
      case 'youtube':
        return 'text-red-600'
      default:
        return 'text-muted-foreground'
    }
  }

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ko,
      })
    } catch {
      return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground mt-2">
          콘텐츠 생성 및 관리 현황을 한눈에 확인하세요.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">로딩 중...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* API 키 상태 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API 키 설정 상태</CardTitle>
              <CardDescription>
                서비스 사용을 위해 필요한 API 키를 확인하세요
              </CardDescription>
            </div>
            <Link to="/settings">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                설정
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeysLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {[
                { key: 'google_api_key', label: 'Google API Key', required: true, feature: '블로거' },
                { key: 'suno_api_key', label: 'Suno API Key', required: false, feature: '음원 생성' },
                { key: 'context7_api_key', label: 'Context7 API Key', required: false, feature: '고품질 콘텐츠' },
                { key: 'openai_api_key', label: 'OpenAI API Key', required: false, feature: 'AI 기능' },
              ].map(({ key, label, required }) => {
                const isSet = apiKeys?.[key as keyof typeof apiKeys] ?? false
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      isSet ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 bg-gray-50 dark:bg-gray-900/20'
                    }`}
                  >
                    {isSet ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isSet ? 'text-green-900 dark:text-green-100' : 'text-gray-700 dark:text-gray-300'}`}>
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isSet ? '설정됨' : required ? '필수' : '선택'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {!apiKeysLoading && (!apiKeys?.google_api_key || !apiKeys?.suno_api_key || !apiKeys?.context7_api_key) && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    API 키를 설정하세요
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
                    서비스를 사용하려면 필요한 API 키를 설정 페이지에서 입력해주세요.
                  </p>
                  <Link to="/settings">
                    <Button size="sm" variant="outline" className="gap-2">
                      설정 페이지로 이동
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>
              최근 생성된 콘텐츠를 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">로딩 중...</span>
              </div>
            ) : recentActivities && recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type)
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <ActivityIcon className={`h-4 w-4 ${getActivityColor(activity.type)}`} />
                        <div>
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">아직 활동 내역이 없습니다.</p>
                <p className="text-xs mt-1">
                  블로거, 음원, 유튜브 메뉴에서 콘텐츠를 생성해보세요.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>빠른 시작</CardTitle>
            <CardDescription>
              자주 사용하는 기능으로 바로 이동하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link
                to="/blogger"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <FileText className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">블로그 게시물 조회</p>
                  <p className="text-xs text-muted-foreground">
                    {apiKeys?.google_api_key ? '블로그 목록을 확인하세요' : 'Google API Key가 필요합니다'}
                  </p>
                </div>
                {!apiKeys?.google_api_key && (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </Link>
              <Link
                to="/music"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <Music className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">음원 생성</p>
                  <p className="text-xs text-muted-foreground">
                    {apiKeys?.suno_api_key ? 'AI로 음원을 생성하세요' : 'Suno API Key가 필요합니다'}
                  </p>
                </div>
                {!apiKeys?.suno_api_key && (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </Link>
              <Link
                to="/youtube"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <Youtube className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">유튜브 영상 업로드</p>
                  <p className="text-xs text-muted-foreground">
                    영상을 생성하고 업로드하세요
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

