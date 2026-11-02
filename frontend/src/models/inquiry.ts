// frontend/src/models/inquiry.ts
/**
 * 問い合わせモデル
 * → 01_glossary.md §2 Inquiry
 * → 03_common_specification.md §5 問い合わせ
 */

import type { InquiryStatus } from './enums'

/** GET /api/v1/inquiries/{id} レスポンス */
export interface InquiryResponse {
  id:        number
  name?:     string | null     // 非ログインユーザーの場合 null
  email:     string
  subject?:  string | null
  body:      string
  status:    InquiryStatus
  createdAt: string
}

/** POST /api/v1/inquiries リクエスト（認証不要）*/
export interface InquiryCreateRequest {
  name?:    string
  email:    string
  subject?: string
  body:     string
}