/**
 * =========================================
 * Paginationコンポーネント
 * =========================================
 */

import styles from './Pagination.module.css'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisible?: number
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
  className = '',
}) => {
  if (totalPages <= 1) return null

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    const half = Math.floor(maxVisible / 2)

    let start = Math.max(0, currentPage - half)
    let end = Math.min(totalPages - 1, currentPage + half)

    // 調整
    if (currentPage - half < 0) {
      end = Math.min(totalPages - 1, end + (half - currentPage))
    }
    if (currentPage + half >= totalPages) {
      start = Math.max(0, start - (currentPage + half - totalPages + 1))
    }

    // 最初のページ
    if (start > 0) {
      pages.push(0)
      if (start > 1) pages.push('...')
    }

    // 中間ページ
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // 最後のページ
    if (end < totalPages - 1) {
      if (end < totalPages - 2) pages.push('...')
      pages.push(totalPages - 1)
    }

    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className={`${styles.container} ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={styles.button}
      >
        前へ
      </button>

      {pages.map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`${styles.button} ${
              page === currentPage ? styles.active : ''
            }`}
          >
            {page + 1}
          </button>
        ) : (
          <span key={index} className={styles.ellipsis}>
            {page}
          </span>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className={styles.button}
      >
        次へ
      </button>
    </div>
  )
}