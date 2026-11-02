// frontend/src/api/offeringApi.ts
import { get, post, patch, del } from './httpClient'
import { API_ENDPOINTS } from '@/config/constants'
import type { OfferingResponse, OfferingRequest, OfferingSearchParams } from '@/models/offering'
import type { AxiosResponse } from 'axios'

/**
 * オファリング API クライアント
 * → 03_common_specification.md §5 オファリング
 *
 * 修正: クエリパラメータを snake_case → camelCase に統一
 *   delivery_method → deliveryMethod
 *   duration_minutes → durationMinutes
 */

/** オファリング一覧（GET /api/v1/offerings・認証不要）*/
export const getOfferings = async (
  params?: OfferingSearchParams
): Promise<OfferingResponse[]> => {
  const res: AxiosResponse = await get(API_ENDPOINTS.OFFERINGS, { params })
  return res.data?.data ?? []
}

/** オファリング詳細（GET /api/v1/offerings/{id}・認証不要）*/
export const getOffering = async (id: number): Promise<OfferingResponse> => {
  const res: AxiosResponse = await get(API_ENDPOINTS.OFFERING_BY_ID(id))
  return res.data?.data
}

/** オファリング作成（POST /api/v1/offerings・APPROVED プロバイダーのみ）*/
export const createOffering = async (
  data: OfferingRequest
): Promise<OfferingResponse> => {
  const res: AxiosResponse = await post(API_ENDPOINTS.OFFERINGS, data)
  return res.data?.data
}

/** オファリング更新（PATCH /api/v1/offerings/{id}・所有者 or ADMIN）*/
export const updateOffering = async (
  id: number,
  data: Partial<OfferingRequest>
): Promise<OfferingResponse> => {
  const res: AxiosResponse = await patch(API_ENDPOINTS.OFFERING_BY_ID(id), data)
  return res.data?.data
}

/** オファリング削除（DELETE /api/v1/offerings/{id}・所有者 or ADMIN）*/
export const deleteOffering = async (id: number): Promise<void> => {
  await del(API_ENDPOINTS.OFFERING_BY_ID(id))
}

/**
 * 全サービス一覧取得（管理者向け・全プロバイダー）
 * GET /api/v1/offerings
 */
export const getAllOfferings = async (): Promise<OfferingResponse[]> => {
  const res = await get<{ data: OfferingResponse[] }>(API_ENDPOINTS.OFFERINGS)
  return res.data.data ?? []
}
