"use client";

/**
 * Universal Color Picker
 * ─────────────────────
 * Provides <ColorSwatch> and <ColorInput> for use anywhere in the app.
 * Clicking a swatch opens a rich popover with:
 *   • react-colorful saturation/hue picker
 *   • Hex + RGB channel inputs
 *   • 40 curated preset colors
 *   • Recent colors (persisted in Zustand store)
 *   • Saved color palettes (backend: Zustand + localStorage)
 */

import {
  useState, useRef, useEffect, useCallback, ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Check, BookmarkPlus, Trash2, ChevronDown } from "lucide-react";
import { useBuilderStore } from "../../store/builderStore";
import { toast } from "sonner";

// ─── Styles for react-colorful ────────────────────────────────────────────────
// We inject the necessary styles inline so no CSS import is needed.
const COLORFUL_STYLES = `
.react-colorful { width: 100% !important; height: 160px !important; border-radius: 10px; overflow: hidden; }
.react-colorful__saturation { border-radius: 8px 8px 0 0 !important; flex: 1; }
.react-colorful__last-control { border-radius: 0 0 8px 8px !important; }
.react-colorful__hue { height: 14px !important; border-radius: 6px !important; }
.react-colorful__hue-pointer,
.react-colorful__saturation-pointer { width: 18px !important; height: 18px !important; border: 2px solid #fff !important; box-shadow: 0 1px 4px rgba(0,0,0,0.5) !important; }
`;

// ─── Preset palette ───────────────────────────────────────────────────────────
const PRESETS: string[][] = [
  ["#000000", "#171717", "#404040", "#737373", "#a3a3a3", "#d4d4d4", "#f5f5f5", "#ffffff"],
  ["#7f1d1d", "#b91c1c", "#ef4444", "#fca5a5", "#7c2d12", "#c2410c", "#f97316", "#fed7aa"],
  ["#713f12", "#a16207", "#f59e0b", "#fde68a", "#14532d", "#15803d", "#22c55e", "#bbf7d0"],
  ["#164e63", "#0e7490", "#06b6d4", "#a5f3fc", "#1e3a8a", "#1d4ed8", "#3b82f6", "#bfdbfe"],
  ["#312e81", "#4338ca", "#6366f1", "#c7d2fe", "#581c87", "#7c3aed", "#8b5cf6", "#ddd6fe"],
  ["#500724", "#be185d", "#ec4899", "#fbcfe8", "#4a044e", "#a21caf", "#a855f7", "#f5d0fe"],
];

// ─── Utilities ────────────────────────────────────────────────────────────────
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, "");
  if (clean.length !== 6) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
}

function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

function normalizeHex(hex: string): string {
  if (hex.startsWith("#")) return hex;
  return "#" + hex;
}

// ─── Picker popover panel ─────────────────────────────────────────────────────
interface PanelProps {
  value: string;
  onChange: (hex: string) => void;
  onClose: () => void;
  anchorRect: DOMRect;
}

