"use client";

import { motion, AnimatePresence } from "motion/react";
import { useBuilderStore } from "../../store/builderStore";
import { X, Check } from "lucide-react";

// ─── Theme definitions (shared) ───────────────────────────────────────────────
export interface ThemeDef {
  id: string;
  name: string;
  description: string;
  bg: string;
  text: string;
  accent: string;
  buttonStyle: "rounded" | "sharp" | "pill";
  bgType: "flat" | "gradient";
  gradientAngle: number;
  bgColor2: string;
  bgColor3: string;
  tag?: string;
}

export const THEMES: ThemeDef[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean white canvas",
    bg: "#ffffff", text: "#111111", accent: "#111111",
    buttonStyle: "rounded", bgType: "flat",
    gradientAngle: 135, bgColor2: "#f3f4f6", bgColor3: "#e5e7eb",
    tag: "Light",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Sleek dark mode",
    bg: "#0a0a0a", text: "#f5f5f5", accent: "#a855f7",
    buttonStyle: "rounded", bgType: "flat",
    gradientAngle: 135, bgColor2: "#1a1a2e", bgColor3: "#16213e",
    tag: "Dark",
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool blue gradient",
    bg: "#0f1f3d", text: "#e2e8f0", accent: "#38bdf8",
    buttonStyle: "pill", bgType: "gradient",
    gradientAngle: 160, bgColor2: "#1e3a5f", bgColor3: "#1e3a8a",
    tag: "Gradient",
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange glow",
    bg: "#1a0800", text: "#fef3e2", accent: "#f97316",
    buttonStyle: "pill", bgType: "gradient",
    gradientAngle: 150, bgColor2: "#7c2d12", bgColor3: "#881337",
    tag: "Gradient",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Nature & calm",
    bg: "#052e16", text: "#dcfce7", accent: "#4ade80",
    buttonStyle: "rounded", bgType: "gradient",
    gradientAngle: 160, bgColor2: "#064e3b", bgColor3: "#134e4a",
    tag: "Gradient",
  },
  {
    id: "neon",
    name: "Neon",
    description: "Vibrant & electric",
    bg: "#09090b", text: "#fafafa", accent: "#22d3ee",
    buttonStyle: "sharp", bgType: "flat",
    gradientAngle: 135, bgColor2: "#0e7490", bgColor3: "#0284c7",
    tag: "Dark",
  },
  {
    id: "lavender",
    name: "Lavender",
    description: "Soft & elegant",
    bg: "#faf5ff", text: "#4a044e", accent: "#a855f7",
    buttonStyle: "pill", bgType: "gradient",
    gradientAngle: 140, bgColor2: "#f3e8ff", bgColor3: "#fdf4ff",
    tag: "Light",
  },
  {
    id: "sand",
    name: "Sand",
    description: "Warm & minimal",
    bg: "#fef9f0", text: "#292524", accent: "#d97706",
    buttonStyle: "rounded", bgType: "flat",
    gradientAngle: 135, bgColor2: "#fef3c7", bgColor3: "#fde68a",
    tag: "Light",
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Northern lights",
    bg: "#030712", text: "#f0fdf4", accent: "#34d399",
    buttonStyle: "pill", bgType: "gradient",
    gradientAngle: 135, bgColor2: "#064e3b", bgColor3: "#1e3a5f",
    tag: "Dark",
  },
  {
    id: "rose",
    name: "Rose",
    description: "Romantic & soft",
    bg: "#fff1f2", text: "#881337", accent: "#f43f5e",
    buttonStyle: "pill", bgType: "gradient",
    gradientAngle: 140, bgColor2: "#ffe4e6", bgColor3: "#fecdd3",
    tag: "Light",
  },
  {
    id: "slate",
    name: "Slate",
    description: "Professional & clean",
    bg: "#0f172a", text: "#e2e8f0", accent: "#64748b",
    buttonStyle: "rounded", bgType: "flat",
    gradientAngle: 135, bgColor2: "#1e293b", bgColor3: "#334155",
    tag: "Dark",
  },
  {
    id: "copper",
    name: "Copper",
    description: "Rich & metallic",
    bg: "#1c0a00", text: "#fef3e2", accent: "#b45309",
    buttonStyle: "rounded", bgType: "gradient",
    gradientAngle: 145, bgColor2: "#431407", bgColor3: "#7c2d12",
    tag: "Dark",
  },
];

