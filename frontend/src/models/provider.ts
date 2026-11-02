// frontend/src/models/provider.ts
/**
 * プロバイダーモデル
 * → 04_backend_specification.md §Provider エンティティ
 * → 05_frontend_specification.md §5.3 ProviderResponse
 * → 01_glossary.md §2 Provider / ProviderDocument
 */

import type { ProviderStatus, DocumentType } from './enums'

/** GET /api/v1/providers/{id} レスポンス */
export interface ProviderResponse {
  id:                       number
  memberId:                 number
  memberName:               string
  memberEmail:              string
  status:                   ProviderStatus
  highSchool?:              string | null
  university?:              string | null
  appealPoint?:             string | null
  bio?:                     string | null
  qualifications:           string[]    // JSON カラム（null の場合は [] で返す）
  achievements:             string[]    // JSON カラム（null の場合は [] で返す）
  onHoldReason?:            string | null
  rejectionReason?:         string | null
  reapplicationAvailableAt?: string | null
  approvedAt?:              string | null
  createdAt:                string
}

/** 書類情報レスポンス（GET /api/v1/providers/{id}/documents）*/
export interface ProviderDocumentResponse {
  id:               number      // ダウンロードURL構築に使用
  providerId:       number
  documentType:     DocumentType
  originalFilename: string
  contentType:      string
  uploadedAt:       string
  /** Phase1: ローカルダウンロードURL。フロントで構築する場合は id を使用 */
  downloadUrl?:     string | null
}

/** プロバイダー申請リクエスト（POST /api/v1/providers）*/
export interface ProviderCreateRequest {
  highSchool?:   string
  university?:   string
  appealPoint?:  string
  qualifications?: string[]
  achievements?:   string[]
}