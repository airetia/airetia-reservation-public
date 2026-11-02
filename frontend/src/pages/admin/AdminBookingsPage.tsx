// frontend/src/pages/admin/AdminBookingsPage.tsx

/**
 * 管理者向け予約管理ページ
 * - 全予約の一覧・ステータスフィルタリング
 * - PENDING 予約の確定（PENDING → CONFIRMED）チケット消費はサーバー側
 *   → PATCH /api/v1/bookings/{id}/confirm
 *   → 02_business_rules.md §2
 * - 管理者代理キャンセル
 */

import React, { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/contexts/ToastProvider'
import { Loading } from '@/components/common/Loading'
import type { BookingResponse } from '@/models/booking'
import { getAllBookings, confirmBooking, cancelBooking } from '@/api/bookingApi'
import { formatDatetime } from '@/utils/date'
import styles from './AdminBookingsPage.module.css'

export const AdminBookingsPage: React.FC = () => {
  const { showToast } = useToast()
  const [bookings,   setBookings]   = useState<BookingResponse[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [status,     setStatus]     = useState<string>('ALL')
  const [confirming, setConfirming] = useState<number | null>(null)
  const [cancelling, setCancelling] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllBookings({ status: status === 'ALL' ? undefined : status })
      setBookings(data)
    } catch {
      setError('予約一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { load() }, [load])

  /** PENDING → CONFIRMED（チケット消費はサーバー側で実施） */
  const handleConfirm = async (id: number) => {
    if (!window.confirm('この予約を確定しますか？（チケットが消費されます）')) return
    setConfirming(id)
    try {
      await confirmBooking(id)
      showToast('予約を確定しました', 'success')
      load()
    } catch (e) {
      const msg = e instanceof Error ? e.message : '確定に失敗しました'
      showToast(msg, 'error')
    } finally {
      setConfirming(null)
    }
  }

  /** 管理者代理キャンセル */
  const handleCancel = async (id: number) => {
    if (!window.confirm('この予約をキャンセルしますか？')) return
    setCancelling(id)
    try {
      await cancelBooking(id)
      showToast('予約をキャンセルしました', 'success')
      load()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'キャンセルに失敗しました'
      showToast(msg, 'error')
    } finally {
      setCancelling(null)
    }
  }

  const statusOptions = [
    { value: 'ALL',                   label: 'すべて' },
    { value: 'PENDING',               label: 'リクエスト中' },
    { value: 'CONFIRMED',             label: '確定済み' },
    { value: 'COMPLETED',             label: '完了' },
    { value: 'CANCELLED_BY_USER',     label: '利用者キャンセル' },
    { value: 'CANCELLED_BY_PROVIDER', label: '提供者キャンセル' },
    { value: 'NO_SHOW',               label: '無断キャンセル' },
  ]

  const statusLabel: Record<string, string> = {
    PENDING:               'リクエスト中',
    CONFIRMED:             '確定済み',
    COMPLETED:             '完了',
    CANCELLED_BY_USER:     '利用者キャンセル',
    CANCELLED_BY_PROVIDER: '提供者キャンセル',
    NO_SHOW:               '無断キャンセル',
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>予約管理</h1>

      <div className={styles.filters}>
        {statusOptions.map(opt => (
          <button type="button"
            key={opt.value}
            className={`${styles.filter} ${status === opt.value ? styles.filterActive : ''}`}
            onClick={() => setStatus(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading && <Loading />}
      {error   && <div className={styles.error}>{error}</div>}

      {!loading && !error && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>利用者</th>
                <th>サービス</th>
                <th>開始日時</th>
                <th>ステータス</th>
                <th>チケット</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.empty}>該当する予約がありません</td>
                </tr>
              )}
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.participantName}</td>
                  <td>{b.serviceTitle}</td>
                  <td>{formatDatetime(b.startDatetime)}</td>
                  <td>
                    <span className={`${styles.badge} ${styles['badge_' + b.status]}`}>
                      {statusLabel[b.status] ?? b.status}
                    </span>
                  </td>
                  <td>{b.ticketsConsumed}枚</td>
                  <td className={styles.actions}>
                    {b.status === 'PENDING' && (
                      <button type="button"
                        className={styles.confirmBtn}
                        onClick={() => handleConfirm(b.id)}
                        disabled={confirming === b.id}
                      >
                        {confirming === b.id ? '処理中…' : '予約確定'}
                      </button>
                    )}
                    {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                      <button type="button"
                        className={styles.cancelBtn}
                        onClick={() => handleCancel(b.id)}
                        disabled={cancelling === b.id}
                      >
                        {cancelling === b.id ? '処理中…' : 'キャンセル'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
