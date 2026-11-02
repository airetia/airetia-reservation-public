// frontend/src/pages/admin/AdminInquiriesPage.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/contexts/ToastProvider'
import { get, patch } from '@/api/httpClient'
import { API_ENDPOINTS } from '@/config/constants'
import type { InquiryResponse } from '@/models/inquiry'
import { InquiryStatus, InquiryStatusLabel } from '@/models/enums'
import styles from './AdminInquiriesPage.module.css'

/** 問い合わせステータスフィルター（"ALL" は独自追加） */
type FilterStatus = 'ALL' | InquiryStatus

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'ALL',                      label: 'すべて' },
  { value: InquiryStatus.OPEN,         label: InquiryStatusLabel[InquiryStatus.OPEN] },
  { value: InquiryStatus.IN_PROGRESS,  label: InquiryStatusLabel[InquiryStatus.IN_PROGRESS] },
  { value: InquiryStatus.RESOLVED,     label: InquiryStatusLabel[InquiryStatus.RESOLVED] },
  { value: InquiryStatus.CLOSED,       label: InquiryStatusLabel[InquiryStatus.CLOSED] },
]

/**
 * 管理者: 問い合わせ管理ページ
 * → 03_common_specification.md §5 問い合わせ
 * → 02_business_rules.md §7.1 管理者権限
 */
export const AdminInquiriesPage: React.FC = () => {
  const { showToast } = useToast()
  const [inquiries,   setInquiries]   = useState<InquiryResponse[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [filter,      setFilter]      = useState<FilterStatus>('ALL')
  const [selected,    setSelected]    = useState<InquiryResponse | null>(null)
  const [newStatus,   setNewStatus]   = useState<InquiryStatus>(InquiryStatus.OPEN)
  const [updating,    setUpdating]    = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    get(API_ENDPOINTS.ADMIN_INQUIRIES)
      .then(res => {
        const data = res.data?.data
        // PageResponse or plain array
        const list = Array.isArray(data) ? data : (data?.content ?? [])
        setInquiries(list)
      })
      .catch(() => setError('問い合わせ一覧の取得に失敗しました'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleOpen = (inq: InquiryResponse) => {
    setSelected(inq)
    setNewStatus(inq.status)
  }

  const handleUpdateStatus = async () => {
    if (!selected) return
    setUpdating(true)
    try {
      const res = await patch(API_ENDPOINTS.INQUIRY_STATUS(selected.id), { status: newStatus })
      const updated: InquiryResponse = res.data?.data ?? { ...selected, status: newStatus }
      setInquiries(prev => prev.map(i => i.id === updated.id ? updated : i))
      setSelected(updated)
      showToast('ステータスを更新しました', 'success')
    } catch {
      showToast('ステータスの更新に失敗しました', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const filtered = filter === 'ALL'
    ? inquiries
    : inquiries.filter(i => i.status === filter)

  if (loading) return <div className={styles.loading}>読み込み中...</div>
  if (error)   return <div className={styles.error}>{error}</div>

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>問い合わせ管理</h1>

      {/* ── フィルター ── */}
      <div className={styles.filters}>
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`${styles.filterBtn} ${filter === opt.value ? styles.active : ''}`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
            {opt.value !== 'ALL' && (
              <> ({inquiries.filter(i => i.status === opt.value).length})</>
            )}
          </button>
        ))}
      </div>

      {/* ── テーブル ── */}
      {filtered.length === 0 ? (
        <p className={styles.empty}>該当する問い合わせはありません</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>名前</th>
              <th>メール</th>
              <th>件名</th>
              <th>本文</th>
              <th>ステータス</th>
              <th>受付日時</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inq => (
              <tr key={inq.id} onClick={() => handleOpen(inq)} style={{ cursor: 'pointer' }}>
                <td>#{inq.id}</td>
                <td>{inq.name ?? '—'}</td>
                <td>{inq.email}</td>
                <td className={styles.bodyCell}>{inq.subject ?? '—'}</td>
                <td className={styles.bodyCell}>{inq.body}</td>
                <td>
                  <span className={`${styles.badge} ${styles[inq.status]}`}>
                    {InquiryStatusLabel[inq.status] ?? inq.status}
                  </span>
                </td>
                <td>{inq.createdAt ? new Date(inq.createdAt).toLocaleString('ja-JP') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── 詳細モーダル ── */}
      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>問い合わせ詳細 #{selected.id}</h2>

            <div className={styles.field}>
              <span className={styles.label}>名前</span>
              <span className={styles.value}>{selected.name ?? '非ログインユーザー'}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>メールアドレス</span>
              <span className={styles.value}>{selected.email}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>受付日時</span>
              <span className={styles.value}>
                {selected.createdAt ? new Date(selected.createdAt).toLocaleString('ja-JP') : '—'}
              </span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>本文</span>
              <p className={styles.value}>{selected.body}</p>
            </div>
            {selected.attachmentUrls && selected.attachmentUrls.length > 0 && (
              <div className={styles.field}>
                <span className={styles.label}>添付ファイル</span>
                <div className={styles.attachments}>
                  {selected.attachmentUrls!.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className={styles.attachLink}>📎 添付{i + 1}</a>
                  ))}
                </div>
              </div>
            )}

            {/* ステータス更新 */}
            <div className={styles.statusRow}>
              <label className={styles.label} style={{ margin: 0 }}>ステータス変更:</label>
              <select
                className={styles.statusSelect}
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as InquiryStatus)}
              >
                {Object.values(InquiryStatus).map(s => (
                  <option key={s} value={s}>{InquiryStatusLabel[s] ?? s}</option>
                ))}
              </select>
              <button
                type="button"
                className={styles.updateBtn}
                disabled={updating || newStatus === selected.status}
                onClick={handleUpdateStatus}
              >
                {updating ? '更新中...' : '更新'}
              </button>
              <button type="button" className={styles.closeBtn} onClick={() => setSelected(null)}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
