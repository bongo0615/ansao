"use client";

/**
 * Khung lá số 4×4 + Input Panel ở giữa — Design Spec §3, §6, §8.
 *
 * Khung gốc 1080×1824px cố định (ngân sách chiều cao từng ô đã cân theo spec),
 * nên không co giãn bằng layout mà bằng `zoom`. Ba chế độ xem:
 *   - `cao`   vừa chiều cao khung nhìn — thấy trọn lá số, không phải cuộn
 *   - `ngang` vừa bề ngang cột — chữ to nhất có thể, cuộn dọc
 *   - số      phần trăm do người dùng chọn
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { anSao } from "@/lib/tuvi/engine";
import { NHAN_THIEU, conThieu, hoanChinh, type BanNhap } from "@/lib/tuvi/ban-nhap";
import { CHI } from "@/lib/tuvi/constants";
import type { LaSo } from "@/lib/tuvi/types";
import { OCung } from "./OCung";
import { InputPanel } from "./InputPanel";
import "@/styles/la-so.css";

/** Vị trí ô cung trên lưới 4×4 — Design Spec §6.2 (col/row 1-indexed). */
const GRID: Record<number, [number, number]> = {
  1: [1, 4], 2: [1, 3], 3: [1, 2], 4: [1, 1],
  5: [2, 1], 6: [3, 1], 7: [4, 1], 8: [4, 2],
  9: [4, 3], 10: [4, 4], 11: [3, 4], 12: [2, 4],
};

const KHUNG_W = 1080;
const KHUNG_H = 1824;

export type CheDoXem = "cao" | "ngang" | number;

export function LaSoView({
  value, onChange, readOnly = false, theme = "dark", cheDo = "cao", onZoom,
}: {
  value: BanNhap;
  onChange?: (next: BanNhap) => void;
  readOnly?: boolean;
  theme?: "dark" | "light";
  cheDo?: CheDoXem;
  /** Báo ngược tỉ lệ thực tế để thanh công cụ hiển thị đúng phần trăm. */
  onZoom?: (z: number) => void;
}) {
  const [zoom, setZoom] = useState(0.5);
  const boxRef = useRef<HTMLDivElement>(null);

  const { laSo, loi, thieu } = useMemo(() => {
    const t = conThieu(value);
    if (t.length > 0) return { laSo: null, loi: null, thieu: t };
    try { return { laSo: anSao(hoanChinh(value)!) as LaSo | null, loi: null, thieu: [] }; }
    catch (e) { return { laSo: null, loi: (e as Error).message, thieu: [] }; }
  }, [value]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const tinh = () => {
      if (typeof cheDo === "number") return setZoom(cheDo);
      if (cheDo === "ngang") return setZoom(Math.min(1, el.clientWidth / KHUNG_W));
      // "cao": trừ khoảng hở trên/dưới để lá số không dính mép khung nhìn.
      const cao = el.getBoundingClientRect().top;
      const con = Math.max(320, window.innerHeight - cao - 24);
      setZoom(Math.min(1, con / KHUNG_H, el.clientWidth / KHUNG_W));
    };
    tinh();
    const ro = new ResizeObserver(tinh);
    ro.observe(el);
    window.addEventListener("resize", tinh);
    return () => { ro.disconnect(); window.removeEventListener("resize", tinh); };
  }, [cheDo]);

  useEffect(() => { onZoom?.(zoom); }, [zoom, onZoom]);

  if (loi) {
    return (
      <div className="rounded-xl border border-hanh-hoa/40 bg-hanh-hoa/10 p-6 text-hanh-hoa">
        <p className="font-medium">Không lập được lá số</p>
        <p className="mt-1 text-sm opacity-80">{loi}</p>
      </div>
    );
  }

  return (
    <div className="la-so-root" data-la-so-theme={theme} ref={boxRef}>
      <div className="la-so-wrapper">
        <div className="la-so-container" style={{ zoom }}>
          {laSo
            ? laSo.cung.map((c) => {
                const [col, row] = GRID[c.index];
                return <OCung key={c.index} c={c} col={col} row={row} />;
              })
            : /* Chưa đủ thông tin: giữ khung la võng, chỉ để tên chi mờ. */
              Array.from({ length: 12 }, (_, i) => {
                const [col, row] = GRID[i + 1];
                return (
                  <div key={i} className="cung" style={{ gridColumn: col, gridRow: row }}>
                    <div className="zone-header">
                      <span className="cung-chuc" style={{ opacity: 0.22 }}>——</span>
                      <span className="tuan-triet-zone1" />
                      <span className="can-chi-cung" style={{ opacity: 0.35 }}>{CHI[i]}</span>
                    </div>
                  </div>
                );
              })}
          <div className="panel-cell">
            <InputPanel laSo={laSo} value={value} onChange={onChange} readOnly={readOnly} />
          </div>
        </div>
      </div>
      {thieu.length > 0 && (
        <p className="no-print mt-3 text-center text-[13px] text-ink-dim">
          Nhập {thieu.map((t) => NHAN_THIEU[t]).join(", ")} để lập lá số.
        </p>
      )}
    </div>
  );
}
