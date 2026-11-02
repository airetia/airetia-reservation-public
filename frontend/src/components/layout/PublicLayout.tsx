// frontend/src/components/layout/PublicLayout.tsx
import { Outlet } from 'react-router-dom'
import styles from './PublicLayout.module.css'

/**
 * 未認証ユーザー用レイアウト（/, /login, /register）
 * ヘッダーを持たないシンプルなフルスクリーンレイアウト
 * → 05_frontend_specification.md §3.2 ルート定義
 */
export const PublicLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <Outlet />
    </div>
  )
}
