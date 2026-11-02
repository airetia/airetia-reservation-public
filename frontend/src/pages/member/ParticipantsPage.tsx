// frontend/src/pages/member/ParticipantsPage.tsx

/**
 * お子様プロフィール管理ページ
 * → 05_frontend_specification.md §3.1 /participants
 * → 01_glossary.md §2 Participant（SELF / CHILD）
 *
 * 仕様:
 *   - 「本人」セクション: SELF participant を表示。「プロフィールで編集」→ ProfilePage へ。
 *   - 「お子様」セクション: CHILD 一覧。追加は CHILD 固定（種別選択なし）。
 *   - CHILD 上限: MAX_CHILDREN_PER_MEMBER（5名）
 *   - 必須: 姓・名・生年月日・性別
 *   - 任意: ふりがな（姓・名）・メモ（500文字）
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { get, post, patch, del } from '@/api/httpClient'
import { API_ENDPOINTS, BUSINESS_RULES } from '@/config/constants'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Loading } from '@/components/common/Loading'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastProvider'
import type { ParticipantListItem } from '@/models/participant'
import type { Gender } from '@/models/enums'
import styles from './ParticipantsPage.module.css'

// ─── ローカル型拡張 ─────────────────────────────────────────────────────────
// バックエンド ParticipantResponse には notes が存在するが、
// フロントエンド ParticipantListItem 型に未追加の場合に備えた拡張
type ParticipantItem = ParticipantListItem & {
  lastNameKana?:  string
  firstNameKana?: string
  notes?:         string
}

type FormData = {
  lastName:      string
  firstName:     string
  lastNameKana:  string
  firstNameKana: string
  birthDate:     string
  gender:        Gender | ''
  notes:         string
}

type FormErrors = Partial<Record<keyof FormData, string>>

const EMPTY_FORM: FormData = {
  lastName: '', firstName: '', lastNameKana: '', firstNameKana: '',
  birthDate: '', gender: '', notes: '',
}

// 年入力を4桁に制限するハンドラ
function limitYearInput(e: React.FormEvent<HTMLInputElement>) {
  const input = e.currentTarget
  const parts = input.value.split('-')
  if (parts[0] && parts[0].length > 4) {
    parts[0] = parts[0].slice(0, 4)
    input.value = parts.join('-')
  }
}

// ─── コンポーネント ─────────────────────────────────────────────────────────
export function ParticipantsPage() {
  const { member } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [participants, setParticipants] = useState<ParticipantItem[]>([])
  const [loading,      setLoading]      = useState(true)
  const [showModal,    setShowModal]    = useState(false)
  const [editing,      setEditing]      = useState<ParticipantItem | null>(null)
  const [form,         setForm]         = useState<FormData>(EMPTY_FORM)
  const [errors,       setErrors]       = useState<FormErrors>({})
  const [saving,       setSaving]       = useState(false)

  const load = useCallback(async () => {
    if (!member?.id) return
    setLoading(true)
    try {
      const res = await get(API_ENDPOINTS.PARTICIPANTS)
      setParticipants(Array.isArray(res.data?.data) ? res.data.data : [])
    } catch {
      showToast('利用者情報の取得に失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }, [member?.id, showToast])

  useEffect(() => { load() }, [load])

  const selfParticipant   = participants.find(p => p.participantType === 'SELF')
  const childParticipants = participants.filter(p => p.participantType === 'CHILD')
  const childCount        = childParticipants.length
  const canAddChild       = childCount < BUSINESS_RULES.MAX_CHILDREN_PER_MEMBER

  const createSelfParticipant = async () => {
    if (!member) return
    try {
      await post(API_ENDPOINTS.PARTICIPANTS, {
        participantType: 'SELF',
        lastName:      member.lastName,
        firstName:     member.firstName,
        lastNameKana:  member.lastNameKana  ?? '',
        firstNameKana: member.firstNameKana ?? '',
        birthDate:     member.birthDate     ?? '',
        gender:        member.gender        ?? undefined,
      })
      showToast('本人の利用者情報を登録しました', 'success')
      load()
    } catch (e) {
      const msg = e instanceof Error ? e.message : '登録に失敗しました'
      showToast(msg, 'error')
    }
  }

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (p: ParticipantItem) => {
    setEditing(p)
    setForm({
      lastName:      p.lastName,
      firstName:     p.firstName,
      lastNameKana:  p.lastNameKana  ?? '',
      firstNameKana: p.firstNameKana ?? '',
      birthDate:     p.birthDate     ?? '',
      gender:        p.gender        ?? '',
      notes:         p.notes         ?? '',
    })
    setErrors({})
    setShowModal(true)
  }

  const handleDelete = async (p: ParticipantItem) => {
    if (!confirm(`「${p.lastName} ${p.firstName}」を削除しますか？`)) return
    try {
      await del(API_ENDPOINTS.PARTICIPANT_BY_ID(p.id))
      showToast('削除しました', 'success')
      load()
    } catch (e) {
      const msg = e instanceof Error ? e.message : '削除に失敗しました'
      showToast(msg, 'error')
    }
  }

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!form.lastName.trim())      errs.lastName      = '姓を入力してください'
    if (!form.firstName.trim())     errs.firstName     = '名を入力してください'
    if (!form.lastNameKana.trim())  errs.lastNameKana  = '姓（ふりがな）を入力してください'
    if (!form.firstNameKana.trim()) errs.firstNameKana = '名（ふりがな）を入力してください'
    if (!form.birthDate)            errs.birthDate     = '生年月日を入力してください'
    if (!form.gender)               errs.gender        = '性別を選択してください'
    // ひらがなチェック
    const kanaPattern = /^[ぁ-ん・ー\s]+$/
    if (form.lastNameKana.trim() && !kanaPattern.test(form.lastNameKana.trim()))
      errs.lastNameKana = 'ひらがなで入力してください'
    if (form.firstNameKana.trim() && !kanaPattern.test(form.firstNameKana.trim()))
      errs.firstNameKana = 'ひらがなで入力してください'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        lastName:      form.lastName.trim(),
        firstName:     form.firstName.trim(),
        lastNameKana:  form.lastNameKana.trim(),
        firstNameKana: form.firstNameKana.trim(),
        birthDate:     form.birthDate,
        gender:        form.gender as Gender,
        notes:         form.notes.trim() || undefined,
      }
      if (editing) {
        await patch(API_ENDPOINTS.PARTICIPANT_BY_ID(editing.id), payload)
        showToast('更新しました', 'success')
      } else {
        await post(API_ENDPOINTS.PARTICIPANTS, { ...payload, participantType: 'CHILD' })
        showToast('お子様を追加しました', 'success')
      }
      setShowModal(false)
      load()
    } catch (e) {
      const msg = e instanceof Error ? e.message : '保存に失敗しました'
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const set = (field: keyof FormData, value: string) =>
    setForm(f => ({ ...f, [field]: value }))

  if (loading) return <Loading />

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>利用者管理</h1>

      {/* ── 本人セクション ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>本人</h2>
        {selfParticipant ? (
          <Card>
            <div className={styles.participantRow}>
              <div className={styles.participantInfo}>
                <strong>{selfParticipant.lastName} {selfParticipant.firstName}</strong>
                {selfParticipant.birthDate && (
                  <span className={styles.detail}>生年月日: {selfParticipant.birthDate}</span>
                )}
              </div>
              <Button variant="secondary" onClick={() => navigate('/member/profile')}>
                プロフィールで編集
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            <div className={styles.noSelfBox}>
              <p className={styles.noSelf}>
                本人（SELF）の利用者情報がありません。
              </p>
              <Button variant="primary" onClick={createSelfParticipant}>
                本人を登録する
              </Button>
              <p className={styles.noSelfNote}>
                ※ 姓名はプロフィールの情報が使用されます
              </p>
            </div>
          </Card>
        )}
      </section>

      {/* ── お子様セクション ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            お子様（{childCount}/{BUSINESS_RULES.MAX_CHILDREN_PER_MEMBER}名）
          </h2>
          <Button variant="primary" onClick={openAdd} disabled={!canAddChild}>
            ＋ お子様を追加
          </Button>
        </div>

        {!canAddChild && (
          <p className={styles.limitNote}>
            ※ 1アカウントで登録できるお子様は最大{BUSINESS_RULES.MAX_CHILDREN_PER_MEMBER}名です
          </p>
        )}

        {childParticipants.length === 0 ? (
          <Card><p className={styles.empty}>お子様が登録されていません</p></Card>
        ) : (
          childParticipants.map(p => (
            <Card key={p.id}>
              <div className={styles.participantRow}>
                <div className={styles.participantInfo}>
                  <strong>{p.lastName} {p.firstName}</strong>
                  {p.birthDate && <span className={styles.detail}>生年月日: {p.birthDate}</span>}
                  {p.gender && (
                    <span className={styles.detail}>
                      {p.gender === 'MALE' ? '男性' : p.gender === 'FEMALE' ? '女性' : 'その他'}
                    </span>
                  )}
                  {p.notes && <span className={styles.detail}>メモ: {p.notes}</span>}
                  {p.hasActivePenalty && (
                    <span className={styles.penaltyBadge}>⚠ 要注意</span>
                  )}
                </div>
                <div className={styles.participantActions}>
                  <Button variant="secondary" onClick={() => openEdit(p)}>編集</Button>
                  <Button variant="danger"    onClick={() => handleDelete(p)}>削除</Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </section>

      {/* ── 追加・編集モーダル ── */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editing ? 'お子様を編集' : 'お子様を追加'}</h2>
              <button
                type="button"
                className={styles.closeX}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.fields}>
              {/* 姓・名（必須）*/}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>姓 <span className={styles.required}>*</span></label>
                  <input
                    value={form.lastName}
                    onChange={e => set('lastName', e.target.value)}
                    maxLength={50}
                    placeholder="山田"
                  />
                  {errors.lastName && <span className={styles.error}>{errors.lastName}</span>}
                </div>
                <div className={styles.field}>
                  <label>名 <span className={styles.required}>*</span></label>
                  <input
                    value={form.firstName}
                    onChange={e => set('firstName', e.target.value)}
                    maxLength={50}
                    placeholder="たろう"
                  />
                  {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
                </div>
              </div>

              {/* ふりがな（必須） */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>姓（ふりがな）<span className={styles.required}>*</span></label>
                  <input
                    value={form.lastNameKana}
                    onChange={e => set('lastNameKana', e.target.value)}
                    maxLength={50}
                    placeholder="やまだ"
                  />
                  {errors.lastNameKana && <span className={styles.error}>{errors.lastNameKana}</span>}
                </div>
                <div className={styles.field}>
                  <label>名（ふりがな）<span className={styles.required}>*</span></label>
                  <input
                    value={form.firstNameKana}
                    onChange={e => set('firstNameKana', e.target.value)}
                    maxLength={50}
                    placeholder="たろう"
                  />
                  {errors.firstNameKana && <span className={styles.error}>{errors.firstNameKana}</span>}
                </div>
              </div>

              {/* 生年月日（必須） */}
              <div className={styles.field}>
                <label>生年月日 <span className={styles.required}>*</span></label>
                <input
                  type="date"
                  value={form.birthDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={e => {
                    const v = e.target.value
                    const year = v.split('-')[0]
                    if (year && year.length > 4) return
                    set('birthDate', v)
                  }}
                  onInput={limitYearInput}
                />
                {errors.birthDate && <span className={styles.error}>{errors.birthDate}</span>}
              </div>

              {/* 性別（必須） */}
              <div className={styles.field}>
                <label>性別 <span className={styles.required}>*</span></label>
                <select
                  value={form.gender}
                  onChange={e => set('gender', e.target.value)}
                >
                  <option value="">選択してください</option>
                  <option value="MALE">男性</option>
                  <option value="FEMALE">女性</option>
                  <option value="OTHER">その他</option>
                </select>
                {errors.gender && <span className={styles.error}>{errors.gender}</span>}
              </div>

              {/* メモ（任意） */}
              <div className={styles.field}>
                <label>メモ<span className={styles.optional}>任意</span></label>
                <textarea
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="アレルギー・特記事項・先生への共有事項など"
                  rows={3}
                  maxLength={500}
                />
                <span className={styles.charCount}>{form.notes.length}/500</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                キャンセル
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : editing ? '更新する' : '追加する'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}