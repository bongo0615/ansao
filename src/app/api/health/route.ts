import { NextResponse } from "next/server";

/**
 * Health check cho Docker/Caddy.
 *
 * Cố ý KHÔNG chạm Supabase hay Anthropic: healthcheck 15 giây một lần mà gọi
 * ra ngoài thì vừa tốn hạn mức, vừa khiến container bị đánh dấu chết chỉ vì một
 * dịch vụ bên thứ ba chớp nháy. Ở đây chỉ trả lời "tiến trình Node còn sống".
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "dev",
    time: new Date().toISOString(),
  });
}
