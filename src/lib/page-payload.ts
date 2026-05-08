// ─────────────────────────────────────────────────────────────────────────────
//  Page payload — the JSON blob persisted in `user_pages.data`.
//
//  This mirrors the persisted slice of the Zustand builder store
//  (src/store/builderStore.ts). The shape is loose by design: each block's
//  `data` field varies by block type, so we validate the top-level structure
//  and let block-specific validation live on the client (which is the source
//  of truth for block shape).
//
//  Importable from BOTH client and server — no Supabase / no `auth()` here.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

const BlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.string().min(1),
    visible: z.boolean(),
    data: z.record(z.string(), z.unknown()),
  })
  .passthrough();

const ProfileSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    bio: z.string(),
    image: z.string().nullable(),
    handle: z.string(),
  })
  .passthrough();

export const PagePayloadSchema = z
  .object({
    profile: ProfileSchema,
    blocks: z.array(BlockSchema),
    appearance: z.record(z.string(), z.unknown()).optional(),
    settings: z.record(z.string(), z.unknown()).optional(),
    savedBlocks: z.array(BlockSchema).optional(),
    savedPalettes: z.array(z.unknown()).optional(),
    recentColors: z.array(z.string()).optional(),
    selectedTheme: z.string().optional(),
    onboardingStep: z.number().optional(),
    previewMode: z.string().optional(),
    activeTab: z.string().optional(),
  })
  .passthrough();

export type PagePayload = z.infer<typeof PagePayloadSchema>;
