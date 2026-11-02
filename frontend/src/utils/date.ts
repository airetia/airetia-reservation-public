// frontend/src/utils/date.ts

/**
 * 日時ユーティリティ
 * → 02_business_rules.md §6（時間・期間計算ルール）
 * → 02_business_rules.md §6.4 UI日時表示形式
 *
 * DB/API: UTC（ISO 8601）
 * UI表示: JST（Asia/Tokyo = UTC+9）
 *
 * 依存ライブラリ: なし（Intl.DateTimeFormat を使用）
 */

const JST = 'Asia/Tokyo'

/**
 * ISO 8601 UTC 文字列を JST 日時に変換して表示する
 * 形式: YYYY年MM月DD日（曜） HH:MM → 02_business_rules.md §6.4
 *
 * @param isoString ISO 8601 UTC 文字列（例: "2026-01-15T05:00:00Z"）
 * @returns "2026年1月15日（金） 14:00"
 */
export function formatJST(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return '—'

  const weekdays = ['日', '月', '火', '水', '木', '金', '土']

  const formatter = new Intl.DateTimeFormat('ja-JP', {
    timeZone: JST,
    year:     'numeric',
    month:    'numeric',
    day:      'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    hour12:   false,
  })

  const parts   = formatter.formatToParts(date)
  const year    = parts.find(p => p.type === 'year')?.value ?? ''
  const month   = parts.find(p => p.type === 'month')?.value ?? ''
  const day     = parts.find(p => p.type === 'day')?.value ?? ''
  const hour    = parts.find(p => p.type === 'hour')?.value ?? ''
  const minute  = parts.find(p => p.type === 'minute')?.value ?? ''

  const weekday = weekdays[date.toLocaleDateString('ja-JP', { timeZone: JST, weekday: 'narrow' })
    ? new Date(date.toLocaleString('en-US', { timeZone: JST })).getDay() : 0]

  return `${year}年${month}月${day}日（${weekday}） ${hour}:${minute}`
}

/**
 * ISO 8601 UTC 文字列を JST 日付のみに変換する
 * 形式: YYYY年MM月DD日（曜） → 02_business_rules.md §6.4
 */
export function formatDateJST(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return '—'

  const weekdays = ['日', '月', '火', '水', '木', '金', '土']

  const jstDate  = new Date(date.toLocaleString('en-US', { timeZone: JST }))
  const year     = jstDate.getFullYear()
  const month    = jstDate.getMonth() + 1
  const day      = jstDate.getDate()
  const weekday  = weekdays[jstDate.getDay()]

  return `${year}年${month}月${day}日（${weekday}）`
}

/**
 * 2つの日時の分差を計算する（サービス開始時刻基準）
 * キャンセルポリシー判定に使用 → 02_business_rules.md §3.1
 *
 * @param startDatetime サービス開始時刻（ISO 8601 UTC）
 * @param cancelTime    キャンセル実行時刻（ISO 8601 UTC、省略時は現在）
 * @returns 開始時刻までの分数（負値 = 開始後）
 */
export function minutesUntil(
  startDatetime: string,
  cancelTime?: string,
): number {
  const start  = new Date(startDatetime).getTime()
  const cancel = cancelTime ? new Date(cancelTime).getTime() : Date.now()
  return Math.floor((start - cancel) / 60_000)
}

/**
 * YYYY-MM-DD 形式の日付文字列を JST 表示用に変換
 * Participant の birthDate など LocalDate 型に使用
 */
export function formatLocalDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  if (!year || !month || !day) return dateStr
  return `${year}年${parseInt(month)}月${parseInt(day)}日`
}

/**
 * formatDatetime: formatJST の別名。日時（日付+時刻）を JST 表示。
 * AdminBookingsPage 等で使用。
 * → 02_business_rules.md §6.4
 */
export const formatDatetime = formatJST

/**
 * formatDateTime: formatJST の別名（コンポーネント互換）
 * BookingDetailModal / BookingListCard / CancellationModal 等で使用。
 */
export const formatDateTime = formatJST

/**
 * formatDate: formatDateJST の別名（コンポーネント互換）
 * ExpiringTicketAlert 等で使用。
 */
export const formatDate = formatDateJST