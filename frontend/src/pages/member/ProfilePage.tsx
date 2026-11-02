// frontend/src/pages/member/ProfilePage.tsx
/**
 * プロフィール編集ページ
 * → 05_frontend_specification.md §3.1 /member/profile
 * → 04_backend_specification.md §Member エンティティ
 *
 * 機能:
 *   - ログイン中のメンバー情報（氏名・ふりがな・生年月日・電話番号・住所）を表示・編集
 *   - PATCH /api/v1/members/{id} で保存（→ memberApi.ts / MemberUpdateRequest）
 *   - 保存後は checkAuth() で AuthContext の member を再同期
 *   - メールアドレス・パスワードは表示のみ
 *   - お子様管理は /member/participants へ誘導
 */

import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { patch }               from '@/api/httpClient'
import { API_ENDPOINTS }       from '@/config/constants'
import { Card }                from '@/components/common/Card'
import { Button }              from '@/components/common/Button'
import { Loading }             from '@/components/common/Loading'
import { useAuth }             from '@/contexts/AuthContext'
import { useToast }            from '@/contexts/ToastProvider'
import type { Member }         from '@/models/member'
import styles                  from './ProfilePage.module.css'

// ─── 型定義 ──────────────────────────────────────────────────────────────────

type FormData = {
  lastName:      string
  firstName:     string
  lastNameKana:  string
  firstNameKana: string
  birthDate:     string
  phoneNumber:   string   // member.ts に合わせて phoneNumber
  postalCode:    string
  address:       string
}

type FormErrors = Partial<Record<keyof FormData, string>>

// ─── バリデーション ───────────────────────────────────────────────────────────

function validate(form: FormData): FormErrors {
  const errors: FormErrors = {}

  if (!form.lastName.trim())      errors.lastName      = '姓を入力してください'
  if (!form.firstName.trim())     errors.firstName     = '名を入力してください'
  if (!form.lastNameKana.trim())  errors.lastNameKana  = '姓（ふりがな）を入力してください'
  if (!form.firstNameKana.trim()) errors.firstNameKana = '名（ふりがな）を入力してください'

  const kana = /^[ぁ-ん・ー\s]+$/
  if (form.lastNameKana.trim() && !kana.test(form.lastNameKana.trim()))
    errors.lastNameKana = 'ひらがなで入力してください'
  if (form.firstNameKana.trim() && !kana.test(form.firstNameKana.trim()))
    errors.firstNameKana = 'ひらがなで入力してください'

  if (form.phoneNumber && !/^\d{10,11}$/.test(form.phoneNumber.replace(/-/g, '')))
    errors.phoneNumber = '電話番号は10〜11桁の数字で入力してください'

  if (form.postalCode && !/^\d{3}-?\d{4}$/.test(form.postalCode))
    errors.postalCode = '郵便番号は「123-4567」形式で入力してください'

  return errors
}

// ─── コンポーネント ─────────────────────────────────────────────────────────

