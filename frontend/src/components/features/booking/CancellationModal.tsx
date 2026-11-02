/**
 * =========================================
 * CancellationModal（キャンセル確認モーダル）
 * =========================================
 */

import { useState, useEffect } from 'react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Loading } from '@/components/common/Loading'
import { useToast } from '@/hooks/useToast'
import * as bookingApi from '@/api/bookingApi'
import { formatDateTime } from '@/utils/date'
import { formatTickets } from '@/utils/formatter'
import type { BookingResponse, CancellationDetails } from '@/models/booking'
import styles from './CancellationModal.module.css'

interface CancellationModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingResponse | null
  onSuccess: () => void
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSuccess,
}) => {
  const { showToast } = useToast()
  const [details, setDetails] = useState<CancellationDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (isOpen && booking) {
      loadCancellationDetails()
    }
  }, [isOpen, booking])

  const loadCancellationDetails = async () => {
    if (!booking) return

    setLoading(true)
    try {
      const response = await bookingApi.getCancellationDetails(booking.id)
      setDetails(response.data)
    } catch (error) {
      showToast('キャンセル情報の取得に失敗しました', 'error')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!booking) return

    setCancelling(true)
    try {
      await bookingApi.cancelBooking(booking.id)
      onSuccess()
    } catch (error: any) {
      const message = error.response?.data?.message || 'キャンセルに失敗しました'
      showToast(message, 'error')
    } finally {
      setCancelling(false)
    }
  }

  if (!booking) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="予約キャンセル">
      {loading ? (
        <Loading />
      ) : details ? (
        <div className={styles.content}>
          <div className={styles.warning}>
            <p className={styles.warningTitle}>予約をキャンセルしますか？</p>
            <p className={styles.warningText}>
              この操作は取り消せません。
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>予約情報</h3>
            <div className={styles.info}>
              <div className={styles.infoRow}>
                <span className={styles.label}>サービス:</span>
                <span className={styles.value}>{booking.serviceTitle}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>日時:</span>
                <span className={styles.value}>
                  {formatDateTime(booking.startDatetime)}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>返還チケット</h3>
            <div className={styles.refundInfo}>
              <div className={styles.refundMain}>
                <span className={styles.refundLabel}>返還率:</span>
                <span className={styles.refundValue}>
                  {(details.current_refund_rate ?? details.currentRefundRate)}%
                </span>
              </div>
              <div className={styles.refundMain}>
                <span className={styles.refundLabel}>返還枚数:</span>
                <span className={styles.refundValue}>
                  {formatTickets((details.current_refund_amount ?? details.currentRefundAmount))}
                </span>
              </div>
              {(details.refund_expiry ?? details.refundExpiry) && (
                <div className={styles.refundExpiry}>
                  <span className={styles.expiryLabel}>有効期限:</span>
                  <span className={styles.expiryValue}>
                    {formatDateTime((details.refund_expiry ?? details.refundExpiry))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {(details.refund_schedule ?? details.refundSchedule ?? []).length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>返還率スケジュール</h3>
              <div className={styles.schedule}>
                {(details.refund_schedule ?? details.refundSchedule ?? []).map((item, index) => (
                  <div key={index} className={styles.scheduleItem}>
                    <span className={styles.scheduleLabel}>{item.label}:</span>
                    <span className={styles.scheduleValue}>
                      {(item.refund_rate ?? item.refundRate)}% ({formatTickets((item.refund_amount ?? item.refundAmount))})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose} disabled={cancelling}>
              戻る
            </Button>
            <Button variant="danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'キャンセル中...' : 'キャンセルする'}
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}