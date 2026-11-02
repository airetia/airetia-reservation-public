// frontend/src/pages/member/OfferingSearchPage.tsx

/**
 * レッスン検索ページ（メンバー用）
 * → 05_frontend_specification.md §3.1 /member/offerings
 *
 * タブ構成:
 *   [レッスンを探す] フィルター・ソートでサービス一覧 → カードクリック → /member/offerings/:id
 *   [先生を探す]     プロバイダー一覧 → カードクリック → /providers/:id
 */

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOfferings } from '@/api/offeringApi'
import type { OfferingResponse } from '@/models/offering'
import styles from './OfferingSearchPage.module.css'

// ─── 型定義 ────────────────────────────────────────────────────────────────
type DeliveryFilter    = 'ONLINE' | 'IN_PERSON' | ''
type OfferingSortOrder = 'recommend' | 'newest' | 'tickets' | 'duration'
type OfferingWithScore = OfferingResponse & { recommendScore?: number }
type PageTab           = 'lesson' | 'teacher'

interface ProviderSummary {
  id:              number
  name:            string
  offeringCount:   number
  deliveryMethods: string[]
  maxScore:        number
}

// ─── ユーティリティ ──────────────────────────────────────────────────────────
function cx(...cls: (string | false | null | undefined)[]): string {
  return cls.filter(Boolean).join(' ')
}

// ─── 定数 ──────────────────────────────────────────────────────────────────
const SORT_LABELS: Record<OfferingSortOrder, string> = {
  recommend: 'おすすめ順',
  newest:    '新着順',
  tickets:   'チケット少ない順',
  duration:  '時間短い順',
}

const DURATION_OPTIONS: { label: string; value: string }[] = [
  { label: 'すべて',    value: '' },
  { label: '30分以内',  value: '30' },
  { label: '60分以内',  value: '60' },
  { label: '90分以内',  value: '90' },
  { label: '120分以内', value: '120' },
]

const TICKET_OPTIONS: { label: string; value: string }[] = [
  { label: '指定なし', value: '' },
  { label: '1枚',     value: '1' },
  { label: '2枚以内', value: '2' },
  { label: '3枚以内', value: '3' },
  { label: '5枚以内', value: '5' },
]

// ── カテゴリ（ジャンル）定義 ─────────────────────────────────────────────
// Offering.title / description のキーワードマッチで分類
const GENRE_OPTIONS: { label: string; value: string; keywords: string[] }[] = [
  { label: 'すべて',           value: '',         keywords: [] },
  { label: '📐 算数・数学',    value: 'math',     keywords: ['算数','数学','計算','math','理系','図形','数式'] },
  { label: '🔤 英語',          value: 'english',  keywords: ['英語','english','英会話','pronunciation','英文','リーディング','ライティング','TOEIC','TOEFL','英検'] },
  { label: '🌏 その他外国語', value: 'lang',      keywords: ['中国語','韓国語','フランス語','スペイン語','ドイツ語','語学','外国語'] },
  { label: '📖 国語・作文',    value: 'japanese', keywords: ['国語','作文','読書','漢字','文章','読解','小論文','文学'] },
  { label: '🔬 理科・科学',    value: 'science',  keywords: ['理科','科学','物理','化学','生物','実験','science','地学'] },
  { label: '🌍 社会・歴史',    value: 'social',   keywords: ['社会','歴史','地理','公民','地図','政治','経済'] },
  { label: '🎵 音楽',          value: 'music',    keywords: ['音楽','ピアノ','ギター','ドラム','バイオリン','歌','声楽','楽器','ソルフェージュ'] },
  { label: '🎨 アート・図工',  value: 'art',      keywords: ['絵','アート','工作','デザイン','図工','drawing','art','陶芸','書道'] },
  { label: '⚽ スポーツ',      value: 'sports',   keywords: ['体育','スポーツ','運動','水泳','サッカー','野球','体操','テニス','バスケ','武道'] },
  { label: '💻 プログラミング', value: 'coding',  keywords: ['プログラミング','coding','python','java','scratch','コード','ロボット','AI'] },
  { label: '🧠 受験・学習法',  value: 'exam',     keywords: ['受験','中学受験','高校受験','大学受験','入試','勉強法','学習法','塾'] },
  { label: '🧘 その他',        value: 'other',    keywords: [] },
]

