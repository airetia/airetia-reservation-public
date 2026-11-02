// frontend/src/components/common/ErrorBoundary.tsx
import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Reactのエラーバウンダリ
 * 子コンポーネントで発生した予期せぬエラーをキャッチして
 * 画面真っ白を防ぐ。MainLayout の Outlet をラップして使用。
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '1rem',
          color: '#6b7280',
          textAlign: 'center',
          padding: '2rem',
        }}>
          <p style={{ fontSize: '2rem' }}>⚠️</p>
          <p style={{ fontWeight: 700, color: '#374151' }}>ページの表示中にエラーが発生しました</p>
          <p style={{ fontSize: '0.875rem' }}>
            {this.state.error?.message ?? '予期せぬエラーです'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/member' }}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#ed53a3',
              color: '#fff',
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ホームに戻る
          </button>
        </div>
      )
    }
    return this.props.children
  }
}