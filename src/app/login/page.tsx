import { redirect } from "next/navigation";
import { cheDoKhach } from "@/lib/che-do";
import { getServerSupabase } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Đăng nhập — An Sao" };

export default async function TrangDangNhap() {
  // Chế độ khách: luồng đăng nhập tắt hoàn toàn.
  if (cheDoKhach()) redirect("/la-so");

  const supabase = await getServerSupabase();
  const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (data?.user) redirect("/la-so");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-black">Đăng nhập</h1>
      <p className="mt-2 text-sm text-ink-300">
        Đăng nhập để lưu lá số và ghi chú luận giải của bạn.
      </p>
      {supabaseConfigured() ? (
        <LoginForm />
      ) : (
        <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          Chưa cấu hình Supabase. Thêm <code>NEXT_PUBLIC_SUPABASE_URL</code> và{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> vào <code>.env.local</code>.
          Trong lúc chờ, bạn vẫn lập được lá số ở chế độ khách.
        </div>
      )}
    </main>
  );
}
