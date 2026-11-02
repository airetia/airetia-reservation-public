// frontend/src/pages/provider/AvailabilitiesPage.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { get, post, patch, del } from '@/api/httpClient'
import { API_ENDPOINTS } from '@/config/constants'
import { formatJST } from '@/utils/date'
import { useToast } from '@/contexts/ToastProvider'
import type { AvailabilityResponse } from '@/models/availability'
import type { OfferingResponse } from '@/models/offering'
import type { BookingResponse } from '@/models/booking'
import styles from './AvailabilitiesPage.module.css'

/**
 * 空き枠・サービス管理ページ（プロバイダー用）
 * → 05_frontend_specification.md §3.1 /provider/availabilities
 * → 02_business_rules.md §5.2 空き枠管理
 *
 * タブ: [空き枠] [予約リクエスト] [サービス]
 */

type TabType = 'slots' | 'requests' | 'services'

function cx(...cls: (string | false | null | undefined)[]): string {
  return cls.filter(Boolean).join(' ')
}

function extractMessage(err: unknown): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message
    ?? (err instanceof Error ? err.message : 'エラーが発生しました')
}

function toJSTDate(utc: string): string {
  const jst = new Date(new Date(utc).getTime() + 9 * 60 * 60 * 1000)
  return jst.toISOString().slice(0, 10)
}

