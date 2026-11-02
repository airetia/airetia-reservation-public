// frontend/src/pages/member/DashboardPage.tsx
import React from 'react'
import { useToast } from '@/contexts/ToastProvider'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import { useAuth } from '@/contexts/AuthContext'
import { getTickets } from '@/api/ticketApi'
import { getMyBookings } from '@/api/bookingApi'
import type { TicketBalanceData } from '@/models/ticket'
import type { BookingResponse } from '@/models/booking'
import styles from './DashboardPage.module.css'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

/**
 * メンバーダッシュボードページ
 * → 05_frontend_specification.md §3.1 /member（DashboardPage）
 *
 * 修正:
 *   - getMyBookings の .catch() で showToast を呼んでいたため
 *     ログイン直後など初回マウント時に「予約情報の取得に失敗しました」が表示されていた。
 *     → Toast 削除。失敗時は空配列で静かに処理する。
 *   - クリーンアップ関数を追加してアンマウント後の setState を防止。
 *   - showToast を依存配列から除外（再レンダーループ防止）。
 */

dayjs.extend(utc)
dayjs.extend(timezone)
const JST = 'Asia/Tokyo'

export const DashboardPage: React.FC = () => {
  const { member, isAdmin, capabilities } = useAuth()
  const navigate = useNavigate()

  const [balance,  setBalance]  = useState<TicketBalanceData | null>(null)
  const { showToast } = useToast()
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (isAdmin) navigate(ROUTES.ADMIN_DASHBOARD, { replace: true })
  }, [isAdmin, navigate])

  useEffect(() => {
    if (isAdmin) return
    let cancelled = false

    setLoading(true)
    Promise.all([
      getTickets()
        .then(res => { if (!cancelled) setBalance(res.balance) })
        .catch(() => {
          // チケット取得失敗はサイレント（再ログイン後に自動リカバリ）
        }),
      getMyBookings()
        .then(res => { if (!cancelled) setBookings(Array.isArray(res) ? res : []) })
        .catch(() => {
          // 予約取得失敗: Toast 表示しない
          // ログイン直後のセッション確立前などに発生しうるが致命的ではない
          if (!cancelled) setBookings([])
        }),
    ]).finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]) // showToast は意図的に省略（依存配列に含めるとループする）

  const upcomingBookings = bookings
    .filter(b => b.status === 'CONFIRMED')
    .sort((a, b) => dayjs(a.startDatetime).unix() - dayjs(b.startDatetime).unix())
    .slice(0, 5)

  const today = dayjs().tz(JST).startOf('day')

  if (isAdmin) return null

  return (
    <div className={styles.page}>

      {/* ウェルカム */}
      <div className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>
          おかえりなさい、{member?.lastName} さん
        </h1>
        <p className={styles.welcomeSub}>
          {dayjs().tz(JST).format('YYYY年MM月DD日（ddd）')}
        </p>
      </div>

      {/* サマリーカード */}
      <div className={styles.summaryGrid}>
        <Link to={ROUTES.TICKETS} className={`${styles.summaryCard} ${styles.cardTicket}`}>
          <div className={styles.cardIcon}>🎫</div>
          <div className={styles.cardBody}>
            <div className={styles.cardLabel}>チケット残高</div>
            {loading ? (
              <div className={styles.cardValueSkeleton} />
            ) : (
              <div className={styles.cardValue}>
                {balance?.balance ?? 0}
                <span className={styles.cardUnit}>枚</span>
              </div>
            )}
            {balance?.nearestExpiry && (
              <div className={styles.cardSub}>
                最短: {dayjs(balance.nearestExpiry).tz(JST).format('MM/DD')}まで
              </div>
            )}
          </div>
          <span className={styles.cardArrow}>→</span>
        </Link>

        <Link to={ROUTES.BOOKINGS} className={`${styles.summaryCard} ${styles.cardBooking}`}>
          <div className={styles.cardIcon}>📅</div>
          <div className={styles.cardBody}>
            <div className={styles.cardLabel}>予約確定中</div>
            {loading ? (
              <div className={styles.cardValueSkeleton} />
            ) : (
              <div className={styles.cardValue}>
                {upcomingBookings.length}
                <span className={styles.cardUnit}>件</span>
              </div>
            )}
          </div>
          <span className={styles.cardArrow}>→</span>
        </Link>
      </div>

      {/* 直近の予約 */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>直近の予約</h2>
          <Link to={ROUTES.BOOKINGS} className={styles.seeAll}>すべて見る</Link>
        </div>

        {loading ? (
          <div className={styles.loading}>読み込み中...</div>
        ) : upcomingBookings.length === 0 ? (
          <div className={styles.empty}>
            <p>予約はありません</p>
            <Link to={ROUTES.OFFERINGS_SEARCH} className={styles.ctaBtn}>サービスを探す →</Link>
          </div>
        ) : (
          <div className={styles.bookingList}>
            {upcomingBookings.map(b => {
              const start      = dayjs(b.startDatetime).tz(JST)
              const isToday    = start.isSame(today, 'day')
              const isTomorrow = start.isSame(today.add(1, 'day'), 'day')
              const dayLabel   = isToday ? '今日' : isTomorrow ? '明日' : start.format('M/DD（ddd）')
              return (
                <div key={b.id} className={`${styles.bookingCard} ${isToday ? styles.bookingToday : ''}`}>
                  {isToday && <div className={styles.todayBadge}>今日</div>}
                  <div className={styles.bookingDate}>
                    <span className={styles.bookingDay}>{dayLabel}</span>
                    <span className={styles.bookingTime}>{start.format('HH:mm')}</span>
                  </div>
                  <div className={styles.bookingInfo}>
                    <div className={styles.bookingService}>{b.serviceTitle}</div>
                    <div className={styles.bookingMeta}>
                      {b.providerName} ・ {b.participantName}
                    </div>
                  </div>
                  <span className={`${styles.methodBadge} ${b.deliveryMethod === 'ONLINE' ? styles.online : styles.inPerson}`}>
                    {b.deliveryMethod === 'ONLINE' ? 'オンライン' : '対面'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* クイックアクション */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>クイックアクション</h2>
        <div className={styles.actionGrid}>
          <Link to={ROUTES.OFFERINGS_SEARCH} className={styles.actionCard}>
            <span className={styles.actionIcon}>🔍</span>
            <span>サービスを探す</span>
          </Link>
          <Link to={ROUTES.BOOKINGS} className={styles.actionCard}>
            <span className={styles.actionIcon}>📋</span>
            <span>予約一覧</span>
          </Link>
          <Link to={ROUTES.TICKETS} className={styles.actionCard}>
            <span className={styles.actionIcon}>🎫</span>
            <span>チケット確認</span>
          </Link>
          <Link to={ROUTES.PARTICIPANTS} className={styles.actionCard}>
            <span className={styles.actionIcon}>👶</span>
            <span>お子様管理</span>
          </Link>
          {!capabilities?.hasProvider && (
            <Link to={ROUTES.PROVIDER_APPLY} className={styles.actionCard}>
              <span className={styles.actionIcon}>✋</span>
              <span>先生として申請</span>
            </Link>
          )}
        </div>
      </section>

    </div>
  )
}