import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/shared/components/common'
import { LoginForm, SignupForm } from '@/features/auth/components'
import { SettingsPage } from '@/features/settings/components'

// 임시 컴포넌트 (개발 중)
const TempPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <h1 className="text-2xl font-bold">{title} - 개발 중</h1>
  </div>
)

export function Routes() {
  return (
    <RouterRoutes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <TempPage title="대시보드" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/blogger"
        element={
          <ProtectedRoute>
            <TempPage title="블로거" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/music"
        element={
          <ProtectedRoute>
            <TempPage title="음원" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/youtube"
        element={
          <ProtectedRoute>
            <TempPage title="유튜브" />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </RouterRoutes>
  )
}

