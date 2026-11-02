// frontend/src/pages/admin/AdminMembersPage.tsx
import { useEffect, useState, useCallback } from 'react'
import { get, patch, del, post } from '@/api/httpClient'
import { API_ENDPOINTS } from '@/config/constants'
import { formatJST } from '@/utils/date'
import { useToast } from '@/contexts/ToastProvider'
import type { Member } from '@/models/member'
import type { PenaltyResponse } from '@/models/penalty'
import styles from './AdminMembersPage.module.css'

/**
 * メンバー管理ページ（管理者用）
 * → 05_frontend_specification.md §3.1 /admin/members
 * → 03_common_specification.md §5 管理者専用
 * → 02_business_rules.md §4 ペナルティルール / §7 権限・認可ルール
 *
 * 機能: 一覧検索・詳細表示・停止/解除/削除・ペナルティ管理・チケット付与
 */

// ─── 型定義 ────────────────────────────────────────────────────────────────
type RoleFilter   = 'ALL' | 'MEMBER' | 'ADMIN'
type StatusFilter = 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'DELETED'

// ─── ユーティリティ ──────────────────────────────────────────────────────────
function cx(...cls: (string | false | null | undefined)[]): string {
  return cls.filter(Boolean).join(' ')
}

function extractMessage(err: unknown): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message
    ?? 'エラーが発生しました'
}

