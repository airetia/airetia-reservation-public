// frontend/src/components/features/ticket/ExpiringTicketAlert.tsx
import React from 'react'
import type { TicketResponse } from '@/models/ticket'
import { formatDate } from '@/utils/date'
import styles from './ExpiringTicketAlert.module.css'

interface Props {
  tickets: TicketResponse[]
  /** 何日以内に期限切れになるチケットを警告するか（デフォルト14日） */
  withinDays?: number
}

/**
 * 期限切れ間近チケット警告
 * → DashboardPage / TicketsPage で使用
 * → 02_business_rules.md §1.2（有効期限）/ §9（チケット期限切れ警告通知）
 */
const ExpiringTicketAlert: React.FC<Props> = ({ tickets, withinDays = 14 }) => {
  const now      = new Date()
  const deadline = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000)

  const expiring = tickets.filter((t) => {
    if (!t.active) return false
    const exp = new Date(t.expiryDate)
    return exp <= deadline && exp > now
  })

  if (expiring.length === 0) return null

  // Group by date
  const grouped = expiring.reduce<Record<string, number>>((acc, t) => {
    const date = formatDate(t.expiryDate)
    acc[date] = (acc[date] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className={styles.alert}>
      <span className={styles.icon}>⚠️</span>
      <div className={styles.body}>
        <p className={styles.title}>
          {withinDays}日以内に期限切れになるチケットがあります（合計{expiring.length}枚）
        </p>
        <ul className={styles.items}>
          {Object.entries(grouped).map(([date, count]) => (
            <li key={date} className={styles.item}>
              {date} に {count}枚 期限切れ
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ExpiringTicketAlert