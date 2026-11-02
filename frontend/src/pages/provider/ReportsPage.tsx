// frontend/src/pages/provider/ReportsPage.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { get, post } from '@/api/httpClient'
import { API_ENDPOINTS } from '@/config/constants'
import { formatJST } from '@/utils/date'
import { useToast } from '@/contexts/ToastProvider'
import type { BookingResponse } from '@/models/booking'
import styles from './ReportsPage.module.css'

/**
 * 報告書一覧・作成ページ（プロバイダー用）
 * → 05_frontend_specification.md §3.1 /provider/reports
 * → 02_business_rules.md §2.6
 */

interface ReportRecord {
  id:          number
  bookingId:   number
  reportType:  'COMPLETION' | 'NO_SHOW'
  feedback:    string | null
  sharedNote:  string | null
  privateNote: string | null
  createdAt:   string
}

type TabType = 'pending' | 'submitted'

function cx(...cls: (string | false | null | undefined)[]): string {
  return cls.filter(Boolean).join(' ')
}

function extractMessage(err: unknown): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message
    ?? (err instanceof Error ? err.message : 'エラーが発生しました')
}

export function ReportsPage() {
  const { showToast } = useToast()

  const [bookings,        setBookings]        = useState<BookingResponse[]>([])
  const [reports,         setReports]         = useState<ReportRecord[]>([])
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState<string | null>(null)
  const [activeTab,       setActiveTab]       = useState<TabType>('pending')
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null)
  const [reportType,      setReportType]      = useState<'COMPLETION' | 'NO_SHOW'>('COMPLETION')
  const [form,            setForm]            = useState({ feedback: '', sharedNote: '', privateNote: '' })
  const [submitting,      setSubmitting]      = useState(false)

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    Promise.all([
      get(API_ENDPOINTS.BOOKINGS, { params: { role: 'provider' } }),
      get(API_ENDPOINTS.REPORTS),
    ])
      .then(([bRes, rRes]) => {
        setBookings(Array.isArray(bRes.data?.data) ? bRes.data.data : [])
        setReports(Array.isArray(rRes.data?.data) ? rRes.data.data : [])
        setError(null)
      })
      .catch(() => {
        if (silent) showToast('データ更新に失敗しました', 'error')
        else setError('データの取得に失敗しました')
      })
      .finally(() => { if (!silent) setLoading(false) })
  }, [showToast])

  useEffect(load, [load])

  const reportedBookingIds = new Set(reports.map(r => r.bookingId))
  const now = new Date()

  const reportableBookings = bookings.filter(b => {
    if (reportedBookingIds.has(b.id)) return false
    if (b.status !== 'CONFIRMED')     return false
    const start = new Date(b.startDatetime)
    const end   = new Date(b.endDatetime)
    const minsFromStart = (now.getTime() - start.getTime()) / 60000
    const minsFromEnd   = (now.getTime() - end.getTime())   / 60000
    return (minsFromEnd >= -15 && minsFromEnd <= 1440) || minsFromStart >= 15
  })

  const handleSelectBooking = (b: BookingResponse) => {
    const minsFromStart = (now.getTime() - new Date(b.startDatetime).getTime()) / 60000
    const minsFromEnd   = (now.getTime() - new Date(b.endDatetime).getTime())   / 60000
    setSelectedBooking(b)
    setReportType(minsFromStart >= 15 && minsFromEnd < 0 ? 'NO_SHOW' : 'COMPLETION')
    setForm({ feedback: '', sharedNote: '', privateNote: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return
    setSubmitting(true)
    try {
      await post(API_ENDPOINTS.REPORTS, {
        bookingId:   selectedBooking.id,
        reportType,
        feedback:    form.feedback    || null,
        sharedNote:  form.sharedNote  || null,
        privateNote: form.privateNote || null,
      })
      showToast('報告書を提出しました', 'success')
      setSelectedBooking(null)
      setForm({ feedback: '', sharedNote: '', privateNote: '' })
      setActiveTab('submitted')
      load(true)
    } catch (e) {
      showToast(extractMessage(e), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className={styles.centered}>読み込み中...</div>
  if (error)   return <div className={styles.centered}><p className={styles.errorMsg}>{error}</p></div>

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>報告書</h1>

      <div className={styles.tabs}>
        {([
          ['pending',   '未提出'],
          ['submitted', '提出済み'],
        ] as [TabType, string][]).map(([t, label]) => (
          <button key={t} type="button"
            className={cx(styles.tab, activeTab === t && styles.tabActive)}
            onClick={() => { setActiveTab(t); setSelectedBooking(null) }}>
            {label}
            {t === 'pending'   && reportableBookings.length > 0 && (
              <span className={styles.badge}>{reportableBookings.length}</span>
            )}
            {t === 'submitted' && (
              <span className={styles.badgeGray}>{reports.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* 未提出：一覧 */}
      {activeTab === 'pending' && !selectedBooking && (
        <section>
          {reportableBookings.length === 0 ? (
            <div className={styles.empty}>
              <p>現在、報告書を提出できる予約はありません。</p>
              <p className={styles.emptyNote}>
                完了報告: サービス終了15分前〜24時間後 ／ 無断キャンセル報告: サービス開始15分後〜
              </p>
            </div>
          ) : (
            <div className={styles.cardList}>
              {reportableBookings.map(b => {
                const minsFromStart = (now.getTime() - new Date(b.startDatetime).getTime()) / 60000
                const minsFromEnd   = (now.getTime() - new Date(b.endDatetime).getTime())   / 60000
                const canNoShow     = minsFromStart >= 15
                const canCompletion = minsFromEnd >= -15 && minsFromEnd <= 1440
                return (
                  <div key={b.id} className={styles.reportableCard}>
                    <div className={styles.cardLeft}>
                      <p className={styles.cardService}>{b.serviceTitle}</p>
                      <p className={styles.cardMeta}>{formatJST(b.startDatetime)} — {b.participantName}</p>
                      <div className={styles.tagRow}>
                        {canCompletion && <span className={styles.tagCompletion}>完了報告可</span>}
                        {canNoShow     && <span className={styles.tagNoShow}>無断キャンセル報告可</span>}
                      </div>
                    </div>
                    <button type="button" className={styles.reportBtn}
                      onClick={() => handleSelectBooking(b)}>
                      報告する
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* 未提出：報告書フォーム */}
      {activeTab === 'pending' && selectedBooking && (
        <section>
          <button type="button" className={styles.backBtn}
            onClick={() => setSelectedBooking(null)}>
            ← 一覧に戻る
          </button>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>報告書作成</h2>
            <div className={styles.bookingBanner}>
              <span className={styles.bookingBannerService}>{selectedBooking.serviceTitle}</span>
              <span className={styles.bookingBannerMeta}>
                {formatJST(selectedBooking.startDatetime)} ／ {selectedBooking.participantName}
              </span>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>報告種別</label>
                <div className={styles.radioGroup}>
                  {(['COMPLETION', 'NO_SHOW'] as const).map(v => (
                    <label key={v} className={styles.radioLabel}>
                      <input type="radio" value={v} checked={reportType === v}
                        onChange={() => setReportType(v)} />
                      {v === 'COMPLETION' ? '完了報告' : '無断キャンセル報告'}
                    </label>
                  ))}
                </div>
              </div>
              {reportType === 'COMPLETION' && (
                <>
                  <TextAreaField label="利用者へのフィードバック" hint="公開・1000文字以内"
                    value={form.feedback} maxLength={1000}
                    onChange={v => setForm(p => ({ ...p, feedback: v }))} />
                  <TextAreaField label="利用者の特徴" hint="全プロバイダーで共有・1000文字以内"
                    value={form.sharedNote} maxLength={1000}
                    onChange={v => setForm(p => ({ ...p, sharedNote: v }))} />
                  <TextAreaField label="詳細メモ" hint="自分のみ閲覧・1000文字以内"
                    value={form.privateNote} maxLength={1000}
                    onChange={v => setForm(p => ({ ...p, privateNote: v }))} />
                </>
              )}
              <div className={styles.btnRow}>
                <button type="button" className={styles.cancelBtn}
                  onClick={() => setSelectedBooking(null)}>キャンセル</button>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? '提出中...' : '報告書を提出'}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* 提出済みタブ */}
      {activeTab === 'submitted' && (
        <section>
          {reports.length === 0 ? (
            <p className={styles.empty}>提出済みの報告書はありません</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>種別</th><th>サービス</th><th>実施日時</th><th>提出日時</th></tr>
                </thead>
                <tbody>
                  {reports.map(r => {
                    const b = bookings.find(bk => bk.id === r.bookingId)
                    return (
                      <tr key={r.id}>
                        <td>
                          <span className={r.reportType === 'COMPLETION' ? styles.tagCompletion : styles.tagNoShow}>
                            {r.reportType === 'COMPLETION' ? '完了' : '無断キャンセル'}
                          </span>
                        </td>
                        <td>{b?.serviceTitle ?? `予約 #${r.bookingId}`}</td>
                        <td className={styles.tdDatetime}>{b ? formatJST(b.startDatetime) : '—'}</td>
                        <td className={styles.tdDatetime}>{formatJST(r.createdAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function TextAreaField({ label, hint, value, maxLength, onChange }:
  { label: string; hint?: string; value: string; maxLength: number; onChange: (v: string) => void }
) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        {label}
        {hint && <span className={styles.fieldHint}> {hint}</span>}
        <span className={styles.counter}> {value.length}/{maxLength}</span>
      </label>
      <textarea rows={4} value={value} maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        className={styles.fieldTextarea} />
    </div>
  )
}