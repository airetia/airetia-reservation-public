// frontend/src/routes/AppRoutes.tsx
import React from 'react'
import { ROUTES } from '@/config/constants'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }  from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastProvider'
import { MainLayout }    from '@/components/layout/MainLayout'
import { PublicLayout }  from '@/components/layout/PublicLayout'

import { PrivateRoute }  from './PrivateRoute'
import { ProviderRoute } from './ProviderRoute'
import { AdminRoute }    from './AdminRoute'
import { PublicRoute }   from './PublicRoute'

// ── 公開ページ ──────────────────────────────────────────────────────────────
import { HomePage }     from '@/pages/public/HomePage'
import { LoginPage }    from '@/pages/auth/LoginPage'
import { RegisterPage }        from '@/pages/auth/RegisterPage'
import { ProviderPublicPage } from '@/pages/public/ProviderPublicPage'

// ── メンバーページ ──────────────────────────────────────────────────────────
import { DashboardPage }           from '@/pages/member/DashboardPage'
import { ProfilePage }             from '@/pages/member/ProfilePage'
import { ParticipantsPage }        from '@/pages/member/ParticipantsPage'
import { OfferingSearchPage }      from '@/pages/member/OfferingSearchPage'
import { BookingsPage }            from '@/pages/member/BookingsPage'
import { TicketsPage }             from '@/pages/member/TicketsPage'
import { ProviderApplicationPage } from '@/pages/member/ProviderApplicationPage'
import { OfferingDetailPage }      from '@/pages/member/OfferingDetailPage'

// ── プロバイダーページ ──────────────────────────────────────────────────────
import { ProviderDashboardPage }  from '@/pages/provider/ProviderDashboardPage'
import { ProviderRegisterPage }   from '@/pages/provider/ProviderRegisterPage'
import { AvailabilitiesPage }    from '@/pages/provider/AvailabilitiesPage'
import { ReportsPage }           from '@/pages/provider/ReportsPage'

// ── 管理者ページ ────────────────────────────────────────────────────────────
import { AdminDashboardPage }    from '@/pages/admin/AdminDashboardPage'
import { AdminMembersPage }      from '@/pages/admin/AdminMembersPage'
import { AdminProvidersPage }    from '@/pages/admin/AdminProvidersPage'
import { AdminTicketsPage }      from '@/pages/admin/AdminTicketsPage'
import { AdminInquiriesPage }  from '@/pages/admin/AdminInquiriesPage'
import { AdminBookingsPage }     from '@/pages/admin/AdminBookingsPage'
import { AdminOfferingsPage }    from '@/pages/admin/AdminOfferingsPage'

// ── エラーページ ────────────────────────────────────────────────────────────
import { NotFoundPage }  from '@/pages/error/NotFoundPage'
import { ForbiddenPage } from '@/pages/error/ForbiddenPage'
import { Servererror }   from '@/pages/error/Servererror'

/**
 * アプリケーションルーティング定義
 * → 05_frontend_specification.md §3.1 画面構成 / §3.2 ルート定義 / §3.3 認証ガード
 *
 * ルートガード:
 *   PublicRoute   → 未認証専用（認証済み → /member）
 *   PrivateRoute  → ログイン必須（未認証 → /login）
 *   ProviderRoute → APPROVED プロバイダー必須（未承認 → /member）
 *   AdminRoute    → ADMIN ロール必須（非管理者 → /member）
 */
const AppRoutesInner: React.FC = () => (
  <Routes>
    {/* ── 公開ページ（未認証専用） ──────────────────────────────────────── */}
    {/* PublicRoute は <Outlet /> をレンダリングするため element に設定し、子ルートで各ページを定義 */}
    <Route element={<PublicLayout />}>
      <Route element={<PublicRoute />}>
        <Route path="/"          element={<HomePage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />
      </Route>
      {/* 認証不要・ログイン済みでもアクセス可能 */}
      <Route path="/providers/:id" element={<ProviderPublicPage />} />
    </Route>

    {/* ── メンバーページ（ログイン必須） ─────────────────────────────────── */}
    <Route element={<PrivateRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/member"                      element={<DashboardPage />} />
        <Route path="/member/profile"              element={<ProfilePage />} />
        <Route path="/member/participants"         element={<ParticipantsPage />} />
        <Route path="/member/offerings"            element={<OfferingSearchPage />} />
        <Route path="/member/offerings/:id"        element={<OfferingDetailPage />} />
        <Route path="/member/bookings"             element={<BookingsPage />} />
        <Route path="/member/tickets"              element={<TicketsPage />} />
        <Route path="/member/provider-application" element={<ProviderApplicationPage />} />
        <Route path="/member/provider-status"      element={<ProviderRegisterPage />} />
      </Route>
    </Route>

    {/* ── プロバイダーページ（APPROVED 必須） ─────────────────────────────── */}
    <Route element={<ProviderRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/provider"                element={<ProviderDashboardPage />} />
        <Route path="/provider/availabilities" element={<AvailabilitiesPage />} />
        <Route path="/provider/reports"        element={<ReportsPage />} />
      </Route>
    </Route>

    {/* ── 管理者ページ（ADMIN 必須） ──────────────────────────────────────── */}
    <Route element={<AdminRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/admin"               element={<AdminDashboardPage />} />
        <Route path="/admin/members"       element={<AdminMembersPage />} />
        <Route path="/admin/providers"     element={<AdminProvidersPage />} />
        <Route path="/admin/tickets"       element={<AdminTicketsPage />} />
        <Route path="/admin/bookings"      element={<AdminBookingsPage />} />
        <Route path="/admin/offerings"     element={<AdminOfferingsPage />} />
        <Route path="/admin/inquiries"     element={<AdminInquiriesPage />} />
      </Route>
    </Route>

    {/* 旧パス互換リダイレクト */}
    <Route path="/dashboard"   element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    <Route path="/dashboard/*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

    <Route path="/403"    element={<ForbiddenPage />} />
    <Route path="/500"    element={<Servererror />} />
    <Route path="*"       element={<NotFoundPage />} />
  </Routes>
)

export const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <AppRoutesInner />
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
)