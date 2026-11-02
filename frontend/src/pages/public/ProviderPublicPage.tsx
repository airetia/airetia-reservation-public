// frontend/src/pages/public/ProviderPublicPage.tsx
/**
 * 先生（プロバイダー）公開プロフィールページ
 * URL: /providers/:id
 * → 認証不要（公開ページ）
 *
 * 修正: 一覧 API (from) ではプロバイダープロフィールが返らないため、
 *   1. 全オファリング一覧を取得してプロバイダーIDでフィルタ
 *   2. 最初の1件の詳細 API (fromDetail) を追加取得してプロフィールを表示
 * → 04_backend_specification.md の OfferingService.fromDetail() が必要
 */
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { get } from '@/api/httpClient'
import { API_ENDPOINTS, ROUTES } from '@/config/constants'
import type { OfferingResponse } from '@/models/offering'
import styles from './ProviderPublicPage.module.css'

export function ProviderPublicPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [offerings, setOfferings] = useState<OfferingResponse[]>([])
  const [detail,    setDetail]    = useState<OfferingResponse | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)

    // 全オファリングを取得 → プロバイダーIDでフィルタ
    get(API_ENDPOINTS.OFFERINGS)
      .then(async res => {
        const all: OfferingResponse[] = Array.isArray(res.data?.data) ? res.data.data : []
        const filtered = all.filter(o => String(o.providerId) === id)

        if (filtered.length === 0) {
          setError('このプロバイダーの情報が見つかりません')
          return
        }

        setOfferings(filtered)

        // 詳細 API で1件取得しプロバイダープロフィールを補完
        // fromDetail() が providerAppealPoint / providerBio 等を返す
        try {
          const detailRes = await get(API_ENDPOINTS.OFFERING_BY_ID(filtered[0].id))
          setDetail(detailRes.data?.data ?? filtered[0])
        } catch {
          // 詳細取得失敗時は一覧データで代替（プロフィールは空になる）
          setDetail(filtered[0])
        }
      })
      .catch(() => setError('プロバイダー情報の取得に失敗しました'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className={styles.centered}>読み込み中...</div>
  if (error || offerings.length === 0) return (
    <div className={styles.centered}>
      <p className={styles.errorMsg}>{error}</p>
      <button type="button" className={styles.backLink}
        onClick={() => navigate(ROUTES.OFFERINGS_SEARCH)}>
        ← 検索に戻る
      </button>
    </div>
  )

  // プロフィール情報は detail（fromDetail）から取得、なければ first で代替
  const profile = detail ?? offerings[0]

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to={ROUTES.OFFERINGS_SEARCH}>レッスンを探す</Link>
        <span className={styles.sep}>›</span>
        <span>{profile.providerName} 先生</span>
      </nav>

      <div className={styles.layout}>
        {/* ════ 左：プロフィール ════ */}
        <aside className={styles.profileSide}>
          <div className={styles.avatar}>
            {profile.providerName.charAt(0)}
          </div>
          <h1 className={styles.name}>{profile.providerName} 先生</h1>

          {profile.recommendScore > 0 && (
            <div className={styles.scoreRow}>
              <span className={styles.scoreStar}>★</span>
              <span className={styles.scoreNum}>
                {Math.round(profile.recommendScore * 100)}
              </span>
              <span className={styles.scoreLabel}>おすすめ度</span>
            </div>
          )}

          {profile.providerAppealPoint ? (
            <blockquote className={styles.appeal}>
              {profile.providerAppealPoint}
            </blockquote>
          ) : (
            <p className={styles.noProfile}>プロフィール情報がありません</p>
          )}

          {profile.providerBio && (
            <p className={styles.bio}>{profile.providerBio}</p>
          )}

          {(profile.providerQualifications?.length ?? 0) > 0 && (
            <section className={styles.infoSection}>
              <h3 className={styles.infoSectionTitle}>保有資格</h3>
              <ul className={styles.tagList}>
                {profile.providerQualifications!.map((q, i) => (
                  <li key={i} className={styles.tagBlue}>{q}</li>
                ))}
              </ul>
            </section>
          )}

          {(profile.providerAchievements?.length ?? 0) > 0 && (
            <section className={styles.infoSection}>
              <h3 className={styles.infoSectionTitle}>実績・賞歴</h3>
              <ul className={styles.tagList}>
                {profile.providerAchievements!.map((a, i) => (
                  <li key={i} className={styles.tagYellow}>{a}</li>
                ))}
              </ul>
            </section>
          )}

          {(profile.providerHighSchool || profile.providerUniversity) && (
            <section className={styles.infoSection}>
              <h3 className={styles.infoSectionTitle}>学歴</h3>
              {profile.providerUniversity && (
                <p className={styles.school}>🎓 {profile.providerUniversity}</p>
              )}
              {profile.providerHighSchool && (
                <p className={styles.school}>🏫 {profile.providerHighSchool}</p>
              )}
            </section>
          )}
        </aside>

        {/* ════ 右：担当サービス一覧 ════ */}
        <main className={styles.offeringsMain}>
          <h2 className={styles.offeringsTitle}>
            提供中のレッスン <span className={styles.offeringsCount}>{offerings.length}件</span>
          </h2>

          <div className={styles.offeringList}>
            {offerings.map(o => (
              <Link
                key={o.id}
                to={`/member/offerings/${o.id}`}
                className={styles.offeringCard}
              >
                <div className={styles.offeringCardBadges}>
                  <span className={styles.badgeMethod}>
                    {o.deliveryMethod === 'ONLINE' ? '🌐 オンライン' : '📍 対面'}
                  </span>
                  <span className={styles.badgeDuration}>{o.durationMinutes}分</span>
                  <span className={styles.badgeTicket}>🎫 {o.ticketsRequired}枚</span>
                </div>
                <h3 className={styles.offeringTitle}>{o.title}</h3>
                {o.description && (
                  <p className={styles.offeringDesc}>{o.description}</p>
                )}
                <span className={styles.offeringCta}>予約する →</span>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}