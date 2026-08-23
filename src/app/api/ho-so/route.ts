import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";

const schema = z.object({
  hoTen: z.string().trim().max(100),
});

/**
 * Cập nhật hồ sơ. Chỉ cho sửa `ho_ten` — `vai_tro` là quyền, không để người
 * dùng tự đặt cho mình.
 */
export async function PATCH(request: NextRequest) {
  const supabase = await getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  // upsert: tài khoản tạo tay trong dashboard có thể chưa có dòng profiles.
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ho_ten: parsed.data.hoTen }, { onConflict: "id" })
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
