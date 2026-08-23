#!/bin/bash
# Mở một địa chỉ công khai tạm thời để người khác vào thử.
#
# Chạy BẢN PRODUCTION (không phải dev server): qua đường hầm, dev mode chậm và
# hay giật do phải biên dịch lại từng route. `next start` phản ánh đúng những gì
# người thử sẽ thấy.
#
# Dùng Cloudflare Quick Tunnel — không cần tài khoản, không cần thẻ. Địa chỉ đổi
# mỗi lần chạy và mất khi bạn Ctrl+C.
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"
PORT="${PORT:-3000}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; DIM='\033[2m'; NC='\033[0m'
LOG="$(mktemp -t ansao-tunnel)"
PID_APP=""; PID_TUN=""

don() {
    echo ""
    echo -e "${YELLOW}Đang đóng…${NC}"
    [ -n "$PID_TUN" ] && kill "$PID_TUN" 2>/dev/null || true
    [ -n "$PID_APP" ] && kill "$PID_APP" 2>/dev/null || true
    lsof -ti:"$PORT" 2>/dev/null | xargs kill 2>/dev/null || true
    rm -f "$LOG"
    echo -e "${GREEN}Đã đóng địa chỉ công khai.${NC}"
    exit 0
}
trap don INT TERM

if ! command -v cloudflared >/dev/null 2>&1; then
    echo -e "${RED}✗ Chưa cài cloudflared.${NC}"
    echo "  brew install cloudflared"
    exit 1
fi

# ── Rà soát an toàn trước khi mở ra ngoài ───────────────────────────────────
echo -e "${BLUE}▸${NC} Rà soát trước khi mở công khai…"
CANH_BAO=0

if grep -qE '^NEXT_PUBLIC_CHAT_MO=1' .env.local; then
    echo -e "  ${RED}✗${NC} CHAT MỞ đang BẬT — người lạ hỏi được chuyên gia, tốn hạn mức API."
    echo -e "    ${DIM}Đặt NEXT_PUBLIC_CHAT_MO=0 trong .env.local.${NC}"
    CANH_BAO=1
fi
if grep -qE '^NEXT_PUBLIC_CHE_DO_KHACH=1' .env.local; then
    echo -e "  ${YELLOW}!${NC} Chế độ khách đang BẬT — bỏ qua đăng nhập hoàn toàn."
    CANH_BAO=1
fi

# Đăng ký còn mở ở Supabase thì ai cũng tạo được tài khoản qua API, dù nút đã ẩn.
SB_URL=$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2-)
SB_KEY=$(grep -E '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | cut -d= -f2-)
if [ -n "$SB_URL" ] && [ -n "$SB_KEY" ]; then
    if curl -s -H "apikey: $SB_KEY" "$SB_URL/auth/v1/settings" | grep -q '"disable_signup":false'; then
        echo -e "  ${YELLOW}!${NC} Supabase vẫn CHO ĐĂNG KÝ — nút đã ẩn nhưng gọi thẳng API vẫn tạo được tài khoản."
        echo -e "    ${DIM}Tắt ở: Authentication → Sign In / Providers → Email → Allow new users to sign up.${NC}"
        CANH_BAO=1
    fi
fi
[ "$CANH_BAO" = "0" ] && echo -e "  ${GREEN}✓${NC} Không có gì đáng ngại."

# ── Build + chạy production ─────────────────────────────────────────────────
echo ""
echo -e "${BLUE}▸${NC} Build bản production…"
rm -rf "$ROOT_DIR/.next"
npm run build >/dev/null 2>&1 || { echo -e "${RED}✗ Build thất bại.${NC} Chạy 'npm run build' để xem lỗi."; exit 1; }

lsof -ti:"$PORT" 2>/dev/null | xargs kill 2>/dev/null || true
npx next start --port "$PORT" >/dev/null 2>&1 &
PID_APP=$!

for _ in $(seq 1 40); do
    curl -sf -o /dev/null "http://localhost:$PORT/" && break
    sleep 0.5
done
curl -sf -o /dev/null "http://localhost:$PORT/" || { echo -e "${RED}✗ App không lên được.${NC}"; don; }
echo -e "  ${GREEN}✓${NC} App chạy ở cổng $PORT"

# ── Mở đường hầm ────────────────────────────────────────────────────────────
echo -e "${BLUE}▸${NC} Mở đường hầm Cloudflare…"
cloudflared tunnel --no-autoupdate --url "http://localhost:$PORT" >"$LOG" 2>&1 &
PID_TUN=$!

DIA_CHI=""
for _ in $(seq 1 60); do
    DIA_CHI=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG" | head -1)
    [ -n "$DIA_CHI" ] && break
    sleep 1
done

if [ -z "$DIA_CHI" ]; then
    echo -e "${RED}✗ Không lấy được địa chỉ công khai.${NC} Log: $LOG"
    tail -20 "$LOG"
    don
fi

TK_EMAIL=$(grep -oE '^# TAI_KHOAN_THU=.*' .env.local 2>/dev/null | cut -d= -f2- || true)

echo ""
echo -e "${GREEN}Địa chỉ công khai đã sẵn sàng${NC}"
echo -e "${DIM}──────────────────────────────────────────────────────${NC}"
echo -e "  ${BLUE}$DIA_CHI${NC}"
echo ""
echo -e "  ${DIM}Gửi kèm cho người thử:${NC}"
echo -e "  ${DIM}  Email:    ${TK_EMAIL:-thu@ansao.test}${NC}"
echo -e "  ${DIM}  Mật khẩu: (mật khẩu bạn đặt khi tạo tài khoản)${NC}"
echo -e "${DIM}──────────────────────────────────────────────────────${NC}"
echo -e "${DIM}Địa chỉ chỉ sống khi cửa sổ này còn mở. Ctrl+C để đóng.${NC}"
echo ""

wait $PID_TUN
