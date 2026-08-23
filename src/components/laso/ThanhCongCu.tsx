"use client";

/**
 * Thanh công cụ duy nhất của màn lá số — gộp cả header trang lẫn thanh điều
 * khiển làm một dải 52px. Ưu tiên: lá số chiếm màn hình, vỏ lùi ra sau.
 */

import Link from "next/link";
import { Logo } from "@/components/graphics/Logo";
import { Menu, MucMenu } from "@/components/ui/Menu";
import {
  IBaCham, IChevron, ICong, IIn, IMatTrang, IMatTroi, IMuiTenTrai, IThuNho, IThung, ITru,
} from "@/components/ui/Icon";
import { ChuongThongBao, type Tin } from "@/components/ui/ThongBao";
import { MenuNguoiDung } from "@/components/site/MenuNguoiDung";
import type { CheDoXem } from "./LaSoView";

const MUC_ZOOM: { gt: CheDoXem; nhan: string; phu?: string }[] = [
  { gt: "cao", nhan: "Vừa màn hình", phu: "Thấy trọn lá số" },
  { gt: "ngang", nhan: "Vừa bề ngang", phu: "Chữ to nhất" },
  { gt: 0.5, nhan: "50%" },
  { gt: 0.75, nhan: "75%" },
  { gt: 1, nhan: "100%" },
];

const BUOC = [0.3, 0.4, 0.5, 0.6, 0.75, 0.9, 1];

