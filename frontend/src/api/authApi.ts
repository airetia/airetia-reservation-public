// frontend/src/api/authApi.ts
import { get, post } from './httpClient'
import { API_ENDPOINTS } from '@/config/constants'
import type { Member } from '@/models/member'
import type { AxiosResponse } from 'axios'

/**
 * 認証 API クライアント
 * → 03_common_specification.md §5 認証
 *
 * セッション Cookie による認証（JWT 不使用）
 * withCredentials: true は httpClient に設定済み
 */

/** ログイン */
export const login = async (
  email: string,
  password: string
): Promise<Member> => {
  const res: AxiosResponse = await post(API_ENDPOINTS.AUTH_LOGIN, { email, password })
  return res.data?.data
}

/** ログアウト */
export const logout = async (): Promise<void> => {
  await post(API_ENDPOINTS.AUTH_LOGOUT)
}

/** 現在のログインユーザー情報取得（初回マウント時のセッション確認）*/
export const getMe = async (): Promise<Member | null> => {
  try {
    const res: AxiosResponse = await get(API_ENDPOINTS.AUTH_ME)
    return res.data?.data ?? null
  } catch {
    // 401 は httpClient インターセプターが /login にリダイレクトする前にここで捕捉
    return null
  }
}

/** 会員登録 */
export const register = async (data: {
  email:         string
  password:      string
  lastName:      string
  firstName:     string
  lastNameKana:  string
  firstNameKana: string
}): Promise<Member> => {
  const res: AxiosResponse = await post(API_ENDPOINTS.AUTH_REGISTER, data)
  return res.data?.data
}
