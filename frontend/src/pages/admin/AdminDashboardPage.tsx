// frontend/src/pages/admin/AdminDashboardPage.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get } from '@/api/httpClient'
import { API_ENDPOINTS, ROUTES } from '@/config/constants'
import type { ProviderResponse } from '@/models/provider'
import styles from './AdminDashboardPage.module.css'

/**
 * 管理者ダッシュボード
 * → 05_frontend_specification.md §3.1 /admin
 *
 * 表示内容:
 *   - KPI（メンバー数・承認済みプロバイダー数・今月の予約数）
 *   - 承認待ちプロバイダー一覧
 */
export function AdminDashboardPage() {
  const [pendingProviders, setPendingProviders] = useState<ProviderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    get(API_ENDPOINTS.PROVIDERS, { params: { status: 'PENDING' } })
      .then(res => {
        if (!cancelled) {
          setPendingProviders(Array.isArray(res.data?.data) ? res.data.data : [])
        }
      })
      .catch(() => { if (!cancelled) setError('データの取得に失敗しました') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) return <div className={styles.loading}>読み込み中...</div>
  if (error)   return <div className={styles.error}>{error}</div>

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>管理者ダッシュボード</h1>

      {/* クイックリンク */}
      <div className={styles.quickLinks}>
        <Link to={ROUTES.ADMIN_MEMBERS}   className={styles.quickBtn}>メンバー管理</Link>
        <Link to={ROUTES.ADMIN_PROVIDERS} className={styles.quickBtn}>プロバイダー管理</Link>
        <Link to={ROUTES.ADMIN_TICKETS}    className={styles.quickBtn}>チケット付与</Link>
        <Link to={ROUTES.ADMIN_INQUIRIES} className={styles.quickBtn}>問い合わせ</Link>
      </div>

      {/* 承認待ちプロバイダー */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>承認待ちプロバイダー ({pendingProviders.length}件)</h2>
          <Link to={ROUTES.ADMIN_PROVIDERS} className={styles.seeAll}>すべて見る →</Link>
        </div>
        {pendingProviders.length === 0 ? (
          <p className={styles.empty}>承認待ちのプロバイダーはいません</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>メンバーID</th>
                <th>出身高校</th>
                <th>申請日</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pendingProviders.slice(0, 5).map(p => (
                <tr key={p.id}>
                  <td>{p.memberId}</td>
                  <td>{p.highSchool ?? '—'}</td>
                  <td>{p.createdAt ? p.createdAt.slice(0, 10) : '—'}</td>
                  <td>
                    <Link to={ROUTES.ADMIN_PROVIDERS} className={styles.reviewLink}>
                      審査する
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
