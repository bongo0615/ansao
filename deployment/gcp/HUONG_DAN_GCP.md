# Triển khai An Sao lên GCP

Kiến trúc: **một VM GCE** chạy Docker Compose với hai container — Caddy (TLS +
reverse proxy) và Next.js. Supabase và Anthropic là dịch vụ ngoài, VM không giữ
trạng thái gì ngoài chứng chỉ Let's Encrypt.

```
Internet ──443──► Caddy ──► web:3000 (Next.js standalone)
                    │
                    └── chứng chỉ Let's Encrypt (volume caddy_data)

                 Supabase (Postgres + Auth)   ← ngoài
                 Anthropic API (Claude Opus 5) ← ngoài
```

**VM không bao giờ build.** Ảnh Docker được dựng ở máy bạn, đóng vào tarball,
chép lên rồi `docker load`. Lý do: `next build` cần hơn 2GB RAM (máy e2-small
không đủ), và build trên VM nghĩa là mã nguồn phải nằm trên đó.

---

## Máy cần gì

| Thành phần | Khuyến nghị | Ghi chú |
|---|---|---|
| Loại máy | `e2-small` (2 vCPU, 2GB) | Đủ cho vài chục người dùng đồng thời. `e2-micro` 1GB thì chật. |
| Đĩa | 20GB pd-balanced | Ảnh ~200MB mỗi bản; cron dọn ảnh cũ hàng tuần. |
| Vùng | `asia-southeast1` (Singapore) | Gần Việt Nam nhất, độ trễ ~30-50ms. |
| Hệ điều hành | Debian 12 | Script chuẩn bị viết cho apt. |
| IP | **Tĩnh** | Let's Encrypt cần tên miền trỏ ổn định. |

---

## Các bước

### 1. Tạo VM

```bash
gcloud compute instances create ansao \
  --zone=asia-southeast1-a \
  --machine-type=e2-small \
  --image-family=debian-12 --image-project=debian-cloud \
  --boot-disk-size=20GB --boot-disk-type=pd-balanced \
  --tags=ansao-web

gcloud compute addresses create ansao-ip --region=asia-southeast1
gcloud compute instances delete-access-config ansao --zone=asia-southeast1-a
gcloud compute instances add-access-config ansao --zone=asia-southeast1-a \
  --address=$(gcloud compute addresses describe ansao-ip \
      --region=asia-southeast1 --format='value(address)')

gcloud compute firewall-rules create ansao-web \
  --allow=tcp:80,tcp:443 --target-tags=ansao-web
```

### 2. Trỏ tên miền

Lấy IP:

```bash
gcloud compute addresses describe ansao-ip --region=asia-southeast1 --format='value(address)'
```

Tạo bản ghi **A** trỏ về IP đó. **Chờ DNS lan xong rồi mới triển khai** —
Caddy xin chứng chỉ ngay lúc khởi động, hỏng thì Let's Encrypt sẽ chặn tần suất.

Kiểm tra: `dig +short ansao.example.com`

### 3. Mở đường SSH cho máy dev

Mỗi dự án một khoá riêng, giống cách làm ở các dự án khác trên máy này.
Khoá `~/.ssh/gcp-ansao` đã được tạo sẵn; nạp phần công khai lên GCP:

```bash
gcloud compute os-login ssh-keys add --key-file ~/.ssh/gcp-ansao.pub
```

Rồi thêm alias vào `~/.ssh/config`:

```
Host ansao-gcp
    HostName <IP ngoài của VM>
    User <tên user Google>
    IdentityFile ~/.ssh/gcp-ansao
```

Kiểm tra: `ssh ansao-gcp true` — không báo gì là xong.

### 4. Chuẩn bị VM

```bash
gcloud compute ssh ansao --zone=asia-southeast1-a
# dán nội dung setup-gce.sh, hoặc scp lên rồi chạy
bash setup-gce.sh
exit   # đăng xuất rồi vào lại để nhóm docker có hiệu lực
```

