// frontend/src/api/ticketApi.ts
import { get, post } from './httpClient'
import { API_ENDPOINTS } from '@/config/constants'
import type {
  TicketBalanceData,
  TicketResponse,
  TicketUsageResponse,
  TicketGrantRequest,
} from '@/models/ticket'

/**
 * チケット API クライアント
 * → 03_common_specification.md §5 チケット
 * → TicketBalanceResponse.java: { balance, nearestExpiry, tickets }
 */

/**
 * チケット残高 + 有効チケット一覧取得
 * GET /api/v1/tickets
 * サーバー応答: { success, data: { balance: int, nearestExpiry: string|null, tickets: [...] } }
 *
 * 修正: エラー時は例外を再スローせず安全なデフォルト値を返す。
 *   Header 等のグローバルコンポーネントがこのAPIを呼ぶ際に
 *   「チケット情報取得失敗」トーストが出るのを防止する。
 */
export const getTickets = async (): Promise<{
  balance: TicketBalanceData
  tickets: TicketResponse[]
}> => {
  try {
    const res     = await get(API_ENDPOINTS.TICKETS)
    const payload = res.data?.data ?? {}
    const balanceData: TicketBalanceData = {
      balance:       payload.balance       ?? 0,
      nearestExpiry: payload.nearestExpiry ?? '',
    }
    return {
      balance: balanceData,
      tickets: Array.isArray(payload.tickets) ? payload.tickets : [],
    }
  } catch {
    // 取得失敗時は空データを返す（呼び出し元でトーストを出さないようにする）
    return {
      balance: { balance: 0, nearestExpiry: '' },
      tickets: [],
    }
  }
}

/**
 * チケット使用履歴取得
 * GET /api/v1/tickets/usages
 */
export const getTicketUsages = async (): Promise<TicketUsageResponse[]> => {
  const res = await get(API_ENDPOINTS.TICKET_USAGES)
  return Array.isArray(res.data?.data) ? res.data.data : []
}

/**
 * 管理者によるチケット手動付与
 * POST /api/v1/tickets
 * → 06_infrastructure.md §7.2（手動付与手順）
 */
export const grantTickets = async (data: TicketGrantRequest): Promise<TicketResponse[]> => {
  const res = await post(API_ENDPOINTS.TICKETS, data)
  return Array.isArray(res.data?.data) ? res.data.data : []
}