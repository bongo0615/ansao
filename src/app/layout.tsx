import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "An Sao — Lập lá số Tử Vi",
  description:
    "Công cụ lập lá số Tử Vi theo trường phái Ảo Bí: nhập ngày giờ và nơi sinh, "
    + "nhận lá số đầy đủ 12 cung với Đại Vận, Lưu Niên và Lưu Nguyệt.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D0D0F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-ink-900 text-ink-50">{children}</body>
    </html>
  );
}
