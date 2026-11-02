4. テスト・検証計画
4.1 単体テスト
JUnit5 + Mockito:
java// test/application/service/auth/AuthServiceTest.java
@SpringBootTest
@Transactional
class AuthServiceTest {
    
    @Autowired
    private AuthService authService;
    
    @Test
    void 会員登録_成功() {
        RegisterRequest request = new RegisterRequest();
        // ... 設定
        
        RegisterResponse response = authService.register(request);
        
        assertNotNull(response.getMemberId());
        assertEquals(request.getEmail(), response.getEmail());
    }
    
    @Test
    void 会員登録_メール重複エラー() {
        // ...
        assertThrows(IllegalArgumentException.class, () -> {
            authService.register(request);
        });
    }
}
4.2 統合テスト
REST Assured（推奨）:
java@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class AuthControllerIntegrationTest {
    
    @LocalServerPort
    private int port;
    
    @BeforeEach
    void setUp() {
        RestAssured.port = port;
    }
    
    @Test
    void 会員登録API_成功() {
        given()
            .contentType(ContentType.JSON)
            .body(registerRequest)
        .when()
            .post("/api/v1/auth/register")
        .then()
            .statusCode(201)
            .body("memberId", notNullValue());
    }
}
```

### 4.3 手動テストチェックリスト

**Week 2完了時**:
- [ ] 会員登録成功
- [ ] 重複メールエラー
- [ ] バリデーションエラー
- [ ] ログイン成功
- [ ] ログイン失敗
- [ ] セッション維持確認

**Week 3完了時**:
- [ ] 子どもプロフィール登録（最大5名）
- [ ] 6人目登録時エラー
- [ ] プロフィール編集・削除

---

## 5. トラブルシューティング

### 5.1 よくあるエラーと対処法

#### エラー1: Flyway migration失敗
```
ERROR: Migration checksum mismatch
対処法:
sql-- Flywayメタデータ削除（開発環境のみ）
DELETE FROM flyway_schema_history WHERE version = 'V1';

-- または全削除
DROP TABLE flyway_schema_history;
再起動してマイグレーション再実行。
エラー2: Lombok動作しない
対処法（Eclipse）:

Lombok jar ダウンロード
java -jar lombok.jar 実行
Eclipse.app選択してインストール
Eclipse再起動

対処法（VSCode）:

Java Extension Pack インストール確認
settings.json に以下追加:

json"java.jdt.ls.vmargs": "-javaagent:/path/to/lombok.jar"
```

#### エラー3: CORS エラー
```
Access to XMLHttpRequest blocked by CORS policy
対処法:
java// config/WebConfig.java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

---

## 付録A: 開発スケジュール全体図

| Week | フェーズ | 主な成果物 |
|------|---------|-----------|
| 1 | Phase 0 | 環境構築、Hello World、基本テーブル |
| 2 | Phase 1 | 認証機能（登録・ログイン） |
| 3 | Phase 2 | メンバー・プロフィール管理 |
| 4-5 | Phase 3 | Provider・Service・Availability |
| 6-7 | Phase 4 | Booking・Ticket |
| 8 | Phase 5 | Report・Penalty |
| 9-10 | Phase 6 | 管理者機能 |
| 11 | 統合テスト | E2Eテスト |
| 12 | デバッグ・調整 | MVP完成 |

---

**Document End**

---

# 補足ドキュメント: 開発時の注意事項

## 1. コーディング規約

- クラス名: PascalCase
- メソッド名: camelCase
- 定数: UPPER_SNAKE_CASE
- パッケージ名: 小文字のみ

## 2. Git運用（将来）

現時点ではGitHub未使用だが、後日以下のブランチ戦略を推奨:
```
main (本番)
  ↑
develop (開発)
  ↑
feature/* (機能ブランチ)
3. デバッグのコツ

@Slf4j を使用してログ出力
REST Client で即座にAPI確認
MySQLで直接データ確認













Week1でのフロントエンド構築要否について

📋 結論: Week1ではバックエンドのみに集中すべき

✅ 推奨アプローチ: バックエンド優先開発
理由
1. 依存関係の観点
バックエンドAPI → フロントエンド実装

フロントエンドはバックエンドAPIに依存
APIが不安定な状態でフロントを作ると手戻りが発生
まずバックエンドを固めてからフロントを作る方が効率的

2. 検証の容易さ
Week1の検証手段:
✅ REST Client（VSCode拡張機能）
✅ Postman
✅ curl コマンド
✅ MySQL直接確認

→ フロントエンドなしでも十分に検証可能
3. 学習コストの分散
Week1で学ぶべきこと:
- Spring Boot基礎
- JPA/Hibernate
- Flyway
- MySQL接続
- REST API設計

→ これだけでも学習量が多い
フロントエンド（React + TypeScript）を同時に学ぶと負荷が大きすぎる。
4. デバッグの効率
問題発生時の切り分け:
バックエンドのみ → 原因特定が容易
バックエンド + フロントエンド → どちらが原因か不明