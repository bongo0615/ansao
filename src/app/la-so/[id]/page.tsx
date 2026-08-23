import { notFound, redirect } from "next/navigation";
import { cheDoKhach } from "@/lib/che-do";
import { getServerSupabase } from "@/lib/supabase/server";
import { LaSoWorkspace } from "@/components/laso/LaSoWorkspace";
import { LaSoCucBo } from "@/components/laso/LaSoCucBo";
import { rowToInput, type LaSoRow } from "@/lib/la-so-io";

export default async function TrangLaSo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const khach = cheDoKhach();

  if (khach) return <LaSoCucBo id={id} />;

  const supabase = await getServerSupabase();
  if (!supabase) redirect("/la-so/moi");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS đã giới hạn theo owner; không thấy → 404.
  const { data } = await supabase.from("la_so").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return <LaSoWorkspace banDau={rowToInput(data as LaSoRow)} id={id} noiLuu="supabase" />;
}
