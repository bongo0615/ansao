/** Bộ icon nét mảnh, dùng chung một khổ 16×16 và `currentColor`. */

type P = { size?: number; className?: string };
const base = (p: P) => ({
  width: p.size ?? 16, height: p.size ?? 16, viewBox: "0 0 16 16",
  fill: "none", stroke: "currentColor", strokeWidth: 1.5,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  className: p.className, "aria-hidden": true,
});

export const IMatTroi = (p: P) => (
  <svg {...base(p)}>
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06M12.95 12.95l-1.06-1.06M4.11 4.11L3.05 3.05" />
  </svg>
);
export const IMatTrang = (p: P) => (
  <svg {...base(p)}><path d="M13.5 9.3A5.8 5.8 0 116.7 2.5a4.6 4.6 0 006.8 6.8z" /></svg>
);
export const ITru = (p: P) => <svg {...base(p)}><path d="M3.5 8h9" /></svg>;
export const ICong = (p: P) => <svg {...base(p)}><path d="M8 3.5v9M3.5 8h9" /></svg>;
export const IMuiTenTrai = (p: P) => (
  <svg {...base(p)}><path d="M10 3L5 8l5 5" /></svg>
);
export const IBaCham = (p: P) => (
  <svg {...base(p)} strokeWidth={0} fill="currentColor">
    <circle cx="3.5" cy="8" r="1.3" /><circle cx="8" cy="8" r="1.3" /><circle cx="12.5" cy="8" r="1.3" />
  </svg>
);
export const IIn = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 6V2.5h7V6M4.5 12H3.5A1.5 1.5 0 012 10.5v-3A1.5 1.5 0 013.5 6h9A1.5 1.5 0 0114 7.5v3a1.5 1.5 0 01-1.5 1.5h-1" />
    <rect x="4.5" y="9.5" width="7" height="4" rx="0.5" />
  </svg>
);
export const IThung = (p: P) => (
  <svg {...base(p)}><path d="M2.5 4h11M6.5 4V2.5h3V4M4 4l.6 9.5h6.8L12 4" /></svg>
);
export const IThuNho = (p: P) => (
  <svg {...base(p)}>
    <path d="M6.5 2.5v4h-4M9.5 13.5v-4h4" />
    <path d="M2.5 13.5l4-4M13.5 2.5l-4 4" />
  </svg>
);
export const IChevron = (p: P) => <svg {...base(p)}><path d="M4 6l4 4 4-4" /></svg>;
export const ISao = (p: P) => (
  <svg {...base(p)} strokeWidth={0} fill="currentColor">
    <path d="M8 1.5c.3 3.2.9 4.5 5 6.5-4.1 2-4.7 3.3-5 6.5-.3-3.2-.9-4.5-5-6.5 4.1-2 4.7-3.3 5-6.5z" />
  </svg>
);
