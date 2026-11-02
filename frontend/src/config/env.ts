// frontend/src/config/env.ts

/**
 * 環境変数アクセサ
 * Vite の import.meta.env を型安全にラップする。
 * コンポーネントから直接 import.meta.env を参照しないこと。
 */

export const env = {
  /** バックエンド API ベース URL（例: http://localhost:8080） */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string ?? '',

  /** 開発環境かどうか */
  isDev:  import.meta.env.DEV  as boolean,

  /** 本番環境かどうか */
  isProd: import.meta.env.PROD as boolean,
} as const