// frontend/src/hooks/useLocalStorage.ts

/**
 * localStorage 永続化フック
 * → 05_frontend_specification.md §4 ローカル状態
 *
 * セッション情報・認証状態は localStorage に保存しないこと。
 * UI設定（テーマ、表示件数等）の保持に使用する。
 *
 * @example
 *   const [pageSize, setPageSize] = useLocalStorage('pageSize', 20)
 */
import { useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(`useLocalStorage: key="${key}"の保存に失敗しました`, error)
    }
  }

  return [storedValue, setValue]
}
