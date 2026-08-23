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

/**
 * Cho phép trò chuyện với chuyên gia mà KHÔNG cần đăng nhập
 * (`NEXT_PUBLIC_CHAT_MO=1`). **Mặc định TẮT.**
 *
 * ⚠️ Bật cờ này là mở một endpoint gọi LLM cho người lạ. Có hạn mức theo IP
 * (`src/lib/gioi-han.ts`) nhưng đó chỉ là phanh, không phải khoá: IP rất dễ đổi.
 * Chỉ bật khi thực sự cần demo công khai và chấp nhận rủi ro chi phí.
 */
export function chatMo(): boolean {
  return process.env.NEXT_PUBLIC_CHAT_MO === "1";
}

/**
 * Cho phép tự đăng ký tài khoản (`NEXT_PUBLIC_CHO_DANG_KY=1`). **Mặc định TẮT** —
 * giai đoạn này chỉ dùng vài tài khoản thử do quản trị tạo sẵn.
 *
 * ⚠️ Cờ này chỉ ẩn giao diện. Chốt chặn thật nằm ở Supabase:
 * Authentication → Sign In / Providers → Email → tắt "Allow new users to sign up".
 * Không tắt ở đó thì người ta vẫn gọi thẳng API đăng ký được.
 */
export function choDangKy(): boolean {
  return process.env.NEXT_PUBLIC_CHO_DANG_KY === "1";
}
