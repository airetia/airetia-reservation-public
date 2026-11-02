// frontend/src/components/features/participant/ParticipantForm.tsx
import React, { useState } from 'react'
import type { ParticipantCreateRequest, ParticipantUpdateRequest } from '@/models/participant'
import type { ParticipantType, Gender } from '@/models/enums'
import styles from './ParticipantForm.module.css'

/**
 * 利用者（SELF / CHILD）登録・編集フォーム
 * → ParticipantsPage で使用（Modal 内）
 * → 01_glossary.md §2 Participant
 *
 * DB テーブル participants のカラムに対応:
 *   必須: 姓・名・生年月日・性別
 *   ※ ふりがなは participants テーブルに存在しないため含めない
 *
 * 生年月日: min="1900-01-01" で5桁年入力防止 / max=今日 で未来日禁止
 */

interface Props {
  mode: 'create' | 'edit'
  defaultValues?: Partial<ParticipantUpdateRequest>
  participantType?: ParticipantType
  submitting?: boolean
  onSubmit: (data: ParticipantCreateRequest | ParticipantUpdateRequest) => void
  onCancel: () => void
}

const GENDER_OPTIONS = [
  { value: 'MALE',   label: '男性' },
  { value: 'FEMALE', label: '女性' },
  { value: 'OTHER',  label: 'その他' },
]

const today = new Date().toISOString().slice(0, 10)

const ParticipantForm: React.FC<Props> = ({
  mode, defaultValues = {}, participantType = 'CHILD', submitting, onSubmit, onCancel,
}) => {
  const [lastName,  setLastName]  = useState(defaultValues.lastName  ?? '')
  const [firstName, setFirstName] = useState(defaultValues.firstName ?? '')
  const [birthDate, setBirthDate] = useState(defaultValues.birthDate ?? '')
  const [gender,    setGender]    = useState<string>(defaultValues.gender ?? '')
  const [errors,    setErrors]    = useState<Record<string, string>>({})

  const clearErr = (field: string) => setErrors(p => ({ ...p, [field]: '' }))

  // 生年月日: 5桁年・未来日を入力時点で拒否
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!val) { setBirthDate(''); clearErr('birthDate'); return }
    const year = parseInt(val.split('-')[0] ?? '0', 10)
    if (isNaN(year) || year > 9999) return  // 5桁年を拒否
    if (val > today) return                  // 未来日を拒否
    setBirthDate(val)
    clearErr('birthDate')
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!lastName.trim())  e.lastName  = '姓は必須です'
    if (!firstName.trim()) e.firstName = '名は必須です'
    if (!birthDate)        e.birthDate = '生年月日は必須です'
    else if (birthDate > today) e.birthDate = '未来の日付は選択できません'
    if (!gender)           e.gender    = '性別は必須です'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    const data = {
      ...(mode === 'create' ? { participantType } : {}),
      lastName,
      firstName,
      birthDate,
      gender: gender as Gender,
    }
    onSubmit(data as ParticipantCreateRequest | ParticipantUpdateRequest)
  }

  return (
    <div className={styles.form}>

      {/* 氏名 */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>姓 <span className={styles.required}>*</span></label>
          <input
            className={`${styles.input}${errors.lastName ? ' ' + styles.inputError : ''}`}
            value={lastName}
            onChange={e => { setLastName(e.target.value); clearErr('lastName') }}
            placeholder="山田"
            maxLength={50}
          />
          {errors.lastName && <p className={styles.errorMsg}>{errors.lastName}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>名 <span className={styles.required}>*</span></label>
          <input
            className={`${styles.input}${errors.firstName ? ' ' + styles.inputError : ''}`}
            value={firstName}
            onChange={e => { setFirstName(e.target.value); clearErr('firstName') }}
            placeholder="太郎"
            maxLength={50}
          />
          {errors.firstName && <p className={styles.errorMsg}>{errors.firstName}</p>}
        </div>
      </div>

      {/* 生年月日・性別 */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>生年月日 <span className={styles.required}>*</span></label>
          <input
            type="date"
            className={`${styles.input}${errors.birthDate ? ' ' + styles.inputError : ''}`}
            value={birthDate}
            onChange={handleBirthDateChange}
            min="1900-01-01"
            max={today}
          />
          {errors.birthDate && <p className={styles.errorMsg}>{errors.birthDate}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>性別 <span className={styles.required}>*</span></label>
          <select
            className={`${styles.select}${errors.gender ? ' ' + styles.inputError : ''}`}
            value={gender}
            onChange={e => { setGender(e.target.value); clearErr('gender') }}
          >
            <option value="">選択してください</option>
            {GENDER_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.gender && <p className={styles.errorMsg}>{errors.gender}</p>}
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.btnCancel} onClick={onCancel}>キャンセル</button>
        <button type="button" className={styles.btnSubmit} onClick={handleSubmit} disabled={submitting}>
          {submitting ? '送信中...' : mode === 'create' ? '登録する' : '保存する'}
        </button>
      </div>
    </div>
  )
}

export default ParticipantForm