#!/bin/bash
# Chạy TRÊN VM, trong thư mục đã giải nén gói.
# Nạp ảnh từ images.tar rồi dựng stack. VM không build gì cả.
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

[ -f VERSION ] && . ./VERSION

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✗ Chưa có .env — đã tạo từ .env.example."
    echo "  Điền DOMAIN, ANTHROPIC_API_KEY… rồi chạy lại ./deploy.sh"
    exit 1
fi

# DOMAIN phải có, không thì Caddy không xin được chứng chỉ.
. ./.env
if [ -z "${DOMAIN:-}" ] || [ "$DOMAIN" = "ansao.example.com" ]; then
    echo "✗ DOMAIN trong .env chưa đặt (hoặc còn là giá trị mẫu)."
    exit 1
fi

echo "→ Nạp ảnh…"
docker load -i images.tar

echo "→ Dựng stack (phiên bản ${VERSION:-latest})…"
VERSION="${VERSION:-latest}" docker compose up -d --remove-orphans

echo "→ Chờ web khoẻ…"
for i in $(seq 1 40); do
    tt=$(docker inspect --format='{{.State.Health.Status}}' ansao-web-1 2>/dev/null || echo starting)
    [ "$tt" = "healthy" ] && break
    sleep 3
done

echo ""
docker compose ps
echo ""
if [ "$tt" = "healthy" ]; then
    echo "✓ Đã chạy: https://$DOMAIN"
    echo "  Lần đầu Caddy xin chứng chỉ mất khoảng 10-30 giây."
else
    echo "✗ web chưa khoẻ. Xem log:  docker compose logs -f web"
fi
