// ─────────────────────────────────────────────────────────────────────────────
//  Server-only Supabase admin client.
//
//      NEVER import this from a client component, page, or any file that ends
//      up in the browser bundle. The service-role key BYPASSES Row-Level
//      Security and must stay on the server. It's read from process.env
//      (no NEXT_PUBLIC_ prefix), so even by accident it can't reach client
//      code — Next.js will refuse to inline it.
//
//  Use this from Next.js API routes (app/api/.../route.ts) only.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client authenticated with the service-role
 * key. Throws a clear error if env vars are missing (so misconfiguration
 * surfaces immediately when the first API route runs).
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Add them to .env.local (server-only — no NEXT_PUBLIC_ prefix).",
    );
  }

  _client = createClient(url, serviceRoleKey, {
    auth: {
      // No browser sessions — we identify the user via Clerk in API routes.
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _client;
}
