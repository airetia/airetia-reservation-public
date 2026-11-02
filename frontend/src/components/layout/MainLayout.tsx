// frontend/src/components/layout/MainLayout.tsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import styles from './MainLayout.module.css'

/**
 * 認証済みユーザー用レイアウト
 * PrivateRoute / ProviderRoute / AdminRoute 配下で使用
 * → 05_frontend_specification.md §3.2 ルート定義
 *
 * ErrorBoundary でページ全体をラップし、
 * 予期せぬエラーによる画面真っ白を防ぐ。
 */
export const MainLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}