// ── 対象年齢定義 ─────────────────────────────────────────────────────────
type AgeFilter = '' | 'preschool' | 'elementary_low' | 'elementary_high' | 'middle' | 'high' | 'adult'

const AGE_OPTIONS: { label: string; value: AgeFilter; keywords: string[] }[] = [
  { label: 'すべて',            value: '',               keywords: [] },
  { label: '🧒 未就学（〜6歳）', value: 'preschool',     keywords: ['幼児','未就学','保育','年長','年中','年少','幼稚園','保育園','0歳','1歳','2歳','3歳','4歳','5歳','6歳'] },
  { label: '🏫 小学校低学年',   value: 'elementary_low', keywords: ['小学生','低学年','1年','2年','3年','小1','小2','小3'] },
  { label: '🏫 小学校高学年',   value: 'elementary_high',keywords: ['小学生','高学年','4年','5年','6年','小4','小5','小6'] },
  { label: '🎒 中学生',         value: 'middle',         keywords: ['中学生','中学','中1','中2','中3'] },
  { label: '🎓 高校生',         value: 'high',           keywords: ['高校生','高校','高1','高2','高3'] },
  { label: '👨 大人・社会人',   value: 'adult',          keywords: ['大人','社会人','adult','シニア','主婦','資格','ビジネス'] },
]

function matchAge(o: OfferingWithScore, age: AgeFilter): boolean {
  if (!age) return true
  const opt = AGE_OPTIONS.find(a => a.value === age)
  if (!opt || opt.keywords.length === 0) return true
  const hay = `${o.title} ${o.description ?? ''}`.toLowerCase()
  return opt.keywords.some(kw => hay.includes(kw.toLowerCase()))
}

// ── 定員（個人/グループ）フィルター ────────────────────────────────────
type CapacityFilter = '' | 'individual' | 'small' | 'group'

const CAPACITY_OPTIONS: { label: string; value: CapacityFilter; min: number; max: number }[] = [
  { label: 'すべて',           value: '',           min: 0,  max: 999 },
  { label: '👤 個人（1名）',   value: 'individual', min: 1,  max: 1   },
  { label: '👥 少人数（2-4名）', value: 'small',    min: 2,  max: 4   },
  { label: '🏫 グループ（5名+）', value: 'group',   min: 5,  max: 999 },
]

/** カテゴリマッチング */
function matchGenre(o: OfferingWithScore, genre: string): boolean {
  if (!genre) return true
  const opt = GENRE_OPTIONS.find(g => g.value === genre)
  if (!opt || opt.keywords.length === 0) {
    // 'other': 他カテゴリにマッチしないもの
    return GENRE_OPTIONS.filter(g => g.value && g.value !== 'other' && g.keywords.length > 0)
      .every(g => !g.keywords.some(kw => matchKeyword(o, kw)))
  }
  return opt.keywords.some(kw => matchKeyword(o, kw))
}

function matchKeyword(o: OfferingWithScore, kw: string): boolean {
  const hay = `${o.title} ${o.description ?? ''}`.toLowerCase()
  return hay.includes(kw.toLowerCase())
}

function sortOfferings(list: OfferingWithScore[], order: OfferingSortOrder): OfferingWithScore[] {
  const copy = [...list]
  switch (order) {
    case 'recommend': return copy.sort((a, b) => (b.recommendScore ?? 0) - (a.recommendScore ?? 0))
    case 'newest':    return copy.sort((a, b) => b.id - a.id)
    case 'tickets':   return copy.sort((a, b) => a.ticketsRequired - b.ticketsRequired)
    case 'duration':  return copy.sort((a, b) => a.durationMinutes - b.durationMinutes)
    default:          return copy
  }
}

/** offerings リストからプロバイダー一覧を集計 */
function buildProviders(offerings: OfferingWithScore[]): ProviderSummary[] {
  const map = new Map<number, ProviderSummary>()
  for (const o of offerings) {
    if (!o.providerId) continue
    const existing = map.get(o.providerId)
    if (existing) {
      existing.offeringCount++
      if (!existing.deliveryMethods.includes(o.deliveryMethod)) {
        existing.deliveryMethods.push(o.deliveryMethod)
      }
      if ((o.recommendScore ?? 0) > existing.maxScore) {
        existing.maxScore = o.recommendScore ?? 0
      }
    } else {
      map.set(o.providerId, {
        id:              o.providerId,
        name:            o.providerName ?? '先生',
        offeringCount:   1,
        deliveryMethods: [o.deliveryMethod],
        maxScore:        o.recommendScore ?? 0,
      })
    }
  }
  // おすすめスコア降順で返す
  return [...map.values()].sort((a, b) => b.maxScore - a.maxScore)
}

