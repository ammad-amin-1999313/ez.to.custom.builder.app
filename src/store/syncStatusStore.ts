// ─────────────────────────────────────────────────────────────────────────────
//  Tiny store for "Saving…" / "Saved" / "Error" UI indicators.
//
//  Lives separate from the main builder store so its transient flags don't
//  end up in the persisted localStorage payload (and so it doesn't trigger
//  an API save loop when the indicator itself changes).
// ─────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";

export type SyncStatus = "idle" | "saving" | "saved" | "error" | "offline";

interface SyncStatusState {
  status: SyncStatus;
  lastSavedAt: number | null;
  errorMessage: string | null;

  setSaving: () => void;
  setSaved: () => void;
  setError: (message: string) => void;
  setIdle: () => void;
}

export const useSyncStatus = create<SyncStatusState>()((set) => ({
  status: "idle",
  lastSavedAt: null,
  errorMessage: null,

  setSaving: () => set({ status: "saving", errorMessage: null }),
  setSaved:  () => set({ status: "saved", lastSavedAt: Date.now(), errorMessage: null }),
  setError:  (message) => set({ status: "error", errorMessage: message }),
  setIdle:   () => set({ status: "idle", errorMessage: null }),
}));
