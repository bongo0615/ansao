import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export async function middleware(request: NextRequest) {
  // Chống CSRF: request đổi trạng thái phải cùng origin.
  if (!SAFE_METHODS.has(request.method) && !isSameOrigin(request)) {
    return NextResponse.json({ error: "Yêu cầu bị chặn (khác nguồn)." }, { status: 403 });
  }
  return updateSession(request);
}

function isSameOrigin(request: NextRequest): boolean {
  const host = request.headers.get("host");
  if (!host) return false;
  for (const header of ["origin", "referer"]) {
    const v = request.headers.get(header);
    if (v) {
      try { return new URL(v).host === host; } catch { return false; }
    }
  }
  return false;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
