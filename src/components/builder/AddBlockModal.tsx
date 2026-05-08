"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useBuilderStore, Block, BlockType } from "../../store/builderStore";
import { toast } from "sonner";
import {
  X,
  Headphones,
  RectangleHorizontal,
  FileDown,
  ListChecks,
  Map,
  Image,
  UserRound,
  Share2,
  Quote,
  Type,
  GitCommitHorizontal,
  Video,
  ChevronsUpDown,
  Square,
  GalleryHorizontal,
  Minus,
  LayoutGrid,
  StretchVertical,
  Plus,
  Link2,
  type LucideIcon,
} from "lucide-react";

// ─── Block Definitions ────────────────────────────────────────────────────────

interface ModalBlockDef {
  type: BlockType | "add-block";
  label: string;
  icon: LucideIcon;
  defaultData: Record<string, unknown>;
}

const CONTENT_BLOCKS: ModalBlockDef[] = [
  { type: "audio",       label: "Audio",       icon: Headphones,         defaultData: { title: "Audio Track", url: "", description: "" } },
  { type: "button",      label: "Button",      icon: RectangleHorizontal,defaultData: { label: "Click Me", url: "https://example.com", description: "" } },
  { type: "file",        label: "File",        icon: FileDown,           defaultData: { name: "Document.pdf", size: "PDF · 1.2 MB", url: "#" } },
  { type: "form",        label: "Form",        icon: ListChecks,         defaultData: { title: "Contact Me", fields: ["name", "email", "message"] } },
  { type: "map",         label: "Map",         icon: Map,                defaultData: { address: "San Francisco, CA", lat: 37.7749, lng: -122.4194 } },
  { type: "photo",       label: "Photo",       icon: Image,              defaultData: { src: "", alt: "", title: "", description: "" } },
  { type: "profile",     label: "Profile",     icon: UserRound,          defaultData: { showAvatar: true, showName: true, showBio: true } },
  { type: "social",      label: "Social",      icon: Share2,             defaultData: { links: [{ platform: "Twitter", url: "https://twitter.com", icon: "twitter" }] } },
  { type: "testimonial", label: "Testimonial", icon: Quote,              defaultData: { quote: "Amazing product!", author: "Happy Customer", role: "Designer" } },
  { type: "text",        label: "Text",        icon: Type,               defaultData: { title: "Text Block", subtitle: "Add your text here..." } },
  { type: "timeline",    label: "Timeline",    icon: GitCommitHorizontal,defaultData: { events: [{ date: "2024", title: "Event" }] } },
  { type: "video",       label: "Video",       icon: Video,              defaultData: { url: "https://youtube.com/watch?v=dQw4w9WgXcQ", title: "My Video" } },
  { type: "link",        label: "Link",        icon: Link2,              defaultData: { label: "My Link", url: "https://example.com", description: "", emoji: "🔗" } },
  // ← Special "Add block" tile at bottom-right of content section
  { type: "add-block",   label: "Add block",   icon: Plus,               defaultData: {} },
];

const LAYOUT_BLOCKS: ModalBlockDef[] = [
  { type: "accordion", label: "Accordion", icon: ChevronsUpDown,   defaultData: { items: [{ title: "Item 1", content: "Content here" }] } },
  { type: "card",      label: "Card",      icon: Square,           defaultData: { title: "Card Title", description: "Card description", image: "" } },
  { type: "carousel",  label: "Carousel",  icon: GalleryHorizontal,defaultData: { images: [{ src: "", caption: "Slide 1" }] } },
  { type: "divider",   label: "Divider",   icon: Minus,            defaultData: { label: "" } },
  { type: "popup",     label: "Popup",     icon: LayoutGrid,       defaultData: { triggerLabel: "Open Popup", mode: "text", content: "Popup message." } },
  { type: "space",     label: "Space",     icon: StretchVertical,  defaultData: { height: 24 } },
];

// ─── Block Grid Tile ──────────────────────────────────────────────────────────
function BlockTile({ def, onClick }: { def: ModalBlockDef; onClick: () => void }) {
  const Icon = def.icon;
  const isSpecial = def.type === "add-block";

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={[
        "flex flex-col items-center justify-center gap-2.5 rounded-2xl py-4 px-2",
        "transition-colors cursor-pointer select-none",
        isSpecial
          ? "bg-zinc-100 hover:bg-zinc-200 border-2 border-dashed border-zinc-300 hover:border-zinc-400"
          : "bg-zinc-100 hover:bg-zinc-200 border-2 border-transparent",
      ].join(" ")}
    >
      <Icon
        className={`w-6 h-6 ${isSpecial ? "text-zinc-400" : "text-zinc-800"}`}
        strokeWidth={1.5}
      />
      <span className={`text-[11px] leading-tight text-center ${isSpecial ? "text-zinc-400" : "text-zinc-700"}`}>
        {def.label}
      </span>
    </motion.button>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
interface AddBlockModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddBlockModal({ open, onClose }: AddBlockModalProps) {
  const addBlock = useBuilderStore((s) => s.addBlock);

  // Resolve the portal target on the client only — `document` doesn't exist
  // during SSR, so reading it at render time would crash the server render
  // even though this component is marked "use client".
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handlePick = (def: ModalBlockDef) => {
    if (def.type === "add-block") {
      // Re-open same modal — clicking "Add block" from inside the modal is a no-op visually
      // so we treat it as adding a blank Link block as a sensible default
      const block: Block = {
        id: `block-link-${Date.now()}`,
        type: "link",
        visible: true,
        data: { label: "New Link", url: "", description: "", emoji: "🔗" },
      };
      addBlock(block);
      toast.success("Link block added!", { description: "Expand it in the Content panel to edit" });
    } else {
      const block: Block = {
        id: `block-${def.type}-${Date.now()}`,
        type: def.type as BlockType,
        visible: true,
        data: { ...def.defaultData },
      };
      addBlock(block);
      toast.success(`${def.label} block added!`, {
        description: "Click ↓ in the Content panel to configure it",
      });
    }
    onClose();
  };

  // Don't render anything until we have a client-side portal target.
  if (!portalTarget) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[1001] inset-0 flex items-center justify-center pointer-events-none p-4"
          >
            <div
              className="pointer-events-auto bg-white rounded-3xl shadow-2xl w-full max-w-[640px] max-h-[88vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
                <h2 className="text-[17px] text-zinc-900">Add block</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4.5 h-4.5" strokeWidth={2} />
                </button>
              </div>

              {/* Scrollable body */}
              <div
                className="flex-1 overflow-y-auto px-6 pb-6"
                style={{ scrollbarWidth: "none" }}
              >
                {/* ── Content section ── */}
                <p className="text-[13px] text-zinc-500 mb-3">Content</p>
                <div className="grid grid-cols-4 gap-2.5 mb-7">
                  {CONTENT_BLOCKS.map((def) => (
                    <BlockTile key={def.type} def={def} onClick={() => handlePick(def)} />
                  ))}
                </div>

                {/* ── Layout section ── */}
                <p className="text-[13px] text-zinc-500 mb-3">Layout</p>
                <div className="grid grid-cols-4 gap-2.5">
                  {LAYOUT_BLOCKS.map((def) => (
                    <BlockTile key={def.type} def={def} onClick={() => handlePick(def)} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    portalTarget
  );
}