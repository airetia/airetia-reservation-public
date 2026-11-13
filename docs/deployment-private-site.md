# AIRETIA予約システム Web公開手順（検索非表示・無料構成）

## 方針
- 公開するドメイン名はこのリポジトリ（Public）に書かない。ドメインはGitHub PagesのCustom domain画面とXserverのDNSでのみ設定する。
- 画面（`frontend/dist`）はGitHub Pages、バックエンドは無料PaaS（Dockerfile使用）、DBは無料MySQL互換サービスに置く。
- 開発中は開発用サブドメイン、実運用ではサブドメイン名だけを変更する（コード変更なし）。
- `frontend/index.html` の `noindex, nofollow` と `frontend/public/robots.txt`（noindex確認のためクロールは許可）で検索登録を抑止する。URLを知る人はアクセスできるため、認証・認可は別途必須。

## 構成と同一サイト条件
ログインのCookieは `SameSite=Lax` のため、画面とAPIは同じ登録ドメイン配下に置く。
- 画面: `<画面用サブドメイン>.<ドメイン>`（GitHub Pages）
- API: `<API用サブドメイン>.<ドメイン>`（PaaSのカスタムドメイン）

## バックエンドの環境変数
| 変数 | 内容 |
|---|---|
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | 無料DBの接続情報 |
| `ALLOWED_ORIGINS` | 画面のURL（カンマ区切り） |
| `CSRF_COOKIE_DOMAIN` | 親ドメイン（画面とAPIが別サブドメインのため必須。画面がXSRF-TOKEN Cookieを読めるようにする） |
| `SESSION_COOKIE_SECURE` | 公開環境は `true` |
| `SESSION_COOKIE_SAMESITE` | `lax`（同一サイト構成の場合） |
| `LOG_LEVEL_APP` / `LOG_LEVEL_FRAMEWORK` | 公開環境は `INFO` |
| `LOG_LEVEL_SQL_PARAMS` | 公開環境は `INFO`（SQLの値を出さない） |

## GitHub側の操作
1. Settings → Pages → Build and deployment を「GitHub Actions」にする。
2. Settings → Secrets and variables → Actions → Variables に `VITE_API_BASE_URL`（APIのホストまで。例 `https://<API用サブドメイン>.<ドメイン>`。`/api/v1` は画面側のコードが付けるので書かない）を登録する。
3. Pages の Custom domain に画面用ドメインを設定する（リポジトリに `CNAME` ファイルは置かない）。
4. DNS反映後、Enforce HTTPS を有効にする。

## Xserver DNS
- 画面用: CNAME `<画面用サブドメイン>` → `<組織名>.github.io`（GitHub Pages画面の指示値を優先）
- API用: PaaSが指示するCNAME

## APIについて
Spring Boot + MySQLが必要。`backend/Dockerfile` でPaaSにデプロイし、Flywayが起動時にテーブルを作成する。無料枠のスリープ・容量制限に注意する。
