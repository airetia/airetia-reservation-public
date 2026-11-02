// frontend/src/routes/PrivateRoute.tsx
import React from 'react'
import { ROUTES } from '@/config/constants'

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loading } from '@/components/common/Loading'

/**
 * ログイン必須ルートガード
 * 未認証 → /login にリダイレクト
 */
export const PrivateRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <Loading fullScreen />
  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />
}
