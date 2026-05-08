"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ClerkProvider, useUser } from "@clerk/nextjs";
import { Toaster, toast } from "sonner";
import {
  useBuilderStore,
  setBuilderUserScope,
  buildInitialState,
  BUILDER_STORAGE_NAME,
} from "@/store/builderStore";
import { useSyncStatus } from "@/store/syncStatusStore";
import { getPage, migratePage } from "@/lib/api/page-client";
import { setSyncEnabled, syncBuilderToServer } from "@/lib/sync";

// ─── Clerk dark-theme appearance ──────────────────────────────────────────────
const clerkAppearance = {
  variables: {
    colorPrimary: "#6366f1",
    colorBackground: "#18181b",
    colorInputBackground: "#27272a",
    colorInputText: "#ffffff",
    colorText: "#f4f4f5",
    colorTextSecondary: "#a1a1aa",
    colorNeutral: "#71717a",
    colorDanger: "#ef4444",
    colorSuccess: "#22c55e",
    borderRadius: "0.75rem",
    fontFamily: "inherit",
  },
  elements: {
    card: {
      background: "#18181b",
      border: "1px solid #27272a",
      boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
    },
    headerTitle: { color: "#ffffff" },
    headerSubtitle: { color: "#a1a1aa" },
    dividerLine: { background: "#27272a" },
    dividerText: { color: "#71717a" },
    socialButtonsBlockButton: {
      background: "#27272a",
      border: "1px solid #3f3f46",
      color: "#f4f4f5",
    },
    socialButtonsBlockButtonText: { color: "#f4f4f5" },
    formFieldLabel: { color: "#d4d4d8" },
    formFieldInput: {
      background: "#27272a",
      borderColor: "#3f3f46",
      color: "#ffffff",
    },
    formButtonPrimary: {
      background: "#6366f1",
      "&:hover": { background: "#4f46e5" },
    },
    footerActionText: { color: "#a1a1aa" },
    footerActionLink: { color: "#818cf8" },
    identityPreviewText: { color: "#a1a1aa" },
    identityPreviewEditButtonIcon: { color: "#a1a1aa" },
    userButtonPopoverCard: {
      background: "#18181b",
      border: "1px solid #27272a",
    },
    userButtonPopoverActionButton: {
      color: "#e4e4e7",
      "&:hover": { background: "#27272a" },
    },
    userButtonPopoverActionButtonText: { color: "#e4e4e7" },
    userButtonPopoverActionButtonIcon: { color: "#a1a1aa" },
    userButtonPopoverFooter: { borderTop: "1px solid #27272a" },
    profileSection__danger: { borderColor: "#3f3f46" },
  },
};

// ─── Migration prompt modal ──────────────────────────────────────────────────
// Shown on the user's FIRST sign-in if there's data in the anonymous bucket
// (i.e. they were editing as a guest). Lets them choose whether to bring
// those edits into their new account or start fresh.
function MigrationModal({
  open,
  onKeep,
  onDiscard,
}: {
  open: boolean;
  onKeep: () => void;
  onDiscard: () => void;
}) {
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  if (!open || !portalTarget) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-white text-base font-semibold mb-1">Welcome!</h2>
        <p className="text-zinc-400 text-sm leading-relaxed mb-5">
          You made some edits while signed out. Want to bring them into your account, or start fresh?
        </p>
        <div className="flex gap-2">
          <button
            onClick={onDiscard}
            className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors"
          >
            Start fresh
          </button>
          <button
            onClick={onKeep}
            className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm transition-colors"
          >
            Keep my edits
          </button>
        </div>
      </div>
    </div>,
    portalTarget,
  );
}

