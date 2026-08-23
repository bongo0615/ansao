import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { kiemTraNgay, laSoSchema, payloadToRow } from "@/lib/la-so-io";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Cập nhật lá số. RLS đã chặn cross-tenant, `.eq("owner_id")` là lớp phòng thủ
 * thứ hai để không phụ thuộc hoàn toàn vào policy.
 */
export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
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

  const { owner_id: _owner, ...fields } = payloadToRow(parsed.data, user.id);
  const { data, error } = await supabase
    .from("la_so").update(fields).eq("id", id).eq("owner_id", user.id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Không tìm thấy lá số" }, { status: 404 });
  return NextResponse.json({ data });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const supabase = await getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { error } = await supabase
    .from("la_so").delete().eq("id", id).eq("owner_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
