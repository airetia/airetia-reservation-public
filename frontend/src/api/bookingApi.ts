// frontend/src/api/bookingApi.ts
import { get, post, del, patch } from './httpClient'
import { API_ENDPOINTS } from '@/config/constants'
import type { BookingResponse, BookingCreateRequest, CancellationDetails } from '@/models/booking'

/**
 * 予約 API クライアント
 * → 03_common_specification.md §5 ブッキング
 *
 * 全関数で res.data?.data を返す（他 API ファイルとの一貫性）
 */

/** 自分の予約一覧取得 */
export const getMyBookings = async (): Promise<BookingResponse[]> => {
  const res = await get(API_ENDPOINTS.BOOKINGS)
  return Array.isArray(res.data?.data) ? res.data.data : []
}

/** プロバイダー視点の予約一覧取得 */
export const getBookingsAsProvider = async (): Promise<BookingResponse[]> => {
  const res = await get(`${API_ENDPOINTS.BOOKINGS}?role=provider`)
  return Array.isArray(res.data?.data) ? res.data.data : []
}

/** 予約作成（→ PENDING）*/
export const createBooking = async (
  data: BookingCreateRequest
): Promise<BookingResponse> => {
  const res = await post(API_ENDPOINTS.BOOKINGS, data)
  return res.data?.data
}

/** 予約詳細取得 */
export const getBooking = async (
  bookingId: number
): Promise<BookingResponse> => {
  const res = await get(API_ENDPOINTS.BOOKING_BY_ID(bookingId))
  return res.data?.data
}

/**
 * 利用者都合キャンセル（§3.1）
 * DELETE /api/v1/bookings/{id}
 */
export const cancelBooking = async (bookingId: number): Promise<void> => {
  await del(API_ENDPOINTS.BOOKING_BY_ID(bookingId))
}

/**
 * プロバイダー都合キャンセル（§3.4 / 100%返還）
 * PATCH /api/v1/bookings/{id}/cancel
 */
export const cancelBookingByProvider = async (bookingId: number): Promise<void> => {
  await patch(`${API_ENDPOINTS.BOOKING_BY_ID(bookingId)}/cancel`, {})
}

/**
 * 全予約一覧取得（管理者専用）
 * GET /api/v1/bookings?status=...
 */
export const getAllBookings = async (
  params?: { status?: string; page?: number; size?: number }
): Promise<BookingResponse[]> => {
  const res = await get(API_ENDPOINTS.BOOKINGS, { params })
  return Array.isArray(res.data?.data) ? res.data.data : []
}

/**
 * 予約確定（管理者）
 * PATCH /api/v1/bookings/{id}/confirm
 */
export const confirmBooking = async (bookingId: number): Promise<BookingResponse> => {
  const res = await patch(`${API_ENDPOINTS.BOOKINGS}/${bookingId}/confirm`)
  return res.data?.data
}

/**
 * キャンセル詳細（返還率・返還枚数）取得
 * GET /api/v1/bookings/{id}/cancellation-details
 * → 02_business_rules.md §3.1 キャンセルポリシー
 */
export const getCancellationDetails = async (
  bookingId: number
): Promise<{ data: CancellationDetails }> => {
  const res = await get(`${API_ENDPOINTS.BOOKING_BY_ID(bookingId)}/cancellation-details`)
  // バックエンド未実装時のフォールバック（暫定）
  if (!res.data?.data) {
    return {
      data: {
        currentRefundRate:   100,
        currentRefundAmount: 0,
        refundExpiry:        null,
        refundSchedule:      [],
        current_refund_rate:   100,
        current_refund_amount: 0,
        refund_expiry:         null,
        refund_schedule:       [],
      }
    }
  }
  return { data: res.data.data }
}