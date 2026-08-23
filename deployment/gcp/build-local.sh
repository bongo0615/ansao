#!/bin/bash
# Dựng ảnh An Sao và đóng thành một gói mang lên VM.
#
# Sinh ra: deployment/gcp/ansao-deploy.tar.gz gồm
#   images.tar          (docker save ansao-web)
#   docker-compose.yml  (bản dùng ảnh dựng sẵn)
#   Caddyfile
#   .env.example
#   VERSION
#   deploy.sh           (nạp ảnh + dựng stack trên VM)
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
BUILD_DIR="$SCRIPT_DIR/build-output"

VERSION="${VERSION:-$(git -C "$ROOT_DIR" describe --tags --always --dirty 2>/dev/null || echo dev)}"
GIT_COMMIT="$(git -C "$ROOT_DIR" rev-parse --short HEAD 2>/dev/null || echo unknown)"
BUILD_TIME="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

# VM trên GCE là amd64. Build trên máy Apple Silicon mà không ép nền tảng sẽ ra
# ảnh arm64, lên VM là "exec format error".
PLATFORM="${PLATFORM:-linux/amd64}"

# ── Env lúc build ───────────────────────────────────────────────────────────
# NEXT_PUBLIC_* bị nhúng vào bundle trình duyệt, nên MỘT gói gắn với MỘT project
# Supabase và MỘT bộ cờ tính năng. Đổi thì phải build lại.
if [ -f "$SCRIPT_DIR/.env" ]; then
    set -a; . "$SCRIPT_DIR/.env"; set +a
fi
: "${NEXT_PUBLIC_SUPABASE_URL:=}"
: "${NEXT_PUBLIC_SUPABASE_ANON_KEY:=}"
: "${NEXT_PUBLIC_SITE_URL:=}"
: "${NEXT_PUBLIC_CHE_DO_KHACH:=0}"
: "${NEXT_PUBLIC_CHAT_MO:=0}"
: "${NEXT_PUBLIC_CHO_DANG_KY:=0}"

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "CẢNH BÁO: thiếu NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY."
    echo "          Ảnh dựng ra sẽ KHÔNG nói chuyện được với Supabase từ trình duyệt."
    echo "          Điền vào deployment/gcp/.env rồi build lại."
    echo ""
fi
for c in NEXT_PUBLIC_CHE_DO_KHACH NEXT_PUBLIC_CHAT_MO NEXT_PUBLIC_CHO_DANG_KY; do
    eval "v=\$$c"
    [ "$v" = "1" ] && echo "CẢNH BÁO: $c=1 sẽ được nhúng vào bản production này."
done

echo "=== Đóng gói An Sao ==="
echo "Phiên bản: $VERSION"
echo "Commit:    $GIT_COMMIT"
echo "Thời điểm: $BUILD_TIME"
echo "Nền tảng:  $PLATFORM"
echo ""

# ── Chặn trước: typecheck + test (nhanh, chạy máy thật) ────────────────────
# `next build` trong Docker cũng chạy tsc, nhưng lỗi chỉ lộ ra SAU vài phút
# cross-build giả lập. Chạy trước ở đây thì hỏng là biết ngay trong vài giây.
echo "→ Typecheck…"
( cd "$ROOT_DIR" && npx tsc --noEmit ) || { echo "✗ Typecheck hỏng."; exit 1; }
echo "→ Test…"
( cd "$ROOT_DIR" && npm test --silent ) || { echo "✗ Test hỏng — engine đang lệch so với tài liệu."; exit 1; }
echo ""

rm -rf "$BUILD_DIR"; mkdir -p "$BUILD_DIR"

echo "→ Dựng ảnh ansao-web ($PLATFORM)…"
docker build \
    --platform "$PLATFORM" \
    -t "ansao-web:$VERSION" -t "ansao-web:latest" \
    --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    --build-arg NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
    --build-arg NEXT_PUBLIC_APP_VERSION="$VERSION" \
    --build-arg NEXT_PUBLIC_CHE_DO_KHACH="$NEXT_PUBLIC_CHE_DO_KHACH" \
    --build-arg NEXT_PUBLIC_CHAT_MO="$NEXT_PUBLIC_CHAT_MO" \
    --build-arg NEXT_PUBLIC_CHO_DANG_KY="$NEXT_PUBLIC_CHO_DANG_KY" \
    "$ROOT_DIR"

# ── Thử ảnh trước khi đóng gói ───────────────────────────────────────────────
# Ảnh thiếu NEXT_PUBLIC_* vẫn build trót lọt, chỉ hỏng khi lên VM: trang đăng
# nhập báo "Chưa cấu hình Supabase". Bắt tại đây, đừng để phát hiện lúc bàn giao.
echo "→ Thử ảnh vừa dựng…"
CANG=$(docker run -d -P --platform "$PLATFORM" "ansao-web:$VERSION")
CONG=$(docker port "$CANG" 3000/tcp | head -1 | sed 's/.*://')
don_thu() { docker rm -f "$CANG" >/dev/null 2>&1 || true; }
trap don_thu EXIT

for _ in $(seq 1 30); do
    curl -sf -o /dev/null "http://localhost:$CONG/api/health" && break
    sleep 2
done

if ! curl -sf -o /dev/null "http://localhost:$CONG/api/health"; then
    echo "✗ Ảnh không khởi động được. Log:"
    docker logs "$CANG" 2>&1 | tail -20
    exit 1
fi

TRANG=$(curl -s --max-time 15 "http://localhost:$CONG/login")
if echo "$TRANG" | grep -q "Chưa cấu hình Supabase"; then
    echo "✗ Ảnh dựng ra KHÔNG có cấu hình Supabase."
    echo "  NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY bị nhúng LÚC BUILD, không sửa được"
    echo "  bằng biến môi trường lúc chạy. Điền vào deployment/gcp/.env rồi build lại."
    exit 1
fi
echo "  ✓ khởi động được, có cấu hình Supabase"
don_thu; trap - EXIT

echo "→ Xuất ảnh ra images.tar…"
docker save "ansao-web:$VERSION" -o "$BUILD_DIR/images.tar"

cp "$SCRIPT_DIR/docker-compose.yml" "$BUILD_DIR/docker-compose.yml"
cp "$SCRIPT_DIR/Caddyfile"          "$BUILD_DIR/Caddyfile"
cp "$SCRIPT_DIR/.env.example"       "$BUILD_DIR/.env.example"
cp "$SCRIPT_DIR/deploy.sh"          "$BUILD_DIR/deploy.sh"
chmod +x "$BUILD_DIR/deploy.sh"

cat > "$BUILD_DIR/VERSION" <<EOF
VERSION=$VERSION
GIT_COMMIT=$GIT_COMMIT
BUILD_TIME=$BUILD_TIME
PLATFORM=$PLATFORM
EOF

TARBALL="$SCRIPT_DIR/ansao-deploy.tar.gz"
tar -czf "$TARBALL" -C "$BUILD_DIR" .
rm -rf "$BUILD_DIR"

echo ""
echo "✓ Xong: $TARBALL ($(du -h "$TARBALL" | cut -f1))"
echo ""
echo "Tiếp theo:  ./push.sh    (chép lên VM và triển khai)"
