Phase 3: Provider・Service・Availability（Week 4-5）
以下同様の流れで実装:

Flyway Migration
Enum定義
Entity作成
Repository作成
Service作成
DTO作成
Controller作成
REST Client でテスト

注意点:

services テーブルは service がMySQLの予約語のため注意
availabilities は providers と services に依存
定員管理ロジックは Service層で実装