// frontend/src/pages/member/OfferingDetailPage.tsx
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { get, post } from '@/api/httpClient'
import { API_ENDPOINTS, ROUTES } from '@/config/constants'
import { formatJST } from '@/utils/date'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/contexts/ToastProvider'
import type { OfferingResponse } from '@/models/offering'
import type { AvailabilityResponse } from '@/models/availability'
import type { ParticipantListItem } from '@/models/participant'
import styles from './OfferingDetailPage.module.css'

/**
 * サービス詳細ページ（メンバー用）
 * URL: /member/offerings/:id
 * → 05_frontend_specification.md §3.1 メンバーページ
 * → 02_business_rules.md §2 予約ルール
 *
 * フロー: サービス詳細 → カレンダー(◎△×) → タイムテーブル → 参加者 → 送信
 *
 * 修正:
 *   - カレンダー: 月単位で全空き枠を事前取得し ◎△× で表示
 *   - 時間選択: タイムテーブル式（ボタングリッド）
 *   - モバイル: サイドバーをアコーディオンで先頭に移動
 */
export function OfferingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { member } = useAuth()
  const { showToast } = useToast()

  const [offering,      setOffering]      = useState<OfferingResponse | null>(null)
  const [participants,  setParticipants]  = useState<ParticipantListItem[]>([])
  // 月単位の全空き枠（カレンダー marks 用）
  const [monthAvails,   setMonthAvails]   = useState<AvailabilityResponse[]>([])
  // 選択日の空き枠（タイムテーブル用）
  const [dayAvails,     setDayAvails]     = useState<AvailabilityResponse[]>([])
  const [loading,       setLoading]       = useState(true)
  const [avLoading,     setAvLoading]     = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [sidebarOpen,   setSidebarOpen]   = useState(false)

  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [selectedDate,          setSelectedDate]          = useState('')
  const [selectedAvail,         setSelectedAvail]         = useState<AvailabilityResponse | null>(null)
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | ''>('')
  const [submitting,            setSubmitting]            = useState(false)
  const [booked,                setBooked]                = useState(false)
  const [showRequestForm,       setShowRequestForm]       = useState(false)
  const [requestMessage,        setRequestMessage]        = useState('')
  const [requestSubmitting,     setRequestSubmitting]     = useState(false)

  // ── 初期ロード ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      get(API_ENDPOINTS.OFFERING_BY_ID(Number(id))),
      get(API_ENDPOINTS.PARTICIPANTS),
    ])
      .then(([offRes, partRes]) => {
        setOffering(offRes.data?.data ?? null)
        setParticipants(Array.isArray(partRes.data?.data) ? partRes.data.data : [])
      })
      .catch(() => setError('サービス情報の取得に失敗しました'))
      .finally(() => setLoading(false))
  }, [id])

  // ── 月が変わったら全空き枠取得（カレンダー marks 用）──────────────────
  useEffect(() => {
    if (!id) return
    get(API_ENDPOINTS.AVAILABILITIES, { params: { offeringId: Number(id) } })
      .then(res => setMonthAvails(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => {/* カレンダーマーク取得失敗は無視 */})
  }, [id, calMonth])

  // ── 日付選択時に当日の空き枠フィルタ ──────────────────────────────────
  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date)
    setSelectedAvail(null)
    setAvLoading(true)
    // 月ロード済みデータからフィルタ（APIコール削減）
    const filtered = monthAvails.filter(a => toJSTDate(a.startDatetime) === date)
    setDayAvails(filtered)
    setAvLoading(false)
    // フォールバック: 月データにない場合はAPIから取得
    if (filtered.length === 0) {
      get(API_ENDPOINTS.AVAILABILITIES, { params: { offeringId: Number(id), date } })
        .then(res => {
          const data = Array.isArray(res.data?.data) ? res.data.data : []
          setDayAvails(data)
        })
        .catch(() => showToast('空き枠の取得に失敗しました', 'error'))
        .finally(() => setAvLoading(false))
    } else {
      setAvLoading(false)
    }
  }, [id, monthAvails, showToast])

  // ── カレンダー各日のマーク計算 ◎△× ─────────────────────────────────
  const dayMarkMap = useMemo(() => {
    const map = new Map<string, '◎' | '△' | '×'>()
    const byDate = new Map<string, AvailabilityResponse[]>()
    monthAvails.forEach(a => {
      const d = toJSTDate(a.startDatetime)
      if (!byDate.has(d)) byDate.set(d, [])
      byDate.get(d)!.push(a)
    })
    byDate.forEach((slots, date) => {
      const bookable = slots.filter(s => s.bookable && (s.remainingSlots ?? 0) > 0)
      if (bookable.length === 0) {
        map.set(date, '×')
      } else {
        const totalRemaining = bookable.reduce((sum, s) => sum + (s.remainingSlots ?? 0), 0)
        const totalCapacity  = bookable.reduce((sum, s) => sum + s.capacity, 0)
        map.set(date, totalRemaining / totalCapacity >= 0.5 ? '◎' : '△')
      }
    })
    return map
  }, [monthAvails])

  // ── 予約リクエスト送信 ─────────────────────────────────────────────────
  const handleBook = async () => {
    if (!selectedAvail || !selectedParticipantId) return
    setSubmitting(true)
    try {
      await post(API_ENDPOINTS.BOOKINGS, {
        availabilityId: selectedAvail.id,
        participantId:  selectedParticipantId,
      })
      setBooked(true)
      showToast('予約リクエストを送信しました', 'success')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      showToast(msg ?? '予約リクエストに失敗しました', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ── 希望日程なしリクエスト送信 ─────────────────────────────────────────
  const handleRequest = async () => {
    if (!requestMessage.trim()) return
    setRequestSubmitting(true)
    try {
      // 問い合わせAPIを使用（認証済みのため名前・メールは member から取得）
      await post(API_ENDPOINTS.INQUIRIES, {
        email:   member?.email ?? '',
        name:    member ? `${member.lastName} ${member.firstName}` : undefined,
        subject: `【日程リクエスト】${offering?.title ?? 'レッスン'}`,
        body:    requestMessage.trim(),
      })
      setShowRequestForm(false)
      setRequestMessage('')
      showToast('日程リクエストを送信しました。先生からの連絡をお待ちください。', 'success')
    } catch {
      showToast('送信に失敗しました。もう一度お試しください。', 'error')
    } finally {
      setRequestSubmitting(false)
    }
  }

  const calendarDays = buildCalendarDays(calMonth)
  const prevMonth = () => setCalMonth(shiftMonth(calMonth, -1))
  const nextMonth = () => setCalMonth(shiftMonth(calMonth, +1))

  if (loading) return <div className={styles.centered}>読み込み中...</div>
  if (error || !offering) return (
    <div className={styles.centered}>
      <p className={styles.errorMsg}>{error ?? 'サービスが見つかりません'}</p>
      <button type="button" className={styles.backLink}
        onClick={() => navigate(ROUTES.OFFERINGS_SEARCH)}>← 検索に戻る</button>
    </div>
  )

  if (booked) return (
    <div className={styles.centeredCard}>
      <div className={styles.successIcon}>✓</div>
      <h2 className={styles.successTitle}>予約リクエストを送信しました</h2>
      <p className={styles.successSub}>
        先生が確認後に確定するとメールでお知らせします。<br />
        予約状況は「予約一覧」からご確認いただけます。
      </p>
      <div className={styles.successActions}>
        <button type="button" className={styles.btnPrimary}
          onClick={() => navigate(ROUTES.BOOKINGS)}>予約一覧へ</button>
        <button type="button" className={styles.btnSecondary}
          onClick={() => { setBooked(false); setSelectedDate(''); setSelectedAvail(null) }}>
          同じ先生で別の日を予約
        </button>
      </div>
    </div>
  )

  const canBook = !!selectedAvail && !!selectedParticipantId
  const activeParticipants = participants.filter(p => p.active)

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to={ROUTES.OFFERINGS_SEARCH}>レッスンを探す</Link>
        <span className={styles.sep}>›</span>
        <span>{offering.title}</span>
      </nav>

      {/* モバイル: 先生情報アコーディオン */}
      <div className={styles.mobileSidebar}>
        <button
          type="button"
          className={styles.mobileSidebarToggle}
          onClick={() => setSidebarOpen(v => !v)}
        >
          <span className={styles.providerAvatarSm}>{offering.providerName.charAt(0)}</span>
          <span className={styles.mobileSidebarLabel}>{offering.providerName} 先生</span>
          <span className={styles.mobileSidebarChevron}>{sidebarOpen ? '▲' : '▼'}</span>
        </button>
        {sidebarOpen && (
          <div className={styles.mobileSidebarContent}>
            <SidebarContent offering={offering} />
          </div>
        )}
      </div>

      <div className={styles.layout}>
        {/* ════ 左：予約フロー ════ */}
        <main className={styles.main}>
          <section className={styles.serviceHeader}>
            <div className={styles.badges}>
              <span className={styles.badgeMethod}>
                {offering.deliveryMethod === 'ONLINE' ? '🌐 オンライン' : '📍 対面'}
              </span>
              <span className={styles.badgeDuration}>{offering.durationMinutes}分</span>
              <span className={styles.badgeTicket}>🎫 {offering.ticketsRequired}枚</span>
            </div>
            <h1 className={styles.title}>{offering.title}</h1>
            {offering.description && (
              <p className={styles.description}>{offering.description}</p>
            )}
          </section>

          {/* STEP 1: 日程カレンダー */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.step}>1</span> 日程を選ぶ
            </h2>
            <div className={styles.calLegend}>
              <span className={styles.legendItem}><span className={styles.markCircle}>◎</span> 空きあり</span>
              <span className={styles.legendItem}><span className={styles.markTriangle}>△</span> 残りわずか</span>
              <span className={styles.legendItem}><span className={styles.markCross}>×</span> 空きなし</span>
            </div>
            <div className={styles.calendar}>
              <div className={styles.calHeader}>
                <button type="button" className={styles.calNav} onClick={prevMonth}>‹</button>
                <span className={styles.calMonth}>{calMonth.replace('-', '年')}月</span>
                <button type="button" className={styles.calNav} onClick={nextMonth}>›</button>
              </div>
              <div className={styles.calGrid}>
                {['日','月','火','水','木','金','土'].map(d => (
                  <div key={d} className={styles.calDow}>{d}</div>
                ))}
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={i} className={styles.calEmpty} />
                  const isPast     = day < new Date().toISOString().slice(0, 10)
                  const isSelected = day === selectedDate
                  const mark       = dayMarkMap.get(day)
                  const unavailable = isPast || mark === '×' || !mark
                  return (
                    <button key={day} type="button"
                      disabled={unavailable}
                      className={[
                        styles.calDay,
                        isPast          ? styles.calDayPast     : '',
                        mark === '◎'   ? styles.calDayCircle        : '',
                        mark === '△'   ? styles.calDayTriangle        : '',
                        mark === '×'   ? styles.calDayCross        : '',
                        !mark && !isPast ? styles.calDayNoSlot  : '',
                        isSelected      ? styles.calDaySelected : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => handleDateSelect(day)}
                    >
                      <span className={styles.calDayNum}>{day.slice(8)}</span>
                      {mark && <span className={styles.calMark}>{mark}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* 希望日程なしリクエスト */}
          {!selectedDate && (
            <section className={styles.requestSection}>
              <p className={styles.requestPrompt}>
                希望の日時がありませんか？
              </p>
              {!showRequestForm ? (
                <button
                  type="button"
                  className={styles.requestToggleBtn}
                  onClick={() => setShowRequestForm(true)}
                >
                  📩 日程をリクエストする
                </button>
              ) : (
                <div className={styles.requestForm}>
                  <p className={styles.requestFormNote}>
                    希望の日時・曜日・時間帯などをお知らせください。先生が確認してご連絡します。
                  </p>
                  <textarea
                    className={styles.requestTextarea}
                    rows={4}
                    maxLength={500}
                    placeholder="例：平日の夕方17〜19時、または土曜日の午前中が希望です。"
                    value={requestMessage}
                    onChange={e => setRequestMessage(e.target.value)}
                  />
                  <span className={styles.requestCharCount}>{requestMessage.length}/500</span>
                  <div className={styles.requestFormActions}>
                    <button type="button" className={styles.requestCancelBtn}
                      onClick={() => { setShowRequestForm(false); setRequestMessage('') }}>
                      キャンセル
                    </button>
                    <button
                      type="button"
                      className={styles.requestSubmitBtn}
                      disabled={!requestMessage.trim() || requestSubmitting}
                      onClick={handleRequest}
                    >
                      {requestSubmitting ? '送信中...' : 'リクエストを送る'}
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* STEP 2: タイムテーブル */}
          {selectedDate && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.step}>2</span>
                時間を選ぶ
                <span className={styles.sectionSub}>{selectedDate.replace(/-/g, '/')}</span>
              </h2>
              {avLoading ? (
                <p className={styles.hint}>空き枠を確認中...</p>
              ) : dayAvails.length === 0 ? (
                <p className={styles.hint}>この日に利用可能な枠がありません</p>
              ) : (
                <div className={styles.timetable}>
                  {dayAvails.map(av => {
                    const remaining  = av.remainingSlots ?? 0
                    const full       = remaining === 0 || !av.bookable
                    const isSelected = selectedAvail?.id === av.id
                    const slotMark   = !av.bookable ? null : full ? '×' : remaining / av.capacity >= 0.5 ? '◎' : '△'
                    return (
                      <button key={av.id} type="button"
                        disabled={full}
                        className={[
                          styles.timetableSlot,
                          full       ? styles.slotFull     : '',
                          isSelected ? styles.slotSelected : '',
                          slotMark === '◎' ? styles.slotCircle : '',
                          slotMark === '△' ? styles.slotTriangle : '',
                        ].filter(Boolean).join(' ')}
                        onClick={() => setSelectedAvail(isSelected ? null : av)}
                      >
                        <span className={styles.slotTime}>
                          {toJSTTime(av.startDatetime)} 〜 {toJSTTime(av.endDatetime)}
                        </span>
                        <span className={styles.slotMarkLabel}>
                          {full ? '×' : slotMark}
                        </span>
                        {!full && (
                          <span className={styles.slotRemaining}>残{remaining}枠</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {/* STEP 3: 参加者選択 */}
          {selectedAvail && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.step}>3</span> 参加者を選ぶ
              </h2>
              {activeParticipants.length === 0 ? (
                <div className={styles.noParticipant}>
                  <p>利用者が登録されていません。</p>
                  <Link to={ROUTES.PARTICIPANTS} className={styles.linkBtn}>
                    利用者を登録する
                  </Link>
                </div>
              ) : (
                <div className={styles.participantList}>
                  {activeParticipants.map(p => (
                    <button key={p.id} type="button"
                      className={[
                        styles.participantCard,
                        selectedParticipantId === p.id ? styles.participantSelected : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => setSelectedParticipantId(
                        selectedParticipantId === p.id ? '' : p.id
                      )}
                    >
                      <span className={styles.participantName}>{p.lastName} {p.firstName}</span>
                      {p.hasActivePenalty && (
                        <span className={styles.penaltyBadge}>要注意</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* STEP 4: 確認・送信 */}
          {selectedAvail && selectedParticipantId && (() => {
            const p = activeParticipants.find(x => x.id === selectedParticipantId)
            return (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.step}>4</span> 予約内容を確認
                </h2>
                <div className={styles.confirmCard}>
                  <dl className={styles.confirmList}>
                    <dt>サービス</dt><dd>{offering.title}</dd>
                    <dt>先生</dt><dd>{offering.providerName}</dd>
                    <dt>日時</dt>
                    <dd>
                      {formatJST(selectedAvail.startDatetime)} 〜 {toJSTTime(selectedAvail.endDatetime)}
                    </dd>
                    <dt>参加者</dt><dd>{p?.lastName} {p?.firstName}</dd>
                    <dt>消費チケット</dt>
                    <dd className={styles.confirmTicket}>🎫 {offering.ticketsRequired}枚</dd>
                  </dl>
                  <p className={styles.confirmNote}>
                    ※ 予約は先生の承認後に確定します。チケットは確定時に消費されます。
                  </p>
                  <button type="button" className={styles.bookBtn}
                    disabled={!canBook || submitting} onClick={handleBook}>
                    {submitting ? '送信中...' : '予約リクエストを送る'}
                  </button>
                </div>
              </section>
            )
          })()}
        </main>

        {/* ════ 右：先生プロフィール（PC表示） ════ */}
        <aside className={styles.sidebar}>
          <SidebarContent offering={offering} />
        </aside>
      </div>
    </div>
  )
}

// ── サイドバーコンテンツ（モバイル/PC共通）──────────────────────────────────
function SidebarContent({ offering }: { offering: OfferingResponse }) {
  return (
    <>
      <div className={styles.providerCard}>
        <div className={styles.providerAvatar}>{offering.providerName.charAt(0)}</div>
        <h3 className={styles.providerName}>{offering.providerName} 先生</h3>

        {offering.recommendScore > 0 && (
          <div className={styles.scoreBar}>
            <span className={styles.scoreLabel}>おすすめ度</span>
            <div className={styles.scoreFill}>
              <div className={styles.scoreFillInner}
                style={{ width: `${Math.round(offering.recommendScore * 100)}%` }} />
            </div>
            <span className={styles.scoreVal}>{Math.round(offering.recommendScore * 100)}</span>
          </div>
        )}

        {offering.providerAppealPoint && (
          <p className={styles.appealPoint}>{offering.providerAppealPoint}</p>
        )}
        {offering.providerBio && <p className={styles.bio}>{offering.providerBio}</p>}

        {(offering.providerQualifications?.length ?? 0) > 0 && (
          <div className={styles.providerSection}>
            <h4 className={styles.providerSectionTitle}>保有資格</h4>
            <ul className={styles.tagList}>
              {offering.providerQualifications!.map((q, i) => (
                <li key={i} className={styles.tag}>{q}</li>
              ))}
            </ul>
          </div>
        )}

        {(offering.providerAchievements?.length ?? 0) > 0 && (
          <div className={styles.providerSection}>
            <h4 className={styles.providerSectionTitle}>実績・賞歴</h4>
            <ul className={styles.tagList}>
              {offering.providerAchievements!.map((a, i) => (
                <li key={i} className={styles.tagAchieve}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        {(offering.providerHighSchool || offering.providerUniversity) && (
          <div className={styles.providerSection}>
            <h4 className={styles.providerSectionTitle}>学歴</h4>
            {offering.providerUniversity && <p className={styles.school}>🎓 {offering.providerUniversity}</p>}
            {offering.providerHighSchool && <p className={styles.school}>🏫 {offering.providerHighSchool}</p>}
          </div>
        )}

        <Link to={`/providers/${offering.providerId}`} className={styles.providerLink}>
          先生のプロフィールを見る →
        </Link>
      </div>

      <div className={styles.infoCard}>
        <h4 className={styles.infoTitle}>レッスン情報</h4>
        <dl className={styles.infoList}>
          <dt>受講形式</dt><dd>{offering.deliveryMethod === 'ONLINE' ? 'オンライン' : '対面'}</dd>
          <dt>時間</dt><dd>{offering.durationMinutes}分</dd>
          <dt>消費チケット</dt><dd>{offering.ticketsRequired}枚</dd>
          <dt>定員</dt><dd>{offering.capacity}名</dd>
        </dl>
      </div>
    </>
  )
}

// ── ユーティリティ ────────────────────────────────────────────────────────────

function toJSTDate(utc: string): string {
  const jst = new Date(new Date(utc).getTime() + 9 * 60 * 60 * 1000)
  return jst.toISOString().slice(0, 10)
}

function toJSTTime(utc: string): string {
  return new Date(utc).toLocaleTimeString('ja-JP', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo'
  })
}

function buildCalendarDays(calMonth: string): (string | null)[] {
  const [y, m] = calMonth.split('-').map(Number)
  const firstDow = new Date(y, m - 1, 1).getDay()
  const daysInMonth = new Date(y, m, 0).getDate()
  const days: (string | null)[] = Array(firstDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(`${calMonth}-${String(d).padStart(2, '0')}`)
  }
  return days
}

function shiftMonth(calMonth: string, delta: number): string {
  const [y, m] = calMonth.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}