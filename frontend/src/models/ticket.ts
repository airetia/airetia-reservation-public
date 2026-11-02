// frontend/src/models/ticket.ts
/**
 * チケットモデル
 * → 01_glossary.md §2 Ticket
 * → airetia_spec_v1_1.docx §5.5 TicketBalanceResponse
 */

import type { UsageType } from './enums'

/** GET /api/v1/tickets レスポンス（TicketBalanceResponse）*/
export interface TicketBalanceResponse {
  balance:       number
  nearestExpiry: string | null
  tickets:       TicketResponse[]
  // コンポーネント互換フィールド
  availableTickets?:   number
  totalPurchased?:     number
  totalConsumed?:      number
  expiringSoonCount?:  number
  // snake_case 互換
  available_tickets?:   number
  total_purchased?:     number
  total_consumed?:      number
  expiring_soon_count?: number
}

/** チケット1枚のレスポンス */
export interface TicketResponse {
  id:         number
  expiryDate: string
  active:     boolean
  createdAt:  string
  // snake_case 互換
  expiry_date?: string
}

/** チケット使用履歴1件 */
export interface TicketUsageItem {
  id:          number
  usageType:   UsageType
  amount:      number
  createdAt:   string
  bookingId?:  number | null
  note?:       string | null
  // コンポーネント互換フィールド
  usageId?:       number
  offeringName?:  string | null
  description?:   string | null
  expiryDate?:    string | null
  usageDate?:     string | null
  // snake_case 互換
  usage_id?:      number
  usage_type?:    UsageType
  usage_date?:    string | null
  booking_id?:    number | null
  offering_name?: string | null
  expiry_date?:   string | null
}

/** POST /api/v1/tickets リクエスト（ADMIN）*/
export interface TicketGrantRequest {
  memberId:   number
  quantity:   number
  expiryDate: string
}