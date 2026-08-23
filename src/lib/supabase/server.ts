import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

type CookieItem = { name: string; value: string; options?: CookieOptions };

/**
 * Client phía server cho route handler / RSC — đọc session từ cookie để RLS
 * thấy đúng `auth.uid()`.
 */
export async function getServerSupabase(): Promise<SupabaseClient | null> {
  const env = supabaseEnv();
  if (!env) return null;

  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(items: CookieItem[]) {
        // Trong RSC cookie store là readonly; middleware lo việc refresh.
        try {
          items.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* readonly */
        }
      },
    },
  });
}
