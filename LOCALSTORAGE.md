# Browser-API & localStorage touchpoints

This document tracks every place in the ported codebase that reaches for a
browser-only API (`localStorage`, `window`, `document`, `navigator`). All of
these are SSR-unsafe by definition — they only exist in the browser. The port
keeps each one inside a `"use client"` component or behind a SSR-safe guard.

If you add another spot that touches these APIs, **add it here** so the SSR
boundary stays intentional rather than accidental.

---

## localStorage

| Where | What it does | SSR-safety strategy |
|---|---|---|
| `src/store/builderStore.ts` (Zustand `persist` middleware, key = `ezto-builder-store` or `ezto-builder-store-<userId>`) | Persists the entire builder state — profile, blocks, appearance, settings, saved palettes, savedBlocks snapshot. Re-reads on hydration. | Zustand `persist` v5 lazily evaluates `localStorage` access; on the server it falls back to default state. The store module is only imported through `"use client"` components, so it never runs during a pure server render. |
| `src/store/builderStore.ts` → `setBuilderUserScope(userId)` | Switches the persist bucket name to `ezto-builder-store-<userId>` so each Clerk user has isolated data. Reads `localStorage.getItem(newName)` to decide between rehydrating and resetting to defaults. | Guarded by `typeof localStorage !== "undefined"`. |
| `app/providers.tsx` → `ClerkScopedStore` | Calls `setBuilderUserScope(user?.id)` in a `useEffect` whenever Clerk's `user.id` changes. | Lives in a `"use client"` component, only runs on the client after mount. |

> **Note:** the per-user bucket strategy is the same as the Vite app. If you
> later replace localStorage with a Postgres-backed Supabase store, search for
> `BUILDER_STORAGE_NAME` and `setBuilderUserScope` and remove or repurpose them.

---

## document / window / navigator

| File | API | Purpose | Strategy |
|---|---|---|---|
| `src/components/builder/AddBlockModal.tsx` | `document.addEventListener("keydown")`, `document.body` (portal target) | ESC to close + body-scoped portal | Inside `useEffect`, client component |
| `src/components/builder/AnalyticsPanel.tsx` | `document.addEventListener("mousedown")`, `document.createElement("a")` | Outside-click handler + CSV download trigger | Inside `useEffect` / event handlers, client component |
| `src/components/builder/PhoneCanvas.tsx` | `document.getElementById`, `document.createElement("link")`, `document.head.appendChild` | Inject Google Fonts `<link>` tags on demand | Called from `useEffect` only |
| `src/components/builder/PublishModal.tsx` | `navigator.clipboard.writeText`, `window.open`, `document.body` | Copy URL, open share popups, portal target | Inside event handlers / portals, client component |
| `src/components/builder/QRCodeModal.tsx` | `navigator.clipboard.writeText`, `document.createElement("a"\|"canvas")` | Copy URL + render QR to canvas + download as image | Inside event handlers, client component |
| `src/components/builder/SettingsPanel.tsx` | `navigator.clipboard.writeText` | Copy page URL | Inside event handler |
| `src/components/ui/ColorPicker.tsx` | `window.innerWidth/Height`, `document.addEventListener("keydown")`, `document.body` (portal), `navigator.clipboard.writeText` | Position picker within viewport, ESC dismissal, portal mount, copy hex | Inside `useEffect` / event handlers, client component |
| `src/components/ui/sidebar.tsx` | `document.cookie`, `window.addEventListener("keydown")` | Persist sidebar open/closed + keyboard shortcut | Inside event handlers / `useEffect` |
| `src/components/ui/use-mobile.ts` | `window.matchMedia`, `window.innerWidth` | Responsive breakpoint hook | Inside `useEffect` (no render-time access) |
| `src/pages/BuilderPage.tsx` | `window.open`, `navigator.clipboard.writeText` | Open `/preview` in new tab + copy share URL | Inside event handlers |
| `src/pages/LockedPage.tsx` | `window.close()` | Close window button | Inside event handler |
| `src/pages/OnboardingPage.tsx` | `navigator.clipboard.writeText` | Copy page URL | Inside event handler |
| `src/pages/PreviewPage.tsx` | `window.history.back()`, `window.close()`, `document.getElementById/createElement/head.appendChild` | Back button + Google Fonts injection | Inside event handlers / `useEffect` |

---

## TL;DR for adding new browser code

1. Make sure the file starts with `"use client";` (every `.tsx` under `src/` already does).
2. Wrap any browser-API access in **either** a `useEffect` (preferred) **or** a `typeof window !== "undefined"` guard if it must run synchronously.
3. Add a row to the table above so the next reader doesn't have to grep.

If you forget step 1 or 2, Next.js will throw a runtime error like
`ReferenceError: document is not defined` during SSR.
