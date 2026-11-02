// frontend/src/utils/validation.ts
/**
 * フロントエンドバリデーションユーティリティ
 * → 03_common_specification.md §7 バリデーションルール
 * → 07_business_rules.md §8 文字数制限
 *
 * バックエンドと同じルールを3層制御（フロント・バック・DB）の第1層として実装する。
 */

/** メールアドレス (RFC準拠) */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/** パスワード（一般）: 8-64文字・英大小数字 */
export function isValidPassword(value: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/.test(value)
}

/** パスワード（管理者）: 12-64文字・英大小数字記号 */
export function isValidAdminPassword(value: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{12,64}$/.test(value)
}

/** ひらがな */
export function isHiragana(value: string): boolean {
  return /^[ぁ-んー]+$/.test(value)
}

/** 郵便番号（数字7桁）*/
export function isValidPostalCode(value: string): boolean {
  return /^\d{7}$/.test(value)
}

/** 電話番号（数字10-11桁）*/
export function isValidPhone(value: string): boolean {
  return /^\d{10,11}$/.test(value)
}

/** 文字数制限チェック */
export function isWithinLength(value: string, max: number): boolean {
  return value.length <= max
}

/** 必須チェック */
export function isRequired(value: string | null | undefined): boolean {
  return !!value && value.trim().length > 0
}

/** サービス時間（15〜120分・15分刻み）*/
export function isValidDurationMinutes(minutes: number): boolean {
  return minutes >= 15 && minutes <= 120 && minutes % 15 === 0
}

/** 定員（1〜15）*/
export function isValidCapacity(capacity: number): boolean {
  return Number.isInteger(capacity) && capacity >= 1 && capacity <= 15
}

/** チケット枚数（1以上）*/
export function isValidTicketCount(count: number): boolean {
  return Number.isInteger(count) && count >= 1
}

// ─────────────────────────────────────────────────────────────────────────────
// フォーム単位バリデーター（エラーメッセージ付き）
// ─────────────────────────────────────────────────────────────────────────────

export type ValidationError = Record<string, string>

/** 会員登録フォームバリデーション */
export function validateRegisterForm(values: {
  email: string
  password: string
  firstName: string
  lastName: string
  firstNameKana?: string
  lastNameKana?: string
}): ValidationError {
  const errors: ValidationError = {}
  if (!isRequired(values.email))       errors.email    = 'メールアドレスを入力してください'
  else if (!isValidEmail(values.email)) errors.email    = 'メールアドレスの形式が正しくありません'
  if (!isRequired(values.password))        errors.password = 'パスワードを入力してください'
  else if (!isValidPassword(values.password)) errors.password = 'パスワードは8文字以上で大文字・小文字・数字を含めてください'
  if (!isRequired(values.firstName))   errors.firstName = '名を入力してください'
  if (!isRequired(values.lastName))    errors.lastName  = '姓を入力してください'
  if (values.firstNameKana && !isHiragana(values.firstNameKana))
    errors.firstNameKana = 'ひらがなで入力してください'
  if (values.lastNameKana && !isHiragana(values.lastNameKana))
    errors.lastNameKana  = 'ひらがなで入力してください'
  return errors
}

/** プロバイダー申請フォームバリデーション（Step 1）*/
export function validateProviderApplicationForm(values: {
  highSchool: string
  appealPoint: string
}): ValidationError {
  const errors: ValidationError = {}
  if (!isRequired(values.highSchool))
    errors.highSchool = '出身高校を入力してください'
  if (!isRequired(values.appealPoint))
    errors.appealPoint = 'アピールポイントを入力してください'
  else if (!isWithinLength(values.appealPoint, 2000))
    errors.appealPoint = '2000文字以内で入力してください'
  return errors
}