// ─── コンポーネント ──────────────────────────────────────────────────────────
export function OfferingSearchPage() {
  const navigate = useNavigate()

  const [offerings, setOfferings] = useState<OfferingWithScore[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<PageTab>('lesson')

  // フィルター状態
  const [keyword,        setKeyword]        = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryFilter>('')
  const [maxDuration,    setMaxDuration]    = useState('')
  const [maxTickets,     setMaxTickets]     = useState('')
  const [sortOrder,      setSortOrder]      = useState<OfferingSortOrder>('recommend')

  // ジャンル・定員・年齢フィルター
  const [genre,    setGenre]    = useState('')
  const [capacity, setCapacity] = useState<CapacityFilter>('')
  const [ageFilter, setAgeFilter] = useState<AgeFilter>('')

  // 先生検索キーワード + バッジフィルター
  const [teacherKeyword,  setTeacherKeyword]  = useState('')
  const [teacherDelivery, setTeacherDelivery] = useState<DeliveryFilter>('')
  const [teacherGenre,    setTeacherGenre]    = useState('')

  const activeFilterCount = [
    keyword !== '',
    deliveryMethod !== '',
    maxDuration !== '',
    maxTickets !== '',
    genre !== '',
    capacity !== '',
    ageFilter !== '',
  ].filter(Boolean).length

  const resetFilters = useCallback(() => {
    setKeyword('')
    setDeliveryMethod('')
    setMaxDuration('')
    setMaxTickets('')
    setGenre('')
    setCapacity('')
    setAgeFilter('')
  }, [])

  // データ取得
  useEffect(() => {
    let cancelled = false
    getOfferings()
      .then(offs => { if (!cancelled) setOfferings(offs as OfferingWithScore[]) })
      .catch(() => { if (!cancelled) setError('データの取得に失敗しました') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // レッスン一覧フィルタリング
  const filteredOfferings = useMemo(() => {
    const capOpt = CAPACITY_OPTIONS.find(c => c.value === capacity)
    const filtered = offerings.filter(o => {
      if (deliveryMethod && o.deliveryMethod !== deliveryMethod) return false
      if (maxDuration && o.durationMinutes > Number(maxDuration))  return false
      if (maxTickets  && o.ticketsRequired > Number(maxTickets))   return false
      if (genre && !matchGenre(o, genre)) return false
      if (ageFilter && !matchAge(o, ageFilter)) return false
      if (capacity && capOpt) {
        if (o.capacity < capOpt.min || o.capacity > capOpt.max) return false
      }
      if (keyword) {
        const kw = keyword.toLowerCase()
        if (
          !o.title.toLowerCase().includes(kw) &&
          !(o.providerName ?? '').toLowerCase().includes(kw) &&
          !(o.description  ?? '').toLowerCase().includes(kw)
        ) return false
      }
      return true
    })
    return sortOfferings(filtered, sortOrder)
  }, [offerings, keyword, deliveryMethod, maxDuration, maxTickets, genre, ageFilter, capacity, sortOrder])

  // 先生一覧（全offerings からプロバイダー集計）
  const filteredProviders = useMemo(() => {
    // 先生フィルタ: ジャンルフィルタを先にofferingsに適用してからプロバイダー集計
    const baseOfferings = teacherGenre
      ? offerings.filter(o => matchGenre(o, teacherGenre))
      : offerings
    const all = buildProviders(baseOfferings)
    return all.filter(p => {
      if (teacherKeyword.trim()) {
        const kw = teacherKeyword.toLowerCase()
        if (!p.name.toLowerCase().includes(kw)) return false
      }
      if (teacherDelivery && !p.deliveryMethods.includes(teacherDelivery)) return false
      return true
    })
  }, [offerings, teacherKeyword, teacherDelivery, teacherGenre])

  if (error) return <div className={styles.centered}><p className={styles.errorMsg}>{error}</p></div>

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>サービスを探す</h1>

      {/* ── タブ ── */}
      <div className={styles.tabRow}>
        <button
          type="button"
          className={cx(styles.tab, activeTab === 'lesson' && styles.tabActive)}
          onClick={() => setActiveTab('lesson')}
        >
          📚 レッスンを探す
        </button>
        <button
          type="button"
          className={cx(styles.tab, activeTab === 'teacher' && styles.tabActive)}
          onClick={() => setActiveTab('teacher')}
        >
          👩‍🏫 先生を探す
        </button>
      </div>

      {/* ════════════════════════════════
          レッスンを探すタブ
          ════════════════════════════════ */}
      {activeTab === 'lesson' && (
        <>
          {/* フィルターパネル */}
          <div className={styles.filterPanel}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>キーワード</span>
              <div className={styles.keywordWrap}>
                <input
                  type="search"
                  placeholder="サービス名・先生名で検索"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  className={styles.keywordInput}
                />
                {keyword && (
                  <button type="button" className={styles.clearBtn}
                    onClick={() => setKeyword('')}>✕</button>
                )}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>形態</span>
              <div className={styles.pills}>
                {(['', 'ONLINE', 'IN_PERSON'] as DeliveryFilter[]).map(v => (
                  <button type="button" key={v}
                    className={cx(styles.pill, deliveryMethod === v ? styles.pillActive : null)}
                    onClick={() => setDeliveryMethod(v)}>
                    {v === '' ? 'すべて' : v === 'ONLINE' ? '💻 オンライン' : '🏠 対面'}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>時間</span>
              <div className={styles.pills}>
                {DURATION_OPTIONS.map(opt => (
                  <button type="button" key={opt.value}
                    className={cx(styles.pill, maxDuration === opt.value ? styles.pillActive : null)}
                    onClick={() => setMaxDuration(opt.value)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>🎫 チケット</span>
              <div className={styles.pills}>
                {TICKET_OPTIONS.map(opt => (
                  <button type="button" key={opt.value}
                    className={cx(styles.pill, maxTickets === opt.value ? styles.pillActive : null)}
                    onClick={() => setMaxTickets(opt.value)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>📚 ジャンル</span>
              <div className={styles.pills}>
                {GENRE_OPTIONS.map(opt => (
                  <button type="button" key={opt.value}
                    className={cx(styles.pill, genre === opt.value ? styles.pillActive : null)}
                    onClick={() => setGenre(opt.value)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>🎂 対象年齢</span>
              <div className={styles.pills}>
                {AGE_OPTIONS.map(opt => (
                  <button type="button" key={opt.value}
                    className={cx(styles.pill, ageFilter === opt.value ? styles.pillActive : null)}
                    onClick={() => setAgeFilter(opt.value)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>👥 定員・形態</span>
              <div className={styles.pills}>
                {CAPACITY_OPTIONS.map(opt => (
                  <button type="button" key={opt.value}
                    className={cx(styles.pill, capacity === opt.value ? styles.pillActive : null)}
                    onClick={() => setCapacity(opt.value)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterFooter}>
              <div className={styles.filterMeta}>
                <span className={styles.resultCount}>
                  {loading ? '読み込み中...' : `${filteredOfferings.length}件のレッスン`}
                </span>
                {activeFilterCount > 0 && (
                  <button type="button" className={styles.resetBtn} onClick={resetFilters}>
                    フィルターをリセット ({activeFilterCount})
                  </button>
                )}
              </div>
              <div className={styles.sortWrap}>
                <span className={styles.sortLabel}>並び替え</span>
                <select value={sortOrder}
                  onChange={e => setSortOrder(e.target.value as OfferingSortOrder)}
                  className={styles.sortSelect}>
                  {(Object.keys(SORT_LABELS) as OfferingSortOrder[]).map(key => (
                    <option key={key} value={key}>{SORT_LABELS[key]}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* サービス一覧 */}
          {loading ? (
            <div className={styles.skeletonGrid}>
              {[...Array(6)].map((_, i) => <div key={i} className={styles.skeletonCard} />)}
            </div>
          ) : filteredOfferings.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>条件に合うサービスが見つかりません</p>
              <button type="button" className={styles.resetBtn} onClick={resetFilters}>
                フィルターをリセット
              </button>
            </div>
          ) : (
            <div className={styles.offeringGrid}>
              {filteredOfferings.map(o => (
                <button type="button" key={o.id}
                  className={styles.offeringCard}
                  onClick={() => navigate(`/member/offerings/${o.id}`)}>
                  {(o.recommendScore ?? 0) > 0 && (
                    <div className={styles.scoreBar}>
                      <div className={styles.scoreBarFill}
                        style={{ width: `${Math.round((o.recommendScore ?? 0) * 100)}%` }} />
                    </div>
                  )}
                  <div className={styles.cardBody}>
                    <div className={styles.metaRow}>
                      <span className={styles.metaMethod}>
                        {o.deliveryMethod === 'ONLINE' ? '🌐 オンライン' : '📍 対面'}
                      </span>
                      <span className={styles.metaDuration}>{o.durationMinutes}分</span>
                      <span className={styles.metaTicket}>🎫 {o.ticketsRequired}枚</span>
                    </div>
                    <h3 className={styles.offeringTitle}>{o.title}</h3>
                    <p className={styles.providerName}>{o.providerName} 先生</p>
                    {o.description && <p className={styles.desc}>{o.description}</p>}
                    <span className={styles.detailCta}>詳細・予約 →</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════
          先生を探すタブ
          ════════════════════════════════ */}
      {activeTab === 'teacher' && (
        <>
          {/* 先生検索 */}
          <div className={styles.filterPanel}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>キーワード</span>
              <div className={styles.keywordWrap}>
                <input
                  type="search"
                  placeholder="先生の名前で検索"
                  value={teacherKeyword}
                  onChange={e => setTeacherKeyword(e.target.value)}
                  className={styles.keywordInput}
                />
                {teacherKeyword && (
                  <button type="button" className={styles.clearBtn}
                    onClick={() => setTeacherKeyword('')}>✕</button>
                )}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>形態</span>
              <div className={styles.pills}>
                {(['', 'ONLINE', 'IN_PERSON'] as DeliveryFilter[]).map(v => (
                  <button type="button" key={v}
                    className={cx(styles.pill, teacherDelivery === v ? styles.pillActive : null)}
                    onClick={() => setTeacherDelivery(v)}>
                    {v === '' ? 'すべて' : v === 'ONLINE' ? '💻 オンライン' : '🏠 対面'}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>📚 ジャンル</span>
              <div className={styles.pills}>
                {GENRE_OPTIONS.map(opt => (
                  <button type="button" key={opt.value}
                    className={cx(styles.pill, teacherGenre === opt.value ? styles.pillActive : null)}
                    onClick={() => setTeacherGenre(opt.value)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterFooter}>
              <span className={styles.resultCount}>
                {loading ? '読み込み中...' : `${filteredProviders.length}人の先生`}
              </span>
              {(teacherKeyword || teacherDelivery || teacherGenre) && (
                <button type="button" className={styles.resetBtn}
                  onClick={() => { setTeacherKeyword(''); setTeacherDelivery(''); setTeacherGenre('') }}>
                  リセット
                </button>
              )}
            </div>
          </div>

          {/* 先生一覧 */}
          {loading ? (
            <div className={styles.skeletonGrid}>
              {[...Array(4)].map((_, i) => <div key={i} className={styles.skeletonCard} />)}
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>先生が見つかりません</p>
            </div>
          ) : (
            <div className={styles.providerGrid}>
              {filteredProviders.map(p => (
                <button type="button" key={p.id}
                  className={styles.providerCard}
                  onClick={() => navigate(`/providers/${p.id}`)}>
                  <div className={styles.providerAvatar}>
                    {p.name.charAt(0)}
                  </div>
                  <div className={styles.providerCardBody}>
                    <h3 className={styles.providerCardName}>{p.name} 先生</h3>
                    <div className={styles.providerCardMeta}>
                      <span className={styles.providerOfferingCount}>
                        📚 {p.offeringCount}件のレッスン
                      </span>
                      <div className={styles.providerMethods}>
                        {p.deliveryMethods.map(m => (
                          <span key={m} className={styles.methodTag}>
                            {m === 'ONLINE' ? '💻 オンライン' : '🏠 対面'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className={styles.detailCta}>プロフィールを見る →</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}