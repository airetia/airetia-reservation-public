// frontend/src/pages/error/NotFoundPage.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/config/constants'
import styles from './NotFoundPage.module.css'

/**
 * 404 ページ
 * → 05_frontend_specification.md §3.2 * → NotFoundPage
 */
export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className={styles.page}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>ページが見つかりません</p>
      <p className={styles.sub}>
        お探しのページは移動または削除された可能性があります。
      </p>
      <button type="button"
        className={styles.btn}
        onClick={() => navigate(isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME)}
      >
        {isAuthenticated ? 'ダッシュボードへ戻る' : 'トップページへ戻る'}
      </button>
    </div>
  )
}