export function ThanhCongCu({
  ten, phu, cheDo, zoom, doiCheDo, theme, doiTheme, tab, doiTab,
  trangThaiLuu, onLuu, onXoa, coTheLuu, duongVe, tin, nguoiDung, choPhepLuu = true,
}: {
  ten: string;
  phu: string;
  cheDo: CheDoXem;
  zoom: number;
  doiCheDo: (c: CheDoXem) => void;
  theme: "dark" | "light";
  doiTheme: () => void;
  tab: "la-so" | "luan-giai";
  doiTab: (t: "la-so" | "luan-giai") => void;
  trangThaiLuu: string | null;
  onLuu?: () => void;
  onXoa?: () => void;
  coTheLuu: boolean;
  duongVe: { href: string; nhan: string };
  tin: Tin[];
  nguoiDung?: { email: string; hoTen: string | null } | null;
  /** false khi bát tự chưa đủ — không có lá số thì không có gì để lưu. */
  choPhepLuu?: boolean;
}) {
  const buocZoom = (huong: 1 | -1) => {
    const gan = BUOC.reduce((a, b) => (Math.abs(b - zoom) < Math.abs(a - zoom) ? b : a));
    const i = BUOC.indexOf(gan);
    doiCheDo(BUOC[Math.min(BUOC.length - 1, Math.max(0, i + huong))]);
  };

  const nhanZoom = typeof cheDo === "string"
    ? MUC_ZOOM.find((m) => m.gt === cheDo)!.nhan
    : `${Math.round(zoom * 100)}%`;

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-void/80 backdrop-blur-xl">
      <div className="flex h-[52px] items-center gap-2 px-3 sm:px-4">
        {/* Về danh sách */}
        <Link
          href={duongVe.href}
          title={duongVe.nhan}
          className="flex items-center gap-1.5 rounded-lg py-1.5 pl-1 pr-2 text-ink-dim transition hover:bg-white/[0.06] hover:text-ink"
        >
          <IMuiTenTrai size={18} />
          <Logo size={22} />
        </Link>

        <span className="hidden h-5 w-px bg-line sm:block" />

        {/* Tên lá số */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[15px] font-semibold leading-tight">{ten}</p>
          <p className="truncate text-[11px] leading-tight text-ink-faint">{phu}</p>
        </div>

        {/* Tab — chỉ màn hẹp */}
        <div className="flex shrink-0 rounded-lg border border-line p-0.5 xl:hidden">
          {([["la-so", "Lá số"], ["luan-giai", "Luận giải"]] as const).map(([k, n]) => (
            <button key={k} onClick={() => doiTab(k)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                tab === k ? "bg-white/10 text-ink" : "text-ink-faint hover:text-ink"}`}>
              {n}
            </button>
          ))}
        </div>

        {/* Zoom */}
        <div className={`hidden items-center rounded-lg border border-line ${
          tab === "la-so" ? "sm:flex" : ""}`}>
          <button onClick={() => buocZoom(-1)} title="Thu nhỏ"
            className="rounded-l-lg px-2 py-1.5 text-ink-dim transition hover:bg-white/[0.06] hover:text-ink">
            <ITru />
          </button>
          <Menu nut={() => (
            <span className="flex min-w-[92px] items-center justify-center gap-1 border-x border-line px-2 py-1.5
                             text-[12px] font-medium text-ink-dim transition hover:text-ink">
              {nhanZoom}<IChevron size={12} />
            </span>
          )}>
            {(dong) => MUC_ZOOM.map((m) => (
              <MucMenu key={String(m.gt)} icon={<IThuNho />}
                onClick={() => { doiCheDo(m.gt); dong(); }}>
                <span className="flex-1">{m.nhan}</span>
                {m.phu && <span className="text-[11px] text-ink-faint">{m.phu}</span>}
              </MucMenu>
            ))}
          </Menu>
          <button onClick={() => buocZoom(1)} title="Phóng to"
            className="rounded-r-lg px-2 py-1.5 text-ink-dim transition hover:bg-white/[0.06] hover:text-ink">
            <ICong />
          </button>
        </div>

        <ChuongThongBao tin={tin} />

        {/* Nền sáng / tối */}
        <button onClick={doiTheme}
          title={theme === "dark" ? "Chuyển nền sáng" : "Chuyển nền tối"}
          aria-label={theme === "dark" ? "Chuyển nền sáng" : "Chuyển nền tối"}
          className="rounded-lg border border-line p-2 text-ink-dim transition hover:bg-white/[0.06] hover:text-ink">
          {theme === "dark" ? <IMatTroi /> : <IMatTrang />}
        </button>

        {/* Menu phụ */}
        <Menu nut={() => (
          <span className="flex rounded-lg border border-line p-2 text-ink-dim transition hover:bg-white/[0.06] hover:text-ink">
            <IBaCham />
          </span>
        )}>
          {(dong) => (
            <>
              <MucMenu icon={<IIn />} onClick={() => { dong(); window.print(); }}>
                In / Xuất PDF
              </MucMenu>
              <div className="sm:hidden">
                <div className="my-1 h-px bg-line" />
                {MUC_ZOOM.map((m) => (
                  <MucMenu key={String(m.gt)} icon={<IThuNho />}
                    onClick={() => { doiCheDo(m.gt); dong(); }}>{m.nhan}</MucMenu>
                ))}
              </div>
              {onXoa && (
                <>
                  <div className="my-1 h-px bg-line" />
                  <MucMenu icon={<IThung />} nguyHiem onClick={() => { dong(); onXoa(); }}>
                    Xoá lá số
                  </MucMenu>
                </>
              )}
            </>
          )}
        </Menu>

        {coTheLuu && onLuu && (
          <button
            onClick={onLuu}
            disabled={trangThaiLuu === "dang_luu" || !choPhepLuu}
            title={choPhepLuu ? undefined : "Nhập đủ ngày giờ sinh trước đã"}
            className="ml-0.5 shrink-0 rounded-lg bg-gradient-to-r from-hanh-kim to-hanh-thuy px-3.5 py-2
                       text-[13px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50">
            {{ chua_luu: "Lưu", dang_luu: "Đang lưu…", da_luu: "Đã lưu", loi: "Thử lại" }[
              trangThaiLuu ?? "chua_luu"] ?? "Lưu"}
          </button>
        )}

        {nguoiDung && (
          <span className="ml-0.5">
            <MenuNguoiDung email={nguoiDung.email} hoTen={nguoiDung.hoTen} gonNhe />
          </span>
        )}
      </div>
    </header>
  );
}
