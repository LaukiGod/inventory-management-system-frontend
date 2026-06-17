import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { Spinner } from './components/ui'
import Layout from './components/Layout'
import Login from './pages/Login'
import Items from './pages/Items'
import Today from './pages/Today'
import Dashboard from './pages/admin/Dashboard'
import Records from './pages/admin/Records'
import Staff from './pages/admin/Staff'
import Categories from './pages/admin/Categories'
import Settings from './pages/admin/Settings'

function FullScreenLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Spinner size={28} />
    </div>
  )
}

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/items" replace />
  return <>{children}</>
}

function RootRedirect() {
  const { isAdmin } = useAuth()
  return <Navigate to={isAdmin ? '/dashboard' : '/items'} replace />
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <FullScreenLoader />

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<RootRedirect />} />
        <Route path="items" element={<Items />} />
        <Route path="today" element={<Today />} />

        <Route path="dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
        <Route path="records" element={<ProtectedRoute adminOnly><Records /></ProtectedRoute>} />
        <Route path="staff" element={<ProtectedRoute adminOnly><Staff /></ProtectedRoute>} />
        <Route path="categories" element={<ProtectedRoute adminOnly><Categories /></ProtectedRoute>} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
