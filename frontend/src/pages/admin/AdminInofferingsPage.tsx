// frontend/src/pages/admin/AdminInofferingsPage.tsx
import { useState, useEffect, useCallback } from 'react'
import { get, del, post, patch } from '@/api/httpClient'
import { API_ENDPOINTS } from '@/config/constants'
import { Loading } from '@/components/common/Loading'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Modal } from '@/components/common/Modal'
import { useToast } from '@/hooks/useToast'
import { useModal } from '@/hooks/useModal'
// ファイル名に合わせたCSSモジュールを参照
import styles from './AdminInofferingsPage.module.css'

interface Offering {
  id: number
  title: string
  description: string | null
  delivery_method: 'ONLINE' | 'IN_PERSON'
  duration_minutes: number
  tickets_required: number
  capacity: number
  is_active: boolean
  provider_id: number
}

interface FormState {
  title: string
  description: string
  delivery_method: 'ONLINE' | 'IN_PERSON'
  duration_minutes: number
  tickets_required: number
  capacity: number
}

const BLANK: FormState = {
  title: '',
  description: '',
  delivery_method: 'ONLINE',
  duration_minutes: 60,
  tickets_required: 1,
  capacity: 1,
}

// エクスポート名をAppRoutesのimport文 "AdminInofferingsPage" に合わせる
export const AdminInofferingsPage: React.FC = () => {
  const { showToast } = useToast()
  const formModal     = useModal()

  const [offerings, setOfferings] = useState<Offering[]>([])
  const [loading,   setLoading]   = useState(true)
  const [editing,   setEditing]   = useState<Offering | null>(null)
  const [form,      setForm]      = useState<FormState>(BLANK)
  const [saving,    setSaving]    = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await get(API_ENDPOINTS.OFFERINGS)
      // レスポンス構造に対応した安全な取り出し
      const raw  = (res as { data?: unknown }).data
      const list =
        (raw as { data?: { content?: Offering[] }; content?: Offering[] })?.data?.content ??
        (raw as { content?: Offering[] })?.content ??
        (raw as { data?: Offering[] })?.data ??
        []
      setOfferings(Array.isArray(list) ? list : [])
    } catch {
      showToast('サービス一覧の取得に失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(BLANK)
    formModal.open()
  }

  const openEdit = (o: Offering) => {
    setEditing(o)
    setForm({
      title:            o.title,
      description:      o.description ?? '',
      delivery_method:  o.delivery_method,
      duration_minutes: o.duration_minutes,
      tickets_required: o.tickets_required,
      capacity:         o.capacity,
    })
    formModal.open()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        title:            form.title,
        description:      form.description || undefined,
        delivery_method:  form.delivery_method,
        duration_minutes: Number(form.duration_minutes),
        tickets_required: Number(form.tickets_required),
        capacity:         Number(form.capacity),
      }
      if (editing) {
        await patch(API_ENDPOINTS.OFFERING_BY_ID(editing.id), payload)
        showToast('サービスを更新しました', 'success')
      } else {
        await post(API_ENDPOINTS.OFFERINGS, payload)
        showToast('サービスを作成しました', 'success')
      }
      formModal.close()
      await load()
    } catch {
      showToast('保存に失敗しました', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (o: Offering) => {
    if (!confirm(`「${o.title}」を削除しますか？`)) return
    try {
      await del(API_ENDPOINTS.OFFERING_BY_ID(o.id))
      showToast('削除しました', 'success')
      await load()
    } catch {
      showToast('削除に失敗しました', 'error')
    }
  }

  const setField = (k: keyof FormState, v: unknown) =>
    setForm(f => ({ ...f, [k]: v }))

  if (loading) return <Loading />

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>サービス管理</h1>
        <Button variant="primary" onClick={openCreate}>＋ サービスを追加</Button>
      </div>

      {offerings.length === 0 ? (
        <Card className={styles.empty}><p>サービスがありません</p></Card>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>タイトル</th>
                <th>形態</th>
                <th>時間</th>
                <th>チケット</th>
                <th>定員</th>
                <th>状態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {offerings.map(o => (
                <tr key={o.id}>
                  <td>{o.title}</td>
                  <td>{o.delivery_method === 'ONLINE' ? 'オンライン' : '対面'}</td>
                  <td>{o.duration_minutes}分</td>
                  <td>{o.tickets_required}枚</td>
                  <td>{o.capacity}名</td>
                  <td>
                    <span className={o.is_active ? styles.active : styles.inactive}>
                      {o.is_active ? '有効' : '無効'}
                    </span>
                  </td>
                  <td className={styles.actionCell}>
                    <Button variant="secondary" onClick={() => openEdit(o)}>編集</Button>
                    <Button variant="danger"    onClick={() => handleDelete(o)}>削除</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 作成 / 編集モーダル */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title={editing ? 'サービスを編集' : 'サービスを追加'}
      >
        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.field}>
            <label>タイトル <span className={styles.req}>*</span></label>
            <input
              required
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              maxLength={255}
            />
          </div>

          <div className={styles.field}>
            <label>説明</label>
            <textarea
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>形態 <span className={styles.req}>*</span></label>
              <select
                value={form.delivery_method}
                onChange={e => setField('delivery_method', e.target.value)}
              >
                <option value="ONLINE">オンライン</option>
                <option value="IN_PERSON">対面</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>時間 <span className={styles.req}>*</span></label>
              <select
                value={form.duration_minutes}
                onChange={e => setField('duration_minutes', e.target.value)}
              >
                {[15,30,45,60,75,90,105,120].map(m => (
                  <option key={m} value={m}>{m}分</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>必要チケット枚数 <span className={styles.req}>*</span></label>
              <input
                type="number"
                min={1}
                value={form.tickets_required}
                onChange={e => setField('tickets_required', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>定員（最大15名）<span className={styles.req}>*</span></label>
              <input
                type="number"
                min={1}
                max={15}
                value={form.capacity}
                onChange={e => setField('capacity', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.modalActions}>
            <Button variant="secondary" type="button" onClick={formModal.close} disabled={saving}>
              キャンセル
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? '保存中...' : editing ? '更新' : '作成'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}