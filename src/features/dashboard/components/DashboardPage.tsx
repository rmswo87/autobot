import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { LayoutDashboard, FileText, Music, Youtube, TrendingUp, Clock } from 'lucide-react'

export function DashboardPage() {
  const stats = [
    {
      title: '블로그 게시물',
      value: '0',
      description: '발행된 게시물 수',
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      title: '생성된 음원',
      value: '0',
      description: '생성된 음원 수',
      icon: Music,
      color: 'text-purple-600',
    },
    {
      title: '유튜브 영상',
      value: '0',
      description: '업로드된 영상 수',
      icon: Youtube,
      color: 'text-red-600',
    },
    {
      title: '이번 달 활동',
      value: '0',
      description: '이번 달 생성된 콘텐츠',
      icon: TrendingUp,
      color: 'text-green-600',
    },
  ]

  const recentActivities = [
    {
      type: 'blog',
      title: '최근 블로그 게시물이 없습니다',
      time: '',
    },
  ]

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
        {stats.map((stat) => {
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
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

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
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        {activity.time && (
                          <p className="text-xs text-muted-foreground">
                            {activity.time}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
              <a
                href="/blogger"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">블로그 게시물 작성</p>
                  <p className="text-xs text-muted-foreground">
                    새로운 블로그 게시물을 생성하세요
                  </p>
                </div>
              </a>
              <a
                href="/music"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <Music className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">음원 생성</p>
                  <p className="text-xs text-muted-foreground">
                    AI로 음원을 생성하세요
                  </p>
                </div>
              </a>
              <a
                href="/youtube"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <Youtube className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">유튜브 영상 업로드</p>
                  <p className="text-xs text-muted-foreground">
                    영상을 생성하고 업로드하세요
                  </p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