### 5. Điền cấu hình ở máy bạn

```bash
cd deployment/gcp
cp .env.example .env
```

Điền `DOMAIN`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SITE_URL`.

> ⚠️ `NEXT_PUBLIC_*` được **nhúng vào bundle lúc build**. Sửa chúng rồi restart
> container là vô ích — phải chạy lại `build-local.sh`. Các biến còn lại
> (`ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) đọc lúc chạy nên sửa xong
> chỉ cần `docker compose up -d`.

### 6. Dựng và triển khai

```bash
./build-local.sh    # typecheck + test + dựng ảnh amd64 + đóng tarball
./push.sh           # scp lên VM + chạy deploy.sh
```

`build-local.sh` chạy typecheck và toàn bộ test trước khi dựng ảnh. Engine sai
thì lá số sai một cách âm thầm, nên đây là cổng chặn cố ý.

Lần đầu vào `https://ansao.example.com` sẽ mất 10-30 giây để Caddy xin chứng chỉ.

---

## Trước khi mở cho người thật

- [ ] **Tắt đăng ký ở Supabase** — Authentication → Sign In / Providers → Email
      → bỏ "Allow new users to sign up". Ẩn nút ở giao diện là chưa đủ, gọi
      thẳng API vẫn tạo được tài khoản.
- [ ] Thêm `https://<tên miền>/auth/callback` vào Supabase → Authentication →
      URL Configuration → Redirect URLs.
- [ ] `NEXT_PUBLIC_CHE_DO_KHACH=0`, `NEXT_PUBLIC_CHAT_MO=0`, `NEXT_PUBLIC_CHO_DANG_KY=0`.
- [ ] Chạy `supabase/migrations/0001_init.sql` trên project production (nếu tách
      khỏi project dev).
- [ ] Đặt hạn mức chi tiêu ở Anthropic Console — `/api/chat` gọi Claude Opus 5
      mỗi lượt hỏi.

---

## Vận hành

```bash
gcloud compute ssh ansao --zone=asia-southeast1-a
cd ~/ansao

docker compose ps                 # trạng thái
docker compose logs -f web        # log ứng dụng
docker compose logs -f caddy      # log TLS / truy cập
docker compose restart web        # restart nhanh
curl -s localhost:3000/api/health # kiểm tra sức khoẻ + phiên bản
```

**Cập nhật phiên bản mới:** ở máy bạn chạy lại `./build-local.sh && ./push.sh`.
`deploy.sh` nạp ảnh mới rồi `up -d`, Caddy giữ nguyên chứng chỉ.

**Quay lui:** ảnh cũ vẫn còn trên VM trong 14 ngày.

```bash
docker images ansao-web           # xem các phiên bản còn giữ
VERSION=<tag cũ> docker compose up -d
```

---

## Khi có trục trặc

| Hiện tượng | Nguyên nhân thường gặp |
|---|---|
| Caddy không xin được chứng chỉ | DNS chưa trỏ đúng, hoặc firewall chưa mở 80/443. Caddy cần cổng 80 cho ACME. |
| `exec format error` | Ảnh dựng ra arm64. Đặt `PLATFORM=linux/amd64` (đã là mặc định trong `build-local.sh`). |
| Trang chạy nhưng đăng nhập hỏng | `NEXT_PUBLIC_SUPABASE_*` lúc build khác project đang dùng → build lại. |
| Chat trả 503 | Thiếu `ANTHROPIC_API_KEY` trong `.env` trên VM. |
| Chat hiện ra một cục thay vì chảy chữ | Caddy đang đệm. Kiểm tra `flush_interval -1` trong `Caddyfile`. |
| Chữ Việt mất dấu / sai font | CSP chặn Google Fonts. Cần cả `fonts.googleapis.com` (CSS) lẫn `fonts.gstatic.com` (file font). |
| Đĩa đầy | `docker image prune -af` (cron đã làm hàng tuần). |
