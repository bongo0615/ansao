import { redirect } from "next/navigation";
import { cheDoKhach } from "@/lib/che-do";
import { getServerSupabase } from "@/lib/supabase/server";
import { Header, Footer } from "@/components/site/Chrome";
import { DanhSachCucBo } from "@/components/laso/DanhSachCucBo";
import { TheLaSo, TheThemMoi } from "@/components/laso/TheLaSo";
import { LuoiRong } from "@/components/laso/LuoiRong";
import { StarField } from "@/components/graphics/StarField";
import type { LaSoRow } from "@/lib/la-so-io";

export const metadata = { title: "Lá số của tôi" };

export default async function TrangDanhSach() {
  const khach = cheDoKhach();
  let rows: LaSoRow[] = [];
  let loi: string | null = null;

  if (!khach) {
    const supabase = await getServerSupabase();
    if (!supabase) redirect("/la-so/moi");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const res = await supabase.from("la_so").select("*").order("updated_at", { ascending: false });
    rows = (res.data ?? []) as LaSoRow[];
    loi = res.error?.message ?? null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header daDangNhap={!khach} khach={khach} />

      <main className="relative flex-1">
        <StarField seed={5} count={40} className="opacity-60" />
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="eyebrow">Bộ sưu tập</p>
          <h1 className="mt-3 font-display text-4xl font-bold">Lá số của tôi</h1>
          <p className="mt-3 max-w-lg text-ink-dim">
            Mỗi thẻ hiển thị khung la võng thu nhỏ, tô theo ngũ hành nạp âm của
            mười hai cung — nhìn là nhận ra ngay.
          </p>

          {khach ? (
            <DanhSachCucBo />
          ) : loi ? (
            <p className="mt-8 rounded-xl border border-hanh-hoa/40 bg-hanh-hoa/10 p-4 text-sm text-hanh-hoa">
              Không tải được danh sách: {loi}
            </p>
          ) : rows.length === 0 ? (
            <LuoiRong />
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((r) => <TheLaSo key={r.id} row={r} />)}
              <TheThemMoi />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
