#!/bin/bash
PROJECT="/Users/airit/Desktop/airetia/airetia-reservation-system"
FRONTEND="$PROJECT/frontend"
BACKEND="$PROJECT/backend"
WEB="$PROJECT/web"
MYSQL_USER="root"
FRONTEND_URL="http://localhost:5173"
BROWSER_WAIT=20

BOLD='\033[1m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; CYAN='\033[0;36m'; RESET='\033[0m'
log()  { echo -e "${BOLD}${GREEN}[✓]${RESET} $1"; }
info() { echo -e "${CYAN}[→]${RESET} $1"; }
warn() { echo -e "${YELLOW}[!]${RESET} $1"; }
sep()  { echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"; }

sep
echo -e "${BOLD}${CYAN}  🚀 airetia 起動中 ── A: メインタブ${RESET}"
sep

# ── このウィンドウのIDを最初に取得して固定 ──────────────────
WIN_ID=$(osascript -e 'tell application "Terminal" to return id of front window')
info "ウィンドウID: $WIN_ID に B/C/D タブを追加します"

# A-1: Git Pull
echo -e "\n${BOLD}[A-1] Git Pull${RESET}"
cd "$PROJECT" && git pull && log "Git Pull 完了"

# A-2: MySQL
echo -e "\n${BOLD}[A-2] MySQL 起動${RESET}"
if mysqladmin -u "$MYSQL_USER" ping --silent 2>/dev/null; then
    warn "MySQL は既に起動済みです"
elif command -v brew &>/dev/null && brew services list 2>/dev/null | grep -q "^mysql"; then
    brew services start mysql
elif command -v mysql.server &>/dev/null; then
    mysql.server start
fi
sleep 2
mysqladmin -u "$MYSQL_USER" ping --silent 2>/dev/null \
    && log "MySQL OK" || warn "MySQL 疎通確認失敗"

# A-3: Eclipse
echo -e "\n${BOLD}[A-3] Eclipse 起動${RESET}"
ECLIPSE_APP=$(ls /Applications/ 2>/dev/null | grep -i eclipse | head -1)
if [ -n "$ECLIPSE_APP" ]; then
    open -a "$ECLIPSE_APP" & log "Eclipse 起動"
else
    warn "Eclipse が見つかりません"
fi

# A-4: VSCode
echo -e "\n${BOLD}[A-4] VSCode 起動${RESET}"
if command -v code &>/dev/null; then
    code "$PROJECT" && log "VSCode 起動"
else
    warn "code コマンドが見つかりません"
fi

# A-5: タブ B/C/D を取得済みウィンドウIDに追加
echo -e "\n${BOLD}[A-5] タブ B/C/D を追加${RESET}"

osascript \
  -e "tell application \"Terminal\"" \
  -e "  do script \"printf '\\\\033]0;B:backend\\\\007'; cd $BACKEND && ./mvnw clean package -U -DskipTests && ./mvnw spring-boot:run\" in window id $WIN_ID" \
  -e "  delay 0.8" \
  -e "  do script \"printf '\\\\033]0;C:frontend\\\\007'; cd $FRONTEND && npm install && npm run dev\" in window id $WIN_ID" \
  -e "  delay 0.8" \
  -e "  do script \"printf '\\\\033]0;D:web\\\\007'; cd $WEB && npm install --legacy-peer-deps && npm run dev\" in window id $WIN_ID" \
  -e "end tell"

log "タブ B/C/D 追加完了"

# A-6: localhost を開く
echo -e "\n${BOLD}[A-6] localhost を開く（${BROWSER_WAIT}秒待機）${RESET}"
sleep "$BROWSER_WAIT"
open "$FRONTEND_URL" && log "ブラウザで $FRONTEND_URL を開きました"

sep
echo -e "${BOLD}${GREEN}  ✅ 完了！${RESET}"
echo -e "  ${CYAN}A${RESET}: メイン（このタブ）"
echo -e "  ${CYAN}B${RESET}: backend  → http://localhost:8080"
echo -e "  ${CYAN}C${RESET}: frontend → $FRONTEND_URL"
echo -e "  ${CYAN}D${RESET}: web      → http://localhost:5174 前後"
sep