// ─── ClerkApiBridge ──────────────────────────────────────────────────────────
// Owns the lifecycle for store ↔ server sync.
//
//   Sign-out → switch the persist bucket back to the anonymous localStorage
//              bucket. Old guest-mode behaviour, unchanged.
//
//   Sign-in  → GET /api/page.
//                • If the DB has data → hydrate the store from it.
//                • Else if the anonymous bucket has data → show MigrationModal
//                  so the user can choose to import or start fresh.
//                • Else → defaults.
//
//   After hydration → subscribe to store changes and PUT /api/page with an
//                     800ms debounce. Status (idle / saving / saved / error)
//                     is exposed via useSyncStatus for the UI to display.
//
//   For signed-in users, localStorage still gets written by the persist
//   middleware — it's just a fast cache; the DB is canonical.
function ClerkApiBridge({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const lastHandledIdRef = useRef<string | null | undefined>(undefined);
  const [pendingMigrationFor, setPendingMigrationFor] = useState<string | null>(null);
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);

  // ── Hydrate / scope switch on auth change ───────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    const newId = user?.id ?? null;
    if (lastHandledIdRef.current === newId) return;

    // Signed out → revert to anonymous localStorage bucket (rehydrate ON so
    // any prior guest data is restored).
    if (!newId) {
      lastHandledIdRef.current = newId;
      setPendingMigrationFor(null);
      setHydratedFor(null);
      useSyncStatus.getState().setIdle();
      setBuilderUserScope(null);
      return;
    }

    // Signed in → check the DB first; that's the canonical source.
    let cancelled = false;
    (async () => {
      try {
        const result = await getPage();
        if (cancelled) return;

        const hasDbData = result?.data != null;
        const hasAnonData =
          typeof localStorage !== "undefined" &&
          !!localStorage.getItem(BUILDER_STORAGE_NAME);

        if (hasDbData) {
          // DB wins. Switch persist bucket name (cache only) and overwrite
          // in-memory state with server data.
          setBuilderUserScope(newId, { rehydrate: false });
          useBuilderStore.setState(result!.data!);
          setHydratedFor(newId);
          lastHandledIdRef.current = newId;
          useSyncStatus.getState().setIdle();
          return;
        }

        // DB is empty for this user.
        if (hasAnonData) {
          // First sign-in with guest edits → ask the user.
          // Don't switch scope yet — the in-memory store is still the
          // anon-bucket data the user was just editing, which is what
          // they want to see behind the modal.
          setPendingMigrationFor(newId);
          lastHandledIdRef.current = newId;
          return;
        }

        // First sign-in, no guest data → defaults.
        setBuilderUserScope(newId, { rehydrate: false });
        useBuilderStore.setState(buildInitialState());
        setHydratedFor(newId);
        lastHandledIdRef.current = newId;
        useSyncStatus.getState().setIdle();
      } catch (err) {
        if (cancelled) return;
        console.error("[sync] hydrate failed:", err);
        toast.error("Couldn't load your saved page");
        // Fall back to localStorage-only mode for this user (degrades
        // gracefully if the API is unreachable).
        setBuilderUserScope(newId);
        setHydratedFor(newId);
        lastHandledIdRef.current = newId;
        useSyncStatus.getState().setError(
          err instanceof Error ? err.message : "Sync error",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user?.id]);

  // ── Auto-save on BLOCK DELETIONS only ─────────────────────────────────────
  // Per the user's UX preference:
  //   • Adding a block / editing block content / reordering / appearance /
  //     settings tweaks  → wait for explicit Save click (BlocksSidebar).
  //   • Deleting a block → save immediately so the deletion sticks across
  //     reloads even without a Save click.
  //
  // We detect deletes by comparing prev vs current `blocks.length`. Other
  // changes do not trigger a save here; the BlocksSidebar's Save button
  // calls `syncBuilderToServer()` directly.
  useEffect(() => {
    if (!hydratedFor || hydratedFor !== user?.id) return;
    setSyncEnabled(true);

    const unsub = useBuilderStore.subscribe((state, prevState) => {
      if (state.blocks.length < prevState.blocks.length) {
        void syncBuilderToServer();
      }
    });

    return () => {
      unsub();
      setSyncEnabled(false);
    };
  }, [hydratedFor, user?.id]);

  // ── Migration handlers ──────────────────────────────────────────────────
  const finishMigration = async (keepGuestData: boolean) => {
    const userId = pendingMigrationFor;
    if (!userId) return;
    setPendingMigrationFor(null);

    if (!keepGuestData) {
      // Clear anon so we don't re-prompt next session.
      try {
        localStorage.removeItem(BUILDER_STORAGE_NAME);
      } catch {
        /* ignore */
      }
      setBuilderUserScope(userId, { rehydrate: false });
      useBuilderStore.setState(buildInitialState());
      setHydratedFor(userId);
      useSyncStatus.getState().setIdle();
      return;
    }

    // Migrate anon → DB
    try {
      const anonRaw =
        typeof localStorage !== "undefined"
          ? localStorage.getItem(BUILDER_STORAGE_NAME)
          : null;
      if (!anonRaw) {
        // shouldn't happen — we only show the modal if anon data existed
        setBuilderUserScope(userId, { rehydrate: false });
        useBuilderStore.setState(buildInitialState());
        setHydratedFor(userId);
        return;
      }

      // Zustand persist stores `{ state, version }`. Extract the state slice.
      const parsed = JSON.parse(anonRaw);
      const payload = parsed?.state ?? parsed;

      const result = await migratePage(payload);
      if ("conflict" in result) {
        toast.error("Account already has saved data — keeping that.");
      } else {
        toast.success("Your guest edits are now in your account.");
      }

      try {
        localStorage.removeItem(BUILDER_STORAGE_NAME);
      } catch {
        /* ignore */
      }

      // Pull the canonical state from the DB (which now has the migrated row,
      // OR — in the conflict case — the existing row we should respect).
      setBuilderUserScope(userId, { rehydrate: false });
      const fresh = await getPage();
      if (fresh?.data) {
        useBuilderStore.setState(fresh.data);
      } else {
        useBuilderStore.setState(buildInitialState());
      }
      setHydratedFor(userId);
      useSyncStatus.getState().setIdle();
    } catch (err) {
      console.error("[migrate] failed:", err);
      toast.error("Couldn't migrate your edits");
      // Best-effort fallback: switch scope, leave in-memory state alone.
      setBuilderUserScope(userId);
      setHydratedFor(userId);
    }
  };

  return (
    <>
      {children}
      <MigrationModal
        open={!!pendingMigrationFor}
        onKeep={() => finishMigration(true)}
        onDiscard={() => finishMigration(false)}
      />
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <ClerkApiBridge>{children}</ClerkApiBridge>
      <Toaster position="bottom-right" richColors />
    </ClerkProvider>
  );
}
