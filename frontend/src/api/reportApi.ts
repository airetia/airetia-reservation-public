// frontend/src/api/reportApi.ts
import { get, post } from './httpClient'
import { API_ENDPOINTS } from '@/config/constants'
import type { AxiosResponse } from 'axios'

/**
 * 報告書 API クライアント
 * → 03_common_specification.md §5 報告書
 * → 02_business_rules.md §2.6（完了報告・無断キャンセル報告）
 */

export interface ReportCreateRequest {
  bookingId:   number
  reportType:  'COMPLETION' | 'NO_SHOW'
  feedback?:   string | null
  sharedNote?: string | null
  privateNote?: string | null
}

export interface ReportResponse {
  id:          number
  bookingId:   number
  providerId:  number
  reportType:  'COMPLETION' | 'NO_SHOW'
  feedback:    string | null
  sharedNote:  string | null
  privateNote: string | null
  createdAt:   string
}

/** 報告書作成（POST /api/v1/reports・APPROVED プロバイダーのみ）*/
export const createReport = async (
  data: ReportCreateRequest
): Promise<ReportResponse> => {
  const res: AxiosResponse = await post(API_ENDPOINTS.REPORTS, data)
  return res.data?.data
}

/** 報告書一覧（GET /api/v1/reports）*/
export const getReports = async (): Promise<ReportResponse[]> => {
  const res: AxiosResponse = await get(API_ENDPOINTS.REPORTS)
  return Array.isArray(res.data?.data) ? res.data.data : []
}

/** 報告書詳細（GET /api/v1/reports/{id}）*/
export const getReport = async (id: number): Promise<ReportResponse> => {
  const res: AxiosResponse = await get(API_ENDPOINTS.REPORT_BY_ID(id))
  return res.data?.data
}
