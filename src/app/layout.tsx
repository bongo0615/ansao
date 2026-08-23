import type { Metadata, Viewport } from "next";
import "./globals.css";

const MO_TA =
  "Lập lá số Tử Vi theo trường phái Ảo Bí từ ngày giờ và nơi sinh, "
  + "rồi trò chuyện cùng chuyên gia AI để luận giải từng cung.";

export const metadata: Metadata = {
  title: {
    default: "An Sao — Lá số Tử Vi & luận giải cùng chuyên gia AI",
    template: "%s · An Sao",
  },
  description: MO_TA,
  openGraph: { title: "An Sao — Huyền Vi", description: MO_TA, locale: "vi_VN", type: "website" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08080C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen bg-void text-ink antialiased">{children}</body>
    </html>
  );
}
