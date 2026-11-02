// frontend/src/pages/auth/LoginPage.tsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/config/constants'
import styles from './LoginPage.module.css'

/**
 * ログインページ
 * → 05_frontend_specification.md §3.4
 *
 * 修正: ログイン後は / へ遷移し、PublicRoute が role に応じて
 *   ADMIN → /admin / MEMBER → /member へリダイレクトする。
 */
export function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [error,      setError]      = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setSubmitting(true)
    setError(null)
    try {
      await login({ email: email.trim(), password })
      // login() 内で checkAuth() が完了し isAdmin が確定する。
      // PublicRoute が role に応じて /admin or /member へリダイレクトするため
      // ここでは / へ遷移するだけでよい。
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ログインに失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        <div className={styles.logoWrapper}>
          <div className={styles.logoMark}>A</div>
          <span className={styles.logoText}>airetia</span>
        </div>

        <h1 className={styles.title}>ログイン</h1>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email" type="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="example@mail.com"
              required autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">パスワード</label>
            <input
              id="password" type="password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required autoComplete="current-password"
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <p className={styles.footer}>
          アカウントをお持ちでない方は{' '}
          <Link to={ROUTES.REGISTER}>新規登録</Link>
        </p>
      </div>
    </div>
  )
}
