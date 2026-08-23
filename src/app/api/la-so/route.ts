import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { kiemTraNgay, laSoSchema, payloadToRow } from "@/lib/la-so-io";

/** Danh sách lá số của người dùng hiện tại. */
export async function GET() {
  const supabase = await getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { data, error } = await supabase
    .from("la_so").select("*").order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

/** Tạo lá số mới. */
export async function POST(request: NextRequest) {
  const supabase = await getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const parsed = laSoSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 },
    );
  }
  if (!kiemTraNgay(parsed.data)) {
    return NextResponse.json({ error: "Ngày sinh không có thật" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("la_so").insert(payloadToRow(parsed.data, user.id)).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
