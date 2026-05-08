"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useBuilderStore, type BuilderState } from "../../store/builderStore";
import { BlockRenderer } from "../preview/BlockRenderer";
import { X as XIcon } from "lucide-react";

// ─── Animation variants ───────────────────────────────────────────────────────
type Variant = { opacity?: number; y?: number; x?: number; scale?: number };
export const ANIM_VARIANTS: Record<string, { initial: Variant; animate: Variant }> = {
  "slide-up":    { initial: { opacity: 0, y: 18 },     animate: { opacity: 1, y: 0 }     },
  "slide-down":  { initial: { opacity: 0, y: -18 },    animate: { opacity: 1, y: 0 }     },
  "slide-left":  { initial: { opacity: 0, x: 18 },     animate: { opacity: 1, x: 0 }     },
  "slide-right": { initial: { opacity: 0, x: -18 },    animate: { opacity: 1, x: 0 }     },
  "fade-in":     { initial: { opacity: 0 },             animate: { opacity: 1 }           },
  "scale-up":    { initial: { opacity: 0, scale: 0.82 }, animate: { opacity: 1, scale: 1 } },
  "scale-down":  { initial: { opacity: 0, scale: 1.18 }, animate: { opacity: 1, scale: 1 } },
  "none":        { initial: {},                          animate: {}                       },
};

const NOISE_URL =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

function buildBgFilter(brightness: number, blur: number): string | undefined {
  const parts: string[] = [];
  if (brightness !== 0) parts.push(`brightness(${1 + brightness * 0.08})`);
  if (blur > 0)         parts.push(`blur(${blur * 0.6}px)`);
  return parts.length ? parts.join(" ") : undefined;
}

