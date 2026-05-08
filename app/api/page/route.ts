// ─────────────────────────────────────────────────────────────────────────────
//  /api/page  —  GET + PUT
//
//  Returns the signed-in user's saved builder state, or saves it.
//  All access is gated by Clerk's `auth()` — no userId from the client is
//  trusted; we always pull it from the session.
//
//  Route handlers are SERVER-ONLY. They use lib/supabase/server.ts which
//  carries the service-role key — never exposed to the browser.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { PagePayloadSchema } from "@/lib/page-payload";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("user_pages")
      .select("data, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[/api/page GET] supabase error:", error);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }

    // First-time user — no row yet. Client will use defaults.
    if (!data) {
      return NextResponse.json({ data: null, updated_at: null });
    }

    return NextResponse.json({ data: data.data, updated_at: data.updated_at });
  } catch (err) {
    console.error("[/api/page GET] unhandled:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
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
    const { error } = await supabase
      .from("user_pages")
      .upsert(
        { user_id: userId, data: parsed.data, version: 1 },
        { onConflict: "user_id" },
      );

    if (error) {
      console.error("[/api/page PUT] supabase error:", error);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/page PUT] unhandled:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
