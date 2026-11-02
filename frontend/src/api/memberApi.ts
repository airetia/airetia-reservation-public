// frontend/src/api/memberApi.ts
import { get, patch, post } from './httpClient'
import { API_ENDPOINTS } from '@/config/constants'
import type { Member, MemberUpdateRequest } from '@/models/member'
import type { AxiosResponse } from 'axios'

/**
 * メンバー API クライアント
 * → 03_common_specification.md §5 メンバー / 認証
 *
 * 修正: RegisterRequest のキーを snake_case → camelCase に統一
 *   last_name → lastName / first_name → firstName 等
 *   RegisterRequest のフィールドを RegisterRequest.java の簡略化後の定義と一致させる
 */

/** 会員登録リクエスト（POST /api/v1/auth/register）*/
export interface RegisterRequest {
  lastName:      string
  firstName:     string
  lastNameKana:  string
  firstNameKana: string
  email:         string
  password:      string
}

/** メンバー詳細取得（GET /api/v1/members/{id}）*/
export const getMember = async (memberId: number): Promise<Member> => {
  const res: AxiosResponse = await get(API_ENDPOINTS.MEMBER_BY_ID(memberId))
  return res.data?.data
}

/** メンバー情報更新（PATCH /api/v1/members/{id}）*/
export const updateMember = async (
  memberId: number,
  data: MemberUpdateRequest
): Promise<Member> => {
  const res: AxiosResponse = await patch(API_ENDPOINTS.MEMBER_BY_ID(memberId), data)
  return res.data?.data
}

/** 全メンバー一覧（管理者用 GET /api/v1/admin/members）*/
export const getAllMembers = async (): Promise<Member[]> => {
  const res: AxiosResponse = await get(API_ENDPOINTS.ADMIN_MEMBERS)
  return res.data?.data ?? []
}

/** メンバー停止（管理者用 PATCH /api/v1/admin/members/{id}/suspend）*/
export const suspendMember = async (memberId: number): Promise<void> => {
  await patch(API_ENDPOINTS.ADMIN_MEMBER_SUSPEND(memberId), {})
}

/** メンバー停止解除（管理者用 PATCH /api/v1/admin/members/{id}/unsuspend）*/
export const unsuspendMember = async (memberId: number): Promise<void> => {
  await patch(API_ENDPOINTS.ADMIN_MEMBER_UNSUSPEND(memberId), {})
}

/** 会員登録（POST /api/v1/auth/register）*/
export const register = async (data: RegisterRequest): Promise<void> => {
  await post(API_ENDPOINTS.AUTH_REGISTER, data)
}

/** 通知設定取得（GET /api/v1/members/{id}/notifications）*/
export const getNotificationSettings = async (memberId: number): Promise<unknown> => {
  const res: AxiosResponse = await get(API_ENDPOINTS.MEMBER_NOTIFICATIONS(memberId))
  return res.data?.data
}

/** 通知設定更新（PATCH /api/v1/members/{id}/notifications）*/
export const updateNotificationSettings = async (
  memberId: number,
  data: Record<string, boolean>
): Promise<void> => {
  await patch(API_ENDPOINTS.MEMBER_NOTIFICATIONS(memberId), data)
}