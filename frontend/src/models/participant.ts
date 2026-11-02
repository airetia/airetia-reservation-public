// frontend/src/models/participant.ts
import type { Gender, ParticipantType } from './enums'

/**
 * 参加者モデル
 * → 04_backend_specification.md §Participant
 * → 06_infrastructure.md §2.2 participants テーブル
 * → 01_glossary.md §2 Participant（SELF / CHILD）
 */

/** 一覧取得用（GET /api/v1/participants）*/
export interface ParticipantListItem {
  id:               number
  participantType:  ParticipantType
  lastName:         string
  firstName:        string
  lastNameKana?:    string
  firstNameKana?:   string
  birthDate?:       string | null   // ISO 8601: YYYY-MM-DD
  gender?:          Gender | null
  notes?:           string | null
  hasActivePenalty: boolean
  age?:             number | null
  // snake_case 互換（既存コンポーネント用）
  full_name?:          string
  first_name?:         string
  last_name?:          string
  birth_date?:         string | null
  has_active_penalty?: boolean
}

/** 詳細取得用（GET /api/v1/participants/{id}）*/
export interface ParticipantResponse extends ParticipantListItem {
  memberId:  number
  active:    boolean
  createdAt: string
  updatedAt: string
}

/** 作成リクエスト（POST /api/v1/participants）*/
export interface ParticipantCreateRequest {
  participantType:  ParticipantType    // 新規は CHILD 固定（SELF は会員登録時に自動生成）
  lastName:         string
  firstName:        string
  lastNameKana?:    string
  firstNameKana?:   string
  birthDate?:       string
  gender?:          Gender
  notes?:           string
}

/** 更新リクエスト（PATCH /api/v1/participants/{id}）*/
export interface ParticipantUpdateRequest {
  lastName?:        string
  firstName?:       string
  lastNameKana?:    string
  firstNameKana?:   string
  birthDate?:       string
  gender?:          Gender
  notes?:           string
}