"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

let cached: SupabaseClient | null = null;

/** Client phía trình duyệt; trả null khi chưa cấu hình Supabase. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  const env = supabaseEnv();
  if (!env) return null;
  if (!cached) cached = createBrowserClient(env.url, env.anonKey);
  return cached;
}
