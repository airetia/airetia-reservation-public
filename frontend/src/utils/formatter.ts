// frontend/src/utils/formatter.ts
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/ja'

/**
 * 表示フォーマットユーティリティ
 * → 02_business_rules.md §6.4 UI日時表示形式
 *
 * DB/API: UTC（ISO 8601）
 * UI 表示: JST 変換後に表示
 */

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('ja')

const TZ = 'Asia/Tokyo'

/** ISO 8601 UTC → "YYYY年MM月DD日（曜）" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return dayjs(iso).tz(TZ).format('YYYY年MM月DD日（ddd）')
}

/** ISO 8601 UTC → "HH:MM" */
export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return dayjs(iso).tz(TZ).format('HH:mm')
}

/** ISO 8601 UTC → "YYYY年MM月DD日（曜） HH:MM" */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return dayjs(iso).tz(TZ).format('YYYY年MM月DD日（ddd） HH:mm')
}

/** チケット枚数表示 */
export function formatTicketCount(count: number | null | undefined): string {
  if (count == null) return '—'
  return `${count}枚`
}

/** 氏名フルネーム（姓 名） */
export function formatFullName(
  lastName: string,
  firstName: string
): string {
  return `${lastName} ${firstName}`
}

/** 郵便番号フォーマット（1234567 → 123-4567） */
export function formatPostalCode(code: string): string {
  if (code.length === 7) return `${code.slice(0, 3)}-${code.slice(3)}`
  return code
}

/** 電話番号フォーマット（09012345678 → 090-1234-5678） */
export function formatPhone(phone: string): string {
  if (phone.length === 11) {
    return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`
  }
  if (phone.length === 10) {
    return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`
  }
  return phone
}

/** 金額表示（500 → "¥500") */
export function formatPrice(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return `¥${amount.toLocaleString('ja-JP')}`
}

/**
 * formatTickets: formatTicketCount の別名（コンポーネント互換）
 */
export const formatTickets = formatTicketCount

/**
 * formatCurrency: formatPrice の別名（コンポーネント互換）
 */
export const formatCurrency = formatPrice