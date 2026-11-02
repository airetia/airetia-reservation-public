フロントエンド環境構築：詳細実行手順

📋 作業概要
目的: React + TypeScript + Vite でフロントエンド環境を構築し、バックエンドAPIと連携できる状態にする
推定作業時間: 1時間

🎯 全体の流れ
Step 1: プロジェクト初期化（Vite）
  ↓
Step 2: 必要なパッケージのインストール
  ↓
Step 3: ディレクトリ構造の作成
  ↓
Step 4: 設定ファイルの作成
  ↓
Step 5: 基本ファイルの作成
  ↓
Step 6: バックエンドとの接続確認
  ↓
Step 7: 認証機能の実装（ログイン画面）

🚀 Step 1: プロジェクト初期化
1.1 frontend ディレクトリの作成
プロジェクトルートで実行：
bash# プロジェクトルートに移動（airetia/）
cd /path/to/airetia

# Vite でフロントエンドプロジェクトを作成
npm create vite@latest frontend -- --template react-ts
```

**出力例**:
```
✔ Select a framework: › React
✔ Select a variant: › TypeScript

Scaffolding project in /path/to/airetia/frontend...

Done. Now run:

  cd frontend
  npm install
  npm run dev
1.2 依存関係のインストール
bashcd frontend
npm install

📦 Step 2: 必要なパッケージのインストール
2.1 必須パッケージ
bash# ルーティング
npm install react-router-dom

# HTTP通信
npm install axios

# 日時処理
npm install dayjs

# 型定義（開発時のみ）
npm install -D @types/node
2.2 オプションパッケージ（後で追加可能）
bash# フォーム管理（後で必要になったら）
# npm install react-hook-form

# バリデーション（後で必要になったら）
# npm install zod

# 状態管理（後で必要になったら）
# npm install zustand

📁 Step 3: ディレクトリ構造の作成
3.1 基本ディレクトリの作成
bash# frontend/ ディレクトリ内で実行
mkdir -p src/api
mkdir -p src/components/common
mkdir -p src/components/layout
mkdir -p src/components/features/auth
mkdir -p src/config
mkdir -p src/contexts
mkdir -p src/hooks
mkdir -p src/models
mkdir -p src/pages/auth
mkdir -p src/pages/public
mkdir -p src/routes
mkdir -p src/styles
mkdir -p src/utils
```

### 3.2 作成後の構造確認
```
frontend/
├── node_modules/
├── public/
├── src/
│   ├── api/              # API通信層
│   ├── components/       # コンポーネント
│   │   ├── common/       # 共通コンポーネント
│   │   ├── layout/       # レイアウト
│   │   └── features/     # 機能別
│   │       └── auth/     # 認証関連
│   ├── config/           # 設定
│   ├── contexts/         # Context
│   ├── hooks/            # カスタムフック
│   ├── models/           # 型定義
│   ├── pages/            # ページ
│   │   ├── auth/         # 認証ページ
│   │   └── public/       # 公開ページ
│   ├── routes/           # ルーティング
│   ├── styles/           # スタイル
│   ├── utils/            # ユーティリティ
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts

⚙️ Step 4: 設定ファイルの作成
4.1 環境変数設定（.env.local）フロントエンド環境変数ファイルを作成注意: .env.local はGit管理対象外なので、.gitignore に含まれていることを確認してください。

4.2 Vite設定（vite.config.ts）Vite設定ファイル作成（パスエイリアス・プロキシ設定）
4.3 TypeScript設定（tsconfig.json更新）
既存の tsconfig.json にパスエイリアス設定を追加します。TypeScript設定ファイル（パスエイリアス追加版）


📝 Step 5: 基本ファイルの作成
5.1 環境変数管理ファイル環境変数を型安全に管理するファイル
5.2 定数定義ファイルアプリケーション全体で使用する定数定義
5.3 型定義ファイル
5.3.1 共通APIレスポンス型グローバル型定義（APIレスポンス等）5.3.2 API共通型API関連の共通型定義
5.4 ドメインモデル型定義
5.4.1 認証関連モデル認証関連のモデル型定義5.4.2 ENUM型定義バックエンドのENUMと対応する型定義
5.5 HTTP通信設定（Axios）Axiosクライアント設定
5.6 認証APIファイルを作成しました, ファイルを読み取りました
✅ Step 5完了：基本ファイル作成完了
上記11ファイルを作成しました。次はStep 6: 認証機能の実装に進みます。

🔐 Step 6: 認証機能の実装
6.1 認証Context作成認証状態を管理するContextプロバイダー
6.2 ルーティング設定
6.2.1 PrivateRoute（認証必須ルート）認証が必要なルートを保護するコンポーネント6.2.2 PublicRoute（公開ルート）公開ルート（認証済みの場合はダッシュボードにリダイレクト）6.2.3 AppRoutes（ルート定義）アプリケーション全体のルート定義
6.3 ページコンポーネント作成
6.3.1 ホームページホームページ（仮実装）6.3.2 ログインページログインページ6.3.3 ダッシュボードページ（仮実装）ダッシュボードページ（仮実装）6.3.4 404エラーページ404エラーページ
6.4 App.tsx更新App.tsxの更新（AuthProviderとルーティング統合）
6.5 main.tsx更新Main.tsxの更新（エントリーポイント）
6.6 基本CSS（index.css）ファイルを作成しました, ファイルを読み取りました


🔧 次のステップ：セットアップ手順
Step 1: プロジェクト初期化
bash# frontendディレクトリに移動
cd frontend

# package.jsonを作成（まだ作成していない場合）
npm init -y

# 依存関係のインストール
npm install react react-dom react-router-dom axios dayjs
npm install -D @types/react @types/react-dom @types/node typescript vite @vitejs/plugin-react
Step 2: ファイル配置
bash# 作成した全ファイルをfrontend/ディレクトリに配置
# （上記22ファイルを適切なディレクトリ構造に配置）
Step 3: バックエンド起動
bash# backendディレクトリで
cd ../backend
./mvnw spring-boot:run
確認ポイント:

✅ http://localhost:8080 でバックエンドが起動
✅ http://localhost:8080/api/v1/auth/me にアクセスして401が返る（未認証）

Step 4: フロントエンド起動
bash# frontendディレクトリで
cd ../frontend
npm run dev
確認ポイント:

✅ http://localhost:3000 でフロントエンドが起動
✅ ホームページが表示される
✅ ログインページに遷移できる

Step 5: 動作確認

ログイン機能テスト

http://localhost:3000/login にアクセス
テストアカウントでログイン試行
ダッシュボードにリダイレクトされるか確認


認証状態の保持確認

ログイン後、ページをリロード
ダッシュボードに留まるか確認（セッション維持）


ログアウト機能テスト

ダッシュボードでログアウトボタンをクリック
ホームページにリダイレクトされるか確認




🎯 実装済み機能
✅ 認証システム

セッションベース認証（Cookie）
CSRF保護（X-XSRF-TOKEN）
401エラー時の自動リダイレクト
認証状態のグローバル管理（AuthContext）

✅ ルーティング

公開ルート（未認証OK）
認証必須ルート（未認証→ログイン画面）
認証済みユーザーの自動リダイレクト

✅ 基本ページ

ホームページ
ログインページ
ダッシュボード
404エラーページ


📝 次に実装すべき機能

会員登録ページ (RegisterPage.tsx)
パーティシパント管理画面
提供物一覧・検索画面
予約作成・管理画面
チケット管理画面
プロバイダー機能画面
管理者機能画面