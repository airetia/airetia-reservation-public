/**
 * =========================================
 * BookingDetailModal（予約詳細モーダル）
 * =========================================
 */

import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { BookingStatusLabel, DeliveryMethodLabel } from '@/models/enums'
import { formatDateTime } from '@/utils/date'
import { formatTickets } from '@/utils/formatter'
import type { BookingResponse } from '@/models/booking'
import styles from './BookingDetailModal.module.css'

interface BookingDetailModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingResponse | null
  onCancelClick?: () => void
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  isOpen,
  onClose,
  booking,
  onCancelClick,
}) => {
  if (!booking) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="予約詳細">
      <div className={styles.content}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>サービス情報</h3>
          <div className={styles.info}>
            <div className={styles.infoRow}>
              <span className={styles.label}>サービス名:</span>
              <span className={styles.value}>{booking.serviceTitle}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>カテゴリー:</span>
              <span className={styles.value}>{(booking.offering as any)?.categoryName ?? ''}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>形態:</span>
              <span className={styles.value}>
                {DeliveryMethodLabel[booking.deliveryMethod]}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>時間:</span>
              <span className={styles.value}>
                {booking.durationMinutes}分
              </span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>日時</h3>
          <div className={styles.info}>
            <div className={styles.infoRow}>
              <span className={styles.label}>開始:</span>
              <span className={styles.value}>
                {formatDateTime(booking.startDatetime)}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>終了:</span>
              <span className={styles.value}>
                {formatDateTime(booking.endDatetime)}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>講師</h3>
          <div className={styles.info}>
            <div className={styles.infoRow}>
              <span className={styles.label}>氏名:</span>
              <span className={styles.value}>{booking.providerName}</span>
            </div>
            {booking.provider?.averageRating != null && (
              <div className={styles.infoRow}>
                <span className={styles.label}>評価:</span>
                <span className={styles.value}>
                  ★ {(booking.provider?.averageRating ?? 0).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>利用者</h3>
          <div className={styles.info}>
            <div className={styles.infoRow}>
              <span className={styles.label}>氏名:</span>
              <span className={styles.value}>{booking.participantName}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>予約情報</h3>
          <div className={styles.info}>
            <div className={styles.infoRow}>
              <span className={styles.label}>ステータス:</span>
              <span className={`${styles.status} ${booking.status ? styles[booking.status as keyof typeof styles] ?? '' : ''}`}>
                {BookingStatusLabel[booking.status]}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>消費チケット:</span>
              <span className={styles.value}>
                {formatTickets(booking.ticketsConsumed)}
              </span>
            </div>
            {booking.refundAmount != null && (
              <div className={styles.infoRow}>
                <span className={styles.label}>返還チケット:</span>
                <span className={styles.value}>
                  {formatTickets(booking.refundAmount)}
                </span>
              </div>
            )}
          </div>
        </div>

        {booking.offering?.onlineUrl && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>オンラインURL</h3>
            <a
              href={booking.offering?.onlineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {booking.offering?.onlineUrl}
            </a>
          </div>
        )}

        {booking.offering?.locationAddress && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>場所</h3>
            <p className={styles.address}>{booking.offering?.locationAddress}</p>
          </div>
        )}

        {booking.notes && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>メモ</h3>
            <p className={styles.notes}>{booking.notes}</p>
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            閉じる
          </Button>
          {booking.canCancel && onCancelClick && (
            <Button variant="danger" onClick={onCancelClick}>
              キャンセルする
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}