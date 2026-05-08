# Database migration — Phase 1

We're moving the canonical store of builder state from `localStorage` to a
Supabase Postgres table. This document is the runbook for finishing the
setup.

## Architecture (what's in place after Phase 1)

```
Browser  ──►  Next.js API routes  ──►  Supabase
                  (server-only)      (service-role key)
```

- **Browser never talks to Supabase directly.** No `@supabase/supabase-js`
  in any client component. All access is through `/api/page` and
  `/api/page/migrate`.
- Auth is enforced inside each API route via Clerk's `auth()` helper —
  the userId is read from the trusted server session, never from the request body.
- Supabase service-role key bypasses RLS by design. RLS on the table is
  enabled with **no permissive policies**, so anyone using the anon key
  (or anything else) gets denied.

## Files added in Phase 1

| Path | What it is |
|---|---|
| [database/clerk-jsonb-schema.sql](database/clerk-jsonb-schema.sql) | The SQL to run in Supabase. One table: `user_pages(user_id text PK, data jsonb, ...)`. |
| [src/lib/supabase/server.ts](src/lib/supabase/server.ts) | Singleton Supabase admin client. Server-only. **Do not import from client components.** |
| [src/lib/page-payload.ts](src/lib/page-payload.ts) | Zod schema mirroring the Zustand store shape. Used to validate request bodies. |
| [app/api/page/route.ts](app/api/page/route.ts) | `GET` (load this user's page) and `PUT` (save it). |
| [app/api/page/migrate/route.ts](app/api/page/migrate/route.ts) | `POST` — one-shot import of the localStorage payload after sign-up. Refuses if a row already exists (409). |

The existing `database/schema.sql` (the long-form normalized design) is
left untouched as a reference for future migrations, but **is not
applied** in this phase.

## What you need to do (one-time setup)

1. **Install the new dependencies**
   ```bash
   npm install
   ```
   This pulls `@supabase/supabase-js` and `zod` from the updated
   `package.json`.

2. **Create the Supabase project**
   - Go to <https://supabase.com>, create a project.
   - Wait for it to provision (~2 min).

3. **Run the schema**
   - Supabase dashboard → **SQL Editor** → paste the contents of
     [database/clerk-jsonb-schema.sql](database/clerk-jsonb-schema.sql) →
     Run.
   - Verify: **Table Editor** should show `user_pages` with no rows.

4. **Grab the credentials and put them in `.env.local`**
   - Supabase dashboard → **Project Settings** → **API**.
   - Copy `Project URL` → `SUPABASE_URL`.
   - Copy `service_role secret` (NOT `anon`) → `SUPABASE_SERVICE_ROLE_KEY`.

   `.env.local` (excerpt):
   ```
   SUPABASE_URL=https://xxxxxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi…   ← server-only, NEVER NEXT_PUBLIC_
   ```

5. **Restart the dev server**
   ```bash
   npm run dev
   ```

6. **Smoke-test the API routes** (signed-in user only)
   ```bash
   # Replace <SESSION_COOKIE> with your Clerk session cookie from devtools.
   # Or just hit them while signed in via the browser fetch API.

   curl http://localhost:3000/api/page \
     -H "Cookie: <SESSION_COOKIE>"
   # Expected: {"data":null,"updated_at":null}  ← first-time user

   curl -X PUT http://localhost:3000/api/page \
     -H "Cookie: <SESSION_COOKIE>" \
     -H "Content-Type: application/json" \
     -d '{"profile":{"firstName":"Test","lastName":"User","bio":"","image":null,"handle":"test"},"blocks":[]}'
   # Expected: {"ok":true}

   curl http://localhost:3000/api/page \
     -H "Cookie: <SESSION_COOKIE>"
   # Expected: {"data":{...the payload you just saved...},"updated_at":"..."}
   ```

   Easier alternative — open the browser console while signed in:
   ```js
   await fetch("/api/page").then(r => r.json());
   ```

## API contract

### `GET /api/page`

| Status | Body | Meaning |
|---|---|---|
| 200 | `{ data: PagePayload \| null, updated_at: string \| null }` | OK. `null` data = first-time user. |
| 401 | `{ error: "Not signed in" }` | No Clerk session. |
| 500 | `{ error: string }` | Server error. |

### `PUT /api/page`

Request body: `PagePayload` (validated by Zod).

| Status | Body | Meaning |
|---|---|---|
| 200 | `{ ok: true }` | Saved (upsert). |
| 400 | `{ error: "Invalid payload", issues }` | Zod failed. |
| 401 | `{ error: "Not signed in" }` | No Clerk session. |
| 500 | `{ error: string }` | Server error. |

### `POST /api/page/migrate`

Request body: `PagePayload` (the guest's localStorage blob).

| Status | Body | Meaning |
|---|---|---|
| 200 | `{ ok: true }` | First-time user — row inserted. |
| 400 | `{ error: "Invalid payload", issues }` | Zod failed. |
| 401 | `{ error: "Not signed in" }` | No Clerk session. |
| 409 | `{ error: "User already has saved data — ..." }` | Row already exists. Caller should use PUT instead. |
| 500 | `{ error: string }` | Server error. |

## Phase 2 — client ↔ API sync (DONE)

Phase 2 ties the in-browser Zustand store to the API routes from Phase 1.
Files added / modified:

| Path | Purpose |
|---|---|
| [src/lib/api/page-client.ts](src/lib/api/page-client.ts) | Browser-side `getPage()`, `savePage()`, `migratePage()` fetch wrappers. |
| [src/lib/persisted-state.ts](src/lib/persisted-state.ts) | Picks the data slice out of the Zustand state for the wire. |
| [src/store/syncStatusStore.ts](src/store/syncStatusStore.ts) | Tiny separate store for "Saving / Saved / Error" UI flags. |
| [src/store/builderStore.ts](src/store/builderStore.ts) | Exported `buildInitialState`; added `{ rehydrate: false }` opt to `setBuilderUserScope`. |
| [app/providers.tsx](app/providers.tsx) | Replaced `ClerkScopedStore` with `ClerkApiBridge` — owns the full server-sync lifecycle. |
| [src/components/builder/BlocksSidebar.tsx](src/components/builder/BlocksSidebar.tsx) | Tiny "Saving… / Saved / Error" line above the Discard/Save row. |
| [src/middleware.ts](src/middleware.ts) | Lives at `src/middleware.ts` (NOT root) — Next.js auto-detected the `src/` directory. |

### How the bridge works

`<ClerkApiBridge>` wraps the app inside `<ClerkProvider>`. It runs a single
effect keyed on `user?.id` and walks the four states:

| Auth transition | Behaviour |
|---|---|
| Not loaded yet | Wait. |
| Signed out | `setBuilderUserScope(null)` — back to the anonymous localStorage bucket. |
| Signed in, **DB has data** | Switch persist bucket to user-scoped (cache-only); `setState(serverData)`. |
| Signed in, **DB empty + anon bucket has data** | Open `<MigrationModal/>` (same UI as before; new flow underneath). |
| Signed in, **DB empty + no anon data** | Switch bucket; `setState(buildInitialState())`. |

After a successful hydrate, the bridge subscribes to the Zustand store. On
every change it schedules a debounced `PUT /api/page` (800ms) and updates
`useSyncStatus` so the UI shows "Saving…" → "Saved" / "Error".

### Migration flow (replaces the localStorage copy)

When the user clicks **Keep my edits** in the modal:

1. Read the anonymous payload from `localStorage["ezto-builder-store"]`
   (Zustand persist envelope `{ state, version }` → take `.state`).
2. `POST /api/page/migrate` with that payload.
   - **200**: row inserted. Toast "Your guest edits are now in your account."
   - **409**: server already has data for this user. Toast a warning;
     the existing DB data wins.
3. Either way, clear the anonymous bucket so we don't re-prompt later.
4. Re-fetch via `GET /api/page` and `setState` it as the canonical state.

When the user clicks **Start fresh**:

1. Clear the anonymous bucket.
2. `setState(buildInitialState())`. The first edit will write defaults to
   the DB via the auto-save loop.

### Sign-out

`setBuilderUserScope(null)` re-points persist at the anonymous bucket and
rehydrates from it (so guests can keep tinkering without an account). The
debounced-save effect tears itself down because `hydratedFor` is cleared.

### Things to know about

- **localStorage still gets written** for signed-in users — it's a fast
  cache for first-paint. The DB is the canonical source. If you clear
  the user's localStorage, the next page load just re-fetches from the
  DB. If the API is unreachable, the store falls back to localStorage
  silently.
- **800ms debounce** on save means typing fast won't hammer the API.
  Adjust the timer in `app/providers.tsx` (`setTimeout(…, 800)`) if it
  feels off.
- **No conflict resolution across tabs / devices yet** — last write
  wins. If you open two tabs and edit both, the later save overwrites
  the earlier. Add `updated_at` checks if this becomes a real problem.
- **Save indicator** only shows when signed in and `status !== "idle"`.
  Signed-out users (writing to anonymous localStorage only) see no
  sync UI — that's intentional, there's nothing to sync.

## What's NOT in this phase

- **Online/offline detection.** If the network drops mid-session, saves
  fail silently and surface as "Couldn't save". A retry queue is a
  later concern.
- **Avatar / image hosting.** Custom social icons + avatars are still
  base64 data URLs inside the JSON blob. Move them to Supabase Storage
  later to keep row size sane.
- **Versioning / migrations of the JSON shape.** The `version` column
  exists but we don't read it yet. Bump it the next time the schema
  changes meaningfully.

## Security notes

- `SUPABASE_SERVICE_ROLE_KEY` is **NOT** prefixed with `NEXT_PUBLIC_`. Next
  will refuse to inline it into client bundles. If you ever see it in
  devtools → check git history → assume it's leaked → rotate immediately
  in Supabase.
- The userId in every query comes from `auth()` (Clerk's server helper).
  Even if a request body contained a `user_id` field, we ignore it. There
  is no path for User A to read or write User B's data.
- RLS is **on with no permissive policies** as a backstop, in case
  someone in the future wires the anon key into the client by accident.
