// frontend/src/pages/member/ProviderApplicationPage.tsx
import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerProvider as applyProvider, uploadDocument as uploadProviderDocument } from '@/api/providerApi'
import { patch } from '@/api/httpClient'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES, BUSINESS_RULES, VALIDATION, API_ENDPOINTS } from '@/config/constants'
import type { ProviderCreateRequest } from '@/models/provider'
import styles from './ProviderApplicationPage.module.css'

/**
 * プロバイダー申請（多段ウィザード）
 * → 05_frontend_specification.md §3.4 ProviderApplicationPage
 * → 02_business_rules.md §5.1
 *
 * Step 1: 基本情報（学歴・資格・実績・アピールポイント）
 * Step 2: 書類アップロード（IDENTITY / CONTRACT / BANK_INFO）
 * Step 3: 確認画面
 * Step 4: 完了画面
 */

type DocumentFiles = {
  identity: File | null
  contract: File | null
  bankInfo: File | null
}

export function ProviderApplicationPage() {
  const navigate = useNavigate()
  const { member } = useAuth()
  const [step, setStep] = useState(1)

  // Step1 フォーム値
  const [form, setForm] = useState({
    // メンバー情報（membersテーブル → §5.1.1）
    birthDate:      '',
    phoneNumber:    '',
    postalCode:     '',
    address:        '',
    // プロバイダー情報（providersテーブル → §5.1.1）
    highSchool:     '',
    university:     '',
    appealPoint:    '',
    qualifications: [''],
    achievements:   [''],
  })
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({})

  // Step2 書類ファイル
  const [files, setFiles] = useState<DocumentFiles>({
    identity: null, contract: null, bankInfo: null,
  })
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({})

  // 申請で取得した providerId
  const [providerId, setProviderId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // ── Step1: バリデーション & 次へ ──────────────────────────────
  const validateStep1 = () => {
    const errs: Record<string, string> = {}
    // メンバー情報（§5.1.1 必須）
    if (!form.birthDate)          errs.birthDate   = '生年月日は必須です'
    if (!form.phoneNumber.trim()) errs.phoneNumber = '電話番号は必須です'
    else if (!/^\d{10,11}$/.test(form.phoneNumber.replace(/-/g, '')))
                                  errs.phoneNumber = '電話番号は10〜11桁の数字で入力してください'
    if (!form.postalCode.trim())  errs.postalCode  = '郵便番号は必須です'
    else if (!/^\d{7}$/.test(form.postalCode.replace(/-/g, '')))
                                  errs.postalCode  = '郵便番号は7桁の数字で入力してください'
    if (!form.address.trim())     errs.address     = '住所は必須です'
    // プロバイダー情報
    if (!form.highSchool.trim())  errs.highSchool  = '出身高校を入力してください'
    if (!form.appealPoint.trim()) errs.appealPoint = 'アピールポイントを入力してください'
    if (form.appealPoint.length > VALIDATION.APPEAL_POINT_MAX)
      errs.appealPoint = `${VALIDATION.APPEAL_POINT_MAX}文字以内で入力してください`
    setStep1Errors(errs)
    return Object.keys(errs).length === 0
  }

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep1()) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      // Step1: メンバー情報を先に更新（birthDate/phone/address は members テーブル §5.1.1）
      await patch(API_ENDPOINTS.MEMBER_BY_ID(member!.id), {
        birthDate:   form.birthDate   || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
        postalCode:  form.postalCode.trim()  || undefined,
        address:     form.address.trim()     || undefined,
      })
      // Step1: プロバイダー基本情報を登録
      const payload: ProviderCreateRequest = {
        highSchool:     form.highSchool.trim(),
        university:     form.university.trim() || undefined,
        appealPoint:    form.appealPoint.trim(),
        qualifications: form.qualifications.filter(q => q.trim()),
        achievements:   form.achievements.filter(a => a.trim()),
      }
      const res = await applyProvider(payload)
      setProviderId(res.id)
      setStep(2)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : '申請の初期化に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Step2: ファイルバリデーション & アップロード ─────────────
  const validateStep2 = () => {
    const errs: Record<string, string> = {}
    if (!files.identity) errs.identity = '身分証明書をアップロードしてください'
    if (!files.contract) errs.contract = '署名済み契約書をアップロードしてください'
    if (!files.bankInfo) errs.bankInfo = '口座情報をアップロードしてください'
    setStep2Errors(errs)
    return Object.keys(errs).length === 0
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2() || !providerId) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      await uploadProviderDocument(providerId, 'IDENTITY', files.identity!)
      await uploadProviderDocument(providerId, 'CONTRACT', files.contract!)
      await uploadProviderDocument(providerId, 'BANK_INFO', files.bankInfo!)
      setStep(3)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : '書類のアップロードに失敗しました')
      // 画面を維持（navigate しない）
    } finally {
      setSubmitting(false)
    }
  }

  // ── Step3: 確認後に完了 ───────────────────────────────────────
  const handleConfirm = () => setStep(4)

  // ── リスト操作ヘルパー ────────────────────────────────────────
  const updateList = (
    field: 'qualifications' | 'achievements',
    idx: number,
    val: string,
  ) => setForm(prev => {
    const next = [...prev[field]]
    next[idx] = val
    return { ...prev, [field]: next }
  })

  const addListItem = (field: 'qualifications' | 'achievements') =>
    setForm(prev => {
      if (prev[field].length >= BUSINESS_RULES.MAX_QUALIFICATIONS) return prev
      return { ...prev, [field]: [...prev[field], ''] }
    })

  const removeListItem = (field: 'qualifications' | 'achievements', idx: number) =>
    setForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== idx),
    }))

  // ── ファイル選択ハンドラー ────────────────────────────────────
  const handleFileChange = (key: keyof DocumentFiles) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (file && file.size > VALIDATION.FILE_MAX_SIZE_MB * 1024 * 1024) {
      alert(`ファイルサイズは${VALIDATION.FILE_MAX_SIZE_MB}MB以内にしてください`)
      return
    }
    setFiles(prev => ({ ...prev, [key]: file }))
  }

  // ── レンダリング ──────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>プロバイダー申請</h1>

      {/* ステップインジケーター */}
      <div className={styles.steps}>
        {['基本情報', '書類提出', '確認', '完了'].map((label, i) => (
          <div key={i} className={`${styles.stepItem} ${step === i + 1 ? styles.active : ''} ${step > i + 1 ? styles.done : ''}`}>
            <div className={styles.stepNum}>{i + 1}</div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} noValidate className={styles.form}>
          <p className={styles.stepDesc}>プロバイダー登録に必要な情報を入力してください。</p>

          {/* ── メンバー情報（§5.1.1） ── */}
          <div className={styles.field}>
            <label>生年月日 <span className={styles.required}>*</span></label>
            <input type="date" value={form.birthDate}
              onChange={e => setForm(p => ({...p, birthDate: e.target.value}))} />
            {step1Errors.birthDate && <span className={styles.fieldError}>{step1Errors.birthDate}</span>}
          </div>

          <div className={styles.field}>
            <label>電話番号 <span className={styles.required}>*</span></label>
            <input type="tel" value={form.phoneNumber} placeholder="09012345678"
              onChange={e => setForm(p => ({...p, phoneNumber: e.target.value}))} />
            {step1Errors.phoneNumber && <span className={styles.fieldError}>{step1Errors.phoneNumber}</span>}
          </div>

          <div className={styles.field}>
            <label>郵便番号 <span className={styles.required}>*</span></label>
            <input value={form.postalCode} placeholder="1234567"
              onChange={e => setForm(p => ({...p, postalCode: e.target.value}))} maxLength={8} />
            {step1Errors.postalCode && <span className={styles.fieldError}>{step1Errors.postalCode}</span>}
          </div>

          <div className={styles.field}>
            <label>住所 <span className={styles.required}>*</span></label>
            <input value={form.address} placeholder="東京都渋谷区..."
              onChange={e => setForm(p => ({...p, address: e.target.value}))} maxLength={255} />
            {step1Errors.address && <span className={styles.fieldError}>{step1Errors.address}</span>}
          </div>

          {/* ── プロバイダー情報（§5.1.1） ── */}
          <div className={styles.field}>
            <label>出身高校 <span className={styles.required}>*</span></label>
            <input value={form.highSchool} onChange={e => setForm(p => ({...p, highSchool: e.target.value}))} placeholder="○○高等学校" />
            {step1Errors.highSchool && <span className={styles.fieldError}>{step1Errors.highSchool}</span>}
          </div>

          <div className={styles.field}>
            <label>出身大学・専門学校</label>
            <input value={form.university} onChange={e => setForm(p => ({...p, university: e.target.value}))} placeholder="○○大学" />
          </div>

          <div className={styles.field}>
            <label>保有資格（最大{BUSINESS_RULES.MAX_QUALIFICATIONS}件）</label>
            {form.qualifications.map((q, i) => (
              <div key={i} className={styles.listRow}>
                <input value={q} onChange={e => updateList('qualifications', i, e.target.value)}
                  placeholder={`資格 ${i + 1}`} maxLength={255} />
                {form.qualifications.length > 1 && (
                  <button type="button" className={styles.removeBtn}
                    onClick={() => removeListItem('qualifications', i)}>×</button>
                )}
              </div>
            ))}
            {form.qualifications.length < BUSINESS_RULES.MAX_QUALIFICATIONS && (
              <button type="button" className={styles.addBtn}
                onClick={() => addListItem('qualifications')}>+ 追加</button>
            )}
          </div>

          <div className={styles.field}>
            <label>賞歴・実績（最大{BUSINESS_RULES.MAX_ACHIEVEMENTS}件）</label>
            {form.achievements.map((a, i) => (
              <div key={i} className={styles.listRow}>
                <input value={a} onChange={e => updateList('achievements', i, e.target.value)}
                  placeholder={`実績 ${i + 1}`} maxLength={255} />
                {form.achievements.length > 1 && (
                  <button type="button" className={styles.removeBtn}
                    onClick={() => removeListItem('achievements', i)}>×</button>
                )}
              </div>
            ))}
            {form.achievements.length < BUSINESS_RULES.MAX_ACHIEVEMENTS && (
              <button type="button" className={styles.addBtn}
                onClick={() => addListItem('achievements')}>+ 追加</button>
            )}
          </div>

          <div className={styles.field}>
            <label>
              アピールポイント <span className={styles.required}>*</span>
              <span className={styles.counter}>（{form.appealPoint.length}/{VALIDATION.APPEAL_POINT_MAX}）</span>
            </label>
            <textarea rows={6} value={form.appealPoint} maxLength={VALIDATION.APPEAL_POINT_MAX}
              onChange={e => setForm(p => ({...p, appealPoint: e.target.value}))}
              placeholder="あなたの強みや指導スタイルなどをご記入ください" />
            {step1Errors.appealPoint && <span className={styles.fieldError}>{step1Errors.appealPoint}</span>}
          </div>

          {submitError && <p className={styles.errorMsg}>{submitError}</p>}
          <button type="submit" className={styles.nextBtn} disabled={submitting}>
            {submitting ? '処理中...' : '次へ（書類提出）'}
          </button>
        </form>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <form onSubmit={handleStep2Submit} noValidate className={styles.form}>
          <p className={styles.stepDesc}>以下の書類をアップロードしてください（JPG / PNG / PDF / 10MB以内）</p>

          <FileField label="身分証明書" file={files.identity}
            onChange={handleFileChange('identity')} error={step2Errors.identity} />
          <FileField label="署名済み契約書（PDFのみ）" file={files.contract}
            accept="application/pdf" onChange={handleFileChange('contract')} error={step2Errors.contract} />
          <FileField label="口座情報" file={files.bankInfo}
            onChange={handleFileChange('bankInfo')} error={step2Errors.bankInfo} />

          {submitError && <p className={styles.errorMsg}>{submitError}</p>}
          <div className={styles.btnRow}>
            <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>戻る</button>
            <button type="submit" className={styles.nextBtn} disabled={submitting}>
              {submitting ? 'アップロード中...' : '次へ（確認）'}
            </button>
          </div>
        </form>
      )}

      {/* Step 3 確認 */}
      {step === 3 && (
        <div className={styles.confirm}>
          <p className={styles.stepDesc}>以下の内容で申請します。</p>
          <dl className={styles.confirmList}>
            <dt>出身高校</dt><dd>{form.highSchool}</dd>
            {form.university && <><dt>出身大学・専門学校</dt><dd>{form.university}</dd></>}
            {form.qualifications.filter(q => q.trim()).length > 0 && (
              <><dt>保有資格</dt><dd>{form.qualifications.filter(q => q.trim()).join('、')}</dd></>
            )}
            {form.achievements.filter(a => a.trim()).length > 0 && (
              <><dt>賞歴・実績</dt><dd>{form.achievements.filter(a => a.trim()).join('、')}</dd></>
            )}
            <dt>アピールポイント</dt><dd className={styles.appealText}>{form.appealPoint}</dd>
            <dt>身分証明書</dt><dd>{files.identity?.name}</dd>
            <dt>契約書</dt><dd>{files.contract?.name}</dd>
            <dt>口座情報</dt><dd>{files.bankInfo?.name}</dd>
          </dl>
          <div className={styles.btnRow}>
            <button className={styles.backBtn} onClick={() => setStep(2)}>戻る</button>
            <button className={styles.nextBtn} onClick={handleConfirm} disabled={submitting}>申請する</button>
          </div>
        </div>
      )}

      {/* Step 4 完了 */}
      {step === 4 && (
        <div className={styles.complete}>
          <div className={styles.completeIcon}>✓</div>
          <h2>申請を受け付けました</h2>
          <p>審査結果をメールでお送りします。審査には通常3営業日かかります。</p>
          <button className={styles.nextBtn} onClick={() => navigate(ROUTES.MEMBER_DASHBOARD)}>
            ダッシュボードへ戻る
          </button>
        </div>
      )}
    </div>
  )
}

function FileField({
  label, file, onChange, error,
  accept = 'image/jpeg,image/png,application/pdf',
}: {
  label: string; file: File | null
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string; accept?: string
}) {
  return (
    <div className={styles.field}>
      <label>{label}</label>
      <input type="file" accept={accept} onChange={onChange} />
      {file && <span className={styles.filename}>{file.name}（差し替え可）</span>}
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  )
}
