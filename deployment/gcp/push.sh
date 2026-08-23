#!/bin/bash
# Đẩy gói triển khai lên VM rồi chạy deploy.sh ở đó.
#
#   ./push.sh                 → gói mới nhất, host mặc định "ansao-gcp"
#   ./push.sh ansao-gcp       → chỉ định host trong ~/.ssh/config
#   ./push.sh ansao-deploy.tar.gz ansao-gcp
#
# Dùng ssh/scp thẳng qua alias trong ~/.ssh/config (không qua `gcloud compute
# ssh`): nhanh hơn, không phụ thuộc gcloud đăng nhập, và cùng cách làm với các
# dự án khác trên cùng máy.
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

HOST_MAC_DINH="ansao-gcp"
GOI=""
REMOTE=""

# Đối số kết thúc bằng .tar.gz là gói; còn lại là alias SSH.
for arg in "$@"; do
    case "$arg" in
        *.tar.gz) GOI="$arg" ;;
        *)        REMOTE="$arg" ;;
    esac
done
REMOTE="${REMOTE:-$HOST_MAC_DINH}"
GOI="${GOI:-ansao-deploy.tar.gz}"

if [ ! -f "$GOI" ]; then
    echo "✗ Không thấy gói '$GOI'. Chạy ./build-local.sh trước."
    exit 1
fi

if ! ssh -o ConnectTimeout=6 -o BatchMode=yes "$REMOTE" true 2>/dev/null; then
    cat <<HD
✗ Không SSH được vào host '$REMOTE'.

  Thêm vào ~/.ssh/config:

    Host $REMOTE
        HostName <IP ngoài của VM>
        User <tên user Google, vd bongo0615>
        IdentityFile ~/.ssh/gcp-ansao

  Và nạp khoá công khai lên VM (chạy ở máy này):

    gcloud compute os-login ssh-keys add \\
      --key-file ~/.ssh/gcp-ansao.pub

  Hoặc thêm vào metadata của VM trong Console:
    Compute Engine → VM → Edit → SSH Keys → Add item
HD
    exit 1
fi

echo "=== Đẩy lên $REMOTE ==="
echo "Gói: $GOI ($(du -h "$GOI" | cut -f1))"
echo ""

echo "→ Tải lên…"
scp "$GOI" "$REMOTE:~/"

# Chép luôn .env nếu có ở máy dev — đỡ phải gõ lại khoá trên VM. File chứa bí
# mật nên đặt quyền 600 ngay sau khi chép.
if [ -f .env ]; then
    echo "→ Đồng bộ .env…"
    scp .env "$REMOTE:~/ansao-env-moi"
fi

echo "→ Giải nén và triển khai…"
# shellcheck disable=SC2087
ssh "$REMOTE" bash -s <<'REMOTE_EOF'
set -e
cd ~
mkdir -p ansao
tar -xzf ansao-deploy.tar.gz -C ansao
cd ansao
chmod +x deploy.sh
if [ -f ~/ansao-env-moi ]; then
    mv ~/ansao-env-moi .env
    chmod 600 .env
fi
if [ -f .env ]; then
    ./deploy.sh
else
    cp .env.example .env
    echo ""
    echo "Lần đầu triển khai — cần điền cấu hình trước:"
    echo "  ssh vào VM, sửa ~/ansao/.env (DOMAIN, Supabase, ANTHROPIC_API_KEY)"
    echo "  rồi chạy:  cd ~/ansao && ./deploy.sh"
fi
REMOTE_EOF
