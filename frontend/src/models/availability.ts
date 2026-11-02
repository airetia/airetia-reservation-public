// frontend/src/models/availability.ts

/**
 * アベイラビリティ（空き枠）モデル
 * → 01_glossary.md §2 Availability
 * → 02_business_rules.md §5.2（空き枠管理）
 * → バックエンド AvailabilityResponse.java に対応（camelCase）
 */

import type { DeliveryMethod } from './enums'

/** GET /api/v1/availabilities レスポンス要素 */
export interface AvailabilityResponse {
  id:              number
  offeringId:      number
  offeringTitle:   string
  providerId:      number
  providerName:    string
  startDatetime:   string        // ISO 8601 UTC
  endDatetime:     string        // ISO 8601 UTC
  durationMinutes: number
  deliveryMethod:  DeliveryMethod
  capacity:        number
  bookedCount:     number
  remainingSlots:  number
  bookable:        boolean
  full:            boolean
  createdAt:       string        // ISO 8601 UTC
}

/** POST /api/v1/availabilities リクエスト */
export interface AvailabilityCreateRequest {
  offeringId:      number
  startDatetime:   string        // ISO 8601 UTC
  endDatetime:     string        // ISO 8601 UTC
  capacity:        number
}