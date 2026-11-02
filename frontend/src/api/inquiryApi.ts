// frontend/src/api/inquiryApi.ts
import { get, post, patch } from './httpClient'
import { API_ENDPOINTS } from '@/config/constants'
import type { InquiryCreateRequest, InquiryResponse } from '@/models/inquiry'
import type { InquiryStatus } from '@/models/enums'
import type { AxiosResponse } from 'axios'

/**
 * 問い合わせ API クライアント
 * → 03_common_specification.md §5 問い合わせ
 * → 01_glossary.md §2 Inquiry
 *
 * POST は認証不要（未ログインユーザーも送信可）
 * GET / PATCH は ADMIN 権限必須
 */

/**
 * 問い合わせ送信（POST /api/v1/inquiries・認証不要・ファイル添付可）
 * 添付ファイルは FormData で送信（最大 3 件・10MB・JPG/PNG/PDF）
 */
export const createInquiry = async (
  data: InquiryCreateRequest,
  attachments?: File[]
): Promise<InquiryResponse> => {
  const formData = new FormData()
  formData.append('email', data.email)
  if (data.name)    formData.append('name',    data.name)
  if (data.subject) formData.append('subject', data.subject)
  formData.append('body', data.body)
  if (attachments) {
    attachments.slice(0, 3).forEach(file => formData.append('files', file))
  }

  const res: AxiosResponse = await post(API_ENDPOINTS.INQUIRIES, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data?.data
}

/** 問い合わせ一覧（GET /api/v1/inquiries・ADMIN のみ）*/
export const getInquiries = async (): Promise<InquiryResponse[]> => {
  const res: AxiosResponse = await get(API_ENDPOINTS.ADMIN_INQUIRIES)
  const data = res.data?.data
  return Array.isArray(data) ? data : (data?.content ?? [])
}

/** 問い合わせ詳細（GET /api/v1/inquiries/{id}・ADMIN のみ）*/
export const getInquiry = async (id: number): Promise<InquiryResponse> => {
  const res: AxiosResponse = await get(API_ENDPOINTS.INQUIRY_BY_ID(id))
  return res.data?.data
}

/** ステータス更新（PATCH /api/v1/inquiries/{id}/status・ADMIN のみ）*/
export const updateInquiryStatus = async (
  id: number,
  status: InquiryStatus
): Promise<InquiryResponse> => {
  const res: AxiosResponse = await patch(API_ENDPOINTS.INQUIRY_STATUS(id), { status })
  return res.data?.data
}
