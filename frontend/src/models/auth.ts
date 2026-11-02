// frontend/src/models/auth.ts

/**
 * 認証関連型定義
 * → 03_common_specification.md §5 認証エンドポイント
 * → 05_frontend_specification.md §4 AuthContext
 */

import type { MemberRole } from './enums'

export interface LoginRequest {
  email:    string
  password: string
}

export interface RegisterRequest {
  email:          string
  password:       string
  firstName:      string
  lastName:       string
  firstNameKana:  string
  lastNameKana:   string
}

/** GET /api/v1/auth/me レスポンス（CurrentUser.java に対応） */
export interface CurrentUser {
  id:        number
  email:     string
  role:      MemberRole
  firstName: string
  lastName:  string
  capabilities: {
    hasProvider: boolean
    hasParent:   boolean
  }
}

/** POST /api/v1/auth/register レスポンス */
export interface RegisterResponse {
  id:        number
  email:     string
  firstName: string
  lastName:  string
}
