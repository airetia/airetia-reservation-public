// frontend/src/pages/member/BookingsPage.tsx
import React from 'react'
import { ROUTES } from '@/config/constants'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getMyBookings, cancelBooking } from '@/api/bookingApi'
import { useToast } from '@/contexts/ToastProvider'
import { BookingStatusLabel, BookingStatusColor } from '@/models/enums'
import type { BookingResponse } from '@/models/booking'
import styles from './BookingsPage.module.css'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

/**
 * 予約一覧ページ
 * → 05_frontend_specification.md §3.1 /member/bookings
 *
 * 修正:
 *   - fetchBookings の .catch() で showToast を使用していたが、
 *     showToast が useCallback 依存配列に入ると再レンダーループが発生する可能性がある。
 *     → setError state でエラーを管理し、ページ内に表示する形式に変更。
 *   - BookingStatusColor は enums.ts に追加済み。
 */

dayjs.extend(utc)
dayjs.extend(timezone)
const JST = 'Asia/Tokyo'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const

// ── ミニカレンダー ────────────────────────────────────────────────────────────

interface CalendarViewProps {
  bookings: BookingResponse[]
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
}

const CalendarView: React.FC<CalendarViewProps> = ({ bookings, selectedDate, onSelectDate }) => {
  const [month, setMonth] = useState(() => dayjs().tz(JST).startOf('month'))

  const bookingsByDate = useMemo(() => {
    const map: Record<string, BookingResponse[]> = {}
    for (const b of bookings) {
      const d = dayjs(b.startDatetime).tz(JST).format('YYYY-MM-DD')
      if (!map[d]) map[d] = []
      map[d].push(b)
    }
    return map
  }, [bookings])

  const daysInMonth = month.daysInMonth()
  const firstDow    = month.day()

  const handleDayClick = (day: number) => {
    const date = month.date(day).format('YYYY-MM-DD')
    onSelectDate(selectedDate === date ? null : date)
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.calNav}>
        <button type="button" className={styles.calNavBtn}
          onClick={() => setMonth(m => m.subtract(1, 'month'))} aria-label="前の月">‹</button>
        <span className={styles.calMonth}>{month.format('YYYY年MM月')}</span>
        <button type="button" className={styles.calNavBtn}
          onClick={() => setMonth(m => m.add(1, 'month'))} aria-label="次の月">›</button>
      </div>

      <div className={styles.calGrid}>
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={`${styles.calDow} ${i === 0 ? styles.calSun : i === 6 ? styles.calSat : ''}`}>
            {w}
          </div>
        ))}
        {Array.from({ length: firstDow }, (_, i) => (
          <div key={`pad-${i}`} className={styles.calEmpty} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day      = i + 1
          const dateStr  = month.date(day).format('YYYY-MM-DD')
          const dayItems = bookingsByDate[dateStr] ?? []
          const isToday  = month.date(day).isSame(dayjs().tz(JST), 'day')
          const isSel    = selectedDate === dateStr
          const dow      = (firstDow + i) % 7
          return (
            <div key={day}
              className={[styles.calDay, isToday ? styles.calDayToday : '',
                isSel ? styles.calDaySelected : '',
                dow === 0 ? styles.calSunDay : '', dow === 6 ? styles.calSatDay : ''].join(' ')}
              onClick={() => dayItems.length > 0 && handleDayClick(day)}
              style={{ cursor: dayItems.length > 0 ? 'pointer' : 'default' }}
            >
              <span className={styles.calDayNum}>{day}</span>
              {dayItems.length > 0 && (
                <div className={styles.calDots}>
                  {dayItems.slice(0, 3).map((b, idx) => {
                    const cls = b.status === 'CONFIRMED' ? styles.dotConfirmed :
                      b.status === 'PENDING' ? styles.dotPending :
                      b.status === 'COMPLETED' ? styles.dotCompleted : styles.dotCancelled
                    return <span key={idx} className={`${styles.calDot} ${cls}`} />
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className={styles.calLegend}>
        <span><span className={`${styles.calDot} ${styles.dotPending}`} /> リクエスト中</span>
        <span><span className={`${styles.calDot} ${styles.dotConfirmed}`} /> 確定中</span>
        <span><span className={`${styles.calDot} ${styles.dotCompleted}`} /> 完了</span>
        <span><span className={`${styles.calDot} ${styles.dotCancelled}`} /> キャンセル</span>
      </div>
    </div>
  )
}

// ── メインページ ─────────────────────────────────────────────────────────────

type FilterType = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

export const BookingsPage: React.FC = () => {
  const { showToast } = useToast()
  const [bookings,     setBookings]     = useState<BookingResponse[]>([])
  const [loading,      setLoading]      = useState(true)
  const [fetchError,   setFetchError]   = useState<string | null>(null)
  const [filter,       setFilter]       = useState<FilterType>('ALL')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [cancelling,   setCancelling]   = useState<number | null>(null)
  const [confirmId,    setConfirmId]    = useState<number | null>(null)

  // 修正: showToast を依存配列から除外し、fetch エラーは state で管理
  const fetchBookings = useCallback(() => {
    setLoading(true)
    setFetchError(null)
    getMyBookings()
      .then(res => setBookings(Array.isArray(res) ? res : []))
      .catch(() => setFetchError('予約一覧の取得に失敗しました。ページをリロードしてください。'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (selectedDate) {
        const d = dayjs(b.startDatetime).tz(JST).format('YYYY-MM-DD')
        if (d !== selectedDate) return false
      }
      if (filter === 'ALL')       return true
      if (filter === 'PENDING')   return b.status === 'PENDING'
      if (filter === 'CONFIRMED') return b.status === 'CONFIRMED'
      if (filter === 'COMPLETED') return b.status === 'COMPLETED'
      if (filter === 'CANCELLED') return ['CANCELLED_BY_USER', 'CANCELLED_BY_PROVIDER', 'NO_SHOW'].includes(b.status)
      return true
    })
  }, [bookings, filter, selectedDate])

  const handleCancel = async (bookingId: number) => {
    setCancelling(bookingId)
    try {
      await cancelBooking(bookingId)
      showToast('予約をキャンセルしました', 'success')
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'CANCELLED_BY_USER' as const } : b
      ))
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'キャンセルに失敗しました'
      showToast(msg, 'error')
    } finally {
      setCancelling(null)
      setConfirmId(null)
    }
  }

  const activeCount = bookings.filter(b =>
    b.status === 'CONFIRMED' || b.status === 'PENDING'
  ).length

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>予約一覧</h1>
        <div className={styles.headerRight}>
          {activeCount > 0 && (
            <div className={styles.badge}>{activeCount}件 有効</div>
          )}
          <Link to={ROUTES.OFFERINGS_SEARCH} className={styles.newBookingBtn}>
            ＋ 新しく予約する
          </Link>
        </div>
      </div>

      {/* フェッチエラーはトーストではなくページ内に表示 */}
      {fetchError && (
        <div className={styles.fetchErrorBanner}>
          <span>{fetchError}</span>
          <button type="button" className={styles.retryBtn} onClick={fetchBookings}>
            再試行
          </button>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <CalendarView bookings={bookings} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      )}

      {selectedDate && (
        <div className={styles.dateFilterBadge}>
          <span>{dayjs(selectedDate).tz(JST).format('MM月DD日')} の予約を表示中</span>
          <button type="button" className={styles.clearDateBtn} onClick={() => setSelectedDate(null)}>
            ✕ クリア
          </button>
        </div>
      )}

      <div className={styles.filterBar}>
        {([
          { value: 'ALL',       label: 'すべて'      },
          { value: 'PENDING',   label: 'リクエスト中' },
          { value: 'CONFIRMED', label: '確定中'       },
          { value: 'COMPLETED', label: '完了'         },
          { value: 'CANCELLED', label: 'キャンセル'   },
        ] as const).map(f => (
          <button type="button" key={f.value}
            className={`${styles.filterBtn} ${filter === f.value ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>読み込み中...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          {filter === 'ALL' && !selectedDate ? (
            <>
              <p>予約がありません</p>
              <Link to={ROUTES.OFFERINGS_SEARCH} className={styles.ctaLink}>サービスを探す →</Link>
            </>
          ) : (
            <p>該当する予約がありません</p>
          )}
        </div>
      ) : (
        <div className={styles.bookingList}>
          {filtered.map(booking => {
            const start = dayjs(booking.startDatetime).tz(JST)
            const end   = dayjs(booking.endDatetime).tz(JST)
            const isPast    = start.isBefore(dayjs())
            const canCancel = (booking.status === 'CONFIRMED' || booking.status === 'PENDING') && !isPast

            return (
              <div key={booking.id} className={styles.bookingCard}>
                <div className={`${styles.statusBadge} ${styles[BookingStatusColor[booking.status] ?? '']}`}>
                  {BookingStatusLabel[booking.status] ?? booking.status}
                </div>

                <div className={styles.bookingContent}>
                  <h3 className={styles.serviceTitle}>{booking.serviceTitle}</h3>
                  <p className={styles.providerName}>講師: {booking.providerName}</p>

                  <div className={styles.bookingMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>📅</span>
                      <span>{start.format('YYYY年MM月DD日（ddd）')}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>⏰</span>
                      <span>{start.format('HH:mm')} 〜 {end.format('HH:mm')}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>👤</span>
                      <span>{booking.participantName}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>🎫</span>
                      <span>{booking.ticketsConsumed}枚消費</span>
                    </div>
                  </div>
                </div>

                {canCancel && (
                  confirmId === booking.id ? (
                    <div className={styles.confirmArea}>
                      <p className={styles.confirmText}>
                        {booking.status === 'PENDING'
                          ? 'リクエストをキャンセルしますか？（チケット未消費のため返還なし）'
                          : 'キャンセルしますか？キャンセルポリシーに従いチケットが返還されます。'}
                      </p>
                      <div className={styles.confirmBtns}>
                        <button type="button" className={styles.cancelConfirmBtn}
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancelling === booking.id}>
                          {cancelling === booking.id ? 'キャンセル中...' : 'はい、キャンセル'}
                        </button>
                        <button type="button" className={styles.cancelAbortBtn}
                          onClick={() => setConfirmId(null)}>
                          戻る
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" className={styles.cancelBtn}
                      onClick={() => setConfirmId(booking.id)}>
                      キャンセル
                    </button>
                  )
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}