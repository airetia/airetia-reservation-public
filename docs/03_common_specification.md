[//]: # (airetia/docs/03_common_specification.md)

# airetia 共通仕様書

**Version**: 3.2.0 | **Updated**: 2026-03-03
**用語** → [01_glossary.md](./01_glossary.md) | **ビジネスルール** → [02_business_rules.md](./02_business_rules.md)

---

## 目次
1. [API 設計原則](#1-api設計原則)
2. [共通ヘッダー](#2-共通ヘッダー)
3. [HTTP ステータスコード](#3-httpステータスコード)
4. [共通データ型](#4-共通データ型)
5. [エンドポイント一覧](#5-エンドポイント一覧)
6. [エラーコード定義](#6-エラーコード定義)
7. [バリデーションルール](#7-バリデーションルール)
8. [タイムゾーン処理](#8-タイムゾーン処理)

---

## 1. API 設計原則

```
ベースURL: /api/v1/{リソース}
設計: RESTful・ステートレス・リソース指向
```

```
GET    /api/v1/offerings           # 一覧取得
GET    /api/v1/offerings/{id}      # 詳細取得
POST   /api/v1/offerings           # 新規作成 → 201
PATCH  /api/v1/offerings/{id}      # 部分更新 → 200
DELETE /api/v1/offerings/{id}      # 削除 → 204
```

**ファイルアップロード**: `Content-Type: multipart/form-data`（JSON エンドポイントとは別扱い）

---

## 2. 共通ヘッダー

### リクエスト

| ヘッダー | 必須 | 値 |
|---------|------|-----|
| `Content-Type` | ○ | `application/json`（ファイル送信時は `multipart/form-data`） |
| `Cookie` | △ | `airetia_SESSION=xxx`（認証済みリクエスト） |
| `X-XSRF-TOKEN` | △ | CSRF トークン（POST / PUT / PATCH / DELETE） |

### レスポンス

| ヘッダー | 値 |
|---------|-----|
| `Content-Type` | `application/json` |
| `Set-Cookie` | `airetia_SESSION=xxx; HttpOnly; Secure; SameSite=Lax` |

---

## 3. HTTP ステータスコード

| コード | 意味 | 使用例 |
|-------|------|--------|
| 200 | OK | GET / PATCH 成功 |
| 201 | Created | POST 成功 |
| 204 | No Content | DELETE 成功 |
| 400 | Bad Request | リクエスト形式エラー |
| 401 | Unauthorized | 未認証 |
| 403 | Forbidden | 権限不足・アカウント停止 |
| 404 | Not Found | リソース不存在 |
| 409 | Conflict | 予約重複・競合 |
| 413 | Payload Too Large | ファイルサイズ超過 |
| 415 | Unsupported Media Type | 対応外ファイル形式 |
| 422 | Unprocessable Entity | ビジネスルール違反 |
| 500 | Internal Server Error | サーバーエラー |

---

## 4. 共通データ型

### ApiResponse
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: FieldError[];
  timestamp: string;  // ISO 8601 UTC
}

interface FieldError {
  field: string;
  message: string;
}
```

### PageResponse
```typescript
interface PageResponse<T> {
  content: T[];
  page: {
    number: number;        // 0 始まり
    size: number;
    totalElements: number;
    totalPages: number;
  };
}
```

---

## 5. エンドポイント一覧

### 認証

| Method | Path | 説明 | 認証 |
|--------|------|------|------|
| POST | `/api/v1/auth/login` | ログイン | 不要 |
| POST | `/api/v1/auth/logout` | ログアウト | 必要 |
| POST | `/api/v1/auth/register` | 会員登録（MEMBER のみ） | 不要 |
| GET | `/api/v1/auth/me` | 現在のユーザー情報取得 | 必要 |

> 管理者アカウントの新規登録は `/api/v1/admin/accounts` を使用（既存管理者のみ実行可能）。

### メンバー

| Method | Path | 説明 | 認証 |
|--------|------|------|------|
| GET | `/api/v1/members/{id}` | 詳細取得 | MEMBER（自分のみ）/ ADMIN |
| PATCH | `/api/v1/members/{id}` | 情報更新 | MEMBER（自分のみ）/ ADMIN |

### 通知設定

| Method | Path | 説明 | 認証 |
|--------|------|------|------|
| GET | `/api/v1/members/{id}/notifications` | 通知設定取得 | MEMBER（自分のみ） |
| PATCH | `/api/v1/members/{id}/notifications` | 通知設定更新 | MEMBER（自分のみ） |

### プロバイダー

| Method | Path | 説明 | 認証 |
|--------|------|------|------|
| POST | `/api/v1/providers` | 登録申請 | MEMBER |
| GET | `/api/v1/providers/{id}` | 詳細取得 | MEMBER（自分）/ ADMIN |
| PATCH | `/api/v1/providers/{id}` | プロバイダー情報更新 | MEMBER（自分・APPROVED のみ）/ ADMIN |
| POST | `/api/v1/providers/{id}/documents` | 書類アップロード（multipart） | MEMBER（自分）/ ADMIN |
| GET | `/api/v1/providers/{id}/documents` | 書類一覧取得（署名付き URL） | ADMIN |
| GET | `/api/v1/providers` | 一覧取得 | ADMIN |
| PATCH | `/api/v1/providers/{id}/approve` | 承認（PENDING → APPROVED） | ADMIN |
| PATCH | `/api/v1/providers/{id}/reject` | 却下（PENDING → REJECTED） | ADMIN |
| PATCH | `/api/v1/providers/{id}/hold` | 保留（PENDING → ON_HOLD） | ADMIN |
| PATCH | `/api/v1/providers/{id}/suspend` | 停止（APPROVED → SUSPENDED） | ADMIN |
| PATCH | `/api/v1/providers/{id}/unsuspend` | 停止解除（SUSPENDED → APPROVED） | ADMIN |

### パーティシパント

| Method | Path | 説明 | 認証 |
|--------|------|------|------|
| GET | `/api/v1/participants` | 自分の利用者一覧 | MEMBER |
| POST | `/api/v1/participants` | 登録 | MEMBER |
| GET | `/api/v1/participants/{id}` | 詳細取得 | MEMBER（自分の）/ ADMIN |
| PATCH | `/api/v1/participants/{id}` | 更新 | MEMBER（自分の）/ ADMIN |
| DELETE | `/api/v1/participants/{id}` | 削除（予約なしのみ） | MEMBER（自分の）/ ADMIN |

### オファリング

| Method | Path | 説明 | 認証 |
|--------|------|------|------|
| GET | `/api/v1/offerings` | 一覧 | 不要 |
| POST | `/api/v1/offerings` | 作成 | PROVIDER（APPROVED） |
| GET | `/api/v1/offerings/{id}` | 詳細 | 不要 |
| PATCH | `/api/v1/offerings/{id}` | 更新 | PROVIDER（所有者）/ ADMIN |
| DELETE | `/api/v1/offerings/{id}` | 削除 | PROVIDER（所有者）/ ADMIN |

### アベイラビリティ

| Method | Path | 説明 | 認証 |
|--------|------|------|------|
| GET | `/api/v1/availabilities` | 一覧（クエリ: `date`, `offering_id`） | 不要 |
| POST | `/api/v1/availabilities` | 作成 | PROVIDER（APPROVED） |
| GET | `/api/v1/availabilities/{id}` | 詳細 | 不要 |
| PATCH | `/api/v1/availabilities/{id}` | 更新 | PROVIDER（所有者）/ ADMIN |
| DELETE | `/api/v1/availabilities/{id}` | 削除 | PROVIDER（所有者）/ ADMIN |

### ブッキング

| Method | Path | 説明 | 認証 |
|--------|------|------|------|
| GET | `/api/v1/bookings` | 一覧 | MEMBER / ADMIN |
| POST | `/api/v1/bookings` | 予約リクエスト（PENDING） | MEMBER |
| GET | `/api/v1/bookings/{id}` | 詳細 | MEMBER（自分の）/ ADMIN |
| PATCH | `/api/v1/bookings/{id}/confirm` | 予約確定（PENDING → CONFIRMED） | ADMIN |
| DELETE | `/api/v1/bookings/{id}` | キャンセル | MEMBER（自分の）/ ADMIN |

### チケット

| Method | Path | 説明 | 認証 |
|--------|------|------|------|
| GET | `/api/v1/tickets` | 残高・有効チケット一覧 | MEMBER |
| GET | `/api/v1/tickets/usages` | 使用履歴 | MEMBER |
| POST | `/api/v1/tickets` | 手動付与 | ADMIN |

### 報告書

| Method | Path | 説明 | 認証 |
|--------|------|------|------|
| POST | `/api/v1/reports` | 報告書作成 | PROVIDER（APPROVED） |
| GET | `/api/v1/reports/{id}` | 詳細 | PROVIDER（自分の）/ ADMIN |
| GET | `/api/v1/reports` | 一覧（クエリ: `booking_id`） | PROVIDER / ADMIN |

### 問い合わせ

| Method | Path | 説明 | 認証 |
|--------|------|------|------|
| POST | `/api/v1/inquiries` | 問い合わせ送信（ファイル添付可） | 不要 |
| GET | `/api/v1/inquiries` | 一覧 | ADMIN |
| GET | `/api/v1/inquiries/{id}` | 詳細 | ADMIN |
| PATCH | `/api/v1/inquiries/{id}/status` | ステータス更新 | ADMIN |

### 管理者専用

| Method | Path | 説明 |
|--------|------|------|
| POST | `/api/v1/admin/accounts` | 管理者アカウント作成 |
| GET | `/api/v1/admin/members` | 全メンバー一覧 |
| PATCH | `/api/v1/admin/members/{id}/suspend` | 利用停止 |
| PATCH | `/api/v1/admin/members/{id}/unsuspend` | 停止解除 |
| DELETE | `/api/v1/admin/members/{id}` | アカウント削除 |
| GET | `/api/v1/admin/penalties` | ペナルティ一覧 |
| DELETE | `/api/v1/admin/penalties/{id}` | ペナルティ手動解除 |

---

## 6. エラーコード定義

形式: `CATEGORY_SPECIFIC_ERROR`

| エラーコード | HTTP | 説明 |
|------------|------|------|
| `VALIDATION_ERROR` | 400 | バリデーションエラー |
| `AUTH_AUTHENTICATION_FAILED` | 401 | 認証失敗 |
| `AUTH_AUTHORIZATION_FAILED` | 403 | 権限不足 |
| `AUTH_ACCOUNT_SUSPENDED` | 403 | アカウント停止中 |
| `AUTH_ADMIN_MEMBER_FEATURE_FORBIDDEN` | 403 | 管理者によるメンバー機能利用禁止 |
| `RESOURCE_NOT_FOUND` | 404 | リソース不存在 |
| `BUSINESS_BOOKING_CONFLICT` | 409 | 予約時間重複 |
| `BUSINESS_INSUFFICIENT_TICKETS` | 422 | チケット不足 |
| `BUSINESS_BOOKING_LIMIT_EXCEEDED` | 422 | 予約合計上限（90件）超過 |
| `BUSINESS_PENDING_LIMIT_EXCEEDED` | 422 | リクエスト上限（10件）超過 |
| `BUSINESS_DAILY_LIMIT_EXCEEDED` | 422 | 1日予約上限（3件）超過 |
| `BUSINESS_CANCELLATION_DEADLINE_PASSED` | 422 | キャンセル期限超過 |
| `BUSINESS_PROVIDER_NOT_APPROVED` | 403 | プロバイダー未承認 |
| `BUSINESS_SELF_BOOKING_NOT_ALLOWED` | 403 | 自分のサービスへの予約禁止 |
| `BUSINESS_PARTICIPANT_HAS_BOOKING` | 422 | 予約があるため削除不可 |
| `BUSINESS_REAPPLICATION_TOO_EARLY` | 422 | 再申請可能期間前 |
| `FILE_TOO_LARGE` | 413 | ファイルサイズ超過（10 MB） |
| `FILE_UNSUPPORTED_TYPE` | 415 | 対応外ファイル形式 |
| `SYSTEM_INTERNAL_ERROR` | 500 | 内部エラー |

### エラーレスポンス形式
```json
{
  "success": false,
  "error_code": "BUSINESS_INSUFFICIENT_TICKETS",
  "message": "チケットが不足しています",
  "errors": [
    { "field": "tickets", "message": "必要: 2枚、残高: 1枚" }
  ],
  "timestamp": "2026-02-25T01:00:00Z"
}
```

---

## 7. バリデーションルール

### 文字列

| フィールド | 最小 | 最大 | 形式 |
|-----------|------|------|------|
| 姓・名 | 1 | 50 | 任意 |
| 姓・名（ふりがな） | 1 | 50 | ひらがな |
| メールアドレス | − | 255 | RFC 準拠 |
| パスワード（一般） | 8 | 64 | 英大小数字 |
| パスワード（管理者） | 12 | 64 | 英大小数字記号 |
| 住所 | 1 | 255 | 任意 |
| 電話番号 | 10 | 11 | 数字のみ |
| 郵便番号 | 7 | 7 | 数字のみ |
| 出身高校 | 1 | 255 | 任意 |
| 出身大学・専門学校 | − | 255 | 任意 |
| アピールポイント | 1 | 2000 | 任意 |
| 保有資格（1 件） | 1 | 255 | 任意（最大 5 件） |
| 賞歴・実績（1 件） | 1 | 255 | 任意（最大 5 件） |
| 報告書 feedback | 0 | 1000 | 任意 |
| 報告書 shared_note | 0 | 1000 | 任意 |
| 報告書 private_note | 0 | 1000 | 任意 |
| 問い合わせ本文 | 1 | 1000 | 任意 |

### 数値

| フィールド | 最小 | 最大 |
|-----------|------|------|
| チケット枚数 | 1 | − |
| 定員 | 1 | 15 |
| サービス時間（分） | 15 | 120（15 分刻み） |

### ファイル

| 項目 | 制約 |
|------|------|
| 形式 | JPG / PNG / PDF |
| サイズ | 10 MB 以内 / ファイル |
| 書類（必須） | `IDENTITY` / `CONTRACT` / `BANK_INFO` の 3 種類すべて |
| 問い合わせ添付 | 最大 3 ファイル |

### パスワード正規表現

**一般**:
```regex
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$
```

**管理者**:
```regex
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{12,64}$
```

---

## 8. タイムゾーン処理

```
DB 保存: UTC（TIMESTAMP 型）
API 応答: UTC（ISO 8601: "2026-02-01T01:00:00Z"）
UI 表示: JST 変換後に表示（→ 02_business_rules.md §6.4）
タイムゾーン識別子: Asia/Tokyo
```

| UTC（DB・API） | JST（UI 表示） |
|---------------|-------------|
| `2026-01-15T05:00:00Z` | `2026年1月15日（金） 14:00` |

---

*関連: [04_backend_specification.md](./04_backend_specification.md) / [05_frontend_specification.md](./05_frontend_specification.md)*
