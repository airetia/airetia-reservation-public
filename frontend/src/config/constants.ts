// frontend/src/config/constants.ts

/**
 * アプリケーション定数定義
 * → 03_common_specification.md §1（API設計原則）§5（エンドポイント一覧）
 * → 05_frontend_specification.md §3.2（ルート定義）
 * → 02_business_rules.md §1.1, §2.2, §5.1
 */

// ─── ルート定数 ────────────────────────────────────────────────────────────
export const ROUTES = {
  // 公開
  HOME:               '/',
  LOGIN:              '/login',
  REGISTER:           '/register',

  // メンバー
  DASHBOARD:          '/member',
  MEMBER_DASHBOARD:   '/member',              // DASHBOARD の別名（後方互換）
  PROFILE:            '/member/profile',
  BOOKINGS:           '/member/bookings',
  PARTICIPANTS:       '/member/participants',
  OFFERINGS_SEARCH:   '/member/offerings',
  TICKETS:            '/member/tickets',
  PROVIDER_APPLY:     '/member/provider-application',
  PROVIDER_STATUS:    '/member/provider-status',

  // プロバイダー
  PROVIDER_DASHBOARD:      '/provider',
  PROVIDER_AVAILABILITIES: '/provider/availabilities',
  PROVIDER_REPORTS:        '/provider/reports',

  // 管理者
  ADMIN_DASHBOARD: '/admin',
  ADMIN_MEMBERS:   '/admin/members',
  ADMIN_PROVIDERS: '/admin/providers',
  ADMIN_TICKETS:   '/admin/tickets',
  ADMIN_BOOKINGS:  '/admin/bookings',
  ADMIN_OFFERINGS: '/admin/offerings',
  ADMIN_INQUIRIES: '/admin/inquiries',
} as const

// ─── APIエンドポイント定数 ──────────────────────────────────────────────────
// → 03_common_specification.md §5 エンドポイント一覧

const API_BASE = '/api/v1'

export const API_ENDPOINTS = {
  // 認証
  AUTH_LOGIN:    `${API_BASE}/auth/login`,
  AUTH_LOGOUT:   `${API_BASE}/auth/logout`,
  AUTH_REGISTER: `${API_BASE}/auth/register`,
  AUTH_ME:       `${API_BASE}/auth/me`,

  // メンバー
  MEMBERS:                               `${API_BASE}/members`,
  MEMBER_BY_ID:       (id: number)    => `${API_BASE}/members/${id}`,
  MEMBER_NOTIFY:      (id: number)    => `${API_BASE}/members/${id}/notifications`,

  // プロバイダー
  PROVIDERS:                               `${API_BASE}/providers`,
  PROVIDER_BY_ID:     (id: number)     => `${API_BASE}/providers/${id}`,
  PROVIDER_DOCUMENTS: (id: number)     => `${API_BASE}/providers/${id}/documents`,
  PROVIDER_APPROVE:   (id: number)     => `${API_BASE}/providers/${id}/approve`,
  PROVIDER_REJECT:    (id: number)     => `${API_BASE}/providers/${id}/reject`,
  PROVIDER_HOLD:      (id: number)     => `${API_BASE}/providers/${id}/hold`,
  PROVIDER_SUSPEND:   (id: number)     => `${API_BASE}/providers/${id}/suspend`,
  PROVIDER_UNSUSPEND: (id: number)     => `${API_BASE}/providers/${id}/unsuspend`,

  // パーティシパント
  PARTICIPANTS:                              `${API_BASE}/participants`,
  PARTICIPANT_BY_ID:  (id: number)      => `${API_BASE}/participants/${id}`,

  // オファリング
  OFFERINGS:                                 `${API_BASE}/offerings`,
  OFFERING_BY_ID:     (id: number)      => `${API_BASE}/offerings/${id}`,

  // アベイラビリティ
  AVAILABILITIES:                             `${API_BASE}/availabilities`,
  AVAILABILITY_BY_ID: (id: number)       => `${API_BASE}/availabilities/${id}`,

  // ブッキング
  // キャンセルは DELETE /bookings/{id}（→ 03_common_specification.md §5）
  BOOKINGS:                                   `${API_BASE}/bookings`,
  BOOKING_BY_ID:      (id: number)       => `${API_BASE}/bookings/${id}`,
  BOOKING_CONFIRM:    (id: number)       => `${API_BASE}/bookings/${id}/confirm`,

  // チケット
  TICKETS:       `${API_BASE}/tickets`,
  TICKET_USAGES: `${API_BASE}/tickets/usages`,

  // 報告書
  REPORTS:                               `${API_BASE}/reports`,
  REPORT_BY_ID:   (id: number)        => `${API_BASE}/reports/${id}`,

  // 問い合わせ
  INQUIRIES:                               `${API_BASE}/inquiries`,
  INQUIRY_BY_ID:  (id: number)         => `${API_BASE}/inquiries/${id}`,
  INQUIRY_STATUS: (id: number)         => `${API_BASE}/inquiries/${id}/status`,

  // 管理者専用
  // ※ ADMIN_PROVIDERS / ADMIN_INQUIRIES はバックエンドが同じエンドポイントを
  //   @PreAuthorize("hasRole('ADMIN')") で保護しているため共用
  ADMIN_ACCOUNTS:                              `${API_BASE}/admin/accounts`,
  ADMIN_MEMBERS:                               `${API_BASE}/admin/members`,
  ADMIN_MEMBER_DELETE:    (id: number)     => `${API_BASE}/admin/members/${id}`,
  ADMIN_MEMBER_SUSPEND:   (id: number)     => `${API_BASE}/admin/members/${id}/suspend`,
  ADMIN_MEMBER_UNSUSPEND: (id: number)     => `${API_BASE}/admin/members/${id}/unsuspend`,
  ADMIN_PENALTIES:                             `${API_BASE}/admin/penalties`,
  ADMIN_PENALTY_DELETE:   (id: number)     => `${API_BASE}/admin/penalties/${id}`,
  ADMIN_INQUIRIES:                             `${API_BASE}/inquiries`,
} as const

