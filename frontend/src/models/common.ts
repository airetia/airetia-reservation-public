// frontend/src/models/common.ts

/**
 * 共通ユーティリティ型定義
 * 複数モデルから参照される汎用型をまとめる。
 * → 03_common_specification.md §4 共通データ型
 */

/** ページネーションパラメータ（クエリ文字列に変換して使用） */
export interface PaginationParams {
  page?: number  // 0始まり
  size?: number
  sort?: string  // 例: "createdAt,desc"
}

/** 選択肢（ドロップダウン等で使用） */
export interface SelectOption<T = string> {
  value: T
  label: string
}

/** 日付範囲フィルタ */
export interface DateRangeFilter {
  from?: string  // ISO 8601
  to?:   string
}
