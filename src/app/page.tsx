import Link from "next/link";
import { LinkButton } from "@/components/ui";
import { cheDoKhach } from "@/lib/che-do";
import { getServerSupabase } from "@/lib/supabase/server";

const DIEM_MANH = [
  {
    tieuDe: "An sao theo trường phái Ảo Bí",
    mo: "Toàn bộ 26 bước an sao nguyên cục, cùng Đại Vận, Lưu Niên và Lưu Nguyệt — "
      + "đúng theo tài liệu kỹ thuật đã kiểm chứng từng công thức.",
  },
  {
    tieuDe: "Đổi lịch chuẩn xác",
    mo: "Quy đổi múi giờ nơi sinh về GMT+7 (kể cả giờ mùa hè lịch sử), đổi âm lịch, "
      + "xử lý đúng giờ Tí sau 23:00 và tháng nhuận.",
  },
  {
    tieuDe: "Lá số để chuyên gia luận",
    mo: "Hiển thị đầy đủ 6 vùng thông tin mỗi cung, màu ngũ hành thống nhất, "
      + "in vừa trọn một trang A4.",
  },
];

export default async function TrangChu() {
  const khach = cheDoKhach();
  const supabase = khach ? null : await getServerSupabase();
  const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  const daDangNhap = Boolean(data?.user);

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-accent">
        Huyền Vi · An Sao
      </p>
      <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
        Lập lá số Tử Vi trong vài giây
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-ink-300">
        Nhập ngày sinh, giờ sinh và nơi sinh — nhận ngay lá số đầy đủ 12 cung theo
        trường phái Ảo Bí, sẵn sàng cho chuyên gia luận giải.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton href="/la-so/moi">Lập lá số mới</LinkButton>
        {khach || daDangNhap ? (
          <LinkButton href="/la-so" variant="ghost">Lá số của tôi</LinkButton>
        ) : (
          <LinkButton href="/login" variant="ghost">Đăng nhập</LinkButton>
        )}
      </div>

      <div className="mt-16 grid gap-5 sm:grid-cols-3">
        {DIEM_MANH.map((d) => (
          <div key={d.tieuDe} className="rounded-xl border border-white/10 bg-ink-800/60 p-5">
            <h2 className="text-base font-bold">{d.tieuDe}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-300">{d.mo}</p>
          </div>
        ))}
      </div>

      {khach ? (
        <p className="mt-16 text-sm text-ink-400">
          Đang chạy ở <strong>chế độ khách</strong> — lá số lưu trong trình duyệt
          này, chưa cần tài khoản.
        </p>
      ) : (
        <p className="mt-16 text-sm text-ink-400">
          Chưa có tài khoản?{" "}
          <Link href="/login" className="text-accent underline">Đăng ký miễn phí</Link>{" "}
          để lưu lại lá số và ghi chú luận giải.
        </p>
      )}
    </main>
  );
}
