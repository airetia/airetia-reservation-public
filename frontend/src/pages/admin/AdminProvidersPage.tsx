// frontend/src/pages/admin/AdminProvidersPage.tsx
/**
 * プロバイダー承認・却下・書類閲覧ページ（管理者用）
 * → 05_frontend_specification.md §3.1 /admin/providers
 * → 02_business_rules.md §5.1.3（審査期間・結果）
 * → 03_common_specification.md §5 プロバイダー
 *
 * 修正: qualifications / achievements が null の場合 .length / .join() でクラッシュ
 *       → (p.qualifications ?? []) で null セーフに変更
 */
import { useEffect, useState, useCallback } from 'react'
import { get, patch } from '@/api/httpClient'
import { formatJST } from '@/utils/date'
import { useToast } from '@/contexts/ToastProvider'
import { API_ENDPOINTS } from '@/config/constants'
import type { ProviderResponse, ProviderDocumentResponse } from '@/models/provider'
import styles from './AdminProvidersPage.module.css'

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ON_HOLD' | 'SUSPENDED'

export function AdminProvidersPage() {
  const { showToast } = useToast()
  const [providers,    setProviders]    = useState<ProviderResponse[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING')

  const [reasonModal, setReasonModal] = useState<{
    providerId: number; action: 'reject' | 'hold'
  } | null>(null)
  const [reason, setReason] = useState('')

  const [docProviderId, setDocProviderId] = useState<number | null>(null)
  const [documents,     setDocuments]     = useState<ProviderDocumentResponse[]>([])
  const [docLoading,    setDocLoading]    = useState(false)

  const openDocuments = useCallback(async (providerId: number) => {
    setDocProviderId(providerId)
    setDocuments([])
    setDocLoading(true)
    try {
      const res = await get(API_ENDPOINTS.PROVIDER_DOCUMENTS(providerId))
      setDocuments(Array.isArray(res.data?.data) ? res.data.data : [])
    } catch {
      showToast('書類情報の取得に失敗しました', 'error')
    } finally {
      setDocLoading(false)
    }
  }, [showToast])

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    const params = statusFilter !== 'ALL' ? { status: statusFilter } : {}
    get(API_ENDPOINTS.PROVIDERS, { params })
      .then(res => {
        setProviders(Array.isArray(res.data?.data) ? res.data.data : [])
        setError(null)
      })
      .catch(() => {
        if (silent) showToast('プロバイダー一覧の更新に失敗しました', 'error')
        else setError('プロバイダー情報の取得に失敗しました')
      })
      .finally(() => { if (!silent) setLoading(false) })
  }, [statusFilter, showToast])

  useEffect(() => { load() }, [load])

  const handleApprove = async (id: number) => {
    if (!confirm('承認しますか？')) return
    try {
      await patch(API_ENDPOINTS.PROVIDER_APPROVE(id), {})
      showToast('承認しました', 'success')
      load(true)
    } catch {
      showToast('承認に失敗しました', 'error')
    }
  }

  const openReasonModal = (providerId: number, action: 'reject' | 'hold') => {
    setReason('')
    setReasonModal({ providerId, action })
  }

  const handleReasonSubmit = async () => {
    if (!reasonModal || !reason.trim()) return
    const { providerId, action } = reasonModal
    try {
      const endpoint = action === 'reject'
        ? API_ENDPOINTS.PROVIDER_REJECT(providerId)
        : API_ENDPOINTS.PROVIDER_HOLD(providerId)
      await patch(endpoint, { reason: reason.trim() })
      setReasonModal(null)
      showToast(action === 'reject' ? '却下しました' : '保留にしました', 'success')
      load(true)
    } catch {
      showToast('操作に失敗しました', 'error')
    }
  }

  const handleSuspend = async (id: number) => {
    if (!confirm('一時停止しますか？')) return
    try {
      await patch(API_ENDPOINTS.PROVIDER_SUSPEND(id), {})
      showToast('プロバイダーを停止しました', 'success')
      load(true)
    } catch {
      showToast('停止に失敗しました', 'error')
    }
  }

  const handleUnsuspend = async (id: number) => {
    try {
      await patch(API_ENDPOINTS.PROVIDER_UNSUSPEND(id), {})
      showToast('停止を解除しました', 'success')
      load(true)
    } catch {
      showToast('停止解除に失敗しました', 'error')
    }
  }

  if (loading) return <div className={styles.loading}>読み込み中...</div>
  if (error)   return <div className={styles.error}>{error}</div>

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>プロバイダー管理</h1>

      {/* フィルター */}
      <div className={styles.filters}>
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'ON_HOLD', 'SUSPENDED'] as StatusFilter[]).map(s => (
          <button type="button"
            key={s}
            className={statusFilter === s ? styles.filterActive : styles.filter}
            onClick={() => setStatusFilter(s)}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {providers.length === 0 ? (
        <p className={styles.empty}>該当するプロバイダーがいません</p>
      ) : (
        <div className={styles.providerList}>
          {providers.map(p => {
            // 修正: null セーフ — APIが空配列でなく null を返す場合に備える
            const qualifications = p.qualifications ?? []
            const achievements   = p.achievements   ?? []

            return (
              <div key={p.id} className={styles.providerCard}>
                <div className={styles.cardHeader}>
                  <span className={`${styles.status} ${styles[p.status.toLowerCase()]}`}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                  <span className={styles.memberId}>メンバーID: {p.memberId}</span>
                </div>

                <dl className={styles.info}>
                  <dt>出身高校</dt><dd>{p.highSchool ?? '—'}</dd>
                  {p.university && <><dt>大学・専門学校</dt><dd>{p.university}</dd></>}
                  {qualifications.length > 0 && (
                    <><dt>資格</dt><dd>{qualifications.join('、')}</dd></>
                  )}
                  {achievements.length > 0 && (
                    <><dt>実績</dt><dd>{achievements.join('、')}</dd></>
                  )}
                  {p.appealPoint && (
                    <><dt>アピールポイント</dt><dd className={styles.appeal}>{p.appealPoint}</dd></>
                  )}
                  {p.rejectionReason && (
                    <><dt>却下理由</dt><dd className={styles.rejection}>{p.rejectionReason}</dd></>
                  )}
                  {p.onHoldReason && (
                    <><dt>保留理由</dt><dd className={styles.onHold}>{p.onHoldReason}</dd></>
                  )}
                </dl>

                <div className={styles.cardActions}>
                  <button type="button" className={styles.docBtn}
                    onClick={() => openDocuments(p.id)}>書類確認</button>
                  {p.status === 'PENDING' && (
                    <>
                      <button type="button" className={styles.approveBtn} onClick={() => handleApprove(p.id)}>承認</button>
                      <button type="button" className={styles.holdBtn} onClick={() => openReasonModal(p.id, 'hold')}>保留</button>
                      <button type="button" className={styles.rejectBtn} onClick={() => openReasonModal(p.id, 'reject')}>却下</button>
                    </>
                  )}
                  {p.status === 'ON_HOLD' && (
                    <>
                      <button type="button" className={styles.approveBtn} onClick={() => handleApprove(p.id)}>承認</button>
                      <button type="button" className={styles.rejectBtn} onClick={() => openReasonModal(p.id, 'reject')}>却下</button>
                    </>
                  )}
                  {p.status === 'APPROVED' && (
                    <button type="button" className={styles.suspendBtn} onClick={() => handleSuspend(p.id)}>停止</button>
                  )}
                  {p.status === 'SUSPENDED' && (
                    <button type="button" className={styles.unsuspendBtn} onClick={() => handleUnsuspend(p.id)}>停止解除</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 書類確認モーダル */}
      {docProviderId !== null && (
        <div className={styles.modalOverlay} onClick={() => setDocProviderId(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.docModalHeader}>
              <h2>提出書類 — プロバイダーID: {docProviderId}</h2>
              <button type="button" className={styles.closeBtn}
                onClick={() => setDocProviderId(null)}>×</button>
            </div>
            {docLoading ? (
              <p className={styles.docLoading}>読み込み中...</p>
            ) : documents.length === 0 ? (
              <p className={styles.docEmpty}>書類が提出されていません</p>
            ) : (
              <ul className={styles.docList}>
                {documents.map(d => (
                  <li key={d.id} className={styles.docItem}>
                    <span className={styles.docType}>{DOC_TYPE_LABEL[d.documentType] ?? d.documentType}</span>
                    <span className={styles.docFilename}>{d.originalFilename}</span>
                    <span className={styles.docDate}>{formatJST(d.uploadedAt)}</span>
                    <a
                      href={`/api/v1/providers/${docProviderId}/documents/${d.id}/download`}
                      target="_blank" rel="noopener noreferrer"
                      className={styles.docDownload}
                    >
                      開く
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* 理由入力モーダル */}
      {reasonModal && (
        <div className={styles.modalOverlay} onClick={() => setReasonModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>{reasonModal.action === 'reject' ? '却下理由' : '保留理由'}</h2>
            <p className={styles.modalNote}>
              {reasonModal.action === 'reject'
                ? '申請者へメールで通知されます。再申請は1ヶ月後になります。'
                : '申請者へメールで通知されます。即時再申請が可能です。'}
            </p>
            <textarea rows={4} value={reason} onChange={e => setReason(e.target.value)}
              placeholder="理由を入力してください" className={styles.reasonInput} />
            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setReasonModal(null)}>キャンセル</button>
              <button type="button"
                className={reasonModal.action === 'reject' ? styles.rejectBtn : styles.holdBtn}
                onClick={handleReasonSubmit}
                disabled={!reason.trim()}
              >
                {reasonModal.action === 'reject' ? '却下する' : '保留にする'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DOC_TYPE_LABEL: Record<string, string> = {
  IDENTITY:  '身分証明書',
  CONTRACT:  '署名済み契約書',
  BANK_INFO: '口座情報',
}

const STATUS_LABEL: Record<string, string> = {
  ALL:               'すべて',
  PENDING_DOCUMENTS: '書類待ち',
  PENDING:           '審査待ち',
  APPROVED:          '承認済み',
  REJECTED:          '却下',
  ON_HOLD:           '保留',
  SUSPENDED:         '停止中',
}