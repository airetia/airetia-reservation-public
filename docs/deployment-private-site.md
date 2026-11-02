# AIRETIA予約システム Web公開手順（検索非表示）

## 方針
- アプリ本体（このPrivate repository）は非公開のまま維持する。
- GitHub Pagesにはビルド成果物 `frontend/dist` のみを公開用repositoryへ配置する。
- 公開URLは `https://reserve.airetia.co.jp` を想定。
- `noindex,nofollow` により検索エンジンの登録を抑止する。URLを知る人はアクセスできるため、認証・認可は別途必須。

## このrepositoryで対応済み
- `frontend/index.html` に `<meta name="robots" content="noindex, nofollow">` を追加。
- `frontend/public/robots.txt` を追加（noindex確認のためクロールを許可）。
- `.github/workflows/frontend-build.yml` を追加（push/PR時にbuildし、distをActions artifactに保存）。

## GitHub側で必要な操作
1. GitHubで公開用repository（例：`airetia-reservation-public`）を **Public** で作成。README等は初期化しない。
2. 公開用repositoryのSettings → Pages → Build and deploymentを「Deploy from a branch」ではなくGitHub Actionsにする。
3. 公開用repositoryに `CNAME` ファイルを作成し、内容を `reserve.airetia.co.jp` の1行にする。
4. GitHub PagesのCustom domainに `reserve.airetia.co.jp` を設定。
5. Xserver DNSにGitHub Pages指定のCNAMEを設定（通常、ホスト名 `reserve` → `airi-13.github.io`）。GitHub Pages画面の指示値を優先する。
6. DNS反映後、PagesのEnforce HTTPSを有効にする。

## APIについて
このシステムはSpring Boot + MySQLを必要とするため、GitHub Pagesだけでは予約機能全体は動作しない。APIサーバーと永続DBの配置、CORS・Cookie・認証設定、`VITE_API_BASE_URL` の本番値設定が別途必要。