// ─── ビジネスルール定数 ────────────────────────────────────────────────────
// → 02_business_rules.md §2.2（予約上限）§5.1.1（プロバイダー申請）§1.1（チケット）

export const BUSINESS_RULES = {
  // チケット → §1.1
  TICKET_UNIT_PRICE:    500,
  TICKET_VALIDITY_DAYS: 365,

  // 予約上限 → §2.2 / §2.3
  MAX_PENDING_BOOKINGS:      10,
  MAX_CONCURRENT_BOOKINGS:   90,
  MAX_DAILY_BOOKINGS:         3,

  // Participant → §01_glossary
  MAX_CHILDREN_PER_MEMBER:   5,

  // プロバイダー申請 → §5.1.1
  MAX_QUALIFICATIONS:        5,
  MAX_ACHIEVEMENTS:          5,

  // キャンセルポリシー境界（分）→ §3.1
  CANCELLATION_FULL_REFUND_MINUTES:    1440,  // 24時間以上前
  CANCELLATION_HALF_REFUND_MINUTES:     720,  // 12時間以上前
  CANCELLATION_PARTIAL_REFUND_MINUTES:   30,  // 30分以上前

  // ペナルティ → §4
  PENALTY_VALIDITY_MONTHS:      3,
  NO_SHOW_SUSPEND_7D_COUNT:     3,
  NO_SHOW_SUSPEND_90D_COUNT:    5,
  NO_SHOW_DELETION_COUNT:      10,

  // 空き枠・予約解放 → §5.2 / §2.1
  BOOKING_RELEASE_MONTHS:          2,
  AVAILABILITY_REGISTER_MONTHS:    3,
} as const

// ─── バリデーション定数 ────────────────────────────────────────────────────
// → 03_common_specification.md §7 バリデーションルール

export const VALIDATION = {
  // 文字数
  NAME_MAX:          50,
  ADDRESS_MAX:       255,
  HIGH_SCHOOL_MAX:   255,
  UNIVERSITY_MAX:    255,
  APPEAL_POINT_MAX:  2000,
  QUALIFICATION_MAX: 255,
  ACHIEVEMENT_MAX:   255,
  REPORT_TEXT_MAX:   1000,
  INQUIRY_BODY_MAX:  1000,
  EMAIL_MAX:         255,

  // パスワード → §7
  PASSWORD_MIN:       8,
  PASSWORD_MAX:      64,
  ADMIN_PASSWORD_MIN: 12,

  // 数値
  PHONE_MIN:     10,
  PHONE_MAX:     11,
  POSTAL_CODE_LEN: 7,
  DURATION_MIN:  15,
  DURATION_MAX: 120,
  DURATION_STEP: 15,
  CAPACITY_MIN:   1,
  CAPACITY_MAX:  15,
  TICKETS_MIN:    1,

  // ファイル → §7
  FILE_MAX_SIZE_MB: 10,
  FILE_ACCEPT: 'image/jpeg,image/png,application/pdf',
} as const