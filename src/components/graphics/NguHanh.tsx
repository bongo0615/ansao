/**
 * Vòng Ngũ Hành — ngũ giác tương sinh (vòng ngoài) + ngôi sao tương khắc
 * (đường chéo trong). Đây cũng là chú giải màu của toàn ứng dụng: người xem
 * hiểu ngay mỗi hành ứng với màu nào trước khi nhìn vào lá số.
 */

const HANH = [
  { ten: "Mộc", mau: "var(--moc)", y: "sinh Hoả" },
  { ten: "Hoả", mau: "var(--hoa)", y: "sinh Thổ" },
  { ten: "Thổ", mau: "var(--tho)", y: "sinh Kim" },
  { ten: "Kim", mau: "var(--kim)", y: "sinh Thuỷ" },
  { ten: "Thuỷ", mau: "var(--thuy)", y: "sinh Mộc" },
];

const R = 88;
const diem = (i: number) => {
  const rad = ((i * 72 - 90) * Math.PI) / 180;
  return { x: 120 + R * Math.cos(rad), y: 120 + R * Math.sin(rad) };
};

export function VongNguHanh({ className = "" }: { className?: string }) {
  const p = HANH.map((_, i) => diem(i));
  return (
    <svg viewBox="0 0 240 240" className={className} role="img"
         aria-label="Vòng ngũ hành: tương sinh vòng ngoài, tương khắc đường chéo trong">
      {/* Tương sinh — ngũ giác ngoài */}
      <polygon
        points={p.map((d) => `${d.x},${d.y}`).join(" ")}
        fill="none" stroke="var(--line-strong)" strokeWidth="1.2"
      />
      {/* Tương khắc — nối cách 2 đỉnh, tạo hình sao 5 cánh */}
      {p.map((a, i) => {
        const b = p[(i + 2) % 5];
        return (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="var(--line)" strokeWidth="1" strokeDasharray="3 4" />
        );
      })}
      {HANH.map((h, i) => (
        <g key={h.ten}>
          <circle cx={p[i].x} cy={p[i].y} r="24" fill="var(--night)" />
          <circle cx={p[i].x} cy={p[i].y} r="24" fill={h.mau} fillOpacity="0.14"
                  stroke={h.mau} strokeWidth="1.4" />
          <text x={p[i].x} y={p[i].y} textAnchor="middle" dominantBaseline="central"
                fontSize="14" fontFamily="Playfair Display, serif" fill={h.mau}>
            {h.ten}
          </text>
        </g>
      ))}
      <text x="120" y="116" textAnchor="middle" fontSize="10"
            fill="var(--ink-faint)" letterSpacing="0.14em">TƯƠNG SINH</text>
      <text x="120" y="132" textAnchor="middle" fontSize="10"
            fill="var(--ink-faint)" letterSpacing="0.14em">TƯƠNG KHẮC</text>
    </svg>
  );
}

/** Chú giải màu ngũ hành dạng hàng ngang — dùng dưới lá số. */
export function ChuGiaiNguHanh({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className}`}>
      {HANH.map((h) => (
        <span key={h.ten} className="flex items-center gap-2 text-xs text-ink-dim">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: h.mau }} />
          {h.ten}
        </span>
      ))}
    </div>
  );
}
