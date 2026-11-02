// frontend/src/pages/admin/AdminOfferingsPage.tsx
/**
 * 管理者向けサービス管理ページ
 * → 05_frontend_specification.md §3.1 /admin/offerings
 * → 02_business_rules.md §7.1 管理者の代理操作（サービスの登録・編集・削除）
 *
 * 機能:
 *   - 全プロバイダーのサービス一覧閲覧
 *   - 承認済みプロバイダーの代理サービス作成（providerId 指定）
 *   - サービスの有効/無効化・削除
 */
import { useEffect, useState, useCallback } from 'react'
import { get, post, patch, del } from '@/api/httpClient'
import { API_ENDPOINTS } from '@/config/constants'
import { useToast } from '@/contexts/ToastProvider'
import type { OfferingResponse } from '@/models/offering'
import type { ProviderResponse } from '@/models/provider'
import styles from './AdminOfferingsPage.module.css'

function extractMessage(err: unknown): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message
    ?? (err instanceof Error ? err.message : 'エラーが発生しました')
}

export function AdminOfferingsPage() {
  const { showToast } = useToast()

  const [offerings,  setOfferings]  = useState<OfferingResponse[]>([])
  const [providers,  setProviders]  = useState<ProviderResponse[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [showForm,   setShowForm]   = useState(false)

  // フォーム状態
  const [form, setForm] = useState({
    providerId:      '',
    title:           '',
    description:     '',
    deliveryMethod:  'ONLINE' as 'ONLINE' | 'IN_PERSON',
    durationMinutes: '60',
    ticketsRequired: '1',
    capacity:        '1',
  })
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [offRes, provRes] = await Promise.all([
        get(API_ENDPOINTS.OFFERINGS),
        get(API_ENDPOINTS.PROVIDERS, { params: { status: 'APPROVED' } }),
      ])
      setOfferings(Array.isArray(offRes.data?.data) ? offRes.data.data : [])
      setProviders(Array.isArray(provRes.data?.data) ? provRes.data.data : [])
      setError(null)
    } catch {
      if (!silent) setError('データの取得に失敗しました')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const resetForm = () => setForm({
    providerId: '', title: '', description: '',
    deliveryMethod: 'ONLINE', durationMinutes: '60',
    ticketsRequired: '1', capacity: '1',
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.providerId) { showToast('プロバイダーを選択してください', 'error'); return }
    if (!form.title.trim()) { showToast('タイトルを入力してください', 'error'); return }
    setSubmitting(true)
    try {
      await post(API_ENDPOINTS.OFFERINGS, {
        providerId:      Number(form.providerId),
        title:           form.title.trim(),
        description:     form.description.trim() || null,
        deliveryMethod:  form.deliveryMethod,
        durationMinutes: Number(form.durationMinutes),
        ticketsRequired: Number(form.ticketsRequired),
        capacity:        Number(form.capacity),
      })
      showToast('サービスを作成しました', 'success')
      setShowForm(false)
      resetForm()
      load(true)
    } catch (e) { showToast(extractMessage(e), 'error') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`「${title}」を削除しますか？\n有効な予約がある場合は削除できません。`)) return
    try {
      await del(API_ENDPOINTS.OFFERING_BY_ID(id))
      showToast('削除しました', 'success')
      load(true)
    } catch (e) { showToast(extractMessage(e), 'error') }
  }

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(f => ({ ...f, [k]: e.target.value }))

  if (loading) return <div className={styles.centered}>読み込み中...</div>
  if (error)   return <div className={styles.centered}><p className={styles.error}>{error}</p></div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>サービス管理</h1>
        <button type="button" className={styles.addBtn}
          onClick={() => { resetForm(); setShowForm(true) }}>
          ＋ サービスを代理作成
        </button>
      </div>

      {offerings.length === 0 ? (
        <p className={styles.empty}>サービスがありません</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th><th>先生</th><th>タイトル</th>
                <th>形式</th><th>時間</th><th>チケット</th><th>定員</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {offerings.map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.providerName}</td>
                  <td>{o.title}</td>
                  <td>{o.deliveryMethod === 'ONLINE' ? '🌐' : '📍'}</td>
                  <td>{o.durationMinutes}分</td>
                  <td>{o.ticketsRequired}枚</td>
                  <td>{o.capacity}名</td>
                  <td>
                    <button type="button" className={styles.deleteBtn}
                      onClick={() => handleDelete(o.id, o.title)}>削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* サービス作成モーダル */}
      {showForm && (
        <div className={styles.overlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>サービスを代理作成</h2>
              <button type="button" className={styles.closeBtn}
                onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleCreate} noValidate className={styles.form}>

              <div className={styles.field}>
                <label>対象プロバイダー <span className={styles.req}>*</span></label>
                <select value={form.providerId} onChange={set('providerId')} required>
                  <option value="">— 選択してください —</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.memberName}（ID: {p.id}）
                    </option>
                  ))}
                </select>
                <p className={styles.hint}>承認済みプロバイダーのみ表示</p>
              </div>

              <div className={styles.field}>
                <label>タイトル <span className={styles.req}>*</span></label>
                <input value={form.title} onChange={set('title')}
                  maxLength={255} placeholder="例: 英語会話レッスン（初級）" required />
              </div>

              <div className={styles.field}>
                <label>説明</label>
                <textarea value={form.description} onChange={set('description')}
                  rows={3} placeholder="レッスンの概要・対象者など" />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>提供形式</label>
                  <select value={form.deliveryMethod} onChange={set('deliveryMethod')}>
                    <option value="ONLINE">🌐 オンライン</option>
                    <option value="IN_PERSON">📍 対面</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>時間</label>
                  <select value={form.durationMinutes} onChange={set('durationMinutes')}>
                    {[15,30,45,60,75,90,105,120].map(m => (
                      <option key={m} value={m}>{m}分</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>消費チケット数</label>
                  <input type="number" min={1} value={form.ticketsRequired}
                    onChange={set('ticketsRequired')} />
                </div>
                <div className={styles.field}>
                  <label>定員（1〜15名）</label>
                  <input type="number" min={1} max={15} value={form.capacity}
                    onChange={set('capacity')} />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn}
                  onClick={() => setShowForm(false)}>キャンセル</button>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? '作成中...' : 'サービスを作成する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}