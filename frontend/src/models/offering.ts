// frontend/src/models/offering.ts
/**
 * オファリングモデル
 * → 01_glossary.md §2 Offering
 * → 04_backend_specification.md §OfferingService（fromDetail で詳細プロフィール付き）
 */

import type { DeliveryMethod } from './enums'

/** GET /api/v1/offerings または /api/v1/offerings/{id} のレスポンス */
export interface OfferingResponse {
  id:              number
  providerId:      number
  providerName:    string

  // ── 詳細取得時（fromDetail）のみ含まれる先生プロフィール ──────────────
  // GET /api/v1/offerings/{id} で返却。一覧（from）では null になることがある。
  providerAppealPoint?:    string | null
  providerBio?:            string | null
  providerQualifications?: string[] | null
  providerAchievements?:   string[] | null
  providerHighSchool?:     string | null
  providerUniversity?:     string | null

  // ── サービス情報 ────────────────────────────────────────────────────────
  categoryId?:     number | null
  categoryName?:   string | null
  title:           string
  description?:    string | null
  deliveryMethod:  DeliveryMethod
  durationMinutes: number
  ticketsRequired: number
  capacity:        number
  active:          boolean

  /** 推薦スコア（0.0〜1.0）一覧取得時に算出 */
  recommendScore:  number
}

/** POST/PATCH /api/v1/offerings リクエスト */
export interface OfferingRequest {
  categoryId?:     number | null
  categoryName?:   string | null
  title:           string
  description?:    string | null
  deliveryMethod:  DeliveryMethod
  durationMinutes: number
  ticketsRequired: number
  capacity:        number
}

/** GET /api/v1/offerings クエリパラメータ */
export interface OfferingSearchParams {
  deliveryMethod?:  DeliveryMethod
  durationMinutes?: number
  maxTickets?:      number
  keyword?:         string
  myOfferings?:     boolean
}

/** オファリング検索結果（OfferingSearchCard 用）*/
export interface OfferingSearchResult {
  id:              number
  offeringName?:   string
  serviceTitle?:   string
  categoryName?:   string | null
  description?:    string | null
  providerName:    string
  deliveryMethod:  import('./enums').DeliveryMethod
  durationMinutes: number
  ticketsRequired: number
  capacity:        number
  averageRating?:  number | null
  totalReviews?:   number
  availableSlotsCount?: number
  // snake_case 互換
  offering_name?:        string
  category_name?:        string | null
  provider_name?:        string
  delivery_method?:      string
  duration_minutes?:     number
  tickets_required?:     number
  average_rating?:       number | null
  total_reviews?:        number
  available_slots_count?: number
}