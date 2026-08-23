"use client";

/** Menu thả xuống tối giản — đóng khi bấm ra ngoài hoặc nhấn Esc. */

import { useEffect, useRef, useState, type ReactNode } from "react";

export function Menu({ nut, children, canPhai = true }: {
  nut: (mo: boolean) => ReactNode;
  children: (dong: () => void) => ReactNode;
  canPhai?: boolean;
}) {
  const [mo, setMo] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mo) return;
    const ngoai = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMo(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setMo(false); };
    document.addEventListener("mousedown", ngoai);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", ngoai);
      document.removeEventListener("keydown", esc);
    };
  }, [mo]);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setMo((v) => !v)} aria-expanded={mo} aria-haspopup="menu">
        {nut(mo)}
      </button>
      {mo && (
        <div
          role="menu"
          // Nền ĐẶC: menu nổi trên lá số dày chữ, mọi độ trong suốt đều làm khó đọc.
          style={{ backgroundColor: "#20202c" }}
          className={`absolute top-full z-50 mt-1.5 min-w-[210px] overflow-hidden rounded-xl
                      border border-white/15 p-1 shadow-menu
                      ${canPhai ? "right-0" : "left-0"}`}
        >
          {children(() => setMo(false))}
        </div>
      )}
    </div>
  );
}

export function MucMenu({ icon, children, onClick, nguyHiem }: {
  icon?: ReactNode; children: ReactNode; onClick: () => void; nguyHiem?: boolean;
}) {
  return (
    <button
      role="menuitem" type="button" onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition
                  ${nguyHiem
                    ? "text-hanh-hoa hover:bg-hanh-hoa/12"
                    : "text-ink-dim hover:bg-white/[0.07] hover:text-ink"}`}
    >
      {icon}{children}
    </button>
  );
}
