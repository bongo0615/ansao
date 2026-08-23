/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Gói standalone: Docker chỉ cần .next/standalone + static + public, không
  // phải bê nguyên node_modules. Ảnh nhỏ hơn nhiều và khởi động nhanh hơn.
  output: "standalone",
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? "dev",
  },
};

export default nextConfig;