// ─── Mini theme card preview (uses actual user data) ──────────────────────────
function ThemeCard({
  theme,
  selected,
  onSelect,
}: {
  theme: ThemeDef;
  selected: boolean;
  onSelect: () => void;
}) {
  const { profile } = useBuilderStore();
  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() || "AM";
  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || "Alex Morgan";
  const bio = profile.bio || "Designer & Developer";

  const bg =
    theme.bgType === "gradient"
      ? `linear-gradient(${theme.gradientAngle}deg, ${theme.bg}, ${theme.bgColor2}, ${theme.bgColor3})`
      : theme.bg;

  const btnRadius =
    theme.buttonStyle === "pill"
      ? "9999px"
      : theme.buttonStyle === "sharp"
      ? "2px"
      : "8px";

  const tagColors: Record<string, string> = {
    Light:    "bg-zinc-100 text-zinc-600",
    Dark:     "bg-zinc-800 text-zinc-300",
    Gradient: "bg-indigo-900/60 text-indigo-300",
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-200 group ${
        selected
          ? "border-indigo-500 shadow-xl shadow-indigo-500/25"
          : "border-zinc-800 hover:border-zinc-600"
      }`}
    >
      {/* Mini phone preview */}
      <div
        className="h-52 flex flex-col items-center pt-5 px-3 gap-2 overflow-hidden"
        style={{ background: bg }}
      >
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center border-2 flex-shrink-0"
          style={{
            backgroundColor: `${theme.accent}20`,
            borderColor: `${theme.accent}40`,
            color: theme.accent,
            fontSize: 14,
          }}
        >
          {profile.image ? (
            <img src={profile.image} alt="" className="w-full h-full object-cover rounded-full" />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Name & Bio */}
        <div className="text-center">
          <p style={{ color: theme.text, fontSize: 11 }} className="font-medium leading-tight truncate max-w-[120px]">
            {fullName}
          </p>
          <p style={{ color: theme.text, fontSize: 9, opacity: 0.55, lineHeight: 1.4 }} className="mt-0.5 truncate max-w-[120px]">
            {bio}
          </p>
        </div>

        {/* Social dots */}
        <div className="flex gap-2 mt-0.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${theme.accent}25`, color: theme.accent }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent, opacity: 0.8 }} />
            </div>
          ))}
        </div>

        {/* Link buttons */}
        <div className="flex flex-col gap-1.5 w-full mt-1">
          {[0.95, 0.75, 0.55].map((op, i) => (
            <div
              key={i}
              className="w-full h-5 flex items-center px-2"
              style={{
                backgroundColor: theme.accent,
                borderRadius: btnRadius,
                opacity: op,
              }}
            >
              <div className="w-2 h-2 rounded-full bg-white/40 mr-1.5" />
              <div className="h-1.5 rounded-full bg-white/60 flex-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Card footer */}
      <div className="bg-zinc-900 px-3 py-2.5 flex items-center justify-between border-t border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-white">{theme.name}</p>
            {theme.tag && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tagColors[theme.tag] || ""}`}>
                {theme.tag}
              </span>
            )}
          </div>
          <p className="text-[10px] text-zinc-500 mt-0.5">{theme.description}</p>
        </div>
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
            selected ? "bg-indigo-500" : "bg-zinc-800 group-hover:bg-zinc-700"
          }`}
        >
          {selected ? (
            <Check className="w-3.5 h-3.5 text-white" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-zinc-600 group-hover:bg-zinc-400" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ThemeBrowserModalProps {
  open: boolean;
  onClose: () => void;
}

export function ThemeBrowserModal({ open, onClose }: ThemeBrowserModalProps) {
  const { selectedTheme, setTheme, setAppearance } = useBuilderStore();

  const handleSelect = (theme: ThemeDef) => {
    setTheme(theme.id);
    setAppearance({
      bgColor: theme.bg,
      textColor: theme.text,
      accentColor: theme.accent,
      buttonStyle: theme.buttonStyle,
      bgType: theme.bgType,
      bgColor2: theme.bgColor2,
      bgColor3: theme.bgColor3,
      gradientAngle: theme.gradientAngle,
      bgGradient: theme.bgType === "gradient",
      gradientEnd: theme.bgColor2,
    });
  };

  return (
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-4 top-8 bottom-8 md:inset-x-16 lg:inset-x-32 xl:inset-x-48 z-50 bg-zinc-950 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 flex-shrink-0">
              <div>
                <h2 className="text-white">Browse Themes</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {THEMES.length} themes available · Previewing with your actual content
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid */}
            <div
              className="flex-1 overflow-y-auto p-6"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {THEMES.map((theme, i) => (
                  <motion.div
                    key={theme.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                  >
                    <ThemeCard
                      theme={theme}
                      selected={selectedTheme === theme.id}
                      onSelect={() => handleSelect(theme)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <p className="text-xs text-zinc-500">
                Changes apply instantly to your preview
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
