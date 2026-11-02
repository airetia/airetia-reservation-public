// frontend/src/pages/member/TicketsPage.tsx

/**
 * チケット管理ページ
 * → 05_frontend_specification.md §3.1 /member/tickets
 * → 02_business_rules.md §1（料金・チケットルール）
 *
 * 変更:
 *   - 有効チケット一覧: 有効期限ごとに枚数グループ表示
 *   - 右上にチケット追加ボタン配置
 */

import { useEffect, useState } from 'react'
import { getTickets, getTicketUsages } from '@/api/ticketApi'
import type { TicketBalanceData, TicketResponse, TicketUsageResponse } from '@/models/ticket'
import { formatJST } from '@/utils/date'
import styles from './TicketsPage.module.css'

type ExpiryGroup = {
  expiryDate: string
  count:      number
  daysLeft:   number
}

/**
 * 有効期限ごとにグループ化（daysLeft の計算も行う）
 * Date.now() はレンダー外のこの関数内で呼ぶ
 */
function groupByExpiry(tickets: TicketResponse[], now: number): ExpiryGroup[] {
  const map = new Map<string, number>()
  for (const t of tickets) {
    if (!t.active) continue
    map.set(t.expiryDate, (map.get(t.expiryDate) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([expiryDate, count]) => ({
      expiryDate,
      count,
      daysLeft: Math.ceil((new Date(expiryDate).getTime() - now) / (1000 * 60 * 60 * 24)),
    }))
}

export function TicketsPage() {
  // loading を true で初期化し、useEffect 内で setLoading(true) を呼ばない
  const [balance,   setBalance]   = useState<TicketBalanceData | null>(null)
  const [tickets,   setTickets]   = useState<TicketResponse[]>([])
  const [usages,    setUsages]    = useState<TicketUsageResponse[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'balance' | 'history'>('balance')
  const [modalOpen, setModalOpen] = useState(false)
  // グループ計算の基準時刻（レンダーごとに変わらないよう state で保持）
  const [now]                     = useState(() => Date.now())

  useEffect(() => {
    let cancelled = false
    Promise.all([getTickets(), getTicketUsages()])
      .then(([ticketData, usageData]) => {
        if (cancelled) return
        setBalance(ticketData.balance)
        setTickets(ticketData.tickets)
        setUsages(usageData)
      })
      .catch(() => { if (!cancelled) setError('チケット情報の取得に失敗しました') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) return <div className={styles.loading}>読み込み中...</div>
  if (error)   return <div className={styles.error}>{error}</div>

  return (
    <div className={styles.page}>

      {/* ── ページヘッダー ── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>チケット管理</h1>
        <button type="button" className={styles.addBtn} onClick={() => setModalOpen(true)}>
          + チケット追加
        </button>
      </div>

      {/* ── 残高カード ── */}
      <div className={styles.balanceCard}>
        <p className={styles.balanceLabel}>現在の残高</p>
        <div className={styles.balanceMain}>
          <span className={styles.balanceCount}>{balance?.balance ?? 0}</span>
          <span className={styles.balanceUnit}>枚</span>
        </div>
        {balance?.nearestExpiry && (
          <p className={styles.expiryNote}>最短有効期限: {formatJST(balance.nearestExpiry)}</p>
        )}
      </div>

      {/* ── タブ ── */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={activeTab === 'balance' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('balance')}
        >
          有効チケット一覧
        </button>
        <button
          type="button"
          className={activeTab === 'history' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('history')}
        >
          使用履歴
        </button>
      </div>

      {activeTab === 'balance'
        ? <TicketList tickets={tickets} now={now} />
        : <UsageList usages={usages} />
      }

      {/* ── チケット追加モーダル ── */}
      {modalOpen && (
        <div className={styles.overlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>チケット追加</h2>
              <button
                type="button"
                className={styles.modalCloseX}
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>チケットのご購入は現在、<strong>銀行振込</strong>によるお申し込みとなっております。</p>
              <div className={styles.bankInfo}>
                <p className={styles.bankLabel}>お振込先</p>
                <table className={styles.bankTable}>
                  <tbody>
                    <tr>
                      <td>銀行名</td>
                      <td>（管理者にお問い合わせください）</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className={styles.modalNote}>
                ご入金確認後、通常1〜2営業日以内にチケットを付与いたします。<br />
                チケット単価: <strong>500円/枚（税抜）</strong><br />
                有効期限: 付与日より1年間
              </p>
              <p className={styles.stripeNote}>
                ※ オンライン決済（クレジットカード）は準備中です
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setModalOpen(false)}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── サブコンポーネント ──────────────────────────────────────────────────────

function TicketList({ tickets, now }: { tickets: TicketResponse[]; now: number }) {
  const groups = groupByExpiry(tickets, now)
  if (groups.length === 0) return <p className={styles.empty}>有効なチケットがありません</p>

  return (
    <div className={styles.ticketGroups}>
      {groups.map(({ expiryDate, count, daysLeft }) => {
        const urgencyClass = daysLeft <= 7
          ? styles.expiryUrgent
          : daysLeft <= 30
          ? styles.expirySoon
          : styles.expiryNormal

        return (
          <div key={expiryDate} className={styles.ticketGroup}>
            <div className={styles.ticketGroupLeft}>
              <span className={urgencyClass}>
                {formatJST(expiryDate)} まで
              </span>
              {daysLeft <= 30 && (
                <span className={daysLeft <= 7 ? styles.daysLeftBadgeUrgent : styles.daysLeftBadge}>
                  あと{daysLeft}日
                </span>
              )}
            </div>
            <div className={styles.ticketGroupRight}>
              <span className={styles.ticketCountNum}>{count}</span>
              <span className={styles.ticketCountUnit}>枚</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const USAGE_LABEL: Record<string, string> = {
  BOOKING:    '予約消費',
  REFUND:     '返還',
  ADJUSTMENT: '管理者調整',
}

function UsageList({ usages }: { usages: TicketUsageResponse[] }) {
  if (usages.length === 0) return <p className={styles.empty}>使用履歴がありません</p>
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>種別</th>
          <th>枚数</th>
          <th>予約ID</th>
          <th>メモ</th>
          <th>日時</th>
        </tr>
      </thead>
      <tbody>
        {usages.map(u => (
          <tr key={u.id}>
            <td>{USAGE_LABEL[u.usageType] ?? u.usageType}</td>
            <td className={u.amount > 0 ? styles.consume : styles.refund}>
              {u.amount > 0 ? `-${u.amount}` : `+${Math.abs(u.amount)}`}枚
            </td>
            <td>{u.bookingId ? `#${u.bookingId}` : '—'}</td>
            <td>{u.note ?? '—'}</td>
            <td>{formatJST(u.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
