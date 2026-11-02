// frontend/src/hooks/usePagination.ts

/**
 * ページネーション状態管理フック
 * → 03_common_specification.md §4 PageResponse
 * → 05_frontend_specification.md §6 Pagination コンポーネント
 *
 * @example
 *   const { page, size, setPage, paginationProps } = usePagination()
 *   // API呼び出し: api.getList({ page, size })
 *   // Paginationコンポーネント: <Pagination {...paginationProps} total={totalPages} />
 */
import { useState, useCallback } from 'react'

interface UsePaginationOptions {
  initialPage?: number  // 0始まり
  initialSize?: number
}

interface UsePaginationReturn {
  page:        number
  size:        number
  setPage:     (page: number) => void
  setSize:     (size: number) => void
  reset:       () => void
  paginationProps: {
    currentPage: number
    pageSize:    number
    onChange:    (page: number) => void
  }
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const { initialPage = 0, initialSize = 20 } = options

  const [page, setPageState] = useState(initialPage)
  const [size, setSizeState] = useState(initialSize)

  const setPage = useCallback((p: number) => setPageState(p), [])
  const setSize = useCallback((s: number) => {
    setSizeState(s)
    setPageState(0)  // サイズ変更時は先頭ページに戻る
  }, [])

  const reset = useCallback(() => {
    setPageState(initialPage)
    setSizeState(initialSize)
  }, [initialPage, initialSize])

  return {
    page,
    size,
    setPage,
    setSize,
    reset,
    paginationProps: {
      currentPage: page,
      pageSize:    size,
      onChange:    setPage,
    },
  }
}
