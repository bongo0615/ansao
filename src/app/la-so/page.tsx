import Link from "next/link";
import { redirect } from "next/navigation";
import { LinkButton } from "@/components/ui";
import { cheDoKhach } from "@/lib/che-do";
import { getServerSupabase } from "@/lib/supabase/server";
import { DanhSachCucBo } from "@/components/laso/DanhSachCucBo";
import type { LaSoRow } from "@/lib/la-so-io";

export const metadata = { title: "Lá số của tôi — An Sao" };

const GIO = (h: number, p: number) =>
  `${String(h).padStart(2, "0")}:${String(p).padStart(2, "0")}`;

export default async function TrangDanhSach() {
  const khach = cheDoKhach();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-black">Lá số của tôi</h1>
        <LinkButton href="/la-so/moi">Lập lá số mới</LinkButton>
      </div>
      {khach ? <DanhSachCucBo /> : <DanhSachSupabase />}
    </main>
  );
}

async function DanhSachSupabase() {
  const supabase = await getServerSupabase();
  if (!supabase) redirect("/la-so/moi");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("la_so").select("*").order("updated_at", { ascending: false });
  const rows = (data ?? []) as LaSoRow[];

  if (error) {
    return (
      <p className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
        Không tải được danh sách: {error.message}
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="mt-10 rounded-xl border border-white/10 bg-ink-800/60 p-6 text-ink-300">
        Bạn chưa lưu lá số nào. Bấm <strong>Lập lá số mới</strong> để bắt đầu.
      </p>
    );
  }

  return (
    <ul className="mt-8 space-y-3">
      {rows.map((r) => (
        <li key={r.id}>
          <Link
            href={`/la-so/${r.id}`}
            className="block rounded-xl border border-white/10 bg-ink-800/60 p-4 transition hover:border-accent/40"
          >
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="text-base font-bold">{r.ho_ten}</span>
              <span className="text-sm text-ink-400">
                {r.gioi_tinh === "nam" ? "Nam" : "Nữ"}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-300">
              {r.ngay_sinh}/{r.thang_sinh}/{r.nam_sinh} ·{" "}
              {GIO(r.gio_sinh, r.phut_sinh)} · {r.noi_sinh}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
