import { Link } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/contexts'
import { Button } from '@/shared/components/ui/button'
import { 
  Zap, 
  BarChart3, 
  Rocket,
  ArrowRight
} from 'lucide-react'

export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuthContext()

  // 인증된 사용자는 대시보드로 리다이렉트 (라우팅에서 처리)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Autobot
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {!isAuthenticated ? (
            <>
              <Link to="/login">
                <Button variant="ghost">로그인</Button>
              </Link>
              <Link to="/signup">
                <Button>시작하기</Button>
              </Link>
            </>
          ) : (
            <Link to="/dashboard">
              <Button>대시보드로 이동</Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
            <span>고품질 자동화 플랫폼</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              콘텐츠 자동화
            </span>
            <br />
            <span className="text-slate-900 dark:text-slate-100">
              한 번에 완성하세요
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            블로그 최적화부터 유튜브 자동화까지.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {!isAuthenticated ? (
              <>
                <Link to="/signup">
                  <Button size="lg" className="text-lg px-8 py-6">
                    무료로 시작하기
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    로그인
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8 py-6">
                  대시보드로 이동
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              모든 것을 자동화하세요
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              복잡한 작업을 간단하게, 반복 작업을 자동으로
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                블로그 최적화
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Lighthouse 최적화 작업
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                음원 플레이리스트
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                유튜브 업로드까지 완전 자동화
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                성과 분석
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                조회수, 성과 지표, 그래프로 한눈에 보는 통계. 월별/연도별 비교까지.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-12 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                지금 바로 시작하세요
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                무료로 시작하고, 언제든지 업그레이드할 수 있습니다.
              </p>
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  무료로 시작하기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Autobot
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2024 Autobot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

