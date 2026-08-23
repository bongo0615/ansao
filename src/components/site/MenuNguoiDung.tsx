"use client";

/**
 * Nút tài khoản ở góc phải — lối vào hồ sơ và đăng xuất.
 *
 * Đăng xuất gọi `signOut()` phía trình duyệt (xoá cookie phiên do @supabase/ssr
 * quản lý) rồi `router.refresh()` để các Server Component đọc lại trạng thái —
 * thiếu bước refresh thì header vẫn hiện như đang đăng nhập cho tới lần tải trang sau.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, MucMenu } from "@/components/ui/Menu";
import { getBrowserSupabase } from "@/lib/supabase/client";

function ChuCai({ ten, size = 32 }: { ten: string; size?: number }) {
  const c = (ten.trim()[0] ?? "?").toUpperCase();
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br
                 from-hanh-kim to-hanh-thuy font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden
    >
      {c}
    </span>
  );
}

export function MenuNguoiDung({ email, hoTen, gonNhe = false }: {
  email: string;
  hoTen: string | null;
  /** Trong thanh công cụ lá số thì thu nhỏ, chỉ còn chữ cái đầu. */
  gonNhe?: boolean;
}) {
  const router = useRouter();
  const [dangThoat, setDangThoat] = useState(false);
  const ten = hoTen?.trim() || email.split("@")[0];

  async function dangXuat() {
    setDangThoat(true);
    await getBrowserSupabase()?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Menu
      nut={(mo) => (
        <span
          title={email}
          className={`flex items-center gap-2 rounded-full transition
                      ${gonNhe ? "" : "border border-line py-1 pl-1 pr-3"}
                      ${mo ? "bg-white/[0.07]" : "hover:bg-white/[0.06]"}`}
        >
          <ChuCai ten={ten} size={gonNhe ? 28 : 26} />
          {!gonNhe && (
            <span className="max-w-[120px] truncate text-[13px] font-medium text-ink-dim">{ten}</span>
          )}
        </span>
      )}
    >
      {(dong) => (
        <>
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <ChuCai ten={ten} size={34} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-ink">{ten}</p>
              <p className="truncate text-[11px] text-ink-faint">{email}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-line" />

          <Link href="/la-so" onClick={dong}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px]
                       text-ink-dim transition hover:bg-white/[0.07] hover:text-ink">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                 strokeWidth="1.5" aria-hidden>
              <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
              <path d="M8 2.5v11M2.5 8h11" />
            </svg>
            Lá số của tôi
          </Link>

          <Link href="/ho-so" onClick={dong}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px]
                       text-ink-dim transition hover:bg-white/[0.07] hover:text-ink">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                 strokeWidth="1.5" strokeLinecap="round" aria-hidden>
              <circle cx="8" cy="5.8" r="2.6" />
              <path d="M3 13.2c.6-2.3 2.5-3.5 5-3.5s4.4 1.2 5 3.5" />
            </svg>
            Hồ sơ
          </Link>

          <div className="my-1 h-px bg-line" />
          <MucMenu
            nguyHiem
            onClick={() => { dong(); void dangXuat(); }}
            icon={
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                   strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                <path d="M6 13.5H3.5a1 1 0 01-1-1v-9a1 1 0 011-1H6M10.5 11L13.5 8l-3-3M13.5 8H6" />
              </svg>
            }
          >
            {dangThoat ? "Đang đăng xuất…" : "Đăng xuất"}
          </MucMenu>
        </>
      )}
    </Menu>
  );
}
