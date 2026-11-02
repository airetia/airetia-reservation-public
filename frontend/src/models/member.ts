// frontend/src/models/member.ts
/**
 * メンバーモデル
 * → 01_glossary.md §2 Member
 * → 05_frontend_specification.md §5.2 GET /auth/me（MemberResponse）
 * → 06_infrastructure.md §2.2 members テーブル
 *
 * 注意: DB カラム名 phone_number → Java フィールド phoneNumber（phone ではない）
 */

import type { MemberRole, Gender } from './enums'

/** GET /api/v1/auth/me および GET /api/v1/members/{id} のレスポンス */
export interface Member {
  id:              number
  email:           string
  firstName:       string
  lastName:        string
  firstNameKana?:  string | null
  lastNameKana?:   string | null
  /** DB カラム: phone_number → Java フィールド: phoneNumber */
  phoneNumber?:    string | null
  postalCode?:     string | null
  address?:        string | null
  birthDate?:      string | null    // YYYY-MM-DD
  gender?:         Gender | null
  role:            MemberRole
  isActive:        boolean
  isLocked:        boolean
  suspendedUntil?: string | null    // ISO 8601 UTC
  capabilities: {
    hasProvider: boolean
    hasParent:   boolean
  }
  createdAt: string
}

/** PATCH /api/v1/members/{id} リクエスト（更新可能フィールドのみ）*/
export interface MemberUpdateRequest {
  firstName?:     string
  lastName?:      string
  firstNameKana?: string
  lastNameKana?:  string
  phoneNumber?:   string
  postalCode?:    string
  address?:       string
  birthDate?:     string
  gender?:        Gender
}