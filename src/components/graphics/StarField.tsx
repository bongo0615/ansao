/**
 * Nền sao tĩnh, sinh bằng hàm băm tất định theo `seed` — cùng seed cho ra cùng
 * bầu trời ở server và client, nên không lệch hydration (dùng Math.random sẽ lệch).
 */
export function StarField({ seed = 7, count = 70, className = "" }: {
  seed?: number; count?: number; className?: string;
}) {
  let s = seed * 9301 + 49297;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

  const sao = Array.from({ length: count }, () => ({
    x: rnd() * 100, y: rnd() * 100, r: 0.4 + rnd() * 1.1,
    o: 0.15 + rnd() * 0.5, d: rnd() * 6,
  }));

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {sao.map((p, i) => (
          <circle
            key={i} cx={p.x} cy={p.y} r={p.r / 10}
            fill="#fff" opacity={p.o}
            style={{ animation: `tho-sang ${5 + (i % 5)}s ease-in-out ${p.d}s infinite` }}
          />
        ))}
      </svg>
    </div>
  );
}