function buildCalendarGrid(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const grid: (string | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    grid.push(`${year}-${mm}-${dd}`)
  }
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

export function AvailabilitiesPage() {
  const { showToast } = useToast()

  const [activeTab,      setActiveTab]      = useState<TabType>('slots')
  const [availabilities, setAvailabilities] = useState<AvailabilityResponse[]>([])
  const [bookings,       setBookings]       = useState<BookingResponse[]>([])
  const [offerings,      setOfferings]      = useState<OfferingResponse[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)
  const [showSlotForm,   setShowSlotForm]   = useState(false)
  const [filterDate,     setFilterDate]     = useState<string | null>(null)
  const [calYear,        setCalYear]        = useState(() => new Date().getFullYear())
  const [calMonth,       setCalMonth]       = useState(() => new Date().getMonth() + 1)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingOffering, setEditingOffering] = useState<OfferingResponse | null>(null)

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    Promise.all([
      get(API_ENDPOINTS.AVAILABILITIES, { params: { mySlots: true } }),
      get(API_ENDPOINTS.OFFERINGS,      { params: { myOfferings: true } }),
      get(API_ENDPOINTS.BOOKINGS,        { params: { role: 'provider' } }),
    ])
      .then(([aRes, oRes, bRes]) => {
        setAvailabilities(Array.isArray(aRes.data?.data) ? aRes.data.data : [])
        setOfferings     (Array.isArray(oRes.data?.data) ? oRes.data.data : [])
        setBookings      (Array.isArray(bRes.data?.data) ? bRes.data.data : [])
        setError(null)
      })
      .catch(() => {
        if (silent) showToast('データ更新に失敗しました', 'error')
        else setError('データの取得に失敗しました')
      })
      .finally(() => { if (!silent) setLoading(false) })
  }, [showToast])

  useEffect(load, [load])

  const slotDateSet = useMemo(() => {
    const s = new Set<string>()
    availabilities.forEach(a => s.add(toJSTDate(a.startDatetime)))
    return s
  }, [availabilities])

  const calGrid = useMemo(
    () => buildCalendarGrid(calYear, calMonth),
    [calYear, calMonth]
  )

  const prevMonth = () => {
    if (calMonth === 1) { setCalYear(y => y - 1); setCalMonth(12) }
    else setCalMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (calMonth === 12) { setCalYear(y => y + 1); setCalMonth(1) }
    else setCalMonth(m => m + 1)
  }

  const nowStr = new Date().toISOString()

  const upcomingSlots = useMemo(
    () => availabilities.filter(a => a.startDatetime >= nowStr),
    [availabilities, nowStr]
  )

  const pastSlots = useMemo(
    () => availabilities.filter(a => a.startDatetime < nowStr),
    [availabilities, nowStr]
  )

  const [showPast, setShowPast] = useState(false)

  const displaySlots = useMemo(() => {
    const base = showPast ? pastSlots : upcomingSlots
    return filterDate ? base.filter(a => toJSTDate(a.startDatetime) === filterDate) : base
  }, [showPast, upcomingSlots, pastSlots, filterDate])

  const filteredSlots = displaySlots  // 後方互換

  const pendingBookings   = bookings.filter(b => b.status === 'PENDING')
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED')

  const handleConfirmBooking = async (bookingId: number) => {
    if (!confirm('この予約を確定しますか？')) return
    try {
      await patch(`/api/v1/bookings/${bookingId}/confirm`, {})
      showToast('予約を確定しました', 'success'); load(true)
    } catch (e) { showToast(extractMessage(e), 'error') }
  }

  const handleDeleteSlot = async (id: number) => {
    if (!confirm('この空き枠を削除しますか？')) return
    try {
      await del(API_ENDPOINTS.AVAILABILITY_BY_ID(id))
      showToast('空き枠を削除しました', 'success'); load(true)
    } catch (e) { showToast(extractMessage(e), 'error') }
  }

  const handleDeleteOffering = async (id: number) => {
    if (!confirm('このサービスを削除しますか？空き枠がある場合は削除できません。')) return
    try {
      await del(API_ENDPOINTS.OFFERING_BY_ID(id))
      showToast('サービスを削除しました', 'success'); load(true)
    } catch (e) { showToast(extractMessage(e), 'error') }
  }

  if (loading) return <div className={styles.centered}>読み込み中...</div>
  if (error)   return <div className={styles.centered}><p className={styles.errorMsg}>{error}</p></div>

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>空き枠・サービス管理</h1>

      <div className={styles.tabs}>
        {([
          ['slots',    `空き枠 (${upcomingSlots.length})`],
          ['requests', '予約リクエスト'],
          ['services', `サービス (${offerings.length})`],
        ] as [TabType, string][]).map(([t, label]) => (
          <button key={t} type="button"
            className={cx(styles.tab, activeTab === t && styles.tabActive)}
            onClick={() => setActiveTab(t)}>
            {label}
            {t === 'requests' && pendingBookings.length > 0 && (
              <span className={styles.badge}>{pendingBookings.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══ 空き枠タブ ══ */}
      {activeTab === 'slots' && (
        <section>
          <div className={styles.calendar}>
            <div className={styles.calHeader}>
              <button type="button" className={styles.calNavBtn} onClick={prevMonth}>‹</button>
              <span className={styles.calTitle}>{calYear}年 {calMonth}月</span>
              <button type="button" className={styles.calNavBtn} onClick={nextMonth}>›</button>
            </div>
            <div className={styles.calGrid}>
              {['日','月','火','水','木','金','土'].map(d => (
                <div key={d} className={cx(
                  styles.calDow,
                  d === '日' && styles.calSun,
                  d === '土' && styles.calSat,
                )}>{d}</div>
              ))}
              {calGrid.map((date, i) => {
                if (!date) return <div key={i} className={styles.calEmpty} />
                const hasSlot    = slotDateSet.has(date)
                const isSelected = filterDate === date
                const isToday    = date === new Date().toISOString().slice(0, 10)
                const dow        = new Date(date).getDay()
                return (
                  <button key={date} type="button"
                    className={cx(
                      styles.calDay,
                      hasSlot    && styles.calHasSlot,
                      isSelected && styles.calSelected,
                      isToday    && styles.calToday,
                      dow === 0  && styles.calSun,
                      dow === 6  && styles.calSat,
                    )}
                    onClick={() => setFilterDate(isSelected ? null : date)}>
                    <span className={styles.calDayNum}>{new Date(date).getDate()}</span>
                    {hasSlot && <span className={styles.calDot} />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className={styles.slotHeader}>
            <div className={styles.slotMeta}>
              {filterDate
                ? <span className={styles.filterActive}>
                    {filterDate} ({displaySlots.length}件)
                    <button type="button" className={styles.clearFilter}
                      onClick={() => setFilterDate(null)}>✕</button>
                  </span>
                : <span>
                    {showPast
                      ? `過去の空き枠 (${pastSlots.length}件)`
                      : `今後の空き枠 (${upcomingSlots.length}件)`}
                  </span>
              }
              <button
                type="button"
                className={styles.togglePastBtn}
                onClick={() => { setShowPast(v => !v); setFilterDate(null) }}
              >
                {showPast ? '▲ 今後の予定を表示' : '▼ 過去の空き枠を表示'}
              </button>
            </div>
            {offerings.length === 0
              ? <p className={styles.noServiceNote}>⚠ 先に「サービス」タブでサービスを作成してください</p>
              : <button type="button" className={styles.addBtn}
                  onClick={() => setShowSlotForm(true)}>＋ 空き枠を追加</button>
            }
          </div>

          {filteredSlots.length === 0 ? (
            <p className={styles.empty}>
              {filterDate ? 'この日の空き枠はありません' : '登録されている空き枠がありません'}
            </p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>サービス</th><th>開始日時</th><th>終了日時</th>
                    <th>定員</th><th>予約数</th><th>状態</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.map(a => (
                    <tr key={a.id} className={a.full ? styles.rowFull : undefined}>
                      <td>{a.offeringTitle}</td>
                      <td className={styles.tdDatetime}>{formatJST(a.startDatetime)}</td>
                      <td className={styles.tdDatetime}>{formatJST(a.endDatetime)}</td>
                      <td>{a.capacity}名</td>
                      <td>{a.bookedCount}名</td>
                      <td>
                        <span className={cx(
                          styles.statusBadge,
                          !a.bookable && styles.statusNotYet,
                          a.bookable && !a.full && styles.statusOpen,
                          a.full && styles.statusFull,
                        )}>
                          {!a.bookable ? '受付前' : a.full ? '満員' : '受付中'}
                        </span>
                      </td>
                      <td>
                        {a.bookedCount === 0
                          ? <button type="button" className={styles.deleteBtn}
                              onClick={() => handleDeleteSlot(a.id)}>削除</button>
                          : <span className={styles.disabledNote}>予約あり</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ══ 予約リクエストタブ ══ */}
      {activeTab === 'requests' && (
        <section>
          <div className={styles.requestSection}>
            <h2 className={styles.sectionTitle}>
              確定待ち
              {pendingBookings.length > 0 && <span className={styles.badge}>{pendingBookings.length}</span>}
            </h2>
            <p className={styles.sectionNote}>
              予約リクエストを確認し、確定ボタンを押してください。確定するとチケットが消費されます。
            </p>
            {pendingBookings.length === 0 ? (
              <p className={styles.empty}>確定待ちのリクエストはありません</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>利用者</th><th>サービス</th><th>日時</th><th>チケット</th><th>リクエスト日</th><th>操作</th></tr>
                  </thead>
                  <tbody>
                    {pendingBookings.map(b => (
                      <tr key={b.id}>
                        <td>{b.participantName}</td>
                        <td>{b.serviceTitle}</td>
                        <td className={styles.tdDatetime}>{formatJST(b.startDatetime)}</td>
                        <td>{b.ticketsConsumed}枚</td>
                        <td className={styles.tdDatetime}>{formatJST(b.createdAt)}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.confirmBtn}
                            onClick={() => handleConfirmBooking(b.id)}
                          >
                            確定する
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={styles.requestSection}>
            <h2 className={styles.sectionTitle}>確定済み予約 ({confirmedBookings.length}件)</h2>
            {confirmedBookings.length === 0 ? (
              <p className={styles.empty}>確定済みの予約はありません</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>利用者</th><th>サービス</th><th>日時</th><th>チケット</th></tr>
                  </thead>
                  <tbody>
                    {confirmedBookings.map(b => (
                      <tr key={b.id}>
                        <td>{b.participantName}</td>
                        <td>{b.serviceTitle}</td>
                        <td className={styles.tdDatetime}>{formatJST(b.startDatetime)}</td>
                        <td>{b.ticketsConsumed}枚</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══ サービスタブ ══ */}
      {activeTab === 'services' && (
        <section>
          <div className={styles.slotHeader}>
            <span />
            <button type="button" className={styles.addBtn}
              onClick={() => { setEditingOffering(null); setShowServiceForm(true) }}>
              ＋ サービスを作成
            </button>
          </div>
          {offerings.length === 0 ? (
            <div className={styles.empty}>
              <p>サービスが登録されていません。</p>
              <p className={styles.emptyNote}>サービスを作成すると「空き枠」タブで追加できます。</p>
            </div>
          ) : (
            <div className={styles.serviceGrid}>
              {offerings.map(o => (
                <div key={o.id} className={styles.serviceCard}>
                  <div className={styles.serviceBody}>
                    <h3 className={styles.serviceCardTitle}>{o.title}</h3>
                    <div className={styles.serviceMeta}>
                      <span className={styles.metaTag}>{o.deliveryMethod === 'ONLINE' ? '🌐 オンライン' : '📍 対面'}</span>
                      <span className={styles.metaTag}>⏱ {o.durationMinutes}分</span>
                      <span className={styles.metaTag}>🎫 {o.ticketsRequired}枚</span>
                      <span className={styles.metaTag}>👥 最大{o.capacity}名</span>
                    </div>
                    {o.description && <p className={styles.serviceDesc}>{o.description}</p>}
                  </div>
                  <div className={styles.serviceActions}>
                    <button type="button" className={styles.editBtn}
                      onClick={() => { setEditingOffering(o); setShowServiceForm(true) }}>編集</button>
                    <button type="button" className={styles.deleteBtn}
                      onClick={() => handleDeleteOffering(o.id)}>削除</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {showSlotForm && (
        <AvailabilityFormModal
          offerings={offerings}
          defaultDate={filterDate ?? undefined}
          onClose={() => setShowSlotForm(false)}
          onSaved={() => { load(true); setShowSlotForm(false) }}
        />
      )}
      {showServiceForm && (
        <OfferingFormModal
          editing={editingOffering}
          onClose={() => { setShowServiceForm(false); setEditingOffering(null) }}
          onSaved={() => { load(true); setShowServiceForm(false); setEditingOffering(null) }}
        />
      )}
    </div>
  )
}

// ── 空き枠追加モーダル（2ステップ）──────────────────────────────────────────
function AvailabilityFormModal({
  offerings, defaultDate, onClose, onSaved,
}: {
  offerings:    OfferingResponse[]
  defaultDate?: string
  onClose:      () => void
  onSaved:      () => void
}) {
  const { showToast } = useToast()
  const [step,       setStep]       = useState<1 | 2>(1)
  const [offeringId, setOfferingId] = useState<number | ''>(offerings[0]?.id ?? '')
  const [startDate,  setStartDate]  = useState(defaultDate ?? '')
  const [startTime,  setStartTime]  = useState('10:00')
  const [capacity,   setCapacity]   = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const selectedOffering = offerings.find(o => o.id === Number(offeringId))
  const today   = new Date().toISOString().slice(0, 10)
  const maxDate = (() => {
    const d = new Date(); d.setMonth(d.getMonth() + 3)
    d.setDate(new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())
    return d.toISOString().slice(0, 10)
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offeringId || !startDate || !selectedOffering) return
    const startMs = new Date(`${startDate}T${startTime}:00+09:00`).getTime()
    setSubmitting(true)
    try {
      await post(API_ENDPOINTS.AVAILABILITIES, {
        offeringId,
        startDatetime: new Date(startMs).toISOString(),
        endDatetime:   new Date(startMs + selectedOffering.durationMinutes * 60000).toISOString(),
        capacity,
      })
      showToast('空き枠を追加しました', 'success'); onSaved()
    } catch (e) { showToast(extractMessage(e), 'error') }
    finally { setSubmitting(false) }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            空き枠を追加
            <span className={styles.modalStep}> {step}/2</span>
          </h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          {step === 1 && (
            <div>
              <p className={styles.stepDesc}>提供するサービスを選択してください</p>
              <div className={styles.serviceSelect}>
                {offerings.map(o => (
                  <button key={o.id} type="button"
                    className={cx(styles.serviceOption, Number(offeringId) === o.id && styles.serviceOptionSelected)}
                    onClick={() => { setOfferingId(o.id); setCapacity(1) }}>
                    <span className={styles.serviceOptionTitle}>{o.title}</span>
                    <span className={styles.serviceOptionMeta}>
                      {o.durationMinutes}分 · {o.deliveryMethod === 'ONLINE' ? 'オンライン' : '対面'} · 🎫{o.ticketsRequired}枚 · 定員{o.capacity}名
                    </span>
                  </button>
                ))}
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={onClose}>キャンセル</button>
                <button type="button" className={styles.submitBtn} disabled={!offeringId}
                  onClick={() => setStep(2)}>次へ →</button>
              </div>
            </div>
          )}
          {step === 2 && selectedOffering && (
            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.selectedService}>
                <span className={styles.selectedServiceLabel}>サービス</span>
                <span className={styles.selectedServiceName}>{selectedOffering.title}</span>
                <button type="button" className={styles.changeServiceBtn} onClick={() => setStep(1)}>変更</button>
              </div>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>日付 <span className={styles.required}>*</span></label>
                  <input type="date" value={startDate} min={today} max={maxDate}
                    onChange={e => setStartDate(e.target.value)} className={styles.fieldInput} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>開始時刻 <span className={styles.required}>*</span></label>
                  <input type="time" value={startTime} step="900"
                    onChange={e => setStartTime(e.target.value)} className={styles.fieldInput} required />
                </div>
              </div>
              <p className={styles.durationNote}>
                終了: {startDate && startTime
                  ? new Date(new Date(`${startDate}T${startTime}:00+09:00`).getTime() + selectedOffering.durationMinutes * 60000)
                      .toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' })
                  : '—'}（{selectedOffering.durationMinutes}分）
              </p>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>定員（1〜{selectedOffering.capacity}名）</label>
                <input type="number" min={1} max={selectedOffering.capacity} value={capacity}
                  onChange={e => setCapacity(Number(e.target.value))}
                  className={cx(styles.fieldInput, styles.fieldInputSm)} />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setStep(1)}>← 戻る</button>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? '作成中...' : '空き枠を追加する'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ── サービス作成・編集モーダル ────────────────────────────────────────────────
function OfferingFormModal({
  editing, onClose, onSaved,
}: {
  editing: OfferingResponse | null
  onClose: () => void
  onSaved: () => void
}) {
  const { showToast } = useToast()
  const isEdit = editing !== null

  const [title,       setTitle]       = useState(editing?.title           ?? '')
  const [description, setDescription] = useState(editing?.description     ?? '')
  const [delivery,    setDelivery]    = useState<'ONLINE' | 'IN_PERSON'>(editing?.deliveryMethod ?? 'ONLINE')
  const [duration,    setDuration]    = useState(editing?.durationMinutes ?? 60)
  const [tickets,     setTickets]     = useState(editing?.ticketsRequired  ?? 1)
  const [capacity,    setCapacity]    = useState(editing?.capacity         ?? 1)
  const [submitting,  setSubmitting]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { showToast('タイトルを入力してください', 'error'); return }
    setSubmitting(true)
    const payload = {
      title: title.trim(), description: description.trim() || null,
      deliveryMethod: delivery, durationMinutes: duration,
      ticketsRequired: tickets, capacity,
    }
    try {
      if (isEdit) {
        const { patch } = await import('@/api/httpClient')
        await patch(API_ENDPOINTS.OFFERING_BY_ID(editing!.id), payload)
        showToast('サービスを更新しました', 'success')
      } else {
        await post(API_ENDPOINTS.OFFERINGS, payload)
        showToast('サービスを作成しました', 'success')
      }
      onSaved()
    } catch (e) { showToast(extractMessage(e), 'error') }
    finally { setSubmitting(false) }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isEdit ? 'サービスを編集' : 'サービスを作成'}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>タイトル <span className={styles.required}>*</span></label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                maxLength={255} placeholder="例: 英語会話レッスン（初級）"
                className={styles.fieldInput} required />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>説明</label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
                placeholder="レッスンの概要・対象者・準備物など"
                className={styles.fieldTextarea} />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>提供形式</label>
              <div className={styles.radioGroup}>
                {(['ONLINE', 'IN_PERSON'] as const).map(v => (
                  <label key={v} className={styles.radioLabel}>
                    <input type="radio" value={v} checked={delivery === v}
                      onChange={() => setDelivery(v)} />
                    {v === 'ONLINE' ? '🌐 オンライン' : '📍 対面'}
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>時間</label>
                <select value={duration} onChange={e => setDuration(Number(e.target.value))}
                  className={styles.fieldInput}>
                  {[15,30,45,60,75,90,105,120].map(m => (
                    <option key={m} value={m}>{m}分</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>消費チケット数</label>
                <input type="number" min={1} value={tickets}
                  onChange={e => setTickets(Number(e.target.value))}
                  className={styles.fieldInput} />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>最大定員 (1〜15)</label>
                <input type="number" min={1} max={15} value={capacity}
                  onChange={e => setCapacity(Number(e.target.value))}
                  className={styles.fieldInput} />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>キャンセル</button>
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? '保存中...' : isEdit ? '更新する' : '作成する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}