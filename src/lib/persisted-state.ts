// ─────────────────────────────────────────────────────────────────────────────
//  Helpers to round-trip the builder state through the API.
//
//  The Zustand store mixes data fields (profile, blocks, …) with action
//  functions (setProfile, addBlock, …). We only want the data fields when
//  serializing to the API (or vice versa, when applying a server payload).
// ─────────────────────────────────────────────────────────────────────────────

import type { BuilderState } from "@/store/builderStore";
import type { PagePayload } from "@/lib/page-payload";

/**
 * Extract the persisted slice from a full Zustand state object.
 * Returns exactly the shape that PagePayloadSchema validates, ready to send
 * to PUT /api/page or POST /api/page/migrate.
 */
export function pickPersistedState(state: BuilderState): PagePayload {
  return {
    profile: state.profile,
    blocks: state.blocks,
    appearance: state.appearance as unknown as PagePayload["appearance"],
    settings: state.settings as unknown as PagePayload["settings"],
    savedBlocks: state.savedBlocks,
    savedPalettes: state.savedPalettes,
    recentColors: state.recentColors,
    selectedTheme: state.selectedTheme,
    onboardingStep: state.onboardingStep,
    previewMode: state.previewMode,
    activeTab: state.activeTab,
  };
}