export function ProfilePage() {
  const { member, checkAuth } = useAuth()
  const { showToast }         = useToast()
  const navigate              = useNavigate()

  const [form,    setForm]    = useState<FormData | null>(null)
  const [errors,  setErrors]  = useState<FormErrors>({})
  const [saving,  setSaving]  = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!member) return
    setForm(memberToForm(member))
  }, [member])

  if (!form || !member) return <Loading />

  const handleChange = (field: keyof FormData, value: string) => {
    setForm(f => f ? { ...f, [field]: value } : f)
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }))
  }

  const handleEdit = () => {
    setErrors({})
    setEditing(true)
  }

  const handleCancel = () => {
    setForm(memberToForm(member))
    setErrors({})
    setEditing(false)
  }

  const handleSave = async () => {
    if (!form) return
    const errs = validate(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSaving(true)
    try {
      await patch(API_ENDPOINTS.MEMBER_BY_ID(member.id), {
        lastName:      form.lastName.trim(),
        firstName:     form.firstName.trim(),
        lastNameKana:  form.lastNameKana.trim()  || null,
        firstNameKana: form.firstNameKana.trim() || null,
        birthDate:     form.birthDate            || null,
        phoneNumber:   form.phoneNumber.trim()   || null,
        postalCode:    form.postalCode.trim()     || null,
        address:       form.address.trim()        || null,
      })
      await checkAuth()
      showToast('プロフィールを更新しました', 'success')
      setEditing(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '更新に失敗しました'
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>プロフィール</h1>

      {/* ── 基本情報 ── */}
      <Card>
        <div className={styles.cardHeader}>
          <h2 className={styles.sectionTitle}>基本情報</h2>
          {!editing && (
            <Button variant="secondary" onClick={handleEdit}>編集</Button>
          )}
        </div>

        <div className={styles.fields}>
          <div className={styles.row}>
            <Field
              label="姓" required
              value={form.lastName} editing={editing} error={errors.lastName}
              onChange={v => handleChange('lastName', v)}
              placeholder="山田" maxLength={50}
            />
            <Field
              label="名" required
              value={form.firstName} editing={editing} error={errors.firstName}
              onChange={v => handleChange('firstName', v)}
              placeholder="花子" maxLength={50}
            />
          </div>

          <div className={styles.row}>
            <Field
              label="姓（ふりがな）" required
              value={form.lastNameKana} editing={editing} error={errors.lastNameKana}
              onChange={v => handleChange('lastNameKana', v)}
              placeholder="やまだ" maxLength={50}
            />
            <Field
              label="名（ふりがな）" required
              value={form.firstNameKana} editing={editing} error={errors.firstNameKana}
              onChange={v => handleChange('firstNameKana', v)}
              placeholder="はなこ" maxLength={50}
            />
          </div>

          {/* 生年月日 */}
          <div className={styles.field}>
            <label className={styles.label}>生年月日</label>
            {editing ? (
              <input
                type="date"
                className={styles.input}
                value={form.birthDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={e => {
                  const v = e.target.value
                  if (v.split('-')[0]?.length > 4) return
                  handleChange('birthDate', v)
                }}
              />
            ) : (
              <p className={styles.value}>{form.birthDate || '未設定'}</p>
            )}
          </div>

          {/* 電話番号 */}
          <div className={styles.field}>
            <label className={styles.label}>電話番号</label>
            {editing ? (
              <>
                <input
                  type="tel"
                  className={`${styles.input}${errors.phoneNumber ? ` ${styles.inputError}` : ''}`}
                  value={form.phoneNumber}
                  onChange={e => handleChange('phoneNumber', e.target.value)}
                  placeholder="09012345678"
                  maxLength={13}
                />
                {errors.phoneNumber && <span className={styles.error}>{errors.phoneNumber}</span>}
              </>
            ) : (
              <p className={styles.value}>{form.phoneNumber || '未設定'}</p>
            )}
          </div>

          {/* 郵便番号 */}
          <div className={styles.field}>
            <label className={styles.label}>郵便番号</label>
            {editing ? (
              <>
                <input
                  className={`${styles.input}${errors.postalCode ? ` ${styles.inputError}` : ''}`}
                  value={form.postalCode}
                  onChange={e => handleChange('postalCode', e.target.value)}
                  placeholder="123-4567"
                  maxLength={8}
                />
                {errors.postalCode && <span className={styles.error}>{errors.postalCode}</span>}
              </>
            ) : (
              <p className={styles.value}>{form.postalCode || '未設定'}</p>
            )}
          </div>

          {/* 住所 */}
          <div className={styles.field}>
            <label className={styles.label}>住所</label>
            {editing ? (
              <input
                className={styles.input}
                value={form.address}
                onChange={e => handleChange('address', e.target.value)}
                placeholder="東京都新宿区..."
                maxLength={255}
              />
            ) : (
              <p className={styles.value}>{form.address || '未設定'}</p>
            )}
          </div>
        </div>

        {editing && (
          <div className={styles.actions}>
            <Button variant="secondary" onClick={handleCancel} disabled={saving}>
              キャンセル
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存する'}
            </Button>
          </div>
        )}
      </Card>

      {/* ── アカウント情報（表示のみ） ── */}
      <Card>
        <h2 className={styles.sectionTitle}>アカウント情報</h2>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}>メールアドレス</label>
            <p className={styles.value}>{member.email}</p>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>パスワード</label>
            <p className={styles.value}>••••••••</p>
          </div>
        </div>
        <p className={styles.note}>
          ※ メールアドレス・パスワードの変更はサポートまでお問い合わせください
        </p>
      </Card>

      {/* ── 利用者管理リンク ── */}
      <Card>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.sectionTitle}>利用者管理</h2>
            <p className={styles.note}>お子様の登録・編集はこちら</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/member/participants')}>
            利用者を管理する
          </Button>
        </div>
      </Card>
    </div>
  )
}

// ─── 内部ヘルパー ────────────────────────────────────────────────────────────

function memberToForm(m: Member): FormData {
  return {
    lastName:      m.lastName      ?? '',
    firstName:     m.firstName     ?? '',
    lastNameKana:  m.lastNameKana  ?? '',
    firstNameKana: m.firstNameKana ?? '',
    birthDate:     m.birthDate     ?? '',
    phoneNumber:   m.phoneNumber   ?? '',
    postalCode:    m.postalCode     ?? '',
    address:       m.address       ?? '',
  }
}

// ─── 表示/編集フィールド共通コンポーネント ───────────────────────────────────

interface FieldProps {
  label:        string
  value:        string
  editing:      boolean
  onChange:     (v: string) => void
  required?:    boolean
  error?:       string
  placeholder?: string
  maxLength?:   number
}

function Field({ label, value, editing, onChange, required, error, placeholder, maxLength }: FieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label}
        {required && editing && <span className={styles.required}> *</span>}
      </label>
      {editing ? (
        <>
          <input
            className={`${styles.input}${error ? ` ${styles.inputError}` : ''}`}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
          />
          {error && <span className={styles.error}>{error}</span>}
        </>
      ) : (
        <p className={styles.value}>{value || '未設定'}</p>
      )}
    </div>
  )
}