// frontend/src/models/api.ts

/**
 * API レスポンス共通型定義
 * バックエンドの ApiResponse<T> / PageResponse<T> に対応
 * → 03_common_specification.md §4 共通データ型
 */

export interface ApiResponse<T = unknown> {
  success:    boolean
  message:    string
  errorCode?: string
  data?:      T
  errors?:    FieldError[]
  timestamp:  string
}

export interface FieldError {
  field:   string
  message: string
}

export interface PageResponse<T> {
  content: T[]
  page: {
    number:        number  // 0始まり
    size:          number
    totalElements: number
    totalPages:    number
  }
}
