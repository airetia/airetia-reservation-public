// frontend/src/contexts/AuthContext.tsx
/* @refresh reset */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useEffect, useState, useContext } from 'react'
import httpClient from '../api/httpClient'
import type { Member } from '../models/member'
import { API_ENDPOINTS } from '@/config/constants'

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthContextType {
  isAuthenticated: boolean
  isAdmin: boolean
  member: Member | null
  capabilities: { hasProvider: boolean; hasParent: boolean }
  loading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [member, setMember]                   = useState<Member | null>(null)
  const [loading, setLoading]                 = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const checkAuth = useCallback(async () => {
    try {
      const res = await httpClient.get(API_ENDPOINTS.AUTH_ME)
      if (res.data.success && res.data.data) {
        setMember(res.data.data)
        setIsAuthenticated(true)
      } else {
        setMember(null)
        setIsAuthenticated(false)
      }
    } catch {
      setMember(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async ({ email, password }: LoginRequest) => {
    const res = await httpClient.post(API_ENDPOINTS.AUTH_LOGIN, { email, password })
    if (res.data.success) {
      await checkAuth()
    } else {
      throw new Error(res.data.message ?? 'ログインに失敗しました')
    }
  }

  const logout = async () => {
    try {
      await httpClient.post(API_ENDPOINTS.AUTH_LOGOUT)
    } finally {
      setMember(null)
      setIsAuthenticated(false)
    }
  }

  useEffect(() => { checkAuth() }, [checkAuth])

  /**
   * capabilities は AuthController の MeResponse.Capabilities が
   * camelCase（hasProvider / hasParent）で返すため、そのまま参照する。
   *
   * 修正: has_provider / has_parent (snake_case) → hasProvider / hasParent (camelCase)
   */
  const capabilities = {
    hasProvider: member?.capabilities?.hasProvider ?? false,
    hasParent:   member?.capabilities?.hasParent   ?? false,
  }

  const isAdmin = member?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{
      isAuthenticated, isAdmin, member, capabilities, loading, login, logout, checkAuth,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}