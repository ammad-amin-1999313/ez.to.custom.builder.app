# Personal Page Builder — Next.js

This is the Next.js port of the Vite + React app at `../`. The port preserves
all behavior: same Zustand store, same components, same Clerk auth model.

## What changed compared to the Vite version

| Concern | Vite version | Next.js version |
|---|---|---|
| Routing | `react-router` (`createBrowserRouter`) | App Router (`app/<route>/page.tsx`) |
| Auth library | `@clerk/react` | `@clerk/nextjs` |
| Auth gating | `<ProtectedRoute>` HOC in `routes.tsx` | `middleware.ts` running `clerkMiddleware().protect()` for `/builder` and `/onboarding` |
| Env vars | `import.meta.env.VITE_*` | `process.env.NEXT_PUBLIC_*` (or server-only) |
| Tailwind v4 | `@tailwindcss/vite` plugin | `@tailwindcss/postcss` PostCSS plugin |
| Asset alias | `figma:asset/...` Vite plugin (unused; no `src/assets/`) | Removed |
| Per-user data isolation | `setBuilderUserScope` swaps Zustand persist bucket | Same logic, kept verbatim |

## Project layout

```
app/                          ← Next.js App Router (server entry points)
  layout.tsx                  ← Root layout (server component)
  providers.tsx               ← ClerkProvider + ClerkScopedStore + Toaster (client)
  globals.css                 ← Imports the three style files under src/styles/
  page.tsx                    ← /                   → ThemeSelectorPage
  builder/page.tsx            ← /builder            → BuilderPage      (auth-gated)
  onboarding/page.tsx         ← /onboarding         → OnboardingPage   (auth-gated)
  preview/page.tsx            ← /preview            → PreviewPage
  sign-in/[[...sign-in]]/page.tsx ← /sign-in/*      → Clerk SignIn UI
  sign-up/[[...sign-up]]/page.tsx ← /sign-up/*      → Clerk SignUp UI
  not-found.tsx               ← 404
src/
  components/                 ← All UI components, ported verbatim
    builder/                  ← BlocksSidebar, ContentPanel, AppearancePanel, etc.
    preview/                  ← BlockRenderer, MiniPreview
    figma/                    ← ImageWithFallback
    ui/                       ← shadcn-style primitives
  pages/                      ← Page-level components, imported by app/<route>/page.tsx
  store/builderStore.ts       ← Zustand store with per-user persist bucket
  styles/                     ← fonts.css, tailwind.css, theme.css
middleware.ts                 ← Clerk middleware (protects /builder, /onboarding)
next.config.ts
postcss.config.mjs            ← Tailwind v4 PostCSS plugin
tsconfig.json                 ← path alias @/* → ./src/*
.env.local                    ← Clerk publishable + secret key (DO NOT commit)
LOCALSTORAGE.md               ← Documentation of every browser-API touchpoint
```

## Setup

### 1. Install dependencies

```bash
cd personal-page-builder-next
npm install
```

### 2. Set up environment variables

Edit `.env.local`. Required values:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_…  ← already populated
CLERK_SECRET_KEY=sk_test_…                   ← REQUIRED, paste your rotated secret key
```

The secret key is required because `middleware.ts` runs server-side. Without it
Clerk's middleware will refuse to start.

### 3. Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## What to test on first run

| Path | Expected |
|---|---|
| `/` | Theme selector loads. Signed-in users see `<UserButton>`; signed-out see "Sign in" button. |
| `/builder` while signed out | Middleware redirects you to `/sign-in`. |
| `/sign-in` | Clerk's sign-in form renders inside the dark-themed branded layout. |
| Sign in | Redirects to `/builder`; profile fields auto-populate from Clerk (name, avatar, handle from email/username). |
| `/builder` editing | Drag blocks, edit content, change appearance, save/discard works. Data persists across reloads. |
| Sign out → sign in as different user | Each user sees their own isolated data (separate `ezto-builder-store-<userId>` bucket). |
| `/preview` | Renders the page using the current builder state. |

## Known limitations carried over from the Vite app

- **Anonymous bucket** (`ezto-builder-store`, no userId suffix) is used while
  signed out. Existing users with data here are NOT auto-migrated to their
  user-scoped bucket on first sign-in — they start fresh. See `LOCALSTORAGE.md`
  for the full story.
- **No backend**. All state lives in `localStorage`. The next phase
  (Supabase) will move the canonical state to Postgres, accessed through
  Next.js API routes.
- **localStorage size cap**: custom social-link icons are stored as base64
  data URLs inside the bucket. The 500 KB per-icon cap exists to avoid
  blowing through the ~5 MB localStorage budget.

## When something breaks

99% of port issues come from one of:

1. **`document is not defined` / `window is not defined` during SSR** — a file
   is using a browser API outside `useEffect` or without a `typeof window`
   guard. See `LOCALSTORAGE.md`.
2. **Hydration mismatch** — the server-rendered HTML differs from what the
   client renders on first pass. Most often caused by reading from Zustand
   state synchronously during render before persist has rehydrated. Wrap the
   read in a `useEffect` + state, or add `suppressHydrationWarning` to the
   element if the value is genuinely client-only (e.g., a date/clock).
3. **`Module not found: @clerk/react`** — leftover import from the Vite app
   that didn't get caught by the sed pass. Replace with `@clerk/nextjs`.
4. **`useNavigate is not a function`** — leftover react-router import.
   Replace `useNavigate` with `useRouter` from `next/navigation` and
   `navigate(x)` with `router.push(x)`.
