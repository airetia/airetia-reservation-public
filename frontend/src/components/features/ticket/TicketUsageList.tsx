/**
 * =========================================
 * TicketUsageList（チケット使用履歴リスト）
 * =========================================
 */

import { Card } from '@/components/common/Card'
import { UsageTypeLabel } from '@/models/enums'
import { formatDateTime } from '@/utils/date'
import { formatTickets } from '@/utils/formatter'
import type { TicketUsageItem } from '@/models/ticket'
import styles from './TicketUsageList.module.css'

interface TicketUsageListProps {
  usages: TicketUsageItem[]
  emptyMessage?: string
}

export const TicketUsageList: React.FC<TicketUsageListProps> = ({
  usages,
  emptyMessage = '使用履歴がありません',
}) => {
  if (usages.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyMessage}>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {usages.map((usage) => (
        <Card key={(usage as any).usage_id ?? usage.id} className={styles.item}>
          <div className={styles.header}>
            <span
              className={`${styles.type} ${styles[((usage as any).usage_type ?? usage.usageType) ?? ''] ?? ''}`}
            >
              {UsageTypeLabel[((usage as any).usage_type ?? usage.usageType) as keyof typeof UsageTypeLabel]}
            </span>
            <span className={styles.date}>
              {formatDateTime(((usage as any).usage_date ?? usage.usageDate ?? usage.createdAt))}
            </span>
          </div>

          <div className={styles.content}>
            <div className={styles.info}>
              {((usage as any).booking_id ?? usage.bookingId) && (
                <p className={styles.description}>
                  予約 #{((usage as any).booking_id ?? usage.bookingId)}
                  {((usage as any).offering_name ?? usage.offeringName) && ` - ${((usage as any).offering_name ?? usage.offeringName)}`}
                </p>
              )}
              {usage.description && (
                <p className={styles.description}>{usage.description}</p>
              )}
            </div>

            <div
              className={`${styles.amount} ${
                (((usage as any).usage_type ?? usage.usageType) === 'BOOKING') ? styles.negative : styles.positive
              }`}
            >
              {(((usage as any).usage_type ?? usage.usageType) === 'BOOKING') ? '-' : '+'}
              {formatTickets(Math.abs(usage.amount))}
            </div>
          </div>

          {((usage as any).expiry_date ?? usage.expiryDate) && (
            <div className={styles.expiry}>
              有効期限: {formatDateTime(((usage as any).expiry_date ?? usage.expiryDate))}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}