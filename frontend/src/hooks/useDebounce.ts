// frontend/src/hooks/useDebounce.ts

/**
 * デバウンスフック
 * 検索入力など高頻度イベントのAPI呼び出し抑制に使用する。
 * → 05_frontend_specification.md §5 API通信
 *
 * @example
 *   const debouncedQuery = useDebounce(searchQuery, 400)
 *   useEffect(() => { api.search(debouncedQuery) }, [debouncedQuery])
 */
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
