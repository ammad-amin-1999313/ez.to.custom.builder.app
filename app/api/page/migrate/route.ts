// ─────────────────────────────────────────────────────────────────────────────
//  /api/page/migrate  —  POST
//
//  One-shot endpoint used right after a guest user signs up. The client
//  posts the localStorage payload here; the server inserts it as the user's
//  first row. Refuses with 409 if a row already exists — never overwrites
//  existing data.
//
//  After a 200 response, the client should clear the anonymous localStorage
//  bucket so the same payload isn't migrated again on the next visit.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { PagePayloadSchema } from "@/lib/page-payload";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PagePayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    // Refuse to overwrite an existing row. The caller must use PUT /api/page
    // for subsequent saves.
    const { data: existing, error: lookupError } = await supabase
      .from("user_pages")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json({ error: lookupError.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json(
        { error: "User already has saved data — refusing to overwrite. Use PUT /api/page instead." },
        { status: 409 },
      );
    }

    const { error } = await supabase
      .from("user_pages")
      .insert({ user_id: userId, data: parsed.data, version: 1 });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