// ─── コンポーネント ──────────────────────────────────────────────────────────
export function AdminMembersPage() {
  const { showToast } = useToast()

  // データ
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  // フィルター
  const [search,       setSearch]       = useState('')
  const [roleFilter,   setRoleFilter]   = useState<RoleFilter>('ALL')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  // モーダル: メンバー詳細
  const [detailMember, setDetailMember] = useState<Member | null>(null)

  // モーダル: ペナルティ
  const [penaltyMember,  setPenaltyMember]  = useState<Member | null>(null)
  const [penalties,      setPenalties]      = useState<PenaltyResponse[]>([])
  const [penaltyLoading, setPenaltyLoading] = useState(false)

  // モーダル: チケット付与
  const [grantMember,  setGrantMember]  = useState<Member | null>(null)
  const [grantQty,     setGrantQty]     = useState('1')
  const [grantExpiry,  setGrantExpiry]  = useState(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 1)
    return d.toISOString().slice(0, 10)
  })
  const [grantLoading, setGrantLoading] = useState(false)

  // ── データ取得 ─────────────────────────────────────────────────────────
  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    get(API_ENDPOINTS.ADMIN_MEMBERS)
      .then(res => {
        setMembers(Array.isArray(res.data?.data) ? res.data.data : [])
        setError(null)
      })
      .catch(() => {
        if (silent) showToast('メンバー一覧の更新に失敗しました', 'error')
        else setError('メンバー情報の取得に失敗しました')
      })
      .finally(() => { if (!silent) setLoading(false) })
  }, [showToast])

  useEffect(load, [load])

  // ── フィルタリング ─────────────────────────────────────────────────────
  const filtered = members.filter(m => {
    if (roleFilter !== 'ALL' && m.role !== roleFilter) return false
    if (statusFilter === 'ACTIVE'    && (!m.isActive || m.isLocked)) return false
    if (statusFilter === 'SUSPENDED' && !(m.isActive && m.isLocked)) return false
    if (statusFilter === 'DELETED'   && m.isActive)                  return false
    if (search) {
      const kw = search.toLowerCase()
      if (!`${m.lastName} ${m.firstName} ${m.email}`.toLowerCase().includes(kw)) return false
    }
    return true
  })

  // ── メンバー操作 ───────────────────────────────────────────────────────
  const handleSuspend = async (m: Member) => {
    const daysStr = prompt(
      `「${m.lastName} ${m.firstName}」を停止します。\n停止日数を入力（デフォルト: 7日）:`, '7'
    )
    if (daysStr === null) return
    const days = parseInt(daysStr, 10)
    if (isNaN(days) || days <= 0) { showToast('有効な日数を入力してください', 'error'); return }
    try {
      await patch(API_ENDPOINTS.ADMIN_MEMBER_SUSPEND(m.id), { days })
      showToast(`${m.lastName} ${m.firstName} を${days}日間停止しました`, 'success')
      setDetailMember(null)
      load(true)
    } catch (e) { showToast(extractMessage(e), 'error') }
  }

  const handleUnsuspend = async (m: Member) => {
    if (!confirm(`「${m.lastName} ${m.firstName}」の停止を解除しますか？`)) return
    try {
      await patch(API_ENDPOINTS.ADMIN_MEMBER_UNSUSPEND(m.id), {})
      showToast('停止を解除しました', 'success')
      setDetailMember(null)
      load(true)
    } catch (e) { showToast(extractMessage(e), 'error') }
  }

  const handleDelete = async (m: Member) => {
    if (!confirm(
      `「${m.lastName} ${m.firstName}」のアカウントを削除しますか？\nこの操作は取り消せません。`
    )) return
    try {
      await del(API_ENDPOINTS.ADMIN_MEMBER_DELETE(m.id))
      showToast('アカウントを削除しました', 'success')
      setDetailMember(null)
      load(true)
    } catch (e) { showToast(extractMessage(e), 'error') }
  }

  // ── ペナルティ管理 ─────────────────────────────────────────────────────
  const openPenalties = async (m: Member) => {
    setDetailMember(null)
    setPenaltyMember(m)
    setPenalties([])
    setPenaltyLoading(true)
    try {
      const res = await get(API_ENDPOINTS.ADMIN_PENALTIES, { params: { memberId: m.id } })
      setPenalties(Array.isArray(res.data?.data) ? res.data.data : [])
    } catch {
      showToast('ペナルティ情報の取得に失敗しました', 'error')
    } finally {
      setPenaltyLoading(false)
    }
  }

  const handleRevokePenalty = async (penaltyId: number) => {
    const reason = prompt('解除理由を入力してください（必須）:')
    if (!reason?.trim()) { showToast('解除理由は必須です', 'error'); return }
    try {
      await del(`${API_ENDPOINTS.ADMIN_PENALTIES}/${penaltyId}`, { params: { reason } })
      showToast('ペナルティを解除しました', 'success')
      if (penaltyMember) {
        const res = await get(API_ENDPOINTS.ADMIN_PENALTIES, { params: { memberId: penaltyMember.id } })
        setPenalties(Array.isArray(res.data?.data) ? res.data.data : [])
      }
    } catch (e) { showToast(extractMessage(e), 'error') }
  }

  // ── チケット付与 ───────────────────────────────────────────────────────
  const openGrant = (m: Member) => {
    setDetailMember(null)
    setGrantMember(m)
    setGrantQty('1')
    const d = new Date()
    d.setFullYear(d.getFullYear() + 1)
    setGrantExpiry(d.toISOString().slice(0, 10))
  }

  const handleGrantTickets = async () => {
    if (!grantMember) return
    const qty = parseInt(grantQty, 10)
    if (isNaN(qty) || qty < 1) { showToast('枚数は1以上を入力してください', 'error'); return }
    if (!grantExpiry)           { showToast('有効期限を入力してください', 'error'); return }
    setGrantLoading(true)
    try {
      await post(API_ENDPOINTS.TICKETS, {
        memberId:   grantMember.id,
        quantity:   qty,
        expiryDate: grantExpiry,
      })
      showToast(
        `${grantMember.lastName} ${grantMember.firstName} に${qty}枚付与しました`,
        'success'
      )
      setGrantMember(null)
    } catch (e) { showToast(extractMessage(e), 'error') }
    finally { setGrantLoading(false) }
  }

  // ── ステータス表示 ─────────────────────────────────────────────────────
  const statusBadge = (m: Member) => {
    if (!m.isActive) return <span className={styles.badgeDeleted}>削除済み</span>
    if (m.isLocked)  return <span className={styles.badgeSuspended}>停止中</span>
    return               <span className={styles.badgeActive}>有効</span>
  }

  // ── レンダリング ────────────────────────────────────────────────────────
  if (loading) return <div className={styles.centered}>読み込み中...</div>
  if (error)   return <div className={styles.centered}><p className={styles.errorMsg}>{error}</p></div>

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>メンバー管理</h1>

      {/* ── フィルターバー ── */}
      <div className={styles.filterBar}>
        <input
          type="search"
          placeholder="氏名・メールアドレスで検索"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.filterGroup}>
          {(['ALL', 'MEMBER', 'ADMIN'] as RoleFilter[]).map(v => (
            <button key={v} type="button"
              className={cx(styles.pill, roleFilter === v && styles.pillActive)}
              onClick={() => setRoleFilter(v)}
            >
              {v === 'ALL' ? 'すべて' : v === 'MEMBER' ? 'メンバー' : '管理者'}
            </button>
          ))}
        </div>
        <div className={styles.filterGroup}>
          {(['ALL', 'ACTIVE', 'SUSPENDED', 'DELETED'] as StatusFilter[]).map(v => (
            <button key={v} type="button"
              className={cx(styles.pill, statusFilter === v && styles.pillActive)}
              onClick={() => setStatusFilter(v)}
            >
              {v === 'ALL' ? '全状態' : v === 'ACTIVE' ? '有効' : v === 'SUSPENDED' ? '停止中' : '削除済み'}
            </button>
          ))}
        </div>
        <span className={styles.countBadge}>{filtered.length}件</span>
      </div>

      {/* ── テーブル ── */}
      {filtered.length === 0 ? (
        <p className={styles.empty}>該当するメンバーが見つかりません</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>氏名</th>
                <th>メールアドレス</th>
                <th>ロール</th>
                <th>状態</th>
                <th>登録日</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className={cx((!m.isActive || m.isLocked) && styles.rowDim)}>
                  <td className={styles.tdId}>{m.id}</td>
                  <td>
                    <button type="button" className={styles.nameBtn}
                      onClick={() => setDetailMember(m)}>
                      {m.lastName} {m.firstName}
                    </button>
                  </td>
                  <td className={styles.tdEmail}>{m.email}</td>
                  <td>
                    <span className={m.role === 'ADMIN' ? styles.badgeAdmin : styles.badgeMember}>
                      {m.role === 'ADMIN' ? '管理者' : 'メンバー'}
                    </span>
                  </td>
                  <td>{statusBadge(m)}</td>
                  <td className={styles.tdDate}>{formatJST(m.createdAt)}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button type="button" className={styles.btnSm}
                        onClick={() => setDetailMember(m)}>詳細</button>
                      <button type="button" className={styles.btnSmWarning}
                        onClick={() => openPenalties(m)}>⚠ ペナルティ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ════ 詳細モーダル ════ */}
      {detailMember && (
        <div className={styles.overlay} onClick={() => setDetailMember(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {detailMember.lastName} {detailMember.firstName}
                <span className={styles.modalSub}> (ID: {detailMember.id})</span>
              </h2>
              <button type="button" className={styles.closeBtn}
                onClick={() => setDetailMember(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <dl className={styles.detailGrid}>
                <dt>メール</dt>
                <dd>{detailMember.email}</dd>
                <dt>ロール</dt>
                <dd>{detailMember.role === 'ADMIN' ? '管理者' : 'メンバー'}</dd>
                <dt>状態</dt>
                <dd>
                  {!detailMember.isActive
                    ? '削除済み'
                    : detailMember.isLocked
                      ? `停止中${detailMember.suspendedUntil
                          ? `（${formatJST(detailMember.suspendedUntil)}まで）`
                          : ''}`
                      : '有効'}
                </dd>
                {detailMember.phoneNumber && <><dt>電話番号</dt><dd>{detailMember.phoneNumber}</dd></>}
                {detailMember.postalCode && <><dt>郵便番号</dt><dd>{detailMember.postalCode}</dd></>}
                {detailMember.address    && <><dt>住所</dt>    <dd>{detailMember.address}</dd></>}
                {detailMember.birthDate  && <><dt>生年月日</dt><dd>{String(detailMember.birthDate)}</dd></>}
                <dt>プロバイダー</dt>
                <dd>{detailMember.capabilities?.hasProvider ? '✅ 承認済み' : '—'}</dd>
                <dt>登録日</dt>
                <dd>{formatJST(detailMember.createdAt)}</dd>
              </dl>

              <div className={styles.modalActions}>
                {detailMember.isActive && !detailMember.isLocked && (
                  <button type="button" className={styles.btnDanger}
                    onClick={() => handleSuspend(detailMember)}>
                    利用停止
                  </button>
                )}
                {detailMember.isActive && detailMember.isLocked && (
                  <button type="button" className={styles.btnWarning}
                    onClick={() => handleUnsuspend(detailMember)}>
                    停止解除
                  </button>
                )}
                <button type="button" className={styles.btnSecondary}
                  onClick={() => openPenalties(detailMember)}>
                  ⚠ ペナルティ確認
                </button>
                <button type="button" className={styles.btnSecondary}
                  onClick={() => openGrant(detailMember)}>
                  🎫 チケット付与
                </button>
                {detailMember.isActive && (
                  <button type="button" className={styles.btnDelete}
                    onClick={() => handleDelete(detailMember)}>
                    アカウント削除
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ ペナルティモーダル ════ */}
      {penaltyMember && (
        <div className={styles.overlay} onClick={() => setPenaltyMember(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                ペナルティ管理
                <span className={styles.modalSub}>
                  　{penaltyMember.lastName} {penaltyMember.firstName}
                </span>
              </h2>
              <button type="button" className={styles.closeBtn}
                onClick={() => setPenaltyMember(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              {penaltyLoading ? (
                <p className={styles.note}>読み込み中...</p>
              ) : penalties.length === 0 ? (
                <p className={styles.note}>有効なペナルティはありません</p>
              ) : (
                <table className={styles.innerTable}>
                  <thead>
                    <tr>
                      <th>参加者</th>
                      <th>種別</th>
                      <th>有効期限</th>
                      <th>状態</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {penalties.map(p => (
                      <tr key={p.id} className={cx(!p.active && styles.rowDim)}>
                        <td>{p.participantName ?? `ID: ${p.participantId}`}</td>
                        <td>{p.penaltyType}</td>
                        <td>{formatJST(p.expiresAt)}</td>
                        <td>
                          <span className={p.active ? styles.badgeActive : styles.badgeDeleted}>
                            {p.active ? '有効' : '解除済み'}
                          </span>
                        </td>
                        <td>
                          {p.active && (
                            <button type="button" className={styles.revokeBtn}
                              onClick={() => handleRevokePenalty(p.id)}>
                              解除
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════ チケット付与モーダル ════ */}
      {grantMember && (
        <div className={styles.overlay} onClick={() => setGrantMember(null)}>
          <div className={cx(styles.modal, styles.modalSm)} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                チケット付与
                <span className={styles.modalSub}>
                  　{grantMember.lastName} {grantMember.firstName}
                </span>
              </h2>
              <button type="button" className={styles.closeBtn}
                onClick={() => setGrantMember(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>枚数</label>
                <input
                  type="number"
                  min="1"
                  value={grantQty}
                  onChange={e => setGrantQty(e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>有効期限</label>
                <input
                  type="date"
                  value={grantExpiry}
                  min={new Date().toISOString().slice(0, 10)}
                  max={`${new Date().getFullYear() + 5}-12-31`}
                  onChange={e => {
                    const v = e.target.value
                    if (v.split('-')[0]?.length > 4) return
                    setGrantExpiry(v)
                  }}
                  onInput={(e) => {
                    const input = e.currentTarget
                    const parts = input.value.split('-')
                    if (parts[0] && parts[0].length > 4) {
                      parts[0] = parts[0].slice(0, 4)
                      input.value = parts.join('-')
                    }
                  }}
                  className={styles.formInput}
                />
              </div>
              <p className={styles.note}>
                ※ 振込確認後に付与してください。付与後は取り消せません。
              </p>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnPrimary}
                  disabled={grantLoading}
                  onClick={handleGrantTickets}>
                  {grantLoading ? '付与中...' : `${grantQty}枚付与する`}
                </button>
                <button type="button" className={styles.btnSecondary}
                  onClick={() => setGrantMember(null)}>
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}