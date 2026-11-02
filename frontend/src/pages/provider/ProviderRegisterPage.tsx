// frontend/src/pages/provider/ProviderRegisterPage.tsx
import React, { useEffect, useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loading } from '@/components/common/Loading'
import { ROUTES } from '@/config/constants'
import { getMyProvider } from '@/api/providerApi'
import type { ProviderResponse } from '@/models/provider'
import { ProviderStatusLabel } from '@/models/enums'
import styles from './ProviderRegisterPage.module.css'

/**
 * プロバイダーステータスページ（/member/provider-status）
 * - 未申請         → 申請ページへ誘導
 * - PENDING_DOCUMENTS / PENDING / ON_HOLD / REJECTED → ステータス表示
 * - APPROVED       → /provider へリダイレクト
 * - SUSPENDED      → 停止中メッセージ
 */
export const ProviderRegisterPage: React.FC = () => {
  const { member, capabilities, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [provider, setProvider] = useState<ProviderResponse | null>(null)
  const [loadingProv, setLoadingProv] = useState(false)

  // 承認済みなら即座にプロバイダーダッシュボードへ
  useEffect(() => {
    if (!authLoading && capabilities?.hasProvider) {
      navigate(ROUTES.PROVIDER_DASHBOARD, { replace: true })
    }
  }, [authLoading, capabilities, navigate])

  // 申請中のプロバイダー情報を取得
  useEffect(() => {
    if (authLoading || capabilities?.hasProvider) return
    setLoadingProv(true)
    getMyProvider()
      .then(setProvider)
      .catch(() => setProvider(null))
      .finally(() => setLoadingProv(false))
  }, [authLoading, capabilities])

  if (authLoading || loadingProv) return <Loading />
  if (!member) return <Navigate to={ROUTES.LOGIN} replace />

  // 未申請
  if (!provider) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.icon}>📋</div>
          <h1 className={styles.title}>プロバイダー申請</h1>
          <p className={styles.desc}>
            プロバイダーとしてサービスを提供するには、審査が必要です。<br />
            申請フォームから必要事項をご入力ください。
          </p>
          <Link to={ROUTES.PROVIDER_APPLY} className={styles.btn}>申請を始める</Link>
        </div>
      </div>
    )
  }

  const statusMessages: Record<string, { icon: string; msg: string; action?: React.ReactNode }> = {
    PENDING_DOCUMENTS: {
      icon: '📄',
      msg: '書類のアップロードが完了していません。申請フォームから書類を提出してください。',
      action: <Link to={ROUTES.PROVIDER_APPLY} className={styles.btn}>書類を提出する</Link>,
    },
    PENDING: {
      icon: '⏳',
      msg: '審査中です。通常 3 営業日以内に結果をメールでお知らせします。',
    },
    ON_HOLD: {
      icon: '⚠️',
      msg: `審査が保留されています。${provider.onHoldReason ? `理由: ${provider.onHoldReason}` : ''}不備を修正して再提出してください。`,
      action: <Link to={ROUTES.PROVIDER_APPLY} className={styles.btn}>再提出する</Link>,
    },
    REJECTED: {
      icon: '❌',
      msg: `申請が却下されました。${provider.rejectionReason ? `理由: ${provider.rejectionReason}` : ''}${
        provider.reapplicationAvailableAt
          ? `再申請可能日: ${new Date(provider.reapplicationAvailableAt).toLocaleDateString('ja-JP')}`
          : ''
      }`,
    },
    SUSPENDED: {
      icon: '🚫',
      msg: 'プロバイダー機能が一時停止されています。詳細はお問い合わせください。',
    },
  }

  const info = statusMessages[provider.status]

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>{info?.icon ?? '📋'}</div>
        <h1 className={styles.title}>申請状況</h1>
        <div className={styles.statusBadge}>{ProviderStatusLabel[provider.status] ?? provider.status}</div>
        <p className={styles.desc}>{info?.msg}</p>
        {info?.action}
        <Link to={ROUTES.DASHBOARD} className={styles.back}>ダッシュボードに戻る</Link>
      </div>
    </div>
  )
}
