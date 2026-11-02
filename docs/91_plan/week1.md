airetia予約管理システム 開発準備・実装計画書

📋 文書管理情報
Document Version: 1.0.0
Created: 2026-01-30
Status: Draft
Related Documents:

システムアーキテクチャ
セキュリティ設計
データベーススキーマ
API仕様


📖 目次

開発環境準備
プロジェクト初期化
開発フェーズ別実装計画
テスト・検証計画
トラブルシューティング


1. 開発環境準備
1.1 必要なツール
ツールバージョン用途インストール確認コマンドJava17バックエンド実行環境java -versionMaven3.8+ビルドツールmvn -versionMySQL8.0+データベースmysql --versionNode.js18.x+フロントエンド実行環境node -vnpm8.x+パッケージ管理npm -vVSCode または Eclipse最新IDE-
1.2 環境構築手順
1.2.1 MySQL準備
bash# MySQL起動確認
mysql -u root -p

# データベース作成
CREATE DATABASE airetia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# ユーザー作成・権限付与
CREATE USER 'airetia_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON airetia.* TO 'airetia_user'@'localhost';
FLUSH PRIVILEGES;

# 接続確認
mysql -u airetia_user -p airetia
```

#### 1.2.2 VSCode推奨拡張機能

- **Java Extension Pack** (Microsoft)
- **Spring Boot Extension Pack** (VMware)
- **MySQL** (cweijan)
- **REST Client** (Huachao Mao) - API テスト用
- **ESLint** - フロントエンド用
- **Prettier** - コード整形用

#### 1.2.3 Eclipse設定（VSCodeの代替）

1. Eclipse IDE for Enterprise Java and Web Developers をダウンロード
2. Lombok プラグインインストール
3. Maven プラグイン確認
4. MySQL Connector 追加

---

## 2. プロジェクト初期化

### 2.1 バックエンドプロジェクト作成

#### 2.1.1 Spring Initializr（推奨）

**オンライン**: https://start.spring.io/

設定:
```
Project: Maven
Language: Java
Spring Boot: 3.2.x (最新安定版)
Group: com.airetia
Artifact: backend
Name: airetia Backend
Package name: com.airetia
Packaging: Jar
Java: 17

Dependencies:
- Spring Web
- Spring Data JPA
- MySQL Driver
- Spring Security
- Validation
- Lombok
- Spring Boot DevTools
生成されたzipを展開し、VSCodeまたはEclipseで開く。
2.1.2 pom.xml 確認・追加
生成後、以下の依存関係を追加:
xml<!-- pom.xml に追加 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-mysql</artifactId>
</dependency>
2.2 application.yml 初期設定
src/main/resources/application.yml:
yamlspring:
  datasource:
    url: jdbc:mysql://localhost:3306/airetia?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: airetia_user
    password: ${DB_PASSWORD:your_password}
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: none  # Flyway使用のためnone
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        jdbc:
          time_zone: UTC
  
  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration
  
  security:
    user:
      name: admin
      password: temp_password  # 初期テスト用

logging:
  level:
    com.airetia: DEBUG
    org.springframework.security: DEBUG
```

### 2.3 ディレクトリ構造作成
```
src/main/java/com/airetia/
├── config/
│   ├── SecurityConfig.java
│   └── WebConfig.java
├── domain/
│   ├── model/
│   │   ├── member/
│   │   ├── provider/
│   │   ├── participant/
│   │   ├── service/
│   │   ├── availability/
│   │   ├── booking/
│   │   ├── ticket/
│   │   ├── penalty/
│   │   └── report/
│   └── rule/
│       └── ValidationRule.java
├── repository/
├── application/
│   ├── service/
│   │   ├── auth/
│   │   ├── member/
│   │   ├── provider/
│   │   ├── booking/
│   │   └── ticket/
│   └── dto/
│       ├── request/
│       └── response/
├── presentation/
│   └── controller/
│       ├── auth/
│       ├── member/
│       └── provider/
└── exception/
    ├── GlobalExceptionHandler.java
    └── custom/

