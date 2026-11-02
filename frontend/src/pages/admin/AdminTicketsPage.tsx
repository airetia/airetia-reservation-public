// frontend/src/pages/admin/AdminTicketsPage.tsx
import React from 'react'
import { useState } from 'react'
import { grantTickets } from '@/api/ticketApi'
import styles from './AdminTicketsPage.module.css'

/**
 * チケット手動付与ページ（管理者用）
 * → 05_frontend_specification.md §3.1 /admin/tickets
 * → 02_business_rules.md §7.1 チケット手動付与
 * → 06_infrastructure.md §7.2 チケット手動付与手順
 *
 * 操作フロー:
 *   1. 振込確認（銀行口座で照合）後に使用
 *   2. 対象メンバーIDと付与枚数を入力して確定
 *   3. 自動通知メール送信（バックエンド側）
 */
export function AdminTicketsPage() {
  const [form, setForm] = useState({
    memberId:   '',
    quantity:   '1',
    expiryDate: '',
    note:       '',
  })
  const [errors,     setErrors]     = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const update = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(p => ({...p, [k]: e.target.value}))
    if (errors[k]) setErrors(p => { const n = {...p}; delete n[k]; return n })
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    const mid = parseInt(form.memberId)
    const qty = parseInt(form.quantity)
    if (!form.memberId || isNaN(mid) || mid <= 0)
      errs.memberId = '有効なメンバーIDを入力してください'
    if (!form.quantity || isNaN(qty) || qty < 1)
      errs.quantity = '1枚以上入力してください'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const memberId = parseInt(form.memberId)
    const quantity = parseInt(form.quantity)

    if (!confirm(
      `メンバーID: ${memberId} に ${quantity}枚のチケットを付与しますか？\n` +
      `有効期限: 付与日から1年間`
    )) return

    setSubmitting(true)
    setSuccess(null)
    setSubmitError(null)

    try {
      const granted = await grantTickets({
        memberId,
        quantity,
        expiryDate: form.expiryDate || undefined,
        note: form.note.trim() || undefined,
      })
      setSuccess(`${granted.length}枚のチケットを付与しました`)
      setForm({ memberId: '', quantity: '1', expiryDate: '', note: '' })
    } catch (e: unknown) {
      // axiosエラーの場合はサーバーメッセージを表示
      const axiosErr = e as { response?: { data?: { message?: string; error_code?: string } }; message?: string }
      const serverMsg = axiosErr?.response?.data?.message
      const errCode = axiosErr?.response?.data?.error_code
      setSubmitError(
        serverMsg
          ? `エラー: ${serverMsg}${errCode ? ` (${errCode})` : ''}`
          : e instanceof Error ? e.message : 'チケット付与に失敗しました。管理者ログを確認してください。'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>チケット手動付与</h1>

      <div className={styles.notice}>
        <strong>注意:</strong> 振込確認後に操作してください。
        付与後は取り消せません。有効期限は付与日から1年間です。
      </div>

      {success && (
        <div className={styles.successMsg}>
          ✓ {success}
          <button type="button" onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {submitError && (
        <div className={styles.errorMsg}>{submitError}</div>
      )}

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="memberId">メンバーID <span className={styles.required}>*</span></label>
          <input
            id="memberId"
            type="number"
            min="1"
            value={form.memberId}
            onChange={update('memberId')}
            placeholder="例: 123"
          />
          {errors.memberId && <span className={styles.fieldError}>{errors.memberId}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="quantity">付与枚数 <span className={styles.required}>*</span></label>
          <input
            id="quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={update('quantity')}
          />
          {errors.quantity && <span className={styles.fieldError}>{errors.quantity}</span>}
          <p className={styles.hint}>
            1枚 = {(500).toLocaleString()}円（税抜）・有効期限は付与日から1年間
          </p>
        </div>

        <div className={styles.field}>
          <label htmlFor="expiryDate">有効期限（任意・省略時は付与日 + 1年）</label>
          <input
            id="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={e => {
              const v = e.target.value
              if (v && v.split('-')[0]?.length > 4) return
              update('expiryDate')(e)
            }}
            onInput={e => {
              const input = e.currentTarget as HTMLInputElement
              const parts = input.value.split('-')
              if (parts[0] && parts[0].length > 4) {
                parts[0] = parts[0].slice(0, 4)
                input.value = parts.join('-')
              }
            }}
          />
          <p className={styles.hint}>省略時は付与日から1年間（§1.2）</p>
        </div>

        <div className={styles.field}>
          <label htmlFor="note">メモ（管理者用・任意）</label>
          <textarea
            id="note"
            rows={2}
            maxLength={255}
            value={form.note}
            onChange={update('note')}
            placeholder="例: 3月分振込確認済み"
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={submitting}>
          {submitting ? '付与中...' : 'チケットを付与する'}
        </button>
      </form>
    </div>
  )
}