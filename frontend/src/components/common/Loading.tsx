// frontend/src/components/common/Loading.tsx
import styles from './Loading.module.css'

/**
 * ローディングスピナー
 * → 05_frontend_specification.md §6 必須共通コンポーネント
 * fullScreen: 画面全体をオーバーレイ表示
 */
interface LoadingProps {
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const Loading: React.FC<LoadingProps> = ({ fullScreen = false, size = 'md' }) => {
  if (fullScreen) {
    return (
      <div className={styles.overlay}>
        <div className={`${styles.spinner} ${styles[size]}`} aria-label="読み込み中" />
      </div>
    )
  }
  return <div className={`${styles.spinner} ${styles[size]}`} aria-label="読み込み中" />
}
