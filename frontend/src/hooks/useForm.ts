// frontend/src/hooks/useForm.ts

/**
 * フォーム状態管理フック
 * → 05_frontend_specification.md §8 フォーム実装
 *
 * @example
 *   const { values, errors, submitting, handleChange, setFieldError, reset, setSubmitting } =
 *     useForm({ email: '', password: '' })
 */
import { useState } from 'react'

export function useForm<T extends Record<string, unknown>>(initialValues: T) {
  const [values,     setValues]     = useState<T>(initialValues)
  const [errors,     setErrors]     = useState<Partial<Record<keyof T, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field: keyof T, value: unknown) => {
    setValues(prev => ({ ...prev, [field]: value }))
    // フィールドを変更したらそのフィールドのエラーをクリア
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const setFieldError = (field: keyof T, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }))
  }

  const clearErrors = () => setErrors({})

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setSubmitting(false)
  }

  return {
    values,
    errors,
    submitting,
    setSubmitting,
    handleChange,
    setFieldError,
    clearErrors,
    reset,
    setValues,
  }
}
