// frontend/src/App.tsx

/**
 * アプリケーションルートコンポーネント
 *
 * main.tsx から呼び出される。
 * ルーティング・プロバイダーの統合は AppRoutes に委譲する。
 * → 05_frontend_specification.md §2 プロジェクト構成
 */
import { AppRoutes } from './routes/AppRoutes'

export default function App() {
  return <AppRoutes />
}
