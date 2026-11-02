[//]: # (airetia/docs/05_frontend_specification.md)

# airetia フロントエンド仕様書

**Version**: 3.1.0 | **Updated**: 2026-02-25
**API 契約** → [03_common_specification.md](./03_common_specification.md) | **ビジネスルール** → [02_business_rules.md](./02_business_rules.md)

---

## 目次
1. [技術スタック](#1-技術スタック)
2. [プロジェクト構成](#2-プロジェクト構成)
3. [画面設計・ルーティング](#3-画面設計ルーティング)
4. [状態管理](#4-状態管理)
5. [API 通信](#5-api通信)
6. [コンポーネント設計](#6-コンポーネント設計)
7. [スタイリング](#7-スタイリング)
8. [フォーム実装](#8-フォーム実装)
9. [ファイルアップロード実装](#9-ファイルアップロード実装)
10. [エラーハンドリング](#10-エラーハンドリング)

---

## 1. 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| React | 18.x | UI フレームワーク |
| TypeScript | 5.x | 型安全性 |
| Vite | 5.x | ビルドツール |
| React Router | 6.x | ルーティング |
| Axios | 1.x | HTTP 通信 |
| dayjs | 1.x | 日時処理（JST 変換） |

---

## 2. プロジェクト構成

```
frontend/src/
├── config/          # env.ts, constants.ts, routes.ts
├── models/          # Enum・ドメイン型定義（バックエンド Enum に対応）
│   ├── enums.ts
│   ├── member.ts
│   ├── provider.ts
│   ├── participant.ts
│   ├── offering.ts
│   ├── availability.ts
│   ├── booking.ts
│   ├── ticket.ts
│   ├── penalty.ts
│   └── report.ts
├── api/             # httpClient.ts, interceptors.ts, *Api.ts
├── hooks/           # useAuth.ts, useBooking.ts, useTicket.ts, useFetch.ts 等
├── contexts/        # AuthContext, ToastContext, ModalContext
├── components/
│   ├── common/      # Button, Input, Select, Modal, Toast, Loading, Card,
│   │                #   Pagination, ErrorBoundary, EmptyState, FileUpload
│   ├── layout/      # Header, Footer, MainLayout, PublicLayout
│   └── features/    # auth/, member/, provider/, booking/, ticket/, admin/
├── pages/
│   ├── public/      # LandingPage, LoginPage, RegisterPage
│   ├── member/      # DashboardPage, ProfilePage, BookingsPage,
│   │                #   ParticipantsPage, TicketsPage
│   ├── provider/    # ProviderDashboardPage, AvailabilitiesPage, ReportsPage,
│   │                #   ProviderApplicationPage
│   └── admin/       # AdminDashboardPage, MembersPage, ProvidersPage,
│                    #   AdminTicketsPage
├── routes/          # AppRoutes, PublicRoute, PrivateRoute, AdminRoute, ProviderRoute
├── utils/           # date.ts, validation.ts, formatter.ts, error.ts
└── styles/          # variables.css, theme.css, base.css, utilities.css
```

---

## 3. 画面設計・ルーティング

### 3.1 画面構成

#### 公開ページ

| パス | コンポーネント | 内容 |
|------|--------------|------|
| `/` | `LandingPage` | サービス説明・CTA（新規登録 / ログイン） |
| `/login` | `LoginPage` | ログインフォーム |
| `/register` | `RegisterPage` | 会員登録フォーム |

#### メンバーページ（MEMBER）

| パス | コンポーネント | 内容 |
|------|--------------|------|
| `/member` | `DashboardPage` | お知らせ・チケット残高・近日の予約 |
| `/member/profile` | `ProfilePage` | プロフィール表示・編集 |
| `/member/bookings` | `BookingsPage` | 予約一覧・キャンセル |
| `/member/participants` | `ParticipantsPage` | 利用者一覧・登録・編集・削除 |
| `/member/tickets` | `TicketsPage` | チケット残高・購入申請・使用履歴 |
| `/member/provider-application` | `ProviderApplicationPage` | プロバイダー申請（多段ウィザード） |

#### プロバイダーページ（MEMBER + APPROVED）

| パス | コンポーネント | 内容 |
|------|--------------|------|
| `/provider` | `ProviderDashboardPage` | 今月の予約・報告書未提出一覧 |
| `/provider/availabilities` | `AvailabilitiesPage` | 空き枠管理 |
| `/provider/reports` | `ReportsPage` | 報告書一覧・作成 |

#### 管理者ページ（ADMIN）

| パス | コンポーネント | 内容 |
|------|--------------|------|
| `/admin` | `AdminDashboardPage` | KPI・承認待ちプロバイダー |
| `/admin/members` | `MembersPage` | メンバー管理・停止・解除 |
| `/admin/providers` | `ProvidersPage` | プロバイダー承認・却下・書類閲覧 |
| `/admin/tickets` | `AdminTicketsPage` | チケット手動付与 |

### 3.2 ルート定義

```tsx
// routes/AppRoutes.tsx
export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return (
    <BrowserRouter>
      <ScrollRestoration />
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={isAuthenticated ? <Navigate to="/member" replace /> : <LandingPage />} />
          <Route path="login"    element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route path="/member" element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="profile"              element={<ProfilePage />} />
            <Route path="bookings"             element={<BookingsPage />} />
            <Route path="participants"         element={<ParticipantsPage />} />
            <Route path="tickets"              element={<TicketsPage />} />
            <Route path="provider-application" element={<ProviderApplicationPage />} />
          </Route>
        </Route>

        <Route path="/provider" element={<ProviderRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<ProviderDashboardPage />} />
            <Route path="availabilities" element={<AvailabilitiesPage />} />
            <Route path="reports"        element={<ReportsPage />} />
          </Route>
        </Route>

        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="members"   element={<MembersPage />} />
            <Route path="providers" element={<ProvidersPage />} />
            <Route path="tickets"   element={<AdminTicketsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
```

### 3.3 認証ガード

```tsx
// PrivateRoute: 未ログイン → /login
export const PrivateRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading fullScreen />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// ProviderRoute: 未承認 → /member
export const ProviderRoute: React.FC = () => {
  const { isAuthenticated, capabilities, loading } = useAuth();
  if (loading) return <Loading fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!capabilities.hasProvider) return <Navigate to="/member" replace />;
  return <Outlet />;
};

// AdminRoute: 管理者以外 → /member
export const AdminRoute: React.FC = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <Loading fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/member" replace />;
  return <Outlet />;
};
```

### 3.4 主要画面の仕様

#### LoginPage
- 画面中央にカード（幅 400px）
- ロゴ: `/assets/images/logo.svg`
- フォーム: メール・パスワード・ログインボタン
- 下部リンク: 「アカウントをお持ちでない方は新規登録」

#### DashboardPage 構成
1. お知らせ（最新 3 件）
2. チケット残高（有効枚数 + 最短有効期限）
3. 今後の予約一覧（直近 5 件・CONFIRMED）
4. クイックアクション（レッスンを探す / チケット購入）

#### ProviderApplicationPage（多段ウィザード）

```
Step 1: 基本情報
  - 出身高校・大学、保有資格（最大 5 件）、賞歴・実績（最大 5 件）
  - アピールポイント（2000 文字・リアルタイム文字数表示）

Step 2: 書類アップロード
  - IDENTITY / CONTRACT / BANK_INFO
  - JPG / PNG / PDF / 10 MB 以内
  - アップロード済みファイル名表示・差し替えボタン

Step 3: 確認画面
  - 入力内容の一覧表示
  - 「申請する」→ 送信中スピナー表示
  - エラー時は画面を維持しトースト通知

Step 4: 完了画面
  - 「申請を受け付けました。審査結果をメールでお送りします。」
  - ダッシュボードへ戻るボタン
```

---

## 4. 状態管理

### AuthContext

```tsx
interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  member: Member | null;
  capabilities: {
    hasProvider: boolean;   // camelCase 統一（has_provider は NG）
    hasParent: boolean;
  };
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}
```

**初回マウント時**: `GET /api/v1/auth/me` でセッション確認。`401` → `member = null`（自動リダイレクトなし）。

### グローバル状態（Context）

- `AuthContext`: 認証状態・ユーザー情報・capabilities
- `ToastContext`: トースト通知（成功・エラー・情報、3 秒自動消去）
- `ModalContext`: モーダル管理

### ローカル状態（useState）

フォーム入力値・UI 表示状態・ページ固有データ

---

## 5. API 通信

### httpClient.ts

```typescript
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});
```

### インターセプター

```typescript
// CSRF トークン自動付与
httpClient.interceptors.request.use((config) => {
  const csrfToken = getCookie('XSRF-TOKEN');
  if (csrfToken && config.method !== 'get') {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }
  return config;
});

// セッション切れ処理
httpClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);
```

### データ取得パターン

```typescript
const [data, setData] = useState<T | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  let cancelled = false;
  setLoading(true);
  api.fetch()
    .then(res => { if (!cancelled) setData(res.data); })
    .catch(err => { if (!cancelled) setError(extractErrorMessage(err)); })
    .finally(() => { if (!cancelled) setLoading(false); });
  return () => { cancelled = true; };  // アンマウント時のメモリリーク防止
}, [deps]);

if (loading) return <Loading />;
if (error)   return <ErrorMessage message={error} />;
if (!data)   return <EmptyState />;
```

### フォーム送信パターン

```typescript
const handleSubmit = async (data: FormData) => {
  setSubmitting(true);
  try {
    await api.submit(data);
    showToast('登録しました', 'success');
    navigate('/next-page');
  } catch (err) {
    showToast(extractErrorMessage(err) ?? 'エラーが発生しました', 'error');
    // navigate しない → 画面を維持
  } finally {
    setSubmitting(false);
  }
};
```

---

## 6. コンポーネント設計

### 設計原則

- 1 コンポーネント = 1 責務
- 全 Props に TypeScript 型定義
- CSS Modules を使用
- `loading` / `error` 状態を必ず実装

### 必須共通コンポーネント

| コンポーネント | 用途 |
|--------------|------|
| `Button` | プライマリ・セカンダリ・危険・無効化・submitting 状態 |
| `Input` | テキスト・パスワード・日付・エラー表示 |
| `Select` | ドロップダウン |
| `Modal` | 確認ダイアログ・フォームモーダル |
| `Toast` | 成功・エラー・情報通知（3 秒自動消去） |
| `Loading` | スピナー（`fullScreen` prop 対応） |
| `Card` | コンテンツカード |
| `ErrorBoundary` | エラー時フォールバック |
| `EmptyState` | データ 0 件時の表示 |
| `FileUpload` | ファイル選択・プレビュー・差し替え |

### 重要な実装ルール

```tsx
// ProfilePage: URLパラメータに依存せず AuthContext から ID を取得する
const { member } = useAuth();
const { data: profile } = useFetch(() => memberApi.getById(member!.id), [member?.id]);

// ErrorBoundary は MainLayout で全ページをラップする
<ErrorBoundary>
  <Outlet />
</ErrorBoundary>

// Header ロゴ
<Link to={isAuthenticated ? '/member' : '/'}>
  <img src="/assets/images/logo.svg" alt="airetia" height={32} />
</Link>
```

---

## 7. スタイリング

### CSS 階層

```
variables.css  ← 色・サイズ・フォント定義
    ↓
theme.css      ← variables 参照（テキスト・背景・ボーダー色）
    ↓
base.css       ← リセット・body・タイポグラフィ
    ↓
utilities.css + components/*.module.css
```

### 主要 CSS 変数

```css
:root {
  --color-primary:   #3b82f6;
  --color-secondary: #8b5cf6;
  --color-success:   #10b981;
  --color-warning:   #f59e0b;
  --color-danger:    #ef4444;
  --font-size-base:  1rem;
  --spacing-md:      1rem;
  --border-radius-md: 0.5rem;
}
```

### ロゴ配置

```
public/assets/images/logo.svg   ← SVG ロゴ（優先）
public/assets/images/logo.png   ← PNG 版（フォールバック）
```

---

## 8. フォーム実装

```typescript
export function useForm<T>(initialValues: T) {
  const [values, setValues]       = useState<T>(initialValues);
  const [errors, setErrors]       = useState<Partial<Record<keyof T, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof T, value: unknown) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = {...prev}; delete e[field]; return e; });
  };

  return {
    values, errors, submitting, setSubmitting, handleChange,
    setFieldError: (f: keyof T, msg: string) => setErrors(prev => ({ ...prev, [f]: msg })),
    reset: () => { setValues(initialValues); setErrors({}); },
  };
}
```

---

## 9. ファイルアップロード実装

### FileUpload コンポーネント

```tsx
interface FileUploadProps {
  label: string;
  accept: string;         // "image/jpeg,image/png,application/pdf"
  maxSizeMB?: number;     // デフォルト 10
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label, accept, maxSizeMB = 10, value, onChange, error
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > maxSizeMB * 1024 * 1024) {
      alert(`ファイルサイズは ${maxSizeMB} MB 以内にしてください`);
      return;
    }
    onChange(file);
  };
  return (
    <div>
      <label>{label}</label>
      <input type="file" accept={accept} onChange={handleChange} />
      {value && <span>{value.name}（差し替え可）</span>}
      {error && <span className="error">{error}</span>}
    </div>
  );
};
```

### ProviderApplicationPage 書類アップロードフロー

```typescript
// Step 2 → Step 3 への進行時に逐次アップロード
const handleDocumentUpload = async (providerId: number, files: DocumentFiles) => {
  setSubmitting(true);
  try {
    await providerApi.uploadDocument(providerId, 'IDENTITY',  files.identity!);
    await providerApi.uploadDocument(providerId, 'CONTRACT',  files.contract!);
    await providerApi.uploadDocument(providerId, 'BANK_INFO', files.bankInfo!);
    setStep(3);
  } catch (err) {
    showToast(extractErrorMessage(err), 'error');
    // 画面を維持（navigate しない）
  } finally {
    setSubmitting(false);
  }
};
```

---

## 10. エラーハンドリング

```typescript
// utils/error.ts
export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message;
  }
  return '予期せぬエラーが発生しました';
}
```

### フォーム送信の原則（全フォーム共通）

1. `setSubmitting(true)` でボタンを disabled にする
2. try / catch / finally で囲む
3. 成功時のみ `navigate()` する（エラー時は画面を維持）
4. エラーは `showToast()` で表示する
5. `finally` で必ず `setSubmitting(false)` を呼ぶ

---

*関連: [06_infrastructure.md](./06_infrastructure.md)*
