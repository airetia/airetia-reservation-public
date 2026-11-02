// frontend/src/api/providerApi.ts
import { get, post, patch, del } from './httpClient'
import { API_ENDPOINTS } from '@/config/constants'
import type { ProviderCreateRequest, ProviderResponse } from '@/models/provider'
import type { AxiosResponse } from 'axios'

/**
 * プロバイダー API クライアント
 * → 03_common_specification.md §5 プロバイダー
 * → 02_business_rules.md §5（プロバイダールール）
 *
 * 修正: リクエストキーを snake_case → camelCase に統一
 *   high_school → highSchool / appeal_point → appealPoint 等
 */

export type DocumentType = 'IDENTITY' | 'CONTRACT' | 'BANK_INFO'

// ── プロバイダー申請 ──────────────────────────────────────────────────────────

/**
 * プロバイダー申請（Step 1: 基本情報）
 * POST /api/v1/providers
 * → 05_frontend_specification.md §3.4 Step 1
 */
export const registerProvider = async (
  data: ProviderCreateRequest
): Promise<ProviderResponse> => {
  // ★ 修正: snake_case キー削除（high_school / appeal_point）→ camelCase そのまま送信
  const res: AxiosResponse = await post(API_ENDPOINTS.PROVIDERS, data)
  return res.data?.data
}

/** 自分のプロバイダー情報（GET /api/v1/providers/me）- ProfilePage用 */
export const getMyProvider = async (): Promise<ProviderResponse> => {
  const res: AxiosResponse<{ data: ProviderResponse }> = await get(`${API_ENDPOINTS.PROVIDERS}/me`)
  return res.data.data
}

/** プロバイダー詳細取得（GET /api/v1/providers/{id}）*/
export const getProvider = async (providerId: number): Promise<ProviderResponse> => {
  const res: AxiosResponse = await get(API_ENDPOINTS.PROVIDER_BY_ID(providerId))
  return res.data?.data
}

/** プロバイダー一覧（管理者用 GET /api/v1/providers）*/
export const getProviders = async (params?: { status?: string }): Promise<ProviderResponse[]> => {
  const res: AxiosResponse = await get(API_ENDPOINTS.PROVIDERS, { params })
  return res.data?.data ?? []
}

// ── 書類アップロード（Step 2）────────────────────────────────────────────────

/**
 * 書類アップロード（multipart/form-data）
 * POST /api/v1/providers/{id}/documents
 * → 05_frontend_specification.md §9
 * → 02_business_rules.md §5.1.2 必要書類
 */
export const uploadDocument = async (
  providerId: number,
  documentType: DocumentType,
  file: File
): Promise<void> => {
  const formData = new FormData()
  formData.append('documentType', documentType)
  formData.append('file', file)
  await post(
    API_ENDPOINTS.PROVIDER_DOCUMENTS(providerId),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
}

// ── 管理者操作 ────────────────────────────────────────────────────────────────

/** 承認（PATCH /api/v1/providers/{id}/approve）*/
export const approveProvider = async (providerId: number): Promise<void> => {
  await patch(API_ENDPOINTS.PROVIDER_APPROVE(providerId), {})
}

/** 却下（PATCH /api/v1/providers/{id}/reject）*/
export const rejectProvider = async (providerId: number, reason?: string): Promise<void> => {
  await patch(API_ENDPOINTS.PROVIDER_REJECT(providerId), { reason })
}

/** 保留（PATCH /api/v1/providers/{id}/hold）*/
export const holdProvider = async (providerId: number, reason?: string): Promise<void> => {
  await patch(API_ENDPOINTS.PROVIDER_HOLD(providerId), { reason })
}

/** 停止（PATCH /api/v1/providers/{id}/suspend）*/
export const suspendProvider = async (providerId: number): Promise<void> => {
  await patch(API_ENDPOINTS.PROVIDER_SUSPEND(providerId), {})
}

/** 停止解除（PATCH /api/v1/providers/{id}/unsuspend）*/
export const unsuspendProvider = async (providerId: number): Promise<void> => {
  await patch(API_ENDPOINTS.PROVIDER_UNSUSPEND(providerId), {})
}
