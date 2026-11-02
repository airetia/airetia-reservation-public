[//]: # (airetia/docs/06_infrastructure.md)

# airetia インフラ・DB・運用仕様書

**Version**: 3.1.0 | **Updated**: 2026-02-25
**バックエンド実装** → [04_backend_specification.md](./04_backend_specification.md)

---

## 目次
1. [インフラ構成](#1-インフラ構成)
2. [データベース設計](#2-データベース設計)
3. [環境構成](#3-環境構成)
4. [デプロイメント](#4-デプロイメント)
5. [監視・アラート](#5-監視アラート)
6. [バックアップ](#6-バックアップ)
7. [運用手順](#7-運用手順)

---

## 1. インフラ構成

### Phase1（MVP）構成

```
インターネット
     ↓
  Route 53
     ↓
  ACM (TLS)
     ↓
   ALB
  ↙     ↘
EC2(App)  S3(Static + Documents)
  ↓
RDS MySQL
```

| リソース | 仕様 | 備考 |
|---------|------|------|
| EC2 | t3.small / Amazon Linux 2023 | Spring Boot JAR 直接実行 |
| RDS | db.t3.micro / MySQL 8.0 | マルチ AZ: Phase2 以降 |
| S3（Static） | 標準ストレージ | フロントエンド静的ファイル |
| S3（Documents） | 標準ストレージ | プロバイダー書類（非公開・IAM 制御） |
| ALB | application | HTTPS 終端 |
| ACM | ワイルドカード証明書 | *.airetia.com |
| Route53 | A/CNAME | airetia.com, api.airetia.com |

### Phase2 以降の追加リソース

| リソース | 用途 |
|---------|------|
| ElastiCache (Redis) | セッション管理 |
| SES | メール送信（Sandbox 解除） |
| CloudFront | CDN（静的ファイル配信） |
| ECS Fargate | コンテナ化（EC2 から移行） |

---

## 2. データベース設計

### 2.1 テーブル一覧

| テーブル | 説明 |
|---------|------|
| `members` | メンバー・管理者アカウント |
| `providers` | プロバイダー基本情報 |
| `provider_qualifications` | 保有資格（最大 5 件） |
| `provider_achievements` | 賞歴・実績（最大 5 件） |
| `provider_documents` | 審査書類ファイル参照 |
| `participants` | 利用者（SELF / CHILD） |
| `offerings` | サービス定義 |
| `availabilities` | 空き枠 |
| `bookings` | 予約 |
| `tickets` | チケット（1 レコード = 1 枚） |
| `ticket_usages` | チケット使用履歴 |
| `penalties` | ペナルティ記録 |
| `reports` | 報告書 |
| `audit_logs` | 管理者操作監査ログ |

### 2.2 主要テーブル定義

```sql
CREATE TABLE members (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    email            VARCHAR(255) NOT NULL UNIQUE,
    password_hash    VARCHAR(255) NOT NULL,
    role             VARCHAR(20)  NOT NULL,                 -- ADMIN / MEMBER
    first_name       VARCHAR(50)  NOT NULL,
    last_name        VARCHAR(50)  NOT NULL,
    first_name_kana  VARCHAR(50),
    last_name_kana   VARCHAR(50),
    birth_date       DATE,                                  -- プロバイダー申請で必須（→ 02_business_rules.md §5.1.1）
    phone            VARCHAR(11),
    postal_code      VARCHAR(7),
    address          VARCHAR(255),
    active           TINYINT(1)   NOT NULL DEFAULT 1,
    locked           TINYINT(1)   NOT NULL DEFAULT 0,
    suspended_until  TIMESTAMP    NULL,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role  (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE providers (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id    BIGINT       NOT NULL UNIQUE,
    status       VARCHAR(30)  NOT NULL DEFAULT 'PENDING_DOCUMENTS',
    high_school  VARCHAR(255),
    university   VARCHAR(255),
    appeal_point TEXT,
    bio          TEXT,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE provider_qualifications (
    id            BIGINT       AUTO_INCREMENT PRIMARY KEY,
    provider_id   BIGINT       NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    sort_order    INT          NOT NULL DEFAULT 0,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE provider_achievements (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    provider_id BIGINT       NOT NULL,
    achievement VARCHAR(255) NOT NULL,
    sort_order  INT          NOT NULL DEFAULT 0,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE provider_documents (
    id                BIGINT       AUTO_INCREMENT PRIMARY KEY,
    provider_id       BIGINT       NOT NULL,
    document_type     VARCHAR(20)  NOT NULL,  -- IDENTITY / CONTRACT / BANK_INFO
    s3_key            VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type      VARCHAR(100) NOT NULL,
    uploaded_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    INDEX idx_provider_type (provider_id, document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE participants (
    id         BIGINT      AUTO_INCREMENT PRIMARY KEY,
    member_id  BIGINT      NOT NULL,
    type       VARCHAR(20) NOT NULL,  -- SELF / CHILD
    first_name VARCHAR(50) NOT NULL,
    last_name  VARCHAR(50) NOT NULL,
    gender     VARCHAR(20),
    birth_date DATE,
    active     TINYINT(1)  NOT NULL DEFAULT 1,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    INDEX idx_member (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE offerings (
    id               BIGINT       AUTO_INCREMENT PRIMARY KEY,
    provider_id      BIGINT       NOT NULL,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    delivery_method  VARCHAR(20)  NOT NULL,  -- ONLINE / IN_PERSON
    duration_minutes INT          NOT NULL,  -- 15〜120（15 分刻み）
    tickets_required INT          NOT NULL,  -- 1 以上
    capacity         INT          NOT NULL,  -- 1〜15
    active           TINYINT(1)   NOT NULL DEFAULT 1,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE availabilities (
    id             BIGINT     AUTO_INCREMENT PRIMARY KEY,
    provider_id    BIGINT     NOT NULL,
    offering_id    BIGINT     NOT NULL,
    start_datetime TIMESTAMP  NOT NULL,   -- UTC 保存
    end_datetime   TIMESTAMP  NOT NULL,   -- UTC 保存
    capacity       INT        NOT NULL,
    bookable       TINYINT(1) NOT NULL DEFAULT 0,  -- 2ヶ月前解放で 1 に（→ BookingReleaseBatch）
    created_at     TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id),
    FOREIGN KEY (offering_id) REFERENCES offerings(id),
    INDEX idx_start          (start_datetime),
    INDEX idx_provider_start (provider_id, start_datetime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bookings (
    id               BIGINT      AUTO_INCREMENT PRIMARY KEY,
    participant_id   BIGINT      NOT NULL,
    availability_id  BIGINT      NOT NULL,
    status           VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
    tickets_consumed INT         NOT NULL,  -- 予約確定時の値を保持。キャンセル・NO_SHOW 後も変更しない
    created_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id)  REFERENCES participants(id),
    FOREIGN KEY (availability_id) REFERENCES availabilities(id),
    INDEX idx_participant (participant_id),
    INDEX idx_status      (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tickets (
    id          BIGINT     AUTO_INCREMENT PRIMARY KEY,
    member_id   BIGINT     NOT NULL,
    quantity    INT        NOT NULL DEFAULT 1,   -- 常に 1（1 レコード = 1 枚）
    expiry_date TIMESTAMP  NOT NULL,
    active      TINYINT(1) NOT NULL DEFAULT 1,
    created_at  TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    INDEX idx_member_expiry (member_id, expiry_date, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ticket_usages (
    id         BIGINT      AUTO_INCREMENT PRIMARY KEY,
    ticket_id  BIGINT      NOT NULL,
    member_id  BIGINT      NOT NULL,
    booking_id BIGINT,
    usage_type VARCHAR(20) NOT NULL,  -- BOOKING / REFUND / ADJUSTMENT
    amount     INT         NOT NULL,  -- 正: 消費、負: 返還
    note       VARCHAR(255),
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (member_id) REFERENCES members(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE penalties (
    id             BIGINT      AUTO_INCREMENT PRIMARY KEY,
    participant_id BIGINT      NOT NULL,
    booking_id     BIGINT      NOT NULL,
    penalty_type   VARCHAR(20) NOT NULL DEFAULT 'NO_SHOW',
    active         TINYINT(1)  NOT NULL DEFAULT 1,
    expires_at     TIMESTAMP   NOT NULL,
    created_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES participants(id),
    FOREIGN KEY (booking_id)     REFERENCES bookings(id),
    INDEX idx_participant_active (participant_id, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reports (
    id           BIGINT      AUTO_INCREMENT PRIMARY KEY,
    booking_id   BIGINT      NOT NULL,
    provider_id  BIGINT      NOT NULL,
    report_type  VARCHAR(20) NOT NULL,  -- COMPLETION / NO_SHOW
    feedback     TEXT,          -- 利用者へのフィードバック（公開）
    shared_note  TEXT,          -- 利用者の特徴（全プロバイダー共有）
    private_note TEXT,          -- 詳細メモ（報告者のみ）
    created_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id)  REFERENCES bookings(id),
    FOREIGN KEY (provider_id) REFERENCES providers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    admin_id    BIGINT       NOT NULL,
    action      VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id   BIGINT,
    note        TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin   (admin_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.3 Flyway マイグレーション命名規則

```
src/main/resources/db/migration/
├── V1__create_members_table.sql
├── V2__create_providers_table.sql
├── V3__create_provider_qualifications_table.sql
├── V4__create_provider_achievements_table.sql
├── V5__create_provider_documents_table.sql
├── V6__create_participants_table.sql
├── V7__create_offerings_table.sql
├── V8__create_availabilities_table.sql
├── V9__create_bookings_table.sql
├── V10__create_tickets_table.sql
├── V11__create_ticket_usages_table.sql
├── V12__create_penalties_table.sql
├── V13__create_reports_table.sql
└── V14__create_audit_logs_table.sql
```

> 既存 DB に `birth_date` カラムを追加する場合は `V15__add_birth_date_to_members.sql` を追加すること。

---

## 3. 環境構成

### 3.1 環境一覧

| 環境 | URL | 用途 |
|-----|-----|------|
| ローカル | http://localhost:5173 (FE) / http://localhost:8080 (BE) | 開発 |
| ステージング | https://staging.airetia.com | 動作確認・レビュー |
| 本番 | https://airetia.com | 運用 |

### 3.2 環境変数

#### バックエンド（application-{profile}.yml）

**共通（application.yml）**:
```yaml
spring:
  application:
    name: airetia-backend
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        # MySQL 8 環境では MySQLDialect を使用する（MySQL8Dialect は非推奨）
        dialect: org.hibernate.dialect.MySQLDialect
  flyway:
    enabled: true
    locations: classpath:db/migration
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 35MB   # 3 ファイル + マージン
logging:
  level:
    com.airetia: INFO
```

**開発（application-dev.yml）**:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/airetia_dev
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  session:
    store-type: none
  mail:
    host: mailhog
    port: 1025
aws:
  s3:
    bucket: airetia-documents-dev
  region: ap-northeast-1
logging:
  level:
    com.airetia: DEBUG
    org.springframework.security: DEBUG
```

**本番（application-prod.yml）**:
```yaml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST}:3306/airetia
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
  session:
    store-type: none  # Phase2 で redis に変更
  mail:
    host: email-smtp.ap-northeast-1.amazonaws.com
    port: 587
    username: ${SES_USERNAME}
    password: ${SES_PASSWORD}
aws:
  s3:
    bucket: ${S3_DOCUMENTS_BUCKET}
  region: ap-northeast-1
```

#### フロントエンド（.env）

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api/v1

# .env.staging
VITE_API_BASE_URL=https://api.staging.airetia.com/api/v1

# .env.production
VITE_API_BASE_URL=https://api.airetia.com/api/v1
```

---

## 4. デプロイメント

### 4.1 バックエンド デプロイ手順

```bash
# 1. ビルド
./mvnw clean package -DskipTests -Pprod

# 2. EC2 へ転送
scp target/airetia-backend-*.jar ec2-user@${EC2_HOST}:~/app/

# 3. 再起動
ssh ec2-user@${EC2_HOST} "
  sudo systemctl stop airetia
  sudo cp ~/app/airetia-backend-*.jar /opt/airetia/airetia.jar
  sudo systemctl start airetia
  sudo systemctl status airetia
"
```

### 4.2 systemd サービス設定

```ini
# /etc/systemd/system/airetia.service
[Unit]
Description=airetia Backend
After=network.target

[Service]
Type=simple
User=airetia
WorkingDirectory=/opt/airetia
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod airetia.jar
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### 4.3 フロントエンド デプロイ手順

```bash
npm run build
aws s3 sync dist/ s3://${STATIC_BUCKET_NAME}/ --delete
# CloudFront キャッシュ無効化（Phase2 以降）
aws cloudfront create-invalidation --distribution-id ${CF_DIST_ID} --paths "/*"
```

### 4.4 DB マイグレーション

Flyway はアプリ起動時に自動実行。手動実行が必要な場合:
```bash
./mvnw flyway:migrate -Pprod
```

---

## 5. 監視・アラート

| 対象 | メトリクス | しきい値 | アラート先 |
|------|----------|---------|-----------|
| EC2 CPU | 使用率 | > 80%（5 分間） | メール |
| EC2 Memory | 使用率 | > 85%（5 分間） | メール |
| RDS CPU | 使用率 | > 70%（5 分間） | メール |
| RDS Storage | 残容量 | < 20% | メール |
| S3（Documents） | 容量 | > 80% | メール |
| ALB | 5xx エラー率 | > 1%（1 分間） | メール + Slack |
| アプリ | ヘルスチェック | `GET /actuator/health` != 200 | メール |

```yaml
# CloudWatch Logs グループ
/airetia/backend/application   # アプリログ
/airetia/backend/access        # アクセスログ
/airetia/mysql/error           # DB エラーログ
```

ログ保持期間: 本番 90 日 / ステージング 30 日

---

## 6. バックアップ

### RDS

| 項目 | 設定 |
|------|------|
| 自動バックアップ | 毎日 3:00 JST |
| 保持期間 | 7 日間 |
| スナップショット（手動） | リリース前・月 1 回 |

### S3（Documents）

- バージョニング: 有効
- ライフサイクル: 90 日後に低頻度アクセスストレージへ移行
- アクセス制御: バケットポリシーでパブリックアクセス禁止・EC2 IAM ロールのみ許可

---

## 7. 運用手順

### 7.1 プロバイダー承認手順

1. 管理画面 `/admin/providers` で申請一覧（status = PENDING）を確認
2. `GET /api/v1/providers/{id}/documents` から S3 署名付き URL で書類閲覧
3. 承認: `PATCH /api/v1/providers/{id}/approve`
4. 却下: `PATCH /api/v1/providers/{id}/reject`（理由を記載）
5. 承認 / 却下メールが自動送信される

### 7.2 チケット手動付与手順（MVP）

1. 振込確認（銀行口座で照合）
2. 管理画面 `/admin/tickets` を開く
3. 対象メンバーを検索し付与枚数・有効期限（購入日 + 1 年）を入力して確定
4. `POST /api/v1/tickets` 実行・自動通知メール送信

### 7.3 ペナルティ手動解除手順

1. 管理画面 `/admin/members/{id}` を開く
2. ペナルティ一覧を確認し解除理由を入力して実行
3. 監査ログに記録される

### 7.4 管理者アカウント追加手順

1. 既存の管理者でログイン
2. `POST /api/v1/admin/accounts`（パスワード: 12 文字以上・大小英数字記号必須）
3. 初期パスワードを安全な方法で伝達し、初回ログイン後に変更させる

### 7.5 障害対応フロー

```
1. アラート受信
2. CloudWatch Logs でエラー確認
3. 軽微な場合: sudo systemctl restart airetia
4. DB 問題: RDS ステータス確認 → 必要に応じてスナップショットからリストア
5. インシデントレポート作成（影響範囲・原因・対処・再発防止）
```

### 7.6 定期メンテナンス

| 頻度 | 作業内容 |
|------|---------|
| 毎週 | ログ確認・アラート確認 |
| 毎月 | RDS 手動スナップショット・セキュリティパッチ確認 |
| 四半期 | SSL 証明書有効期限確認・依存ライブラリ脆弱性確認 |

---

*関連: [04_backend_specification.md](./04_backend_specification.md) / [05_frontend_specification.md](./05_frontend_specification.md)*
