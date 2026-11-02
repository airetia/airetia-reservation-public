/**
 * =========================================
 * BookingListCard（予約一覧項目）
 * =========================================
 */

import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { BookingStatusLabel } from '@/models/enums'
import { formatDateTime } from '@/utils/date'
import { formatTickets } from '@/utils/formatter'
import type { BookingListItem } from '@/models/booking'
import styles from './BookingListCard.module.css'

interface BookingListCardProps {
  booking: BookingListItem
  onClick: () => void
  onCancel?: () => void
}

export const BookingListCard: React.FC<BookingListCardProps> = ({
  booking,
  onClick,
  onCancel,
}) => {
  return (
    <Card className={styles.card}>
      <div className={styles.main} onClick={onClick}>
        <div className={styles.header}>
          <h3 className={styles.title}>{booking.offering_name}</h3>
          <span className={`${styles.status} ${(booking.status ? styles[booking.status as keyof typeof styles] : '')}`}>
            {BookingStatusLabel[booking.status]}
          </span>
        </div>

        <div className={styles.info}>
          <div className={styles.infoRow}>
            <span className={styles.label}>日時:</span>
            <span className={styles.value}>
              {formatDateTime(booking.start_datetime ?? booking.startDatetime)}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>講師:</span>
            <span className={styles.value}>{booking.provider_name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>利用者:</span>
            <span className={styles.value}>{booking.participant_name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>チケット:</span>
            <span className={styles.value}>
              {formatTickets(booking.tickets_consumed ?? booking.ticketsConsumed ?? 0)}
            </span>
          </div>
        </div>
      </div>

      {(booking.can_cancel ?? booking.canCancel) && onCancel && (
        <div className={styles.actions}>
          <Button variant="danger" size="small" onClick={onCancel}>
            キャンセル
          </Button>
        </div>
      )}
    </Card>
  )
}