import type { Config } from "tailwindcss";

/**
 * Màu khai báo dạng `var(--x)` (hex đầy đủ) nên Tailwind KHÔNG tự tính được
 * biến thể alpha — `bg-surface-2/95` sẽ không sinh ra CSS nào và phần tử thành
 * trong suốt hoàn toàn. Hàm dưới đây trả về `color-mix()` khi có opacity
 * modifier, giữ nguyên biến khi không có, nên `/50`, `/[0.08]`… hoạt động bình
 * thường mà vẫn dùng chung một bộ biến với `la-so.css` và các SVG.
 *
 * Tailwind chấp nhận hàm ở vị trí giá trị màu nhưng kiểu TS chưa mô tả điều đó,
 * nên phải ép về string ở ranh giới này.
 */
const bien = (v: string): string =>
  ((({ opacityValue }: { opacityValue?: string }) => {
    // Không có modifier, Tailwind truyền chuỗi `var(--tw-*-opacity)` chứ không
    // phải số — ép kiểu sẽ ra NaN và hỏng cả màu đặc. Chỉ dùng color-mix khi
    // opacity thực sự là một con số nhỏ hơn 1.
    const a = Number(opacityValue);
    if (!Number.isFinite(a) || a >= 1) return `var(${v})`;
    return `color-mix(in srgb, var(${v}) ${a * 100}%, transparent)`;
  }) as unknown as string);

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", "ui-serif", "Georgia", "serif"],
        sans: ["Be Vietnam Pro", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        void: bien("--void"),
        night: bien("--night"),
        surface: { DEFAULT: bien("--surface"), 2: bien("--surface-2") },
        line: { DEFAULT: bien("--line"), strong: bien("--line-strong") },
        ink: { DEFAULT: bien("--ink"), dim: bien("--ink-dim"), faint: bien("--ink-faint") },
        hanh: {
          kim: bien("--kim"), hoa: bien("--hoa"), moc: bien("--moc"),
          thuy: bien("--thuy"), tho: bien("--tho"),
        },
        gold: bien("--gold"),
        cyan: bien("--cyan"),
      },
      boxShadow: {
        lift: "0 18px 50px -22px rgba(0,0,0,0.85)",
        glow: "0 0 40px -8px rgba(136,0,255,0.45)",
        menu: "0 16px 44px -12px rgba(0,0,0,0.9)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
