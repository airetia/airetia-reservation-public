// frontend/src/models/enums.ts
/**
 * Enum 定義（バックエンド Java Enum と 1:1 対応）
 * → 01_glossary.md §3 Enum 定義
 */

// ── ロール ────────────────────────────────────────────────────────────────
export type MemberRole = 'ADMIN' | 'MEMBER'

// ── 性別 ─────────────────────────────────────────────────────────────────
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export const GenderLabel: Record<Gender, string> = {
  MALE:   '男性',
  FEMALE: '女性',
  OTHER:  'その他',
}

// ── パーティシパント種別 ──────────────────────────────────────────────────
export type ParticipantType = 'SELF' | 'CHILD'

// ── プロバイダーステータス ────────────────────────────────────────────────
export type ProviderStatus =
  | 'PENDING_DOCUMENTS'
  | 'ON_HOLD'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'

export const ProviderStatusLabel: Record<ProviderStatus, string> = {
  PENDING_DOCUMENTS: '書類待ち',
  ON_HOLD:           '保留',
  PENDING:           '審査待ち',
  APPROVED:          '承認済み',
  REJECTED:          '却下',
  SUSPENDED:         '停止中',
}

// ── 書類種別 ─────────────────────────────────────────────────────────────
export type DocumentType = 'IDENTITY' | 'CONTRACT' | 'BANK_INFO'

export const DocumentTypeLabel: Record<DocumentType, string> = {
  IDENTITY:  '身分証明書',
  CONTRACT:  '署名済み契約書',
  BANK_INFO: '口座情報',
}

// ── 提供形式 ─────────────────────────────────────────────────────────────
export type DeliveryMethod = 'ONLINE' | 'IN_PERSON'

export const DeliveryMethodLabel: Record<DeliveryMethod, string> = {
  ONLINE:    'オンライン',
  IN_PERSON: '対面',
}

// ── 予約ステータス ────────────────────────────────────────────────────────
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED_BY_USER'
  | 'CANCELLED_BY_PROVIDER'
  | 'NO_SHOW'

export const BookingStatusLabel: Record<BookingStatus, string> = {
  PENDING:               'リクエスト中',
  CONFIRMED:             '確定済み',
  COMPLETED:             '完了',
  CANCELLED_BY_USER:     '利用者キャンセル',
  CANCELLED_BY_PROVIDER: '提供者キャンセル',
  NO_SHOW:               '無断キャンセル',
}

/** BookingsPage の CSS クラス名マッピング（styles[BookingStatusColor[status]] で使用） */
export const BookingStatusColor: Record<BookingStatus, string> = {
  PENDING:               'badge_pending',
  CONFIRMED:             'badge_confirmed',
  COMPLETED:             'badge_completed',
  CANCELLED_BY_USER:     'badge_cancelled',
  CANCELLED_BY_PROVIDER: 'badge_cancelled',
  NO_SHOW:               'badge_no_show',
}

// ── 報告書種別 ────────────────────────────────────────────────────────────
export type ReportType = 'COMPLETION' | 'NO_SHOW'

// ── チケット使用種別 ──────────────────────────────────────────────────────
export type UsageType = 'BOOKING' | 'REFUND' | 'ADJUSTMENT'

export const UsageTypeLabel: Record<UsageType, string> = {
  BOOKING:    '予約消費',
  REFUND:     '返還',
  ADJUSTMENT: '手動調整',
}

// ── ペナルティ種別 ────────────────────────────────────────────────────────
export type PenaltyType = 'NO_SHOW'

// ── 問い合わせステータス ──────────────────────────────────────────────────

/** Java Enum と同名の const enum として定義（AdminInquiriesPage で InquiryStatus.OPEN 形式で使用）*/
export const InquiryStatus = {
  OPEN:        'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED:    'RESOLVED',
  CLOSED:      'CLOSED',
} as const

export type InquiryStatus = typeof InquiryStatus[keyof typeof InquiryStatus]

export const InquiryStatusLabel: Record<InquiryStatus, string> = {
  OPEN:        '未対応',
  IN_PROGRESS: '対応中',
  RESOLVED:    '解決済み',
  CLOSED:      'クローズ',
}