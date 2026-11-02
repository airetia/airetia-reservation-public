// frontend/src/routes/ProviderRoute.tsx
import React from 'react'
import { ROUTES } from '@/config/constants'

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loading } from '@/components/common/Loading'

/**
 * APPROVED プロバイダー専用ルートガード
 * 未認証           → /login
 * 未承認プロバイダー → /member
 *
 * 修正: has_provider → hasProvider（camelCase統一）
 *       /dashboard → /member（パス統一）
 */
export const ProviderRoute: React.FC = () => {
  const { isAuthenticated, capabilities, loading } = useAuth()
  if (loading) return <Loading fullScreen />
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />
  if (!capabilities.hasProvider) return <Navigate to={ROUTES.DASHBOARD} replace />
  return <Outlet />
}
