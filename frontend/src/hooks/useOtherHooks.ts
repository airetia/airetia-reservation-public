// frontend/src/hooks/useOtherHooks.ts

/**
 * 汎用ユーティリティフック集
 * 単独ファイルにするほど大きくないフックをまとめる。
 * → 05_frontend_specification.md §5 データ取得パターン
 */
import { useState, useEffect, useRef, useCallback } from 'react'

// ── useFetch ─────────────────────────────────────────────────────────────────
/**
 * データ取得フック（アンマウント時のメモリリーク防止対応）
 * → 05_frontend_specification.md §5 データ取得パターン
 *
 * @example
 *   const { data, loading, error, refetch } = useFetch(() => memberApi.getById(id), [id])
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
) {
  const [data,    setData]    = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [trigger, setTrigger] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcher()
      .then(res  => { if (!cancelled) setData(res) })
      .catch(err => { if (!cancelled) setError(err?.response?.data?.message ?? 'データの取得に失敗しました') })
      .finally(  () => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, trigger])

  const refetch = useCallback(() => setTrigger(t => t + 1), [])

  return { data, loading, error, refetch }
}

// ── usePrevious ───────────────────────────────────────────────────────────────
/** 直前の値を保持するフック */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)
  useEffect(() => { ref.current = value }, [value])
  return ref.current
}

// ── useIsMounted ──────────────────────────────────────────────────────────────
/** コンポーネントがマウント中かどうかを返すフック */
export function useIsMounted(): () => boolean {
  const isMounted = useRef(false)
  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])
  return useCallback(() => isMounted.current, [])
}
