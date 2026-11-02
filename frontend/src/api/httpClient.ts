// frontend/src/api/httpClient.ts
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'

/**
 * HTTP クライアント
 * → 05_frontend_specification.md §5 API通信
 *
 * 設定:
 *   - baseURL: 環境変数 VITE_API_BASE_URL が設定されている場合はそれを使用（未設定時は空文字 = 同一オリジン）
 *   - withCredentials: true（セッション Cookie を送受信）
 *   - CSRF: X-XSRF-TOKEN ヘッダーを自動付与（GET 以外）
 *   - 401: /login へリダイレクト
 */

const httpClient = axios.create({
  baseURL:         import.meta.env.VITE_API_BASE_URL ?? '',
  timeout:         10_000,
  headers:         { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// ── リクエストインターセプター: CSRF トークン自動付与 ───────────────────────
httpClient.interceptors.request.use(config => {
  const csrfToken = getCookie('XSRF-TOKEN')
  if (csrfToken && config.method && config.method.toLowerCase() !== 'get') {
    config.headers['X-XSRF-TOKEN'] = csrfToken
  }
  return config
})

// ── レスポンスインターセプター: 401 → ログインページへ ────────────────────
// /auth/me と /auth/login は 401 でリダイレクトしない
// （AuthContext が自前でハンドリング / ログインフォームエラーは Toast 表示）
// baseURL = '' のため、リクエストURLは /api/v1/... の絶対パスになる
const AUTH_SKIP_REDIRECT = ['/api/v1/auth/me', '/api/v1/auth/login']

httpClient.interceptors.response.use(
  res => res,
  err => {
    const url = err.config?.url ?? ''
    if (err.response?.status === 401 &&
        !AUTH_SKIP_REDIRECT.some(p => url.includes(p))) {
      window.location.replace('/login')
    }
    // エラーメッセージをサーバーレスポンスから取り出す
    const serverMsg = err.response?.data?.message
    if (serverMsg) {
      err.message = serverMsg
    }
    return Promise.reject(err)
  }
)

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

// ── 短縮ヘルパー（各 API ファイルで import して使用）─────────────────────
export const get = (
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> =>
  httpClient.get(url, config)

export const post = (
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> =>
  httpClient.post(url, data, config)

export const patch = (
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> =>
  httpClient.patch(url, data, config)

export const put = (
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> =>
  httpClient.put(url, data, config)

export const del = (
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> =>
  httpClient.delete(url, config)

export default httpClient