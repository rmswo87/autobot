import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/shared/components/common'
import { LoginForm, SignupForm } from '@/features/auth/components'
import { SettingsPage, ApiGuidePage } from '@/features/settings/components'
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout'
import { DashboardPage } from '@/features/dashboard/components'
import { LandingPage } from '@/features/landing'
import { BloggerPage } from '@/features/blogger'
import { BloggerOAuthCallback, KeywordAnalyzer, MorphemeAnalyzer, KeywordRecommendationDashboard, BlogReconstructionPage } from '@/features/blogger/components'

// 임시 컴포넌트 (개발 중)
const TempPage = ({ title }: { title: string }) => (
  <div className="space-y-4">
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="text-muted-foreground">이 기능은 현재 개발 중입니다.</p>
  </div>
)

export function Routes() {
  return (
    <RouterRoutes>
      {/* Landing Page */}
      <Route
        path="/"
        element={<LandingPage />}
      />

      {/* Public Routes */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />

      {/* Protected Routes with Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/api-guide/:apiKeyType"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ApiGuidePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/blogger"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BloggerPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/blogger/oauth/callback"
        element={
          <ProtectedRoute>
            <BloggerOAuthCallback />
          </ProtectedRoute>
        }
      />
      <Route
        path="/blogger/keyword-analyzer"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <KeywordAnalyzer />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/blogger/morpheme-analyzer"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MorphemeAnalyzer />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/blogger/keyword-recommendations"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <KeywordRecommendationDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/blogger/reconstruct"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BlogReconstructionPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/music"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TempPage title="음원" />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/youtube"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TempPage title="유튜브" />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </RouterRoutes>
  )
}

