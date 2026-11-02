// frontend/src/pages/auth/RegisterPage.tsx
import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerMember } from '@/api/memberApi'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES, VALIDATION } from '@/config/constants'
import styles from './RegisterPage.module.css'

/**
 * 会員登録ページ
 * → 05_frontend_specification.md §3.1 /register
 * → POST /api/v1/auth/register
 *
 * 入力項目: 姓・名・姓かな・名かな・メールアドレス・パスワード
 * 登録後にログインして /member へリダイレクト
 *
 * バリデーション → 03_common_specification.md §7
 */
export function RegisterPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const [form, setForm] = useState({
    lastName:      '',
    firstName:     '',
    lastNameKana:  '',
    firstNameKana: '',
    email:         '',
    password:      '',
    confirmPassword: '',
  })
  const [errors,     setErrors]     = useState<Partial<typeof form & { general: string }>>({})
  const [submitting, setSubmitting] = useState(false)

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => { const n = {...prev}; delete n[field as keyof typeof n]; return n })
    }
  }

  const validate = (): boolean => {
    const errs: typeof errors = {}
    if (!form.lastName.trim())      errs.lastName      = '姓を入力してください'
    if (!form.firstName.trim())     errs.firstName     = '名を入力してください'
    if (!form.lastNameKana.trim())  errs.lastNameKana  = '姓（ふりがな）を入力してください'
    else if (!/^[ぁ-ん]+$/.test(form.lastNameKana.trim()))
                                    errs.lastNameKana  = 'ひらがなで入力してください'
    if (!form.firstNameKana.trim()) errs.firstNameKana = '名（ふりがな）を入力してください'
    else if (!/^[ぁ-ん]+$/.test(form.firstNameKana.trim()))
                                    errs.firstNameKana = 'ひらがなで入力してください'
    if (!form.email.trim())         errs.email    = 'メールアドレスを入力してください'
    if (form.password.length < VALIDATION.PASSWORD_MIN_LENGTH)
                                    errs.password = `パスワードは${VALIDATION.PASSWORD_MIN_LENGTH}文字以上で入力してください`
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/.test(form.password))
                                    errs.password = '英大文字・小文字・数字をそれぞれ1文字以上含めてください'
    if (form.password !== form.confirmPassword)
                                    errs.confirmPassword = 'パスワードが一致しません'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await registerMember({
        lastName:      form.lastName.trim(),
        firstName:     form.firstName.trim(),
        lastNameKana:  form.lastNameKana.trim(),
        firstNameKana: form.firstNameKana.trim(),
        email:         form.email.trim(),
        password:      form.password,
      })
      // 登録成功 → 即ログイン
      await login({ email: form.email.trim(), password: form.password })
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (e) {
      const msg = e instanceof Error ? e.message : '登録に失敗しました'
      setErrors(prev => ({ ...prev, general: msg }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoWrapper}>
          <span className={styles.logoText}>airetia</span>
        </div>

        <h1 className={styles.title}>新規登録</h1>

        {errors.general && <p className={styles.errorMsg}>{errors.general}</p>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.row}>
            <Field label="姓" id="lastName" value={form.lastName}
              onChange={update('lastName')} error={errors.lastName} placeholder="山田" />
            <Field label="名" id="firstName" value={form.firstName}
              onChange={update('firstName')} error={errors.firstName} placeholder="太郎" />
          </div>
          <div className={styles.row}>
            <Field label="姓（ふりがな）" id="lastNameKana" value={form.lastNameKana}
              onChange={update('lastNameKana')} error={errors.lastNameKana} placeholder="やまだ" />
            <Field label="名（ふりがな）" id="firstNameKana" value={form.firstNameKana}
              onChange={update('firstNameKana')} error={errors.firstNameKana} placeholder="たろう" />
          </div>
          <Field label="メールアドレス" id="email" type="email" value={form.email}
            onChange={update('email')} error={errors.email} placeholder="example@mail.com" />
          <Field label="パスワード" id="password" type="password" value={form.password}
            onChange={update('password')} error={errors.password}
            placeholder="英大文字・小文字・数字を含む8文字以上" />
          <Field label="パスワード（確認）" id="confirmPassword" type="password"
            value={form.confirmPassword} onChange={update('confirmPassword')}
            error={errors.confirmPassword} placeholder="パスワードを再入力" />

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? '登録中...' : '新規登録'}
          </button>
        </form>

        <p className={styles.footer}>
          既にアカウントをお持ちの方は{' '}
          <Link to={ROUTES.LOGIN}>ログイン</Link>
        </p>
      </div>
    </div>
  )
}

// ── フィールドコンポーネント（内部用） ─────────────────────────────
interface FieldProps {
  label: string; id: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string; placeholder?: string; type?: string
}
function Field({ label, id, value, onChange, error, placeholder, type = 'text' }: FieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete="off" />
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  )
}
