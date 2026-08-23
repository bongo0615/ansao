"use client";

/**
 * Chuông thông báo trên thanh công cụ — thay cho dải cảnh báo chiếm chỗ ngang
 * màn hình. Có tin chưa đọc thì hiện chấm; bấm để mở.
 */

import type { ReactNode } from "react";
import { Menu } from "./Menu";

export type Tin = {
  id: string;
  muc: "tin" | "canh_bao" | "loi";
  tieuDe: string;
  than: ReactNode;
};

const MAU: Record<Tin["muc"], { cham: string; vien: string }> = {
  tin: { cham: "var(--cyan)", vien: "var(--cyan)" },
  canh_bao: { cham: "var(--gold)", vien: "var(--gold)" },
  loi: { cham: "var(--hoa)", vien: "var(--hoa)" },
};

export function ChuongThongBao({ tin }: { tin: Tin[] }) {
  const nang = tin.find((t) => t.muc === "loi") ?? tin[0];

  return (
    <Menu nut={() => (
      <span
        className="relative flex rounded-lg border border-line p-2 text-ink-dim transition
                   hover:bg-white/[0.06] hover:text-ink"
        title={tin.length ? `${tin.length} thông báo` : "Không có thông báo"}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
             strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M8 2a4 4 0 00-4 4c0 3-1.2 4-1.2 4h10.4S12 9 12 6a4 4 0 00-4-4zM6.7 12.5a1.5 1.5 0 002.6 0" />
        </svg>
        {nang && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full ring-2"
                style={{ background: MAU[nang.muc].cham, ["--tw-ring-color" as string]: "var(--void)" }} />
        )}
      </span>
    )}>
      {() => (
        <div className="w-[290px] p-1">
          {tin.length === 0 ? (
            <p className="px-3 py-4 text-center text-[13px] text-ink-faint">Không có thông báo</p>
          ) : (
            tin.map((t) => (
              <div key={t.id} className="rounded-lg border-l-2 px-3 py-2.5"
                   style={{ borderColor: MAU[t.muc].vien }}>
                <p className="text-[13px] font-semibold text-ink">{t.tieuDe}</p>
                <div className="mt-1 text-[12px] leading-relaxed text-ink-dim">{t.than}</div>
              </div>
            ))
          )}
        </div>
      )}
    </Menu>
  );
}
