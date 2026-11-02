// frontend/src/contexts/ToastContext.ts

/**
 * ToastContext 型エクスポート
 * 実装は ToastProvider.tsx に集約。
 * このファイルは型参照のみに使用する。
 * → 05_frontend_specification.md §4 グローバル状態 ToastContext
 */
export type { ToastContextType } from './ToastProvider'
export { useToast } from './ToastProvider'
