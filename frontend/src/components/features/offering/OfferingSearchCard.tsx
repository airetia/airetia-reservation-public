/**
 * =========================================
 * OfferingSearchCard（サービス検索結果カード）
 * =========================================
 */

import { Card } from '@/components/common/Card'
import { DeliveryMethodLabel } from '@/models/enums'
import { formatTickets } from '@/utils/formatter'
import type { OfferingSearchResult } from '@/models/offering'
import styles from './OfferingSearchCard.module.css'

interface OfferingSearchCardProps {
  offering: OfferingSearchResult
  onClick: () => void
}

export const OfferingSearchCard: React.FC<OfferingSearchCardProps> = ({
  offering,
  onClick,
}) => {
  return (
    <Card className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <h3 className={styles.title}>{offering.offering_name}</h3>
        <span className={styles.category}>{offering.category_name}</span>
      </div>

      <p className={styles.description}>{offering.description}</p>

      <div className={styles.provider}>
        <span className={styles.providerLabel}>講師:</span>
        <span className={styles.providerName}>{offering.provider_name}</span>
      </div>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>形態:</span>
          <span className={styles.metaValue}>
            {DeliveryMethodLabel[(offering.delivery_method ?? offering.deliveryMethod ?? 'ONLINE') as keyof typeof DeliveryMethodLabel]}
          </span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>時間:</span>
          <span className={styles.metaValue}>{offering.duration_minutes}分</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>チケット:</span>
          <span className={styles.metaValue}>
            {formatTickets(offering.tickets_required)}
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        {(offering.average_rating ?? offering.averageRating) != null && (
          <div className={styles.rating}>
            <span className={styles.star}>★</span>
            <span className={styles.ratingValue}>
              {((offering.average_rating ?? offering.averageRating) ?? 0).toFixed(1)}
            </span>
            <span className={styles.reviewCount}>
              ({(offering.total_reviews ?? offering.totalReviews ?? 0)})
            </span>
          </div>
        )}

        <div className={styles.availability}>
          {((offering.available_slots_count ?? offering.availableSlotsCount ?? 0) > 0) ? (
            <span className={styles.availableSlots}>
              空き枠: {(offering.available_slots_count ?? offering.availableSlotsCount ?? 0)}件
            </span>
          ) : (
            <span className={styles.noSlots}>空き枠なし</span>
          )}
        </div>
      </div>
    </Card>
  )
}