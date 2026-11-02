// frontend/src/pages/error/ForbiddenPage.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import styles from './ForbiddenPage.module.css'

export const ForbiddenPage: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth()
  const homeLink = isAdmin ? '/admin' : isAuthenticated ? '/member' : '/'

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>🚫</div>
        <h1 className={styles.title}>403</h1>
        <p className={styles.subtitle}>アクセスが拒否されました</p>
        <p className={styles.desc}>このページを表示する権限がありません。</p>
        <Link to={homeLink} className={styles.btn}>
          トップへ戻る
        </Link>
      </div>
    </div>
  )
}
