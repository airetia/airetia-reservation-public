/**
 * =========================================
 * TicketBalanceCard（チケット残高カード）
 * =========================================
 */

import { Card } from '@/components/common/Card'
import { formatTickets, formatCurrency } from '@/utils/formatter'
import type { TicketBalanceResponse } from '@/models/ticket'
import styles from './TicketBalanceCard.module.css'

interface TicketBalanceCardProps {
  balance: TicketBalanceResponse
}

export const TicketBalanceCard: React.FC<TicketBalanceCardProps> = ({
  balance,
}) => {
  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>チケット残高</h3>
      </div>

      <div className={styles.balance}>
        <div className={styles.mainBalance}>
          <span className={styles.balanceValue}>
            {(balance.available_tickets ?? balance.balance ?? 0)}
          </span>
          <span className={styles.balanceUnit}>枚</span>
        </div>
        <div className={styles.balanceEquivalent}>
          ≒ {formatCurrency((balance.available_tickets ?? balance.balance ?? 0) * 500)}相当
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>総購入枚数:</span>
          <span className={styles.detailValue}>
            {formatTickets((balance.total_purchased ?? balance.totalPurchased ?? 0))}
          </span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>総消費枚数:</span>
          <span className={styles.detailValue}>
            {formatTickets((balance.total_consumed ?? balance.totalConsumed ?? 0))}
          </span>
        </div>
        {(balance.expiring_soon_count ?? balance.expiringSoonCount ?? 0) > 0 && (
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>
              期限切れ間近（30日以内）:
            </span>
            <span className={`${styles.detailValue} ${styles.warning}`}>
              {formatTickets((balance.expiring_soon_count ?? balance.expiringSoonCount ?? 0))}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}