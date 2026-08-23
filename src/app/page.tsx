import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { cheDoKhach, choDangKy } from "@/lib/che-do";
import { LinkButton } from "@/components/ui";
import { Header, Footer } from "@/components/site/Chrome";
import { ThienBan } from "@/components/graphics/ThienBan";
import { VongNguHanh } from "@/components/graphics/NguHanh";
import { StarField } from "@/components/graphics/StarField";

const BUOC = [
  { so: "01", t: "Nhập ngày giờ sinh", m: "Ngày, giờ và nơi sinh. Hệ thống tự quy đổi múi giờ về GMT+7 — kể cả giờ mùa hè lịch sử — rồi đổi sang âm lịch." },
  { so: "02", t: "Lá số hiện ra tức thì", m: "Đủ 12 cung với chính tinh, phụ tinh, Tứ Hoá, Tuần Triệt, cùng ba tầng Đại Vận · Lưu Niên · Lưu Nguyệt." },
  { so: "03", t: "Hỏi bất cứ điều gì", m: "Trò chuyện cùng chuyên gia AI đọc đúng lá số của bạn. Mọi nhận định đều dẫn rõ cung nào, sao nào." },
];

const DIEM = [
  { t: "Đúng từng công thức", m: "26 bước an sao nguyên cục cùng ba tầng vận, cài đặt theo tài liệu kỹ thuật Ảo Bí và khoá lại bằng 131 bài kiểm thử tự động.", mau: "var(--kim)" },
  { t: "Đối chiếu lá số mẫu", m: "Kiểm chứng độc lập với bộ 8 lá số mẫu phủ đủ tổ hợp âm dương nam nữ — khớp toàn bộ cung chức, can chi và vị trí sao.", mau: "var(--thuy)" },
  { t: "Luận giải có căn cứ", m: "Chuyên gia AI không tự an sao. Lá số được nạp sẵn làm dữ kiện, nên mọi câu trả lời đều truy ngược được về cung và sao cụ thể.", mau: "var(--moc)" },
  { t: "Đổi lịch chuẩn xác", m: "Xử lý đúng giờ Tí sau 23 giờ thuộc ngày hôm sau, tháng nhuận theo tháng bị nhuận, và múi giờ của hơn 60 nơi sinh.", mau: "var(--tho)" },
  { t: "In vừa một trang A4", m: "Lá số giữ đúng tỉ lệ khung 1080×1824, tự chuyển nền sáng khi in để tiết kiệm mực và không mất chữ.", mau: "var(--hoa)" },
  { t: "Riêng tư theo từng người", m: "Mỗi lá số chỉ thuộc về tài khoản tạo ra nó, được bảo vệ ở tầng cơ sở dữ liệu bằng Row Level Security.", mau: "var(--cyan)" },
];

export default async function TrangChu() {
  const khach = cheDoKhach();
  const supabase = khach ? null : await getServerSupabase();
  const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  const daDangNhap = Boolean(data?.user);

  return (
    <div className="flex min-h-screen flex-col">
      <Header daDangNhap={daDangNhap} khach={khach} />

      {/* ---------- Hero ---------- */}
      <section className="aurora relative overflow-hidden">
        <StarField seed={11} count={80} />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div className="anim-noi-len">
            <p className="eyebrow">Tử Vi Đẩu Số · Trường phái Ảo Bí</p>
            <h1 className="mt-5 font-display text-[2.75rem] font-bold leading-[1.08] sm:text-6xl">
              Lá số của bạn,
              <br />
              <span className="text-gradient">luận giải bởi chuyên gia</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-dim">
              Nhập ngày giờ và nơi sinh, nhận ngay lá số Tử Vi đầy đủ mười hai cung.
              Rồi hỏi bất cứ điều gì — về sự nghiệp, tình duyên, vận hạn năm nay —
              và nghe lời giải dựa trên chính lá số ấy.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <LinkButton href="/la-so/moi" className="px-7 py-3 text-base">
                Lập lá số ngay
              </LinkButton>
              <Link href="#cach-hoat-dong"
                className="rounded-full px-5 py-3 text-sm text-ink-dim transition hover:text-ink">
                Xem cách hoạt động →
              </Link>
            </div>
            <p className="mt-6 text-xs text-ink-faint">
              Miễn phí · Không cần thẻ · Lá số hiện ra trong vài giây
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <ThienBan className="w-full drop-shadow-[0_0_60px_rgba(136,0,255,0.25)]" />
          </div>
        </div>
      </section>

      {/* ---------- Cách hoạt động ---------- */}
      <section id="cach-hoat-dong" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow">Cách hoạt động</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold sm:text-4xl">
            Ba bước, chưa đầy một phút
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {BUOC.map((b) => (
              <div key={b.so} className="glass glow-border rounded-2xl p-7 transition-transform hover:-translate-y-1">
                <span className="font-display text-4xl font-bold text-gold/25">{b.so}</span>
                <h3 className="mt-4 font-display text-xl font-semibold">{b.t}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-dim">{b.m}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Ngũ hành ---------- */}
      <section className="border-t border-line bg-night/60">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Ngũ hành</p>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
              Màu sắc mang nghĩa, không phải trang trí
            </h2>
            <p className="mt-5 leading-relaxed text-ink-dim">
              Mỗi sao, mỗi nạp âm can chi trên lá số đều được tô đúng theo ngũ hành
              của nó. Nhìn một cung là thấy ngay thế tương sinh hay tương khắc đang
              diễn ra, không cần tra bảng.
            </p>
            <p className="mt-4 leading-relaxed text-ink-dim">
              Trường phái Ảo Bí không dùng thang Miếu – Vượng – Đắc – Hãm. Sức mạnh
              của một sao đọc qua quan hệ ngũ hành giữa sao và nạp âm của cung nó đóng,
              cùng với tổ hợp sao xung quanh.
            </p>
          </div>
          <div className="mx-auto w-full max-w-[380px]">
            <VongNguHanh className="w-full" />
          </div>
        </div>
      </section>

      {/* ---------- Điểm mạnh ---------- */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow">Vì sao tin được</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold sm:text-4xl">
            Một lá số sai thì sai rất êm
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-dim">
            Sao vẫn hiện đủ, bố cục vẫn đẹp, chỉ vị trí là sai — và không ai nhận ra.
            Vì vậy phần lõi được kiểm chứng nghiêm ngặt trước khi đến tay bạn.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DIEM.map((d) => (
              <div key={d.t} className="glass rounded-2xl p-6">
                <span className="block h-1 w-10 rounded-full" style={{ background: d.mau }} />
                <h3 className="mt-4 font-display text-lg font-semibold">{d.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">{d.m}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="relative overflow-hidden border-t border-line">
        <StarField seed={29} count={50} />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="font-display text-4xl font-bold sm:text-5xl">
            Lá số đang chờ bạn
          </h2>
          <p className="mx-auto mt-5 max-w-lg leading-relaxed text-ink-dim">
            Chỉ cần ngày sinh, giờ sinh và nơi sinh. Phần còn lại để chúng tôi lo.
          </p>
          <LinkButton href="/la-so/moi" className="mt-9 px-8 py-3.5 text-base">
            Bắt đầu — miễn phí
          </LinkButton>
        </div>
      </section>

      <Footer />
    </div>
  );
}
