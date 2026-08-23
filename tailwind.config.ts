import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Be Vietnam Pro", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Nền tối theo tông lá số (#1C1C21 / #0D0D0F) thay vì xanh mực MintSlide,
        // để app chrome và khung lá số không đá màu nhau.
        ink: {
          50: "#F8FAFC", 100: "#EEF2F7", 200: "#D9E0EA", 300: "#B6C1D1",
          400: "#8B8B99", 500: "#63636F", 600: "#3D3D47", 700: "#26262E",
          800: "#1C1C21", 900: "#0D0D0F",
        },
        // Palette ngũ hành (dark) — dùng cho app chrome khi cần nhắc màu hành.
        hanh: {
          kim: "#8800FF", hoa: "#FF4400", moc: "#60CD00",
          thuy: "#2A78FF", tho: "#FF964B",
        },
        brand: { DEFAULT: "#8800FF", 500: "#8800FF", 600: "#6E00CC", 700: "#560099" },
        accent: { DEFAULT: "#BEF1FF", 500: "#BEF1FF" },
      },
      boxShadow: {
        panel: "0 12px 40px -16px rgba(0, 0, 0, 0.6)",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0", transform: "translateY(4px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: { fadeIn: "fadeIn 220ms ease-out" },
    },
  },
  plugins: [],
};

export default config;
