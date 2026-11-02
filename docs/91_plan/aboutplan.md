📅 修正版スケジュール
Week 1（バックエンドのみ）
Dayタスク成果物検証方法Day 1-2環境構築・動作確認HelloControllerREST ClientDay 3-5Flyway + 基本テーブルmembers テーブルMySQL確認Day 6-7Member エンティティ作成Member.java, RepositoryJUnitテスト
Week1完了条件:

✅ Spring Boot起動成功
✅ MySQL接続成功
✅ Flyway migration成功
✅ Member CRUD動作確認（REST Clientで）


Week 2（認証機能 + 初期フロントエンド）
Dayタスク成果物検証方法Day 8-9Spring Security設定SecurityConfigREST ClientDay 10-11会員登録API/auth/registerREST ClientDay 12ログインAPI/auth/loginREST ClientDay 13-14フロントエンド初期構築React起動、ログイン画面ブラウザ
Week2完了条件:

✅ 会員登録API動作
✅ ログインAPI動作
✅ React起動成功
✅ ログイン画面からAPI呼び出し成功


Week 3以降（バックエンド + フロントエンド並行）
Week3以降は、バックエンドAPIを先に作り、その後フロントエンドを実装する「反復型開発」に移行。
Week 3: Participant（子どもプロフィール）
├─ Day 15-16: バックエンドAPI作成 → REST Client検証
└─ Day 17: フロントエンド実装 → ブラウザ検証

Week 4: Provider（サービス提供者）
├─ Day 18-19: バックエンドAPI作成
└─ Day 20-21: フロントエンド実装