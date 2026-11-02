// frontend/src/models/report.ts
import type { ReportType } from './enums'

/**
 * 報告書モデル型定義
 * → 02_business_rules.md §2.6（完了報告・無断キャンセル報告）
 * → 03_common_specification.md §5 報告書
 */

/** 報告書作成リクエスト */
export interface ReportCreateRequest {
  bookingId:   number
  reportType:  ReportType        // COMPLETION | NO_SHOW
  feedback:    string            // 利用者へのフィードバック（公開・1000文字以内）
  sharedNote?: string            // 利用者の特徴（全プロバイダー共有・1000文字以内）
  privateNote?: string           // 詳細メモ（報告者のみ閲覧・1000文字以内）
}

/** 報告書レスポンス */
export interface ReportResponse {
  id:           number
  bookingId:    number
  providerId:   number
  reportType:   ReportType
  feedback:     string | null
  sharedNote:   string | null
  privateNote:  string | null
  createdAt:    string           // ISO 8601 UTC
}
