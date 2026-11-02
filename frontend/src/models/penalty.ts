// frontend/src/models/penalty.ts
/**
 * ペナルティモデル
 * → 01_glossary.md §2 Penalty
 * → 02_business_rules.md §4 ペナルティルール
 */

import type { PenaltyType } from './enums'

/** GET /api/v1/admin/penalties レスポンス */
export interface PenaltyResponse {
  id:            number
  participantId: number
  bookingId:     number
  penaltyType:   PenaltyType
  isActive:      boolean
  expiresAt:     string    // ISO 8601 UTC（付与日時 + 3ヶ月）
  createdAt:     string
}