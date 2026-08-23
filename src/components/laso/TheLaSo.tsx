"use client";

/**
 * Thẻ lá số (tile card) cho màn quản lý.
 *
 * Mỗi thẻ hiện một "mini la võng" 4×4 tô theo ngũ hành nạp âm 12 cung của
 * chính lá số đó — nên hai lá số khác nhau nhìn đã khác nhau, dễ nhận ra
 * hơn là một danh sách chữ.
 */

import Link from "next/link";
import { useMemo } from "react";
import { anSao } from "@/lib/tuvi/engine";
import { rowToInput, type LaSoRow } from "@/lib/la-so-io";
import { chiAt } from "@/lib/tuvi/constants";
import { Chip } from "@/components/ui";

const MAU_HANH: Record<string, string> = {
  kim: "var(--kim)", hoa: "var(--hoa)", moc: "var(--moc)",
  thuy: "var(--thuy)", tho: "var(--tho)",
};

/** Vị trí ô trên lưới 4×4 theo hệ Dần=1 (Design Spec §6.2). */
const O: Record<number, [number, number]> = {
  1: [0, 3], 2: [0, 2], 3: [0, 1], 4: [0, 0], 5: [1, 0], 6: [2, 0],
  7: [3, 0], 8: [3, 1], 9: [3, 2], 10: [3, 3], 11: [2, 3], 12: [1, 3],
};

const GIO = (h: number, p: number) =>
  `${String(h).padStart(2, "0")}:${String(p).padStart(2, "0")}`;

export function TheLaSo({ row, onXoa }: { row: LaSoRow; onXoa?: (id: string) => void }) {
  const ls = useMemo(() => {
    try { return anSao(rowToInput(row)); } catch { return null; }
  }, [row]);

  return (
    <div className="glass glow-border group relative rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/la-so/${row.id}`} className="block">
        <div className="flex items-start gap-4">
          {/* Mini la võng */}
          <div className="relative h-[76px] w-[76px] shrink-0 rounded-lg border border-line bg-void/60 p-1">
            <div className="grid h-full w-full grid-cols-4 grid-rows-4 gap-[1.5px]">
              {Array.from({ length: 16 }, (_, i) => {
                const col = i % 4, r = Math.floor(i / 4);
                const idx = Number(Object.keys(O).find((k) => {
                  const [c, rr] = O[Number(k)];
                  return c === col && rr === r;
                }));
                if (!idx) return <span key={i} className="rounded-[2px] bg-white/[0.03]" />;
                const cung = ls?.cung.find((c) => c.index === idx);
                const laMenh = cung?.isMenh;
                return (
                  <span
                    key={i}
                    className="rounded-[2px] transition-opacity"
                    style={{
                      background: cung ? MAU_HANH[cung.napAm.hanh] : "transparent",
                      opacity: laMenh ? 0.95 : 0.3,
                      boxShadow: laMenh ? "0 0 8px currentColor" : undefined,
                      color: cung ? MAU_HANH[cung.napAm.hanh] : undefined,
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-lg font-semibold group-hover:text-cyan">
              {row.ho_ten || "Lá số chưa đặt tên"}
            </h3>
            <p className="mt-1 text-[13px] text-ink-dim">
              {row.ngay_sinh}/{row.thang_sinh}/{row.nam_sinh} · {GIO(row.gio_sinh, row.phut_sinh)}
            </p>
            <p className="mt-0.5 truncate text-[13px] text-ink-faint">{row.noi_sinh}</p>

            {ls && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Chip>{ls.amDuongGioiTinh}</Chip>
                <Chip>Mệnh {chiAt(ls.menh)}</Chip>
                <Chip style={{ color: MAU_HANH[ls.cuc.hanh] }}>{ls.cuc.ten}</Chip>
              </div>
            )}
          </div>
        </div>
      </Link>

      {onXoa && (
        <button
          onClick={(e) => { e.preventDefault(); onXoa(row.id); }}
          aria-label={`Xoá lá số ${row.ho_ten}`}
          className="absolute right-3 top-3 rounded-full p-2 text-ink-faint opacity-0 transition
                     hover:bg-hanh-hoa/15 hover:text-hanh-hoa focus-visible:opacity-100 group-hover:opacity-100"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M2 3.5h10M5.5 3.5V2h3v1.5M3.5 3.5l.6 8.5h5.8l.6-8.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

/** Ô trống dẫn tới trang lập lá số mới — luôn là thẻ cuối lưới. */
export function TheThemMoi() {
  return (
    <Link
      href="/la-so/moi"
      className="group flex min-h-[132px] flex-col items-center justify-center gap-3 rounded-2xl
                 border border-dashed border-line-strong p-5 text-center transition-all
                 hover:border-cyan/40 hover:bg-white/[0.03]"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong
                       text-ink-dim transition group-hover:border-cyan/50 group-hover:text-cyan">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M9 3.5v11M3.5 9h11" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-sm font-medium text-ink-dim group-hover:text-ink">Lập lá số mới</span>
    </Link>
  );
}
