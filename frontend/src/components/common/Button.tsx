// frontend/src/components/common/Button.tsx
import React from 'react'
import styles from './Button.module.css'

/**
 * 汎用ボタンコンポーネント
 * → 05_frontend_specification.md §6 必須共通コンポーネント
 */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  /** sm / md / lg / small（= sm 互換） */
  size?: 'sm' | 'md' | 'lg' | 'small'
  loading?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  // "small" は "sm" の互換エイリアス
  const sizeClass = size === 'small' ? styles.sm : styles[size]
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className={styles.spinner} /> : null}
      {children}
    </button>
  )
}