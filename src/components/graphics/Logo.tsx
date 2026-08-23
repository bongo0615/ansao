/**
 * Dấu hiệu nhận diện — "Tinh Bàn": ngôi sao bốn cánh nằm trong vòng thiên bàn.
 *
 * Thiết kế theo ràng buộc khắt khe nhất của icon: **còn đọc được ở 16px**.
 * Vì vậy chỉ một hình khối chủ đạo (ngôi sao) trên nền tương phản mạnh; lưới
 * la võng 4×4 của phiên bản trước biến thành cháo ở cỡ favicon nên đã bỏ,
 * chỉ giữ lại bốn chấm ở bốn hướng gợi nhớ bốn góc khung.
 *
 * ⚠️ Giữ đồng bộ với `src/app/icon.svg` (favicon) và `src/app/apple-icon.tsx`.
 */

export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  const id = "logo";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}
         role="img" aria-label="An Sao">
      <defs>
        <linearGradient id={`${id}-nen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#241242" />
          <stop offset="55%" stopColor="#12101f" />
          <stop offset="100%" stopColor="#080810" />
        </linearGradient>
        <linearGradient id={`${id}-sao`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#FFE9B0" />
          <stop offset="42%" stopColor="#E5C07B" />
          <stop offset="100%" stopColor="#BEF1FF" />
        </linearGradient>
        <radialGradient id={`${id}-quang`} cx="50%" cy="50%">
          <stop offset="0%" stopColor="#8800FF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#8800FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="64" height="64" rx="14" fill={`url(#${id}-nen)`} />
      {/* Viền tóc: giữ icon tách khỏi nền sáng, vô hình trên nền tối */}
      <rect x="0.5" y="0.5" width="63" height="63" rx="13.5" fill="none"
            stroke="#fff" strokeOpacity="0.10" />

      <circle cx="32" cy="32" r="21" fill={`url(#${id}-quang)`} />
      <circle cx="32" cy="32" r="23" fill="none" stroke="#E5C07B" strokeOpacity="0.3" />

      {/* Bốn hướng — dấu vết còn lại của khung la võng */}
      <g fill="#E5C07B" opacity="0.55">
        <circle cx="32" cy="9" r="1.5" /><circle cx="55" cy="32" r="1.5" />
        <circle cx="32" cy="55" r="1.5" /><circle cx="9" cy="32" r="1.5" />
      </g>

      <path d="M32 10 C32.9 22.5 35.2 27.8 54 32 C35.2 36.2 32.9 41.5 32 54
               C31.1 41.5 28.8 36.2 10 32 C28.8 27.8 31.1 22.5 32 10 Z"
            fill={`url(#${id}-sao)`} />
      <path d="M32 21 C32.6 27.4 33.9 29.7 43 32 C33.9 34.3 32.6 36.6 32 43
               C31.4 36.6 30.1 34.3 21 32 C30.1 29.7 31.4 27.4 32 21 Z"
            fill="#fff" opacity="0.22" transform="rotate(45 32 32)" />
    </svg>
  );
}

export function LogoChu({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Logo size={32} />
      <span className="font-display text-lg font-bold leading-none tracking-tight">
        An&nbsp;Sao
        <span className="ml-1.5 align-middle text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-gold">
          Huyền Vi
        </span>
      </span>
    </span>
  );
}