function PickerPanel({ value, onChange, onClose, anchorRect }: PanelProps) {
  const safeVal = isValidHex(value) ? value : "#6366f1";
  const [localColor, setLocalColor] = useState(safeVal);
  const [hexInput, setHexInput] = useState(safeVal);
  const [rgbInput, setRgbInput] = useState(() => hexToRgb(safeVal) || { r: 99, g: 102, b: 241 });
  const [copied, setCopied] = useState(false);
  const [showPalettes, setShowPalettes] = useState(false);
  const [paletteName, setPaletteName] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  // Resolve the portal target on the client only. `document` doesn't exist
  // during SSR, so reading it at render time would crash the server render.
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  const { recentColors, addRecentColor, savedPalettes, savePalette, deletePalette, appearance } = useBuilderStore();

  const PANEL_W = 272;
  const PANEL_H = 560;

  // ── Computed position ──
  const pos = (() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top = anchorRect.bottom + 8;
    if (top + PANEL_H > vh - 8) top = anchorRect.top - PANEL_H - 8;
    if (top < 8) top = 8;
    let left = anchorRect.left;
    if (left + PANEL_W > vw - 8) left = vw - PANEL_W - 8;
    if (left < 8) left = 8;
    return { top, left };
  })();

  // ── Sync local state when value changes externally ──
  useEffect(() => {
    if (isValidHex(value) && value !== localColor) {
      setLocalColor(value);
      setHexInput(value);
      setRgbInput(hexToRgb(value) || { r: 0, g: 0, b: 0 });
    }
  }, [value]);

  // ── Escape key closes ──
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  // ── Core color change (called by any input) ──
  const commit = useCallback((hex: string) => {
    if (!isValidHex(hex)) return;
    setLocalColor(hex);
    setHexInput(hex);
    setRgbInput(hexToRgb(hex) || { r: 0, g: 0, b: 0 });
    onChange(hex);
    addRecentColor(hex);
  }, [onChange, addRecentColor]);

  const handlePickerChange = (hex: string) => {
    // react-colorful gives lowercase hex
    const h = hex.startsWith("#") ? hex : "#" + hex;
    setLocalColor(h);
    setHexInput(h);
    setRgbInput(hexToRgb(h) || { r: 0, g: 0, b: 0 });
    onChange(h);
  };

  const handlePickerChangeEnd = () => {
    addRecentColor(localColor);
  };

  const handleHexInput = (raw: string) => {
    let v = raw;
    if (!v.startsWith("#")) v = "#" + v.replace(/#/g, "");
    setHexInput(v);
    if (isValidHex(v)) commit(v);
  };

  const handleRgbInput = (ch: "r" | "g" | "b", raw: string) => {
    const num = Math.max(0, Math.min(255, parseInt(raw) || 0));
    const next = { ...rgbInput, [ch]: num };
    setRgbInput(next);
    const hex = rgbToHex(next.r, next.g, next.b);
    setLocalColor(hex);
    setHexInput(hex);
    onChange(hex);
    addRecentColor(hex);
  };

  const copyHex = () => {
    navigator.clipboard.writeText(localColor);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Color copied!");
  };

  const handleSavePalette = () => {
    if (!paletteName.trim()) return;
    // Save the 3 brand colors + current color as a palette
    const colors = [
      appearance.accentColor,
      appearance.bgColor,
      appearance.textColor,
      localColor,
    ].filter((c, i, a) => a.indexOf(c) === i).slice(0, 6);
    savePalette(paletteName.trim(), colors);
    setPaletteName("");
    toast.success(`Palette "${paletteName.trim()}" saved!`);
  };

  const rgb = hexToRgb(localColor) || { r: 0, g: 0, b: 0 };

  // Don't render anything until we have a client-side portal target.
  if (!portalTarget) return null;

  return createPortal(
    <>
      {/* Style injection */}
      <style>{COLORFUL_STYLES}</style>

      {/* Backdrop */}
      <div className="fixed inset-0 z-[9990]" onClick={onClose} />

      {/* Panel */}
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.92, y: -6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -6 }}
        transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
        className="fixed z-[9999] bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
        style={{ top: pos.top, left: pos.left, width: PANEL_W }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── react-colorful ── */}
        <div className="p-3 pb-2">
          <HexColorPicker
            color={localColor}
            onChange={handlePickerChange}
            onMouseUp={handlePickerChangeEnd}
          />
        </div>

        {/* ── Hex + copy + swatch ── */}
        <div className="px-3 pb-2 flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg border border-zinc-700 flex-shrink-0"
            style={{ backgroundColor: localColor }}
          />
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexInput(e.target.value)}
            onBlur={() => { if (!isValidHex(hexInput)) setHexInput(localColor); }}
            maxLength={7}
            spellCheck={false}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono uppercase tracking-wider focus:outline-none focus:border-indigo-500 min-w-0"
            placeholder="#000000"
          />
          <button
            onClick={copyHex}
            title="Copy hex"
            className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 flex items-center justify-center transition-colors flex-shrink-0"
          >
            {copied
              ? <Check className="w-3.5 h-3.5 text-green-400" />
              : <Copy className="w-3.5 h-3.5 text-zinc-400" />
            }
          </button>
        </div>

        {/* ── RGB channels ── */}
        <div className="px-3 pb-3 grid grid-cols-3 gap-1.5">
          {(["r", "g", "b"] as const).map((ch) => (
            <div key={ch} className="flex flex-col gap-0.5">
              <span className="text-[9px] text-zinc-600 uppercase text-center tracking-widest">{ch}</span>
              <input
                type="number"
                value={rgb[ch]}
                min={0}
                max={255}
                onChange={(e) => handleRgbInput(ch, e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-1 py-1.5 text-xs text-zinc-200 text-center focus:outline-none focus:border-indigo-500 [appearance:textfield]"
              />
            </div>
          ))}
        </div>

        {/* ── Preset grid ── */}
        <div className="px-3 pb-2">
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-2">Colors</p>
          <div className="space-y-1">
            {PRESETS.map((row, ri) => (
              <div key={ri} className="flex gap-1">
                {row.map((c) => (
                  <button
                    key={c}
                    onClick={() => commit(c)}
                    title={c}
                    className="flex-1 h-6 rounded-md transition-all hover:scale-110 hover:z-10 relative"
                    style={{
                      backgroundColor: c,
                      outline: localColor.toLowerCase() === c.toLowerCase() ? "2px solid white" : "none",
                      outlineOffset: 1,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent colors ── */}
        {recentColors.length > 0 && (
          <div className="px-3 pb-2">
            <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1.5">Recent</p>
            <div className="flex gap-1 flex-wrap">
              {recentColors.slice(0, 8).map((c, i) => (
                <button
                  key={`${c}-${i}`}
                  onClick={() => commit(c)}
                  title={c}
                  className="w-6 h-6 rounded-md transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: localColor.toLowerCase() === c.toLowerCase() ? "2px solid white" : "1px solid #3f3f46",
                    outlineOffset: 1,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Saved palettes ── */}
        <div className="border-t border-zinc-800">
          <button
            onClick={() => setShowPalettes(!showPalettes)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-800/50 transition-colors"
          >
            <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Palettes</span>
            <ChevronDown className={`w-3 h-3 text-zinc-600 transition-transform ${showPalettes ? "rotate-180" : ""}`} />
          </button>

          {showPalettes && (
            <div className="px-3 pb-3 space-y-2">
              {/* Save new palette */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={paletteName}
                  onChange={(e) => setPaletteName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSavePalette()}
                  placeholder="Palette name…"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 min-w-0"
                />
                <button
                  onClick={handleSavePalette}
                  disabled={!paletteName.trim()}
                  className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-white" />
                </button>
              </div>

              {/* Palette list */}
              {savedPalettes.length === 0 ? (
                <p className="text-[10px] text-zinc-700 text-center py-1">No palettes saved yet</p>
              ) : (
                <div className="space-y-1.5 max-h-28 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                  {savedPalettes.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 group">
                      <div className="flex gap-0.5 flex-1">
                        {p.colors.slice(0, 6).map((c, i) => (
                          <button
                            key={i}
                            onClick={() => commit(c)}
                            title={c}
                            className="h-5 flex-1 rounded transition-all hover:scale-105"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] text-zinc-600 truncate max-w-[48px]">{p.name}</span>
                      <button
                        onClick={() => { deletePalette(p.id); toast.success("Palette deleted"); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3 h-3 text-zinc-600 hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>,
    portalTarget
  );
}

// ─── ColorSwatch (universal trigger) ─────────────────────────────────────────
interface SwatchProps {
  value: string;
  onChange: (hex: string) => void;
  /** Tailwind sizing class, default "w-7 h-7" */
  className?: string;
  shape?: "square" | "circle";
  disabled?: boolean;
}

export function ColorSwatch({
  value, onChange, className = "w-7 h-7", shape = "square", disabled = false,
}: SwatchProps) {
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (disabled || !triggerRef.current) return;
    setAnchorRect(triggerRef.current.getBoundingClientRect());
    setOpen(true);
  };

  const safeVal = isValidHex(value) ? value : "#6366f1";

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleClick}
        disabled={disabled}
        title={`Color: ${safeVal}`}
        className={[
          "border-2 border-zinc-700 hover:border-indigo-500 transition-all flex-shrink-0",
          "hover:scale-105 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          shape === "circle" ? "rounded-full" : "rounded-lg",
          className,
        ].join(" ")}
        style={{ backgroundColor: safeVal }}
      />
      <AnimatePresence>
        {open && anchorRect && (
          <PickerPanel
            value={safeVal}
            onChange={onChange}
            onClose={() => setOpen(false)}
            anchorRect={anchorRect}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── ColorInput (swatch + hex text field) ─────────────────────────────────────
interface ColorInputProps {
  value: string;
  onChange: (hex: string) => void;
}

export function ColorInput({ value, onChange }: ColorInputProps) {
  const [textVal, setTextVal] = useState(value);

  // Keep text in sync with external value
  useEffect(() => {
    if (isValidHex(value)) setTextVal(value);
  }, [value]);

  const handleText = (raw: string) => {
    const v = normalizeHex(raw);
    setTextVal(v);
    if (isValidHex(v)) onChange(v);
  };

  return (
    <div className="flex items-center gap-2">
      <ColorSwatch
        value={value}
        onChange={(hex) => { onChange(hex); setTextVal(hex); }}
      />
      <input
        type="text"
        value={textVal}
        onChange={(e) => handleText(e.target.value)}
        onBlur={() => { if (!isValidHex(textVal)) setTextVal(isValidHex(value) ? value : "#000000"); }}
        maxLength={7}
        spellCheck={false}
        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300 font-mono uppercase tracking-wide focus:outline-none focus:border-indigo-500 min-w-0"
      />
    </div>
  );
}

// ─── ColorPill (label above + large swatch) ───────────────────────────────────
interface ColorPillProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

export function ColorPill({ label, value, onChange }: ColorPillProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-zinc-600">{label}</span>
      <ColorSwatch value={value} onChange={onChange} className="w-9 h-9 rounded-xl" />
    </div>
  );
}
