// frontend/src/routes/AdminRoute.tsx
import React from 'react'
import { ROUTES } from '@/config/constants'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loading } from '@/components/common/Loading'

/**
 * 管理者専用ルートガード
 * → 05_frontend_specification.md §3.3 AdminRoute
 *
 * 修正: 非管理者リダイレクト先 /dashboard → /member
 */
export const AdminRoute: React.FC = () => {
  const { isAuthenticated, member, loading } = useAuth()

  if (loading) return <Loading fullScreen />
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />
  // ★ 修正: /dashboard → /member
  if (member?.role !== 'ADMIN') return <Navigate to={ROUTES.DASHBOARD} replace />

  return <Outlet />
}
