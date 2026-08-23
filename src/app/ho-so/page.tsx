import Link from "next/link";
import { redirect } from "next/navigation";
import { cheDoKhach } from "@/lib/che-do";
import { getServerSupabase } from "@/lib/supabase/server";
import { Header, Footer } from "@/components/site/Chrome";
import { StarField } from "@/components/graphics/StarField";
import { HoSoForm } from "./HoSoForm";

export const metadata = { title: "Hồ sơ" };

const NGAY = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export default async function TrangHoSo() {
  if (cheDoKhach()) redirect("/la-so");

  const supabase = await getServerSupabase();
  if (!supabase) redirect("/");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: hoSo } = await supabase
    .from("profiles").select("*").eq("id", user.id).maybeSingle();
  const { count } = await supabase
    .from("la_so").select("id", { count: "exact", head: true });

  const VAI_TRO: Record<string, string> = {
    khach: "Người dùng", chuyen_gia: "Chuyên gia luận giải",
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header daDangNhap khach={false} email={user.email ?? ""} hoTen={hoSo?.ho_ten ?? null} />

      <main className="relative flex-1">
        <StarField seed={41} count={35} className="opacity-50" />
        <div className="mx-auto max-w-2xl px-6 py-14">
          <p className="eyebrow">Tài khoản</p>
          <h1 className="mt-3 font-display text-4xl font-bold">Hồ sơ</h1>

          <HoSoForm
            email={user.email ?? ""}
            hoTenBanDau={hoSo?.ho_ten ?? ""}
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { nhan: "Lá số đã lưu", gt: String(count ?? 0) },
              { nhan: "Vai trò", gt: VAI_TRO[hoSo?.vai_tro ?? "khach"] ?? "Người dùng" },
              { nhan: "Tham gia từ", gt: hoSo?.created_at ? NGAY(hoSo.created_at) : "—" },
            ].map((o) => (
              <div key={o.nhan} className="glass rounded-2xl p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  {o.nhan}
                </p>
                <p className="mt-2 font-display text-xl font-semibold">{o.gt}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-line p-5">
            <h2 className="font-display text-lg font-semibold">Dữ liệu của bạn</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">
              Ứng dụng chỉ lưu <strong>thông tin đầu vào</strong> của lá số — bát tự
              và nơi sinh. Bản thân lá số luôn được tính lại từ đầu mỗi lần mở, nên
              khi quy tắc an sao được cập nhật, mọi lá số cũ tự đúng theo.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-dim">
              Mỗi lá số chỉ thuộc về tài khoản tạo ra nó, được bảo vệ ở tầng cơ sở
              dữ liệu. Xoá lá số trong{" "}
              <Link href="/la-so" className="text-cyan underline underline-offset-2">
                Lá số của tôi
              </Link>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
