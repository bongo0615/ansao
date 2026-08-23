#!/bin/bash
# Khởi động môi trường dev của An Sao.
#
# App chỉ có 1 tiến trình (Next.js) — không cần Docker. Script lo phần lặt vặt:
# cài dependency khi thiếu, tạo .env.local, dọn port cũ, chạy test trước khi mở.
#
# Cách dùng:
#   ./dev.sh            Kiểm tra rồi chạy dev server (mặc định)
#   ./dev.sh nhanh      Chạy ngay, bỏ qua test (khi đang lặp nhanh)
#   ./dev.sh test       Chỉ chạy test (99 test: engine + nạp âm)
#   ./dev.sh kiem-tra   Typecheck + test + build production
#   ./dev.sh xuat       Xuất lá số ra HTML tĩnh để đối chiếu mockup
#   ./dev.sh dung       Dừng dev server đang chạy
#
# Biến môi trường:
#   PORT=3001 ./dev.sh  Đổi cổng (mặc định 3000)
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

PORT="${PORT:-3000}"
LENH="${1:-chay}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; DIM='\033[2m'; NC='\033[0m'

thongbao() { echo -e "${BLUE}▸${NC} $1"; }
canhbao()  { echo -e "${YELLOW}!${NC} $1"; }
loi()      { echo -e "${RED}✗${NC} $1"; }
xong()     { echo -e "${GREEN}✓${NC} $1"; }

# In khối comment hướng dẫn ở đầu file (dừng ở dòng không phải comment).
huong_dan() {
    awk 'NR>1 { if (!/^#/) exit; sub(/^# ?/, ""); print }' "$0"
}

# ── Dừng tiến trình đang giữ cổng ───────────────────────────────────────────
don_port() {
    local pids
    pids=$(lsof -ti:"$PORT" 2>/dev/null || true)
    [ -z "$pids" ] && return 0
    canhbao "Cổng $PORT đang bị chiếm (PID: $(echo "$pids" | tr '\n' ' ')) — đang dừng…"
    echo "$pids" | xargs kill 2>/dev/null || true
    sleep 1
    # Còn sống thì kill cứng.
    pids=$(lsof -ti:"$PORT" 2>/dev/null || true)
    [ -n "$pids" ] && echo "$pids" | xargs kill -9 2>/dev/null || true
    xong "Đã giải phóng cổng $PORT."
}

if [ "$LENH" = "dung" ]; then
    don_port
    exit 0
fi

# ── Preflight ────────────────────────────────────────────────────────────────
if ! command -v node >/dev/null 2>&1; then
    loi "Chưa cài Node.js. Cần Node 18.18+ (khuyến nghị 20+)."
    exit 1
fi

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 18 ]; then
    loi "Node $(node -v) quá cũ — Next.js 15 cần Node 18.18 trở lên."
    exit 1
fi

# node_modules cũ hơn package.json → cài lại.
if [ ! -d node_modules ] || [ package.json -nt node_modules ]; then
    thongbao "Đang cài dependency…"
    npm install
    xong "Đã cài xong dependency."
fi

# ── .env.local ───────────────────────────────────────────────────────────────
# Thiếu key Supabase, app vẫn chạy được ở CHẾ ĐỘ KHÁCH: lập và in lá số bình
# thường, chỉ không lưu/đăng nhập được. Vì vậy chỉ cảnh báo, không chặn.
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    canhbao "Đã tạo .env.local từ .env.example (chưa có key Supabase)."
fi

CO_SUPABASE=0
if grep -qE '^NEXT_PUBLIC_SUPABASE_URL=.+' .env.local \
   && grep -qE '^NEXT_PUBLIC_SUPABASE_ANON_KEY=.+' .env.local; then
    CO_SUPABASE=1
fi

CHE_DO_KHACH=0
grep -qE '^NEXT_PUBLIC_CHE_DO_KHACH=1' .env.local && CHE_DO_KHACH=1

CO_AI=0
grep -qE '^ANTHROPIC_API_KEY=.+' .env.local && CO_AI=1

