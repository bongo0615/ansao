#!/bin/bash
# Chuẩn bị VM GCE mới cho An Sao. Chạy MỘT LẦN, TRÊN VM.
#
#   gcloud compute ssh ansao --zone asia-southeast1-a
#   curl -fsSL -o setup.sh <URL> && bash setup.sh    # hoặc dán nội dung này
set -e

echo "=== Chuẩn bị VM cho An Sao ==="

if [ "$(id -u)" = "0" ]; then
    echo "✗ Đừng chạy bằng root — script tự dùng sudo khi cần."
    exit 1
fi

echo "→ Cập nhật hệ thống…"
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

if ! command -v docker >/dev/null 2>&1; then
    echo "→ Cài Docker…"
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker "$USER"
    echo "  (đăng xuất rồi vào lại để dùng docker không cần sudo)"
else
    echo "→ Docker đã có: $(docker --version)"
fi

# Compose v2 đi kèm Docker mới; kiểm tra cho chắc.
docker compose version >/dev/null 2>&1 || {
    echo "→ Cài docker compose plugin…"
    sudo apt-get install -y -qq docker-compose-plugin
}

echo "→ Bật swap 2GB…"
# e2-small chỉ có 2GB RAM. VM không build ứng dụng, nhưng swap giúp khỏi bị OOM
# khi `docker load` ảnh vài trăm MB.
if ! sudo swapon --show | grep -q /swapfile; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile >/dev/null
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
else
    echo "  swap đã bật"
fi

echo "→ Dọn ảnh Docker cũ hàng tuần…"
# Mỗi lần triển khai để lại một ảnh cũ; đĩa sẽ đầy sau chừng chục lần.
# Dùng systemd timer chứ không phải cron: ảnh Ubuntu tối giản không cài sẵn cron.
sudo tee /etc/systemd/system/docker-prune.service >/dev/null <<'UNIT'
[Unit]
Description=Don anh Docker cu

[Service]
Type=oneshot
ExecStart=/usr/bin/docker image prune -af --filter until=336h
UNIT

sudo tee /etc/systemd/system/docker-prune.timer >/dev/null <<'UNIT'
[Unit]
Description=Don anh Docker cu hang tuan

[Timer]
OnCalendar=Sun 04:00
Persistent=true

[Install]
WantedBy=timers.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now docker-prune.timer >/dev/null 2>&1

echo "→ Bật cập nhật bảo mật tự động…"
sudo apt-get install -y -qq unattended-upgrades
sudo dpkg-reconfigure -f noninteractive unattended-upgrades >/dev/null 2>&1 || true

echo ""
echo "✓ VM đã sẵn sàng."
echo ""
echo "Còn lại (làm ở máy bạn):"
echo "  1. Mở cổng 80/443:"
echo "     gcloud compute firewall-rules create ansao-web \\"
echo "       --allow tcp:80,tcp:443 --target-tags ansao-web"
echo "  2. Trỏ bản ghi A của tên miền về IP tĩnh của VM"
echo "  3. ./build-local.sh && ./push.sh"
