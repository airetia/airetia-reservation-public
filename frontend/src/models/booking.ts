// frontend/src/models/booking.ts
/**
 * 予約モデル
 * → 01_glossary.md §2 Booking
 * → airetia_spec_v1_1.docx §5.4 BookingResponse
 */

import type { BookingStatus, DeliveryMethod } from './enums'

/** ネストされたオファリング情報（BookingDetailModal 用）*/
export interface BookingOfferingInfo {
  offeringId?:      number
  offeringName?:    string
  categoryName?:    string | null
  deliveryMethod?:  DeliveryMethod
  durationMinutes?: number
  onlineUrl?:       string | null
  locationAddress?: string | null
}

/** ネストされたプロバイダー情報（BookingDetailModal 用）*/
export interface BookingProviderInfo {
  providerId?:    number
  providerName?:  string
  averageRating?: number | null
}

/** GET /api/v1/bookings レスポンス */
export interface BookingResponse {
  id:              number
  participantId:   number
  participantName: string
  availabilityId:  number
  providerId:      number
  providerName:    string
  serviceTitle:    string
  startDatetime:   string
  endDatetime:     string
  durationMinutes: number
  deliveryMethod:  DeliveryMethod
  status:          BookingStatus
  ticketsConsumed: number
  createdAt:       string

  // 任意フィールド
  canCancel?:    boolean | null
  refundAmount?: number | null
  notes?:        string | null

  // ネストオブジェクト（詳細画面用）
  offering?: BookingOfferingInfo | null
  provider?: BookingProviderInfo | null
}

/** 予約一覧カード用 */
export interface BookingListItem {
  id:              number
  status:          BookingStatus
  startDatetime:   string
  providerName:    string
  participantName: string
  ticketsConsumed: number
  offeringName?:   string
  canCancel?:      boolean | null
  // snake_case 互換（既存コンポーネント用）
  offering_name?:    string
  start_datetime?:   string
  provider_name?:    string
  participant_name?: string
  tickets_consumed?: number
  can_cancel?:       boolean | null
}

/** POST /api/v1/bookings リクエスト */
export interface BookingCreateRequest {
  availabilityId: number
  participantId:  number
}

/** キャンセル詳細（CancellationModal 用）*/
export interface CancellationDetails {
  currentRefundRate:   number
  currentRefundAmount: number
  refundExpiry?:       string | null
  refundSchedule:      RefundScheduleItem[]
  // snake_case 互換
  current_refund_rate?:   number
  current_refund_amount?: number
  refund_expiry?:         string | null
  refund_schedule?:       RefundScheduleItem[]
}

export interface RefundScheduleItem {
  label:       string
  refundRate:  number
  refundAmount: number
  // snake_case 互換
  refund_rate?:   number
  refund_amount?: number
}