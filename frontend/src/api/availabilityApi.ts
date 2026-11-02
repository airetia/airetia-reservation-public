// frontend/src/api/availabilityApi.ts
import { get, post, patch, del } from './httpClient'
import { API_ENDPOINTS } from '@/config/constants'
import type {
  AvailabilityResponse,
  AvailabilityCreateRequest,
  AvailabilityUpdateRequest,
  AvailabilitySearchParams,
} from '@/models/availability'
import type { AxiosResponse } from 'axios'

/**
 * アベイラビリティ（空き枠）API クライアント
 * → 03_common_specification.md §5 アベイラビリティ
 */

/** 空き枠一覧（GET /api/v1/availabilities・認証不要）*/
export const getAvailabilities = async (
  params?: AvailabilitySearchParams
): Promise<AvailabilityResponse[]> => {
  const res: AxiosResponse = await get(API_ENDPOINTS.AVAILABILITIES, { params })
  return Array.isArray(res.data?.data) ? res.data.data : []
}

/** 空き枠詳細（GET /api/v1/availabilities/{id}・認証不要）*/
export const getAvailability = async (id: number): Promise<AvailabilityResponse> => {
  const res: AxiosResponse = await get(API_ENDPOINTS.AVAILABILITY_BY_ID(id))
  return res.data?.data
}

/** 空き枠作成（POST /api/v1/availabilities・APPROVED プロバイダーのみ）*/
export const createAvailability = async (
  data: AvailabilityCreateRequest
): Promise<AvailabilityResponse> => {
  const res: AxiosResponse = await post(API_ENDPOINTS.AVAILABILITIES, data)
  return res.data?.data
}

/**
 * 空き枠更新（PATCH /api/v1/availabilities/{id}）
 * 予約がある場合は capacity のみ変更可（新定員 >= 既存予約数）
 * → 02_business_rules.md §5.2
 */
export const updateAvailability = async (
  id: number,
  data: AvailabilityUpdateRequest
): Promise<AvailabilityResponse> => {
  const res: AxiosResponse = await patch(API_ENDPOINTS.AVAILABILITY_BY_ID(id), data)
  return res.data?.data
}

/** 空き枠削除（DELETE /api/v1/availabilities/{id}・予約 0 件のみ可）*/
export const deleteAvailability = async (id: number): Promise<void> => {
  await del(API_ENDPOINTS.AVAILABILITY_BY_ID(id))
}
