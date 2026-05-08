// ─────────────────────────────────────────────────────────────────────────────
//  Server-sync trigger.
//
//  This module owns the "save the current builder state to the server" action.
//  Both the bridge (for auto-save on deletion) and the Save button (for
//  explicit save) call into it. Keeping this here means actions in the store
//  don't need to know anything about the network layer.
//
//  Auto-save policy (per the user's UX preference):
//    • Block deletions  → fire syncBuilderToServer() automatically.
//    • Anything else    → wait for the user to click Save.
//
//  The bridge enables/disables sync via setSyncEnabled() based on auth +
//  hydration state, so no save fires for guest sessions or before the
//  initial GET completes.
// ─────────────────────────────────────────────────────────────────────────────

import { useBuilderStore } from "@/store/builderStore";
import { useSyncStatus } from "@/store/syncStatusStore";
import { savePage } from "@/lib/api/page-client";
import { pickPersistedState } from "@/lib/persisted-state";

let _enabled = false;

/**
 * Toggle whether triggerSave() actually does anything.
 * Bridge calls setSyncEnabled(true) once the user is signed in AND the store
 * has been hydrated from the server. setSyncEnabled(false) on sign-out.
 */
export function setSyncEnabled(enabled: boolean): void {
  _enabled = enabled;
}

/**
 * Push the current Zustand state to the server. No-op if sync is disabled
 * (guest session, or pre-hydration). Updates useSyncStatus along the way.
 */
export async function syncBuilderToServer(): Promise<void> {
  if (!_enabled) return;
  useSyncStatus.getState().setSaving();
  try {
    const state = useBuilderStore.getState();
    await savePage(pickPersistedState(state));
    useSyncStatus.getState().setSaved();
  } catch (err) {
    console.error("[sync] save failed:", err);
    useSyncStatus.getState().setError(
      err instanceof Error ? err.message : "Save failed",
    );
  }
}
