/**
 * Chế độ khách — bật bằng `NEXT_PUBLIC_CHE_DO_KHACH=1` trong `.env.local`.
 *
 * Khi bật: bỏ qua toàn bộ luồng đăng nhập, lá số lưu vào localStorage của
 * trình duyệt. Dùng để kiểm thử engine + giao diện mà không vướng auth.
 * Tắt cờ đi là quay lại luồng Supabase bình thường, không cần sửa code.
 */
export function cheDoKhach(): boolean {
  return process.env.NEXT_PUBLIC_CHE_DO_KHACH === "1";
}
