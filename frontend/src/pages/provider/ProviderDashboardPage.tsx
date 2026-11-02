// frontend/src/pages/provider/ProviderDashboardPage.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get } from '@/api/httpClient'
import { ROUTES, API_ENDPOINTS } from '@/config/constants'
import { formatJST } from '@/utils/date'
import type { BookingResponse } from '@/models/booking'
import type { OfferingResponse } from '@/models/offering'
import styles from './ProviderDashboardPage.module.css'

interface ReportRecord { id: number; bookingId: number }

/**
 * プロバイダーダッシュボード
 * → 05_frontend_specification.md §3.1 /provider
 *
 * 修正:
 *   - Promise.all が一部失敗しても全体をクラッシュさせないよう
 *     allSettled パターンに変更。
 *   - 取得失敗時は setError ではなく空データで継続表示する。
 */
export function ProviderDashboardPage() {
  const [bookings,  setBookings]  = useState<BookingResponse[]>([])
  const [offerings, setOfferings] = useState<OfferingResponse[]>([])
  const [reports,   setReports]   = useState<ReportRecord[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    // allSettled: 一部失敗しても他を継続
    Promise.allSettled([
      get(API_ENDPOINTS.BOOKINGS,  { params: { role: 'provider' } }),
      get(API_ENDPOINTS.OFFERINGS, { params: { myOfferings: true } }),
      get(API_ENDPOINTS.REPORTS),
    ])
      .then(([bRes, oRes, rRes]) => {
        if (cancelled) return
        if (bRes.status === 'fulfilled')
          setBookings(Array.isArray(bRes.value.data?.data) ? bRes.value.data.data : [])
        if (oRes.status === 'fulfilled')
          setOfferings(Array.isArray(oRes.value.data?.data) ? oRes.value.data.data : [])
        if (rRes.status === 'fulfilled')
          setReports(Array.isArray(rRes.value.data?.data) ? rRes.value.data.data : [])
        // 全て失敗した場合のみエラー表示
        if (bRes.status === 'rejected' && oRes.status === 'rejected') {
          setError('情報の取得に失敗しました。ページをリロードしてください。')
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  const now = new Date()

  const thisMonth = bookings.filter(b => {
    const d = new Date(b.startDatetime)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })

  const completed = thisMonth.filter(b => b.status === 'COMPLETED')

  const estimatedReward = Math.floor(
    completed.reduce((sum, b) => sum + (b.ticketsConsumed ?? 0), 0) * 500 * 0.4
  )

  const reportedIds = new Set(reports.map(r => r.bookingId))
  const pendingReports = bookings.filter(b =>
    b.status === 'CONFIRMED' && new Date(b.endDatetime) < now && !reportedIds.has(b.id)
  )

  if (loading) return <div className={styles.loading}>読み込み中...</div>
  if (error)   return <div className={styles.error}>{error}</div>

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>プロバイダーダッシュボード</h1>

      <section className={styles.rewardCard}>
        <div className={styles.rewardMain}>
          <span className={styles.rewardLabel}>今月の報酬（概算）</span>
          <span className={styles.rewardAmount}>¥{estimatedReward.toLocaleString()}</span>
        </div>
        <div className={styles.rewardSub}>
          完了 {completed.length}件 / 今月 {thisMonth.length}件
          <span className={styles.rewardNote}>※ 月末締め・翌月10日払い</span>
        </div>
      </section>

      {pendingReports.length > 0 && (
        <section className={styles.alertSection}>
          <h2 className={styles.alertTitle}>
            ⚠ 報告書未提出（{pendingReports.length}件）
          </h2>
          <div className={styles.bookingList}>
            {pendingReports.slice(0, 3).map(b => (
              <div key={b.id} className={styles.bookingCardAlert}>
                <div>
                  <strong>{b.serviceTitle}</strong>
                  <p className={styles.datetime}>{formatJST(b.startDatetime)} — {b.participantName}</p>
                </div>
                <Link to={ROUTES.PROVIDER_REPORTS} className={styles.reportLink}>
                  報告する →
                </Link>
              </div>
            ))}
          </div>
          {pendingReports.length > 3 && (
            <Link to={ROUTES.PROVIDER_REPORTS} className={styles.moreLink}>
              他 {pendingReports.length - 3}件を見る →
            </Link>
          )}
        </section>
      )}

      <section className={styles.section}>
        <h2>今月の予約（{thisMonth.length}件）</h2>
        {thisMonth.length === 0 ? (
          <p className={styles.empty}>今月の予約はありません</p>
        ) : (
          <div className={styles.bookingList}>
            {thisMonth.map(b => (
              <div key={b.id} className={styles.bookingCard}>
                <div className={styles.bookingMeta}>
                  <span className={styles.service}>{b.serviceTitle}</span>
                  <span className={styles[b.status.toLowerCase() as keyof typeof styles] ?? ''}>
                    {STATUS_LABEL[b.status] ?? b.status}
                  </span>
                </div>
                <p className={styles.datetime}>{formatJST(b.startDatetime)}</p>
                <p className={styles.participant}>{b.participantName}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>登録サービス（{offerings.length}件）</h2>
          <Link to={ROUTES.PROVIDER_AVAILABILITIES} className={styles.manageBtn}>
            サービス・空き枠を管理 →
          </Link>
        </div>
        {offerings.length === 0 ? (
          <div className={styles.offeringEmpty}>
            <p>サービスが登録されていません。</p>
            <Link to={ROUTES.PROVIDER_AVAILABILITIES} className={styles.addServiceLink}>
              ＋ サービスを作成する
            </Link>
          </div>
        ) : (
          <div className={styles.offeringGrid}>
            {offerings.map(o => (
              <div key={o.id} className={styles.offeringCard}>
                <strong>{o.title}</strong>
                <p>{o.durationMinutes}分 / {o.deliveryMethod === 'ONLINE' ? 'オンライン' : '対面'}</p>
                <p>🎫 {o.ticketsRequired}枚 / 定員{o.capacity}名</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className={styles.quickLinks}>
        <Link to={ROUTES.PROVIDER_AVAILABILITIES} className={styles.quickBtn}>
          空き枠を管理
        </Link>
        <Link to={ROUTES.PROVIDER_REPORTS} className={styles.quickBtn}>
          報告書一覧
        </Link>
        <Link to={ROUTES.PROFILE} className={styles.quickBtnSecondary}>
          プロフィール
        </Link>
      </div>
    </div>
  )
}

const STATUS_LABEL: Record<string, string> = {
  PENDING:               'リクエスト中',
  CONFIRMED:             '確定',
  COMPLETED:             '完了',
  CANCELLED_BY_USER:     'キャンセル（利用者）',
  CANCELLED_BY_PROVIDER: 'キャンセル（提供者）',
  NO_SHOW:               '無断キャンセル',
}