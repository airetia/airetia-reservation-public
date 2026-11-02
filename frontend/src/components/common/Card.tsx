// frontend/src/components/common/Card.tsx
import React from 'react'
import styles from './Card.module.css'

/**
 * 汎用カードコンポーネント
 * → 05_frontend_specification.md §6 必須共通コンポーネント
 *
 * ブランドカラールール: 白背景 + 構造色の影 + 白ボーダー
 */

interface CardProps {
  children: React.ReactNode
  className?: string
  /** パディングをなくす（テーブル等を内包する場合） */
  noPadding?: boolean
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding, onClick }) => {
  return (
    <div
      className={`${styles.card} ${noPadding ? styles.noPadding : ''} ${className}${onClick ? ' ' + styles.clickable : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
}