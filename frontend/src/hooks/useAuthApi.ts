// frontend/src/hooks/useAuthApi.ts

/**
 * 認証API呼び出しフック
 * → 05_frontend_specification.md §5 API通信
 * → 03_common_specification.md §5 認証エンドポイント
 *
 * AuthContext の login/logout とは別に、
 * 登録・パスワード変更等の認証関連API呼び出しを担う。
 */
import { useCallback } from 'react'
import { API_ENDPOINTS } from '@/config/constants'
import httpClient from '../api/httpClient'
import type { RegisterRequest, RegisterResponse } from '../models/auth'
import type { ApiResponse }                       from '../models/api'

export function useAuthApi() {

  /** POST /api/v1/auth/register */
  const register = useCallback(async (req: RegisterRequest): Promise<RegisterResponse> => {
    const res = await httpClient.post<ApiResponse<RegisterResponse>>(API_ENDPOINTS.AUTH_REGISTER, req)
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message ?? '登録に失敗しました')
    }
    return res.data.data
  }, [])

  return { register }
}