// ─── Hamburger menu overlay ───────────────────────────────────────────────────
function MenuOverlay({ open, onClose, textColor, accentColor, bg }: {
  open: boolean; onClose: () => void;
  textColor: string; accentColor: string; bg: string;
}) {
  const items = ["Home", "About", "Links", "Contact"];
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-0 z-30 flex flex-col"
          style={{ background: bg }}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-4">
            <span style={{ color: textColor, opacity: 0.5, fontSize: 11 }}>Menu</span>
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${textColor}10` }}>
              <XIcon className="w-3.5 h-3.5" style={{ color: textColor }} />
            </button>
          </div>
          <div className="px-5 space-y-1">
            {items.map((item, i) => (
              <motion.div key={item} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="py-3 border-b" style={{ borderColor: `${textColor}10` }}>
                <span style={{ color: textColor, fontSize: 15 }}>{item}</span>
              </motion.div>
            ))}
          </div>
          <div className="px-5 mt-auto pb-8">
            <div className="w-full py-3 rounded-xl text-center text-sm"
              style={{ backgroundColor: accentColor, color: "#fff" }}>
              Get in touch
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Google Fonts loader ──────────────────────────────────────────────────────
const GF_MAP: Record<string, string> = {
  "Outfit":            "Outfit:wght@400;500;600;700",
  "Inter":             "Inter:wght@400;500;600;700",
  "Plus Jakarta Sans": "Plus+Jakarta+Sans:wght@400;500;600;700",
  "DM Sans":           "DM+Sans:wght@400;500;600;700",
  "Space Grotesk":     "Space+Grotesk:wght@400;500;600;700",
  "Nunito":            "Nunito:wght@400;500;600;700",
  "Lato":              "Lato:wght@400;700",
  "Montserrat":        "Montserrat:wght@400;500;600;700",
  "Open Sans":         "Open+Sans:wght@400;500;600;700",
  "Poppins":           "Poppins:wght@400;500;600;700",
  "Raleway":           "Raleway:wght@400;500;600;700",
  "Roboto Mono":       "Roboto+Mono:wght@400;500;600",
  "Playfair Display":  "Playfair+Display:wght@400;600;700",
  "Merriweather":      "Merriweather:wght@400;700",
  "Pacifico":          "Pacifico",
};

function loadGoogleFont(name: string) {
  if (!name || !GF_MAP[name]) return;
  const id = `gf-${name.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id   = id;
  link.rel  = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${GF_MAP[name]}&display=swap`;
  document.head.appendChild(link);
}

// ─── PhoneCanvas ──────────────────────────────────────────────────────────────
export function PhoneCanvas() {
  const { blocks, appearance, profile, previewMode } = useBuilderStore();
  const visibleBlocks = blocks.filter((b) => b.visible);

  // ── Replay animation key ──
  const [animKey, setAnimKey] = useState(0);
  const prevAnimRef = useRef(appearance.animation);
  useEffect(() => {
    if (prevAnimRef.current !== appearance.animation) {
      prevAnimRef.current = appearance.animation;
      setAnimKey(k => k + 1);
    }
  }, [appearance.animation]);

  // ── Load Google Fonts whenever the selection changes ──
  useEffect(() => { loadGoogleFont(appearance.fontFamily);    }, [appearance.fontFamily]);
  useEffect(() => { loadGoogleFont(appearance.typographyFont); }, [appearance.typographyFont]);

  // Resolved font (typographyFont overrides fontFamily when set)
  const resolvedFont = appearance.typographyFont || appearance.fontFamily;

  const btnRadius =
    appearance.buttonStyle === "pill" ? "9999px"
    : appearance.buttonStyle === "sharp" ? "2px"
    : "12px";

  // Background value
  const bgValue =
    appearance.bgType === "gradient"
      ? `linear-gradient(${appearance.gradientAngle}deg,${appearance.bgColor},${appearance.bgColor2 || appearance.gradientEnd},${appearance.bgColor3 || appearance.bgColor2 || appearance.gradientEnd})`
      : appearance.bgType === "image" && appearance.bgImageUrl
      ? undefined
      : appearance.bgGradient
      ? `linear-gradient(to bottom,${appearance.bgColor},${appearance.gradientEnd})`
      : appearance.bgColor;

  const bgFilter = buildBgFilter(appearance.brightness, appearance.blur);
  const anim = ANIM_VARIANTS[appearance.animation] ?? ANIM_VARIANTS["slide-up"];

  const sharedProps = { bgValue, bgImageUrl: appearance.bgType === "image" ? appearance.bgImageUrl : "", btnRadius, visibleBlocks, bgFilter, noise: appearance.noise, anim, showMenuButton: appearance.showMenuButton, textColor: appearance.textColor, accentColor: appearance.accentColor, animKey, resolvedFont };

  return (
    <div className="flex-1 bg-zinc-900/40 flex flex-col items-center justify-start overflow-hidden">
      {/* Canvas — preview mode toggle moved to the footer in BuilderPage.
          pt-4 keeps a 16px breathing space above the device frame. */}
      <div className="flex-1 flex items-start justify-center pt-4 pb-6 overflow-y-auto w-full" style={{ scrollbarWidth: "none" }}>
        <AnimatePresence mode="wait">
          {previewMode === "mobile" ? (
            <motion.div key="mobile" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }}>
              <MobileFrame {...sharedProps} profile={profile} appearance={appearance} />
            </motion.div>
          ) : (
            <motion.div key="web" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }} className="w-full max-w-xl mx-6">
              <WebFrame {...sharedProps} profile={profile} appearance={appearance} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Shared frame props ───────────────────────────────────────────────────────
interface FrameProps {
  bgValue: string | undefined;
  bgImageUrl: string;
  btnRadius: string;
  visibleBlocks: BuilderState["blocks"];
  bgFilter: string | undefined;
  noise: boolean;
  anim: { initial: Variant; animate: Variant };
  showMenuButton: boolean;
  textColor: string;
  accentColor: string;
  profile: BuilderState["profile"];
  appearance: BuilderState["appearance"];
  animKey: number;
  resolvedFont: string;
}

// ─── Mobile frame ─────────────────────────────────────────────────────────────
function MobileFrame({ bgValue, bgImageUrl, btnRadius, visibleBlocks, bgFilter, noise, anim, showMenuButton, textColor, accentColor, profile, appearance, animKey, resolvedFont }: FrameProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const bgStyle: React.CSSProperties = bgValue
    ? { background: bgValue }
    : bgImageUrl
    ? { backgroundImage: `url(${bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundColor: appearance.bgColor };

  const menuBg = appearance.bgType === "gradient"
    ? `linear-gradient(${appearance.gradientAngle}deg,${appearance.bgColor},${appearance.bgColor2})`
    : appearance.bgColor;

  return (
    <div className="relative" style={{ width: 320, minHeight: 640 }}>
      {/* Phone shell */}
      <div className="absolute inset-0 rounded-[48px] bg-zinc-800 shadow-2xl border-4 border-zinc-700" />

      {/* Screen */}
      <div className="relative rounded-[44px] overflow-hidden mx-1 my-1" style={{ minHeight: 630 }}>

        {/* ── Background layer (has blur/brightness filter) ── */}
        <div className="absolute inset-0 pointer-events-none" style={{ ...bgStyle, filter: bgFilter }} />

        {/* ── Noise overlay ── */}
        {noise && (
          <div className="absolute inset-0 pointer-events-none z-[1]"
            style={{ backgroundImage: `url("${NOISE_URL}")`, backgroundRepeat: "repeat", backgroundSize: "128px 128px", opacity: 0.04, mixBlendMode: "overlay" }} />
        )}

        {/* ── Status bar ── */}
        <div className="relative z-[2] flex items-center justify-between px-6 py-2 text-xs"
          style={{ color: textColor }}>
          <span>9:41</span>
          <div className="w-20 h-4 rounded-b-xl" style={{ backgroundColor: `${textColor}08` }} />
          <div className="flex items-center gap-2">
            {showMenuButton && (
              <button onClick={() => setMenuOpen(true)} className="flex flex-col gap-0.5 items-end">
                {[18, 13, 18].map((w, i) => (
                  <div key={i} className="h-0.5 rounded-full" style={{ width: w, backgroundColor: textColor, opacity: 0.8 }} />
                ))}
              </button>
            )}
            <div className="w-4 h-2 rounded-sm border" style={{ borderColor: `${textColor}40` }}>
              <div className="w-2.5 h-full rounded-sm" style={{ backgroundColor: textColor }} />
            </div>
          </div>
        </div>

        {/* ── Content (no filter — text stays sharp) ── */}
        <div className="relative z-[2] overflow-y-auto"
          style={{ color: textColor, fontFamily: resolvedFont, minHeight: 580, scrollbarWidth: "none" as const }}>
          <div className="px-4 pb-8 space-y-3">
            {visibleBlocks.map((block, i) => (
              <motion.div key={`${block.id}-${animKey}`} layout
                initial={anim.initial} animate={anim.animate}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}>
                <BlockRenderer block={block} profile={profile} appearance={appearance} btnRadius={btnRadius} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Menu overlay ── */}
        <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)}
          textColor={textColor} accentColor={accentColor} bg={menuBg} />
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-16 h-1 bg-zinc-600 rounded-full" />
    </div>
  );
}

// ─── Web frame ────────────────────────────────────────────────────────────────
function WebFrame({ bgValue, bgImageUrl, btnRadius, visibleBlocks, bgFilter, noise, anim, showMenuButton, textColor, accentColor, profile, appearance, animKey, resolvedFont }: FrameProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const bgStyle: React.CSSProperties = bgValue
    ? { background: bgValue }
    : bgImageUrl
    ? { backgroundImage: `url(${bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundColor: appearance.bgColor };

  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-700 shadow-xl">
      {/* Browser chrome */}
      <div className="bg-zinc-800 px-4 py-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 bg-zinc-700 rounded-lg px-3 py-1 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-500 flex-shrink-0" />
          <span className="text-xs text-zinc-400">ez.to/{profile.handle || "alexmorgan"}</span>
        </div>
        {showMenuButton && (
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex flex-col gap-0.5 p-1">
            {[14, 10, 14].map((w, i) => (
              <div key={i} className="h-0.5 rounded-full bg-zinc-400" style={{ width: w }} />
            ))}
          </button>
        )}
      </div>

      {/* Page content — let it grow with the blocks; the canvas's outer
          flex-1 overflow-y-auto container (line ~168) handles scrolling.
          Removed the prior `max-h-96 overflow-y-auto` cap so the absolute
          background actually covers the full content height. */}
      <div className="relative">
        {/* Background layer */}
        <div className="absolute inset-0 pointer-events-none" style={{ ...bgStyle, filter: bgFilter }} />

        {noise && (
          <div className="absolute inset-0 pointer-events-none z-[1]"
            style={{ backgroundImage: `url("${NOISE_URL}")`, backgroundRepeat: "repeat", backgroundSize: "128px 128px", opacity: 0.04, mixBlendMode: "overlay" }} />
        )}

        {/* Web menu dropdown */}
        <AnimatePresence>
          {menuOpen && showMenuButton && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="relative z-20 p-3 space-y-1.5 border-b"
              style={{ background: appearance.bgColor, borderColor: `${textColor}15` }}>
              {["Home", "About", "Links", "Contact"].map((item) => (
                <button key={item} onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors"
                  style={{ color: textColor }}>
                  {item}
                </button>
              ))}
              <div className="w-full py-2 rounded-lg text-xs text-center text-white mt-2"
                style={{ backgroundColor: accentColor }}>
                Get in touch
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-[2] max-w-sm mx-auto px-6 py-8 space-y-4"
          style={{ color: textColor, fontFamily: resolvedFont }}>
          {visibleBlocks.map((block, i) => (
            <motion.div key={`${block.id}-${animKey}`} layout
              initial={anim.initial} animate={anim.animate}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}>
              <BlockRenderer block={block} profile={profile} appearance={appearance} btnRadius={btnRadius} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}