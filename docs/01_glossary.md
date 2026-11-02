[//]: # (airetia/docs/01_glossary.md)

# airetia 用語定義書

**Version**: 3.2.0 | **Updated**: 2026-03-03
**ビジネスルール** → [02_business_rules.md](./02_business_rules.md)

---

## 1. 表記ルール

| 文脈 | 表記 | 例 |
|------|------|----|
| DB / API / バックエンド | 英語・複数形・スネークケース | `offerings`, `provider_id` |
| コード（Java） | 英語・単数形・PascalCase | `Offering`, `Provider` |
| コード（TypeScript） | 英語・単数形・camelCase | `offering`, `providerId` |
| UI 表示 | 日本語（文脈依存） | 「レッスン」「先生」「お子様」 |
| ドキュメント | 日本語・正式名称 | 「サービス提供者」「利用者」 |

---

## 2. 主要エンティティ

### Admin（管理者）
- システム全体を管理するアカウント（`members` テーブル・`role = ADMIN`）
- **Member として扱わない**: チケット取得・予約・Participant 登録などメンバー専用機能は利用不可
- 追加は既存管理者のみが実施可能
- 権限詳細 → [02_business_rules.md §7.1](./02_business_rules.md#71-管理者admin)

### Member（メンバー）
- システムにログインする一般ユーザー（`role = MEMBER`、DBテーブル: `members`）
- チケットはメンバー単位で保持
- 1アカウントで Provider・Parent の両機能を持てる

### Provider（プロバイダー / サービス提供者）
- サービスを提供する機能エンティティ（管理者承認制）
- UI 表示: Phase1「先生・講師」
- DBテーブル: `providers`
- ステータス遷移 → ProviderStatus 参照
- 登録・承認フロー → [02_business_rules.md §5.1](./02_business_rules.md#51-登録承認)

### ProviderDocument（提出書類）
- 審査用アップロードファイルへの参照（種別: `IDENTITY` / `CONTRACT` / `BANK_INFO`）
- DBテーブル: `provider_documents`

### Participant（パーティシパント / 利用者）
- サービスを受講する主体（独立ログイン不可・必ず Member に紐づく）
- 種別: `SELF`（メンバー本人）/ `CHILD`（子ども・1アカウント最大 5 名）
- DBテーブル: `participants`

### Offering（オファリング / サービス）
- 提供サービス全般（Phase1 はレッスンのみ）
- 属性: 時間（15〜120 分・15 分刻み）、形態（ONLINE / IN_PERSON）、消費チケット枚数（1 枚以上）、定員（1〜15）
- DBテーブル: `offerings`

### Availability（アベイラビリティ / 空き枠）
- プロバイダーが登録した提供可能時間帯
- 登録可能期間: 当日〜3ヶ月後の月末
- 予約解放タイミング: サービス開始日の 2ヶ月前 0:00 JST
- DBテーブル: `availabilities`

### Booking（ブッキング / 予約）
- 利用者が空き枠に対して行う申し込み
- 上限: CONFIRMED + PENDING 合計 90 件・うち PENDING 10 件・1日 3 件・時間重複禁止
- DBテーブル: `bookings`

### Ticket（チケット）
- サービス予約に使用する単位（500 円/枚・税抜・MVP 固定）
- 有効期限: 購入日 + 1 年
- 消費タイミング: 予約確定（CONFIRMED）時（有効期限 FIFO 順）
- DBテーブル: `tickets`

### Penalty（ペナルティ）
- 無断キャンセルに対する制裁記録（有効期間: 付与日時 + 3ヶ月）
- DBテーブル: `penalties`

### Report（報告書）
- プロバイダーによるサービス完了 / 無断キャンセル報告
- 各テキスト項目: 1000 文字以内
- DBテーブル: `reports`

### Inquiry（問い合わせ）
- メンバー・非ログインユーザーからの問い合わせ
- 本文: 1000 文字以内・ファイル添付最大 3 件（10MB・JPG/PNG/PDF）
- DBテーブル: `inquiries`, `inquiry_attachments`

---

## 3. Enum 定義

> Java 実装 → [04_backend_specification.md](./04_backend_specification.md)
> TypeScript 型 → [05_frontend_specification.md](./05_frontend_specification.md)

### MemberRole
| 値 | 意味 |
|----|------|
| `ADMIN` | 管理者 |
| `MEMBER` | 一般メンバー |

### Gender
| 値 | 意味 |
|----|------|
| `MALE` | 男性 |
| `FEMALE` | 女性 |
| `OTHER` | その他 |

### ParticipantType
| 値 | 意味 |
|----|------|
| `SELF` | メンバー本人 |
| `CHILD` | 子ども（保護者紐づき） |

### ProviderStatus
| 値 | 意味 | 再申請 |
|----|------|--------|
| `PENDING_DOCUMENTS` | 書類アップロード待ち | − |
| `ON_HOLD` | 保留（書類不備等）| 即時可 |
| `PENDING` | 審査待ち（書類提出完了） | − |
| `APPROVED` | 承認済み | − |
| `REJECTED` | 却下 | 却下日 + 1ヶ月後 |
| `SUSPENDED` | 一時停止 | − |

### DocumentType
| 値 | 意味 |
|----|------|
| `IDENTITY` | 身分証明書 |
| `CONTRACT` | 署名済み契約書 |
| `BANK_INFO` | 口座情報 |

### BookingStatus
| 値 | 意味 | 遷移元 |
|----|------|--------|
| `PENDING` | リクエスト（未確定）| 初期値 |
| `CONFIRMED` | 予約確定 | PENDING |
| `COMPLETED` | 完了 | CONFIRMED |
| `CANCELLED_BY_USER` | 利用者都合キャンセル | CONFIRMED / PENDING |
| `CANCELLED_BY_PROVIDER` | 提供者都合キャンセル | CONFIRMED |
| `NO_SHOW` | 無断キャンセル | CONFIRMED |

### DeliveryMethod
| 値 | 意味 |
|----|------|
| `ONLINE` | オンライン |
| `IN_PERSON` | 対面 |

### ReportType
| 値 | 意味 |
|----|------|
| `COMPLETION` | 完了報告 |
| `NO_SHOW` | 無断キャンセル報告 |

### UsageType
| 値 | 意味 |
|----|------|
| `BOOKING` | 予約消費 |
| `REFUND` | 返還 |
| `ADJUSTMENT` | 管理者調整 |

### InquiryStatus
| 値 | 意味 |
|----|------|
| `OPEN` | 未対応 |
| `IN_PROGRESS` | 対応中 |
| `RESOLVED` | 解決済み |
| `CLOSED` | クローズ |

---

## 4. 略語一覧

| 略語 | 正式名称 |
|------|---------|
| JST | Japan Standard Time（UTC+9） |
| UTC | Coordinated Universal Time |
| MVP | Minimum Viable Product |
| SPA | Single Page Application |
| FIFO | First In First Out |
| CSRF | Cross-Site Request Forgery |
| ORM | Object-Relational Mapping |

---

*関連: [02_business_rules.md](./02_business_rules.md) / [03_common_specification.md](./03_common_specification.md)*
