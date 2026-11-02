// frontend/src/routes/PublicRoute.tsx
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loading } from '@/components/common/Loading'
import { ROUTES } from '@/config/constants'

/**
 * 公開ルートガード
 * ログイン済みユーザーが /login・/register にアクセスした場合にリダイレクト。
 *   ADMIN  → /admin
 *   MEMBER → /member
 * → 05_frontend_specification.md §3.3
 */
export const PublicRoute: React.FC = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  if (loading) return <Loading fullScreen />
  if (!isAuthenticated) return <Outlet />
  // ROUTES.DASHBOARD は存在しない → ROUTES.DASHBOARD を使用
  return <Navigate to={isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD} replace />
}
