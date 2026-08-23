/**
 * Tạo tài khoản thử đã XÁC NHẬN SẴN, để đăng nhập ngay không cần mở email.
 *
 *   node scripts/tao-tai-khoan-thu.mjs [email] [mật-khẩu]
 *
 * Cần SUPABASE_SERVICE_ROLE_KEY trong .env.local (Project Settings → API →
 * service_role). Khoá này bỏ qua RLS — chỉ dùng ở máy dev, đừng bao giờ đưa lên
 * client hay commit.
 */
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_) { console.error("✗ Thiếu NEXT_PUBLIC_SUPABASE_URL trong .env.local"); process.exit(1); }
if (!KEY) {
  console.error(`✗ Thiếu SUPABASE_SERVICE_ROLE_KEY trong .env.local.

  Lấy ở: Supabase → Project Settings → API → Project API keys → service_role
  Rồi thêm dòng:  SUPABASE_SERVICE_ROLE_KEY=<khoá>

  Hoặc tạo tay: Supabase → Authentication → Users → Add user
  (nhớ tích "Auto Confirm User").`);
  process.exit(1);
}

const email = process.argv[2] ?? "thu@ansao.test";
const matKhau = process.argv[3] ?? "AnSao!2026thu";

const res = await fetch(`${URL_}/auth/v1/admin/users`, {
  method: "POST",
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    email,
    password: matKhau,
    email_confirm: true,                       // bỏ qua bước xác nhận email
    user_metadata: { ho_ten: "Tài khoản thử" },
  }),
});

const json = await res.json().catch(() => ({}));

if (res.ok) {
  console.log(`✓ Đã tạo tài khoản thử\n\n  Email:    ${email}\n  Mật khẩu: ${matKhau}\n`);
  console.log("  Đăng nhập tại http://localhost:3000/login");
} else if (/already been registered|already exists/i.test(json.msg ?? json.message ?? "")) {
  console.log(`• Tài khoản ${email} đã có sẵn — dùng mật khẩu bạn đặt lúc tạo.`);
  console.log(`  Muốn đặt lại mật khẩu: chạy lại với email khác, hoặc đổi trong Supabase → Authentication → Users.`);
} else {
  console.error(`✗ Không tạo được (HTTP ${res.status}):`, json.msg ?? json.message ?? JSON.stringify(json));
  process.exit(1);
}
