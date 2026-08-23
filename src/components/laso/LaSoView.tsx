"use client";

/**
 * Khung lá số 4×4 + Input Panel ở giữa — Design Spec §3, §6, §8.
 *
 * Khung gốc 1080×1824px cố định (ngân sách chiều cao từng ô đã cân theo
 * spec); trên màn hẹp dùng `zoom` để thu vừa bề rộng thay vì phá layout.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { anSao, type AnSaoInput } from "@/lib/tuvi/engine";
import { CHI_POS } from "@/lib/tuvi/constants";
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

const FRAME_W = 1080;

export type LaSoFormState = AnSaoInput;

export function LaSoView({
  value,
  onChange,
  readOnly = false,
  theme = "dark",
}: {
  value: LaSoFormState;
  onChange?: (next: LaSoFormState) => void;
  readOnly?: boolean;
  theme?: "dark" | "light";
}) {
  const [zoom, setZoom] = useState(1);
  const boxRef = useRef<HTMLDivElement>(null);

  const { laSo, loi } = useMemo(() => {
    try {
      return { laSo: anSao(value) as LaSo | null, loi: null as string | null };
    } catch (e) {
      return { laSo: null, loi: (e as Error).message };
    }
  }, [value]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => setZoom(Math.min(1, el.clientWidth / FRAME_W));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (loi || !laSo) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-red-200">
        <p className="font-medium">Không lập được lá số</p>
        <p className="mt-1 text-sm opacity-80">{loi}</p>
      </div>
    );
  }

  return (
    <div className="la-so-root" data-la-so-theme={theme} ref={boxRef}>
      <div className="la-so-wrapper">
        <div className="la-so-container" style={{ zoom }}>
          {laSo.cung.map((c) => {
            const [col, row] = GRID[c.index];
            return <OCung key={c.index} c={c} col={col} row={row} />;
          })}
          <div className="panel-cell">
            <InputPanel
              laSo={laSo}
              value={value}
              onChange={onChange}
              readOnly={readOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export { CHI_POS };