src/main/resources/
├── db/
│   └── migration/
│       ├── V1__Create_members_table.sql
│       ├── V2__Create_participants_table.sql
│       └── ...
└── templates/
    └── email/
2.4 フロントエンドプロジェクト作成
bash# Reactプロジェクト作成（TypeScript）
npx create-react-app frontend --template typescript

cd frontend

# 必要なライブラリインストール
npm install axios
npm install react-router-dom
npm install @types/react-router-dom -D
```

**推奨ディレクトリ構造**:
```
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── authApi.ts
│   │   ├── memberApi.ts
│   │   └── bookingApi.ts
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── features/
│   │       ├── auth/
│   │       ├── member/
│   │       └── booking/
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useMember.ts
│   ├── pages/
│   │   ├── auth/
│   │   ├── member/
│   │   └── provider/
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   └── PrivateRoute.tsx
│   ├── utils/
│   ├── App.tsx
│   └── index.tsx
└── package.json

3. 開発フェーズ別実装計画
Phase 0: 基盤準備（1週間）
Day 1-2: 環境構築・動作確認
タスク:

✅ MySQL接続確認
✅ Spring Boot起動確認
✅ React起動確認
✅ CORS設定確認

成果物:

HelloController.java → /api/hello エンドポイント作成
React → Axios で /api/hello 呼び出し成功

動作確認:
bash# バックエンド起動
cd backend
mvn spring-boot:run

# フロントエンド起動（別ターミナル）
cd frontend
npm start

# ブラウザ: http://localhost:3000
# コンソールで "Hello from Backend" 表示確認
Day 3-5: Flyway + 基本テーブル作成
タスク:

Flyway設定
V1__Create_members_table.sql 作成
V2__Create_participants_table.sql 作成
マイグレーション実行確認

V1__Create_members_table.sql:
sqlCREATE TABLE members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    first_name_kana VARCHAR(50) NOT NULL,
    last_name_kana VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    postal_code VARCHAR(7) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role ENUM('ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
動作確認:
bashmvn spring-boot:run
# ログで Flyway migration 成功確認

mysql -u airetia_user -p airetia
SHOW TABLES;
# members テーブル存在確認
Day 6-7: Enum定義 + Member エンティティ作成
Enum作成:

java
// domain/model/member/MemberRole.java
package com.airetia.domain.model.member;

public enum MemberRole {
    ADMIN,
    MEMBER
}

// domain/model/member/Gender.java
package com.airetia.domain.model.member;

public enum Gender {
    MALE,
    FEMALE,
    OTHER
}
Member エンティティ:

java
// domain/model/member/Member.java
package com.airetia.domain.model.member;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;
    
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;
    
    @Column(name = "first_name_kana", nullable = false, length = 50)
    private String firstNameKana;
    
    @Column(name = "last_name_kana", nullable = false, length = 50)
    private String lastNameKana;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate birthDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;
    
    @Column(name = "postal_code", nullable = false, length = 7)
    private String postalCode;
    
    @Column(nullable = false)
    private String address;
    
    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberRole role = MemberRole.MEMBER;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
Repository作成:

java
// repository/MemberRepository.java
package com.airetia.repository;

import com.airetia.domain.model.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);
    boolean existsByEmail(String email);
}
動作確認:

bash
mvn spring-boot:run
# エラーなく起動確認

# （オプション）テストデータ挿入
mysql -u airetia_user -p airetia
INSERT INTO members (first_name, last_name, first_name_kana, last_name_kana, email, password_hash, date_of_birth, gender, postal_code, address, phone_number, role) VALUES ('太郎', '山田', 'たろう', 'やまだ', 'test@example.com', 'dummy_hash', '1990-01-01', 'MALE', '1234567', '東京都渋谷区', '09012345678', 'MEMBER');

# 確認
SELECT * FROM members;