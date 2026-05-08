-- ============================================================
--  EZ.to — Clerk + JSONB schema (v1)
--
--  Why this exists alongside `schema.sql`:
--    • `schema.sql` is the long-term normalized design built around
--      Supabase Auth (uses auth.users, auth.uid(), per-table RLS).
--    • This file is the v1 migration target: a single JSONB-keyed-by-Clerk
--      table that exactly mirrors the Zustand store shape on the client.
--      No translation layer, no joins, just one row per user holding
--      their entire builder state.
--
--  Auth model:
--    • The browser NEVER talks to Supabase directly. All access goes
--      through Next.js API routes that use Clerk's `auth()` to identify
--      the user, then talk to Supabase with the SERVICE-ROLE key.
--    • RLS is enabled with no permissive policies → if anyone ever did
--      get the anon key, they still couldn't read this table.
--    • The service role bypasses RLS by design — that's how the API
--      routes read/write rows.
--
--  Run this in Supabase Dashboard → SQL Editor.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.user_pages (
  user_id     TEXT        PRIMARY KEY,                  -- Clerk user ID, e.g. "user_2abc..."
  data        JSONB       NOT NULL DEFAULT '{}',        -- entire builder state (see lib/page-payload.ts)
  version     INTEGER     NOT NULL DEFAULT 1,           -- schema version of the JSON blob
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-touch updated_at on every UPDATE
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_pages_updated_at ON public.user_pages;
CREATE TRIGGER trg_user_pages_updated_at
  BEFORE UPDATE ON public.user_pages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS on, no policies → anon/authenticated keys cannot read this table.
-- The Next.js API routes use the service-role key, which bypasses RLS.
ALTER TABLE public.user_pages ENABLE ROW LEVEL SECURITY;

-- (Intentionally no SELECT/INSERT/UPDATE/DELETE policies. Add them later
--  ONLY if you decide to call Supabase directly from the browser using
--  Clerk JWT integration. For now, all access is server-side.)