# ── Các lệnh phụ ─────────────────────────────────────────────────────────────
case "$LENH" in
    test)
        thongbao "Chạy test (2 test case acceptance + đối chiếu 60 hoa giáp)…"
        npm test
        exit 0
        ;;
    kiem-tra)
        thongbao "Typecheck…";        npx tsc --noEmit && xong "Typecheck sạch."
        thongbao "Test…";             npm test
        thongbao "Build production…"; npm run build
        xong "Tất cả đều qua."
        exit 0
        ;;
    xuat)
        DICH="${2:-$ROOT_DIR/la-so-mau.html}"
        if ! curl -sf -o /dev/null "http://localhost:$PORT/la-so/moi"; then
            loi "Dev server chưa chạy ở cổng $PORT. Mở ./dev.sh ở tab khác trước."
            exit 1
        fi
        node scripts/xuat-la-so.mjs "http://localhost:$PORT/la-so/moi" "$DICH"
        exit 0
        ;;
    chay|nhanh) ;;
    *)
        loi "Không hiểu lệnh '$LENH'."
        echo ""
        huong_dan
        exit 1
        ;;
esac

# ── Test trước khi chạy ──────────────────────────────────────────────────────
# Engine sai thì lá số sai một cách âm thầm (sao vẫn hiện, chỉ sai vị trí), nên
# mặc định chạy test trước. Dùng `./dev.sh nhanh` để bỏ qua.
if [ "$LENH" = "chay" ]; then
    thongbao "Kiểm tra engine trước khi mở server…"
    if npm test --silent >/tmp/ansao-test.log 2>&1; then
        xong "$(grep -oE 'Tests +[0-9]+ passed' /tmp/ansao-test.log | tail -1) — engine khớp tài liệu."
    else
        loi "Test KHÔNG qua — engine đang lệch so với TechDoc:"
        echo ""
        tail -30 /tmp/ansao-test.log
        echo ""
        canhbao "Sửa engine trước, hoặc chạy './dev.sh nhanh' nếu bạn cố ý bỏ qua."
        exit 1
    fi
fi

# ── Khởi động ────────────────────────────────────────────────────────────────
don_port

echo ""
echo -e "${GREEN}An Sao — môi trường dev${NC}"
echo -e "${DIM}────────────────────────────────────────────${NC}"
echo -e "  Trang chủ      ${BLUE}http://localhost:$PORT${NC}"
echo -e "  Lập lá số mới  ${BLUE}http://localhost:$PORT/la-so/moi${NC}"
if [ "$CHE_DO_KHACH" = "1" ]; then
    echo -e "  Chế độ         ${YELLOW}KHÁCH${NC} — đăng nhập TẮT, lá số lưu trong trình duyệt"
    echo -e "  ${DIM}Bật lại đăng nhập: đặt NEXT_PUBLIC_CHE_DO_KHACH=0 trong .env.local.${NC}"
elif [ "$CO_SUPABASE" = "1" ]; then
    echo -e "  Đăng nhập      ${BLUE}http://localhost:$PORT/login${NC}"
    echo -e "  Supabase       ${GREEN}đã cấu hình${NC} — lưu được lá số"
else
    echo -e "  Supabase       ${YELLOW}chưa cấu hình${NC} — không lưu được lá số"
    echo -e "  ${DIM}Điền key vào .env.local, hoặc đặt NEXT_PUBLIC_CHE_DO_KHACH=1${NC}"
    echo -e "  ${DIM}để test không cần đăng nhập.${NC}"
fi
if [ "$CO_AI" = "1" ]; then
    echo -e "  Luận giải AI   ${GREEN}sẵn sàng${NC} (Claude Opus 5)"
else
    echo -e "  Luận giải AI   ${YELLOW}tắt${NC} — thiếu ANTHROPIC_API_KEY trong .env.local"
    echo -e "  ${DIM}Lấy key tại https://console.anthropic.com/settings/keys${NC}"
fi
echo -e "${DIM}────────────────────────────────────────────${NC}"
echo -e "${DIM}Ctrl+C để dừng.${NC}"
echo ""

exec npx next dev --port "$PORT"
