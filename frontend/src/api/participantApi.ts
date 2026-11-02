// frontend/src/api/participantApi.ts
import { get, post, patch, del } from './httpClient'
import { API_ENDPOINTS } from '@/config/constants'
import type {
  ParticipantResponse,
  ParticipantCreateRequest,
  ParticipantUpdateRequest,
  ParticipantListItem,
} from '@/models/participant'
import type { AxiosResponse } from 'axios'

/**
 * パーティシパント API クライアント
 * → 03_common_specification.md §5 パーティシパント
 *
 * 修正: toSnake() 変換ヘルパーを削除。
 *   application.yml から property-naming-strategy: SNAKE_CASE を削除したため、
 *   Jackson はデフォルト（camelCase）を使用する。
 *   リクエスト / レスポンス共に camelCase で統一。
 */

/** 利用者一覧（GET /api/v1/participants）*/
export const getMyParticipants = async (): Promise<ParticipantListItem[]> => {
  const res: AxiosResponse = await get(API_ENDPOINTS.PARTICIPANTS)
  return res.data?.data ?? []
}

/** 利用者詳細（GET /api/v1/participants/{id}）*/
export const getParticipant = async (id: number): Promise<ParticipantResponse> => {
  const res: AxiosResponse = await get(API_ENDPOINTS.PARTICIPANT_BY_ID(id))
  return res.data?.data
}

/** 利用者作成（POST /api/v1/participants）*/
export const createParticipant = async (
  data: ParticipantCreateRequest
): Promise<ParticipantResponse> => {
  const res: AxiosResponse = await post(API_ENDPOINTS.PARTICIPANTS, data)
  return res.data?.data
}

/** 利用者更新（PATCH /api/v1/participants/{id}）*/
export const updateParticipant = async (
  id: number,
  data: ParticipantUpdateRequest
): Promise<ParticipantResponse> => {
  const res: AxiosResponse = await patch(API_ENDPOINTS.PARTICIPANT_BY_ID(id), data)
  return res.data?.data
}

/** 利用者削除（DELETE /api/v1/participants/{id}・予約なしのみ）*/
export const deleteParticipant = async (id: number): Promise<void> => {
  await del(API_ENDPOINTS.PARTICIPANT_BY_ID(id))
}
