"use client";

import { useState } from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "motion/react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { useBuilderStore, Block, BlockType } from "../../store/builderStore";
import { useSyncStatus } from "../../store/syncStatusStore";
import { syncBuilderToServer } from "../../lib/sync";
import { AddBlockModal } from "./AddBlockModal";
import { toast } from "sonner";
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  ListPlus,
  UserRound,
  Share2,
  Type,
  Minus,
  FileDown,
  ListChecks,
  Map,
  Image,
  Quote,
  GitCommitHorizontal,
  Video,
  ChevronsUpDown,
  Square,
  GalleryHorizontal,
  LayoutGrid,
  StretchVertical,
  Link2,
  Headphones,
  RectangleHorizontal,
  ChevronUp,
  ChevronDown,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";

// ─── Icon map per block type ──────────────────────────────────────────────────
const BLOCK_ICONS: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  profile:     UserRound,
  social:      Share2,
  text:        Type,
  divider:     Minus,
  photo:       Image,
  form:        ListChecks,
  map:         Map,
  timeline:    GitCommitHorizontal,
  testimonial: Quote,
  file:        FileDown,
  popup:       LayoutGrid,
  link:        Link2,
  audio:       Headphones,
  button:      RectangleHorizontal,
  video:       Video,
  card:        Square,
  carousel:    GalleryHorizontal,
  accordion:   ChevronsUpDown,
  space:       StretchVertical,
};

const BLOCK_COLORS: Record<BlockType, string> = {
  profile:     "bg-indigo-50 text-indigo-500",
  social:      "bg-pink-50 text-pink-500",
  text:        "bg-emerald-50 text-emerald-500",
  divider:     "bg-zinc-100 text-zinc-400",
  photo:       "bg-amber-50 text-amber-500",
  form:        "bg-cyan-50 text-cyan-500",
  map:         "bg-red-50 text-red-500",
  timeline:    "bg-purple-50 text-purple-500",
  testimonial: "bg-yellow-50 text-yellow-500",
  file:        "bg-green-50 text-green-500",
  popup:       "bg-rose-50 text-rose-500",
  link:        "bg-blue-50 text-blue-500",
  audio:       "bg-violet-50 text-violet-500",
  button:      "bg-orange-50 text-orange-500",
  video:       "bg-red-50 text-red-500",
  card:        "bg-slate-50 text-slate-500",
  carousel:    "bg-fuchsia-50 text-fuchsia-500",
  accordion:   "bg-teal-50 text-teal-500",
  space:       "bg-zinc-100 text-zinc-400",
};

const BLOCK_LABELS: Record<BlockType, string> = {
  profile:     "Profile",
  social:      "Social",
  text:        "Text",
  divider:     "Divider",
  photo:       "Photo",
  form:        "Form",
  map:         "Map",
  timeline:    "Timeline",
  testimonial: "Testimonial",
  file:        "File",
  popup:       "Popup",
  link:        "Link",
  audio:       "Audio",
  button:      "Button",
  video:       "Video",
  card:        "Card",
  carousel:    "Carousel",
  accordion:   "Accordion",
  space:       "Space",
};

