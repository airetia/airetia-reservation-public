// frontend/src/hooks/useModal.ts

/**
 * モーダル開閉状態管理フック
 * → 05_frontend_specification.md §6 コンポーネント設計 Modal
 *
 * @example
 *   const { isOpen, open, close } = useModal()
 *   const { isOpen, open, close, data } = useModal<BookingResponse>()
 */
import { useState, useCallback } from 'react'

interface UseModalReturn<T = undefined> {
  isOpen: boolean
  data:   T | undefined
  open:   (data?: T) => void
  close:  () => void
}

export function useModal<T = undefined>(): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(false)
  const [data,   setData]   = useState<T | undefined>(undefined)

  const open = useCallback((payload?: T) => {
    setData(payload)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    // アニメーション完了後にデータをクリアするため少し遅延
    setTimeout(() => setData(undefined), 300)
  }, [])

  return { isOpen, data, open, close }
}
