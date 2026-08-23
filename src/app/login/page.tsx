import Link from "next/link";
import { redirect } from "next/navigation";
import { cheDoKhach } from "@/lib/che-do";
import { choDangKy } from "@/lib/che-do";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getServerSupabase } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";
import { LogoChu } from "@/components/graphics/Logo";
import { ThienBan } from "@/components/graphics/ThienBan";
import { StarField } from "@/components/graphics/StarField";

export const metadata = { title: "Đăng nhập" };

export default async function TrangDangNhap() {
  if (cheDoKhach()) redirect("/la-so");

  const supabase = await getServerSupabase();
  const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (data?.user) redirect("/la-so");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Cột trái — thương hiệu */}
      <div className="relative hidden overflow-hidden border-r border-line bg-night lg:flex lg:flex-col lg:justify-between lg:p-12">
        <StarField seed={17} count={60} />
        <Link href="/"><LogoChu /></Link>
        <div className="relative">
          <ThienBan className="mx-auto w-full max-w-[380px] opacity-90" />
        </div>
        <div>
          <p className="font-display text-2xl leading-snug">
            “Lá số là bản đồ khuynh hướng,
            <br />không phải bản án.”
          </p>
          <p className="mt-3 text-sm text-ink-faint">
            Đăng nhập để lưu lá số và tiếp tục cuộc trò chuyện đang dang dở.
          </p>
        </div>
      </div>

      {/* Cột phải — biểu mẫu */}
      <div className="relative flex flex-col justify-center px-6 py-14">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="lg:hidden"><LogoChu /></Link>
          <h1 className="mt-8 font-display text-3xl font-bold lg:mt-0">Chào mừng trở lại</h1>
          <p className="mt-2 text-sm text-ink-dim">
            {choDangKy()
              ? "Đăng nhập để xem lại bộ sưu tập lá số của bạn."
              : "Ứng dụng đang trong giai đoạn thử nghiệm — đăng nhập bằng tài khoản được cấp."}
          </p>

          {supabaseConfigured() ? (
            <LoginForm />
          ) : (
            <div className="mt-7 rounded-xl border border-gold/30 bg-gold/[0.08] p-4 text-sm leading-relaxed text-gold">
              Chưa cấu hình Supabase. Thêm <code>NEXT_PUBLIC_SUPABASE_URL</code> và{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> vào <code>.env.local</code>.
            </div>
          )}

          <p className="mt-8 text-center text-xs text-ink-faint">
            Chưa muốn tạo tài khoản?{" "}
            <Link href="/la-so/moi" className="text-cyan underline underline-offset-2">
              Lập lá số ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