// ─── Single block row ─────────────────────────────────────────────────────────
function BlockRow({ block, index, total }: { block: Block; index: number; total: number }) {
  const { toggleBlockVisibility, removeBlock, reorderBlocks } = useBuilderStore();
  const blocks = useBuilderStore((s) => s.blocks);
  const Icon = BLOCK_ICONS[block.type] ?? Type;
  const colorClass = BLOCK_COLORS[block.type] ?? "bg-zinc-100 text-zinc-400";
  const label = BLOCK_LABELS[block.type] ?? block.type;
  const dragControls = useDragControls();

  const moveUp = () => {
    if (index === 0) return;
    const next = [...blocks];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    reorderBlocks(next);
  };

  const moveDown = () => {
    if (index === total - 1) return;
    const next = [...blocks];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    reorderBlocks(next);
  };

  return (
    <Reorder.Item
      value={block}
      dragListener={false}
      dragControls={dragControls}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, height: 0 }}
      transition={{ duration: 0.18 }}
      className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl transition-colors hover:bg-zinc-800/60 ${
        !block.visible ? "opacity-40" : ""
      }`}
    >
      {/* Grip — initiates drag */}
      <button
        type="button"
        onPointerDown={(e) => dragControls.start(e)}
        aria-label="Drag to reorder"
        className="flex-shrink-0 p-0.5 -ml-0.5 rounded text-zinc-700 group-hover:text-zinc-500 cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      {/* Icon */}
      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="w-3 h-3" />
      </div>

      {/* Label */}
      <span className="flex-1 text-xs text-zinc-300 truncate">{label}</span>

      {/* Reorder */}
      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={moveUp}
          disabled={index === 0}
          className="p-0.5 hover:text-white text-zinc-600 disabled:opacity-20 transition-colors"
        >
          <ChevronUp className="w-2.5 h-2.5" />
        </button>
        <button
          onClick={moveDown}
          disabled={index === total - 1}
          className="p-0.5 hover:text-white text-zinc-600 disabled:opacity-20 transition-colors"
        >
          <ChevronDown className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Visibility toggle */}
      <button
        onClick={() => toggleBlockVisibility(block.id)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 transition-all flex-shrink-0"
        title={block.visible ? "Hide block" : "Show block"}
      >
        {block.visible
          ? <Eye className="w-3 h-3" />
          : <EyeOff className="w-3 h-3" />
        }
      </button>

      {/* Delete */}
      <button
        onClick={() => {
          removeBlock(block.id);
          toast.success(`${label} removed`);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all flex-shrink-0"
        title="Remove block"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </Reorder.Item>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export function BlocksSidebar() {
  const [modalOpen, setModalOpen] = useState(false);
  const { blocks, saveSession, discardSession, savedBlocks, reorderBlocks } = useBuilderStore();
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const syncStatus = useSyncStatus((s) => s.status);
  const syncError  = useSyncStatus((s) => s.errorMessage);

  // Dirty-check: compare id+visible fingerprints
  const hasUnsaved = JSON.stringify(blocks.map(b => b.id + b.visible)) !==
                     JSON.stringify(savedBlocks.map(b => b.id + b.visible));

  const handleSave = () => {
    // 1. Snapshot the current blocks locally so Discard reverts to this state.
    saveSession();
    // 2. Push to the server (no-op for guest sessions; setSyncEnabled gates it).
    void syncBuilderToServer();
    toast.success("Changes saved!", { description: `${blocks.length} block(s) saved` });
  };

  const handleDiscard = () => {
    discardSession();
    toast.info("Changes discarded");
  };

  return (
    <>
      <div className="w-56 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col">

        {/* ── Header ── */}
        <div className="px-4 py-3.5 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest">Blocks</p>
            {hasUnsaved && (
              <span className="text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-1.5 py-0.5 rounded-full leading-tight">
                unsaved
              </span>
            )}
          </div>
          <p className="text-[10px] text-zinc-700 mt-0.5">{blocks.length} block{blocks.length !== 1 ? "s" : ""} on page</p>
        </div>

        {/* ── Block list ── */}
        <div
          className="flex-1 overflow-y-auto py-1.5 px-1.5 min-h-0"
          style={{ scrollbarWidth: "none" }}
        >
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <ListPlus className="w-5 h-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">No blocks yet</p>
                <p className="text-[10px] text-zinc-700 mt-0.5">Click "Add block" to start</p>
              </div>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={blocks}
              onReorder={reorderBlocks}
              as="div"
            >
              <AnimatePresence initial={false}>
                {blocks.map((block, i) => (
                  <BlockRow
                    key={block.id}
                    block={block}
                    index={i}
                    total={blocks.length}
                  />
                ))}
              </AnimatePresence>
            </Reorder.Group>
          )}
        </div>

        {/* ── Add block button ── */}
        <div className="px-3 pt-2 pb-1.5 border-t border-zinc-800 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-900 text-xs transition-colors"
          >
            <ListPlus className="w-3.5 h-3.5" />
            <span>Add block</span>
          </motion.button>
        </div>

        {/* ── Sync status indicator (signed-in users only) ──
            Reflects the auto-save state managed by ClerkApiBridge. Hidden
            when idle (no work to display) and when signed out (no server
            sync happens for guest sessions). */}
        {clerkLoaded && isSignedIn && syncStatus !== "idle" && (
          <div className="px-3 pt-1 flex-shrink-0">
            {syncStatus === "saving" && (
              <p className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving…
              </p>
            )}
            {syncStatus === "saved" && (
              <p className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                <Check className="w-3 h-3" />
                Saved to your account
              </p>
            )}
            {syncStatus === "error" && (
              <p
                className="flex items-center gap-1.5 text-[10px] text-red-400"
                title={syncError ?? undefined}
              >
                <AlertCircle className="w-3 h-3" />
                Couldn&apos;t save — retrying on next change
              </p>
            )}
          </div>
        )}

        {/* ── Discard / Save ──
            When signed out, the Save button itself becomes the sign-in CTA
            (primary indigo). This replaces the previous amber warning banner
            which felt visually heavy and redundant. */}
        <div className="px-3 pb-3 pt-1 flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDiscard}
            disabled={!hasUnsaved}
            className="flex-1 py-2 text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-center"
          >
            Discard
          </button>
          {clerkLoaded && !isSignedIn ? (
            <SignInButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs transition-colors text-center cursor-pointer"
              >
                Sign in to save
              </motion.button>
            </SignInButton>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={!hasUnsaved}
              className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-700 border border-zinc-700 text-white text-xs transition-colors text-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      <AddBlockModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}