import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/shared/components/common'
import { LoginForm, SignupForm } from '@/features/auth/components'
import { SettingsPage } from '@/features/settings/components'
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout'
import { DashboardPage } from '@/features/dashboard/components'

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
        path="/blogger"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TempPage title="블로거" />
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

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </RouterRoutes>
  )
}

