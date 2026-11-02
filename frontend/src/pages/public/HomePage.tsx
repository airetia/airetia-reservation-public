// frontend/src/pages/public/HomePage.tsx
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import styles from './HomePage.module.css'

/**
 * ランディングページ（公開・未ログイン）
 * ログイン済みの場合は AppRoutes のリダイレクト / PublicRoute で /member へ遷移
 * → 05_frontend_specification.md §3.1 LandingPage
 */
export const HomePage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      {/* ヘッダー */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src="/assets/images/logo.svg" alt="airetia"
            onError={e => { (e.currentTarget as HTMLImageElement).src = '/assets/images/logo.png' }}
          />
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnOutline} onClick={() => navigate(ROUTES.LOGIN)}>
            ログイン
          </button>
          <button className={styles.btn} onClick={() => navigate(ROUTES.REGISTER)}>
            新規登録
          </button>
        </div>
      </header>

      {/* ヒーロー */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          お子様の可能性を、<br />最高の先生と広げよう
        </h1>
        <p className={styles.heroSubtitle}>
          airetia は審査済みプロバイダーによる
          オンライン・対面レッスン予約サービスです。
        </p>
        <div className={styles.heroCta}>
          <button className={styles.btnLg} onClick={() => navigate(ROUTES.REGISTER)}>
            無料で始める
          </button>
          <button className={styles.btnOutlineLg} onClick={() => navigate(ROUTES.LOGIN)}>
            ログイン
          </button>
        </div>
      </section>

      {/* 特徴 */}
      <section className={styles.features}>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>✓</span>
          <h3>審査済みプロバイダー</h3>
          <p>全プロバイダーは身分証・資格・契約書で厳格に審査されています。</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>✓</span>
          <h3>チケット制で柔軟に</h3>
          <p>1枚500円のチケットで好きなレッスンを予約。有効期限は1年間。</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>✓</span>
          <h3>オンライン・対面</h3>
          <p>お好みの形式でレッスンを受けられます。</p>
        </div>
      </section>

      {/* フッター */}
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} airetia. All rights reserved.</p>
      </footer>
    </div>
  )
}
