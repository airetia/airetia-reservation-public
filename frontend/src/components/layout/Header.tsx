// frontend/src/components/layout/Header.tsx
import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import styles from './Header.module.css'
import { ROUTES } from '@/config/constants'

/**
 * ヘッダーコンポーネント
 * → MainLayout / PublicLayout から使用
 *
 * プロバイダー承認済みメンバーは「メンバー / 先生」モード切り替えボタンを表示。
 * モードは現在の URL パスで自動判定する:
 *   /provider/* → 先生モード
 *   それ以外     → メンバーモード
 */
export const Header: React.FC = () => {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { isAuthenticated, isAdmin, member, capabilities, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    try { await logout() } finally { navigate(ROUTES.LOGIN) }
  }

  // /member は完全一致のみ（/member/bookings 等でアクティブにならないよう）
  const isActive = (path: string) => {
    if (path === '/member' || path === '/provider' || path === '/admin') {
      return location.pathname === path ? styles.navLinkActive : ''
    }
    return location.pathname === path || location.pathname.startsWith(path + '/')
      ? styles.navLinkActive
      : ''
  }

  // 先生モードかどうか（URL で判定）
  const isProviderMode = location.pathname.startsWith('/provider')

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* ── ロゴ ── */}
        <Link
          to={isAuthenticated ? (isAdmin ? ROUTES.ADMIN_DASHBOARD : isProviderMode ? ROUTES.PROVIDER_DASHBOARD : ROUTES.DASHBOARD) : ROUTES.HOME}
          className={styles.logo}
        >
          <span className={styles.logoMark}>A</span>
          <span className={styles.logoText}>airetia</span>
        </Link>

        {/* ── ナビ（認証済み） ── */}
        {isAuthenticated && (
          <>
            <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
              {isAdmin ? (
                <>
                  <Link to={ROUTES.ADMIN_DASHBOARD}           className={`${styles.navLink} ${isActive('/admin')}`}      onClick={() => setMenuOpen(false)}>ダッシュボード</Link>
                  <Link to={ROUTES.ADMIN_MEMBERS}   className={`${styles.navLink} ${isActive('/admin/members')}`}   onClick={() => setMenuOpen(false)}>メンバー</Link>
                  <Link to={ROUTES.ADMIN_PROVIDERS} className={`${styles.navLink} ${isActive('/admin/providers')}`} onClick={() => setMenuOpen(false)}>プロバイダー審査</Link>
                  <Link to={ROUTES.ADMIN_BOOKINGS}  className={`${styles.navLink} ${isActive('/admin/bookings')}`}  onClick={() => setMenuOpen(false)}>予約管理</Link>
                  <Link to={ROUTES.ADMIN_TICKETS}   className={`${styles.navLink} ${isActive('/admin/tickets')}`}   onClick={() => setMenuOpen(false)}>チケット付与</Link>
                  <Link to={ROUTES.ADMIN_INQUIRIES}
                    className={`${styles.navLink} ${isActive('/admin/inquiries')}`}
                    onClick={() => setMenuOpen(false)}>問い合わせ</Link>
                </>
              ) : isProviderMode ? (
                /* 先生モードのナビ */
                <>
                  <Link to={ROUTES.PROVIDER_DASHBOARD}                className={`${styles.navLink} ${isActive('/provider')}`}                onClick={() => setMenuOpen(false)}>ダッシュボード</Link>
                  <Link to={ROUTES.PROVIDER_AVAILABILITIES} className={`${styles.navLink} ${isActive('/provider/availabilities')}`} onClick={() => setMenuOpen(false)}>空き枠管理</Link>
                  <Link to={ROUTES.PROVIDER_REPORTS}        className={`${styles.navLink} ${isActive('/provider/reports')}`}        onClick={() => setMenuOpen(false)}>報告書</Link>
                </>
              ) : (
                /* メンバーモードのナビ */
                <>
                  <Link to={ROUTES.DASHBOARD}                  className={`${styles.navLink} ${isActive('/member')}`}                  onClick={() => setMenuOpen(false)}>ホーム</Link>
                  <Link to={ROUTES.OFFERINGS_SEARCH} className={`${styles.navLink} ${isActive('/member/offerings')}`} onClick={() => setMenuOpen(false)}>サービスを探す</Link>
                  <Link to={ROUTES.BOOKINGS}         className={`${styles.navLink} ${isActive('/member/bookings')}`}         onClick={() => setMenuOpen(false)}>予約</Link>
                  <Link to={ROUTES.TICKETS}          className={`${styles.navLink} ${isActive('/member/tickets')}`}          onClick={() => setMenuOpen(false)}>チケット</Link>
                  <Link to={ROUTES.PARTICIPANTS}     className={`${styles.navLink} ${isActive('/member/participants')}`}     onClick={() => setMenuOpen(false)}>お子様</Link>
                  {!capabilities.hasProvider && (
                    <Link to={ROUTES.PROVIDER_APPLY}
                      className={`${styles.navLink} ${isActive('/member/provider-application')}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      先生に申請
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* ── 右側エリア ── */}
            <div className={styles.right}>

              {/* モード切り替えボタン（プロバイダー承認済みのみ） */}
              {!isAdmin && capabilities.hasProvider && (
                <div className={styles.modeSwitcher}>
                  <button type="button"
                    className={`${styles.modeBtn} ${!isProviderMode ? styles.modeBtnActive : ''}`}
                    onClick={() => navigate(ROUTES.DASHBOARD)}
                  >
                    メンバー
                  </button>
                  <button type="button"
                    className={`${styles.modeBtn} ${isProviderMode ? styles.modeBtnActive : ''}`}
                    onClick={() => navigate(ROUTES.PROVIDER_DASHBOARD)}
                  >
                    先生
                  </button>
                </div>
              )}

              {/* ユーザー名 */}
              <span className={styles.userName}>
                {isAdmin && <span className={styles.adminBadge}>管理者</span>}
                {member?.lastName} {member?.firstName}
              </span>

              {!isAdmin && (
                <Link to={ROUTES.PROFILE} className={styles.profileLink} onClick={() => setMenuOpen(false)}>
                  プロフィール
                </Link>
              )}

              <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                ログアウト
              </button>

              {/* ハンバーガーボタン（モバイル） */}
              <button type="button"
                className={styles.hamburger}
                onClick={() => setMenuOpen(v => !v)}
                aria-label="メニュー"
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </>
        )}

        {/* ── 未認証 ── */}
        {!isAuthenticated && (
          <div className={styles.authButtons}>
            <Link to={ROUTES.LOGIN}    className={styles.btnSecondary}>ログイン</Link>
            <Link to={ROUTES.REGISTER} className={styles.btnPrimary}>新規登録</Link>
          </div>
        )}

      </div>
    </header>
  )
}