// frontend/src/main.tsx

/**
 * アプリケーションエントリポイント
 *
 * ★ CSS 読み込み順（05_frontend_specification.md §7）:
 *   base.css → @import variables.css → :root に全トークン定義
 *   以降の *.module.css は var(--xxx) で参照するだけでよい。
 */
import React from 'react'
import ReactDOM from 'react-dom/client'

import './styles/base.css'   // ← @import ./variables.css を含む。必ず最初。

import { AppRoutes } from './routes/AppRoutes'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
)
