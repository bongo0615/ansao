import Link from "next/link";
import { LogoChu } from "@/components/graphics/Logo";
import { LinkButton } from "@/components/ui";
import { MenuNguoiDung } from "./MenuNguoiDung";

export function Header({ daDangNhap, khach, email, hoTen }: {
  daDangNhap: boolean;
  khach: boolean;
  email?: string;
  hoTen?: string | null;
}) {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-void/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <Link href="/" className="transition-opacity hover:opacity-80"><LogoChu /></Link>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          {daDangNhap || khach ? (
            <>
              <Link href="/la-so" className="rounded-full px-3.5 py-2 text-ink-dim transition hover:text-ink">
                Lá số của tôi
              </Link>
              <LinkButton href="/la-so/moi">Lập lá số</LinkButton>
              {daDangNhap && email && (
                <span className="ml-1.5">
                  <MenuNguoiDung email={email} hoTen={hoTen ?? null} />
                </span>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-3.5 py-2 text-ink-dim transition hover:text-ink">
                Đăng nhập
              </Link>
              <LinkButton href="/la-so/moi">Lập lá số miễn phí</LinkButton>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="no-print border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center">
        <LogoChu className="opacity-70" />
        <p className="text-xs leading-relaxed text-ink-faint sm:ml-auto sm:max-w-md sm:text-right">
          Tử Vi là bản đồ khuynh hướng, không phải bản án. Nội dung luận giải mang
          tính tham khảo, không thay thế tư vấn y tế, pháp lý hay tài chính.
        </p>
      </div>
    </footer>
  );
}
