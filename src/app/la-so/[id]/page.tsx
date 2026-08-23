import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cheDoKhach } from "@/lib/che-do";
import { getServerSupabase } from "@/lib/supabase/server";
import { LaSoWorkspace } from "@/components/laso/LaSoWorkspace";
import { LaSoCucBo } from "@/components/laso/LaSoCucBo";
import { rowToInput, type LaSoRow } from "@/lib/la-so-io";

export default async function TrangLaSo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-8">
      <Link href="/la-so" className="no-print mb-4 inline-block text-sm text-ink-400 underline">
        ← Lá số của tôi
      </Link>
      {cheDoKhach() ? <LaSoCucBo id={id} /> : <LaSoSupabase id={id} />}
    </main>
  );
}

async function LaSoSupabase({ id }: { id: string }) {
  const supabase = await getServerSupabase();
  if (!supabase) redirect("/la-so/moi");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS đã giới hạn theo owner; không thấy → 404.
  const { data } = await supabase.from("la_so").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return <LaSoWorkspace banDau={rowToInput(data as LaSoRow)} id={id} noiLuu="supabase" />;
}
