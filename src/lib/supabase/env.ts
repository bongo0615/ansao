/**
 * Nguồn duy nhất xác định Supabase đã cấu hình hay chưa. Thiếu env → app chạy
 * ở chế độ ẩn danh (lập lá số được, không lưu được).
 */

export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export const supabaseConfigured = () => supabaseEnv() !== null;
