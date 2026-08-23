/**
 * Thiên Bàn — đồ hoạ chủ đạo của trang chủ.
 *
 * Ba vòng đồng tâm quay chậm ngược chiều nhau (12 chi · 10 can · 28 vạch sao)
 * bao quanh khung la võng 4×4 — chính là bố cục lá số thật. Toàn bộ là SVG
 * thuần, không thư viện, không ảnh: nét luôn sắc ở mọi độ phân giải và nhẹ.
 */

const CHI_12 = ["Tí", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const CAN_10 = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const HANH = ["var(--kim)", "var(--thuy)", "var(--moc)", "var(--hoa)", "var(--tho)"];

/** Toạ độ trên đường tròn, 0° ở đỉnh và đi thuận chiều kim đồng hồ. */
const toaDo = (goc: number, r: number) => {
  const rad = ((goc - 90) * Math.PI) / 180;
  return { x: 250 + r * Math.cos(rad), y: 250 + r * Math.sin(rad) };
};

export function ThienBan({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      role="img"
      aria-label="Thiên bàn Tử Vi: ba vòng can chi bao quanh khung la võng 12 cung"
    >
      <defs>
        <radialGradient id="tb-loi" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#2a1a4a" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#12101c" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#08080c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tb-vien" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--kim)" stopOpacity="0.9" />
          <stop offset="50%" stopColor="var(--thuy)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--kim)" stopOpacity="0.15" />
        </linearGradient>
        <filter id="tb-mo" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* Quầng sáng lõi */}
      <circle cx="250" cy="250" r="215" fill="url(#tb-loi)" />

      {/* Vòng ngoài — 28 vạch tú, quay thuận rất chậm */}
      <g style={{ animation: "quay-thuan 150s linear infinite", transformOrigin: "250px 250px" }}>
        <circle cx="250" cy="250" r="228" fill="none" stroke="var(--line)" strokeWidth="1" />
        {Array.from({ length: 28 }, (_, i) => {
          const a = toaDo((i * 360) / 28, 228);
          const b = toaDo((i * 360) / 28, i % 7 === 0 ? 212 : 220);
          return (
            <line
              key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={i % 7 === 0 ? "var(--gold)" : "var(--line-strong)"}
              strokeWidth={i % 7 === 0 ? 1.6 : 1}
            />
          );
        })}
      </g>

      {/* Vòng can — quay nghịch */}
      <g style={{ animation: "quay-nghich 110s linear infinite", transformOrigin: "250px 250px" }}>
        <circle cx="250" cy="250" r="196" fill="none" stroke="url(#tb-vien)" strokeWidth="1.2" />
        {CAN_10.map((can, i) => {
          const p = toaDo((i * 360) / 10, 196);
          return (
            <g key={can} transform={`translate(${p.x} ${p.y})`}>
              <circle r="13" fill="var(--night)" stroke="var(--line-strong)" strokeWidth="0.8" />
              <text
                textAnchor="middle" dominantBaseline="central"
                fontSize="10" fontFamily="Be Vietnam Pro, sans-serif"
                fill={HANH[Math.floor(i / 2) % 5]} opacity="0.92"
                transform={`rotate(${(i * 360) / 10})`}
              >
                {can}
              </text>
            </g>
          );
        })}
      </g>

      {/* Vòng chi — quay thuận */}
      <g style={{ animation: "quay-thuan 80s linear infinite", transformOrigin: "250px 250px" }}>
        <circle cx="250" cy="250" r="166" fill="none" stroke="var(--line)" strokeWidth="1" />
        {CHI_12.map((chi, i) => {
          const p = toaDo((i * 360) / 12, 166);
          return (
            <text
              key={chi} x={p.x} y={p.y}
              textAnchor="middle" dominantBaseline="central"
              fontSize="13" fontFamily="Playfair Display, serif"
              fill="var(--ink-dim)" opacity="0.85"
              transform={`rotate(${(i * 360) / 12} ${p.x} ${p.y})`}
            >
              {chi}
            </text>
          );
        })}
      </g>

      {/* Khung la võng 4×4 — bố cục thật của lá số */}
      <g stroke="var(--line-strong)" strokeWidth="1" fill="none">
        <rect x="130" y="130" width="240" height="240" rx="2" stroke="var(--gold)" strokeOpacity="0.5" />
        {[190, 250, 310].map((v) => (
          <g key={v}>
            <line x1={v} y1="130" x2={v} y2="370" />
            <line x1="130" y1={v} x2="370" y2={v} />
          </g>
        ))}
        {/* Ô giữa 2×2 = Input Panel, tô nhẹ để nhận ra ngay */}
        <rect x="190" y="190" width="120" height="120" fill="rgba(136,0,255,0.10)" stroke="none" />
      </g>

      {/* Tam hợp — tam giác nối 3 cung, nhịp thở nhẹ */}
      <g fill="none" strokeWidth="1" style={{ animation: "tho-sang 7s ease-in-out infinite" }}>
        <polygon points="160,160 340,220 220,340" stroke="var(--thuy)" strokeOpacity="0.55" />
        <polygon points="340,160 160,220 280,340" stroke="var(--kim)" strokeOpacity="0.4" />
      </g>

      {/* Sao trung tâm */}
      <circle cx="250" cy="250" r="26" fill="var(--kim)" opacity="0.16" filter="url(#tb-mo)" />
      <circle cx="250" cy="250" r="4" fill="var(--gold)" />

      {/* Vài chấm sao lấp lánh lệch nhịp */}
      {[
        [96, 118, 1.6, 0], [404, 148, 1.2, 1.4], [78, 356, 1.4, 2.6],
        [418, 372, 1.8, 0.8], [250, 60, 1.3, 3.4], [250, 442, 1.5, 1.9],
      ].map(([x, y, r, d], i) => (
        <circle
          key={i} cx={x} cy={y} r={r} fill="var(--cyan)"
          style={{ animation: `tho-sang ${4 + i * 0.6}s ease-in-out ${d}s infinite` }}
        />
      ))}
    </svg>
  );
}
