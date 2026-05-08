// ─────────────────────────────────────────────────────────────────────────────
//  Client-side fetch wrappers for the /api/page routes.
//
//  These run in the browser and never touch Supabase directly. They speak
//  HTTP to our Next.js API routes, which in turn use the service-role key
//  server-side. See lib/supabase/server.ts and app/api/page/route.ts.
// ─────────────────────────────────────────────────────────────────────────────

import type { PagePayload } from "@/lib/page-payload";

export interface GetPageResponse {
  data: PagePayload | null;
  updated_at: string | null;
}

/** Load the signed-in user's page. Returns null on 401 (not signed in). */
export async function getPage(): Promise<GetPageResponse | null> {
  const res = await fetch("/api/page", { cache: "no-store" });
  if (res.status === 401) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `GET /api/page failed (${res.status})`);
  }
  return res.json();
}

/** Save the signed-in user's page (upsert). Throws on any non-200 response. */
export async function savePage(payload: PagePayload): Promise<void> {
  const res = await fetch("/api/page", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `PUT /api/page failed (${res.status})`);
  }
}

/**
 * One-shot migration of guest data into a freshly-signed-up user's row.
 * Returns:
 *   - { ok: true }       → row inserted
 *   - { conflict: true } → 409, user already has data; caller should not retry
 *   throws on any other failure.
 */
export async function migratePage(
  payload: PagePayload,
): Promise<{ ok: true } | { conflict: true }> {
  const res = await fetch("/api/page/migrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status === 409) return { conflict: true };
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `POST /api/page/migrate failed (${res.status})`);
  }
  return { ok: true };
}
