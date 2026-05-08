"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useBuilderStore } from "../store/builderStore";
import { BlockRenderer } from "../components/preview/BlockRenderer";
import { ArrowUp, X, Menu as MenuIcon, Zap } from "lucide-react";
import { Lock, Mail, ArrowLeft } from "lucide-react";

// ─── Shared anim variants (matches PhoneCanvas) ────────────────────────────
type Variant = { opacity?: number; y?: number; x?: number; scale?: number };
const ANIM_VARIANTS: Record<string, { initial: Variant; animate: Variant }> = {
  "slide-up":    { initial: { opacity: 0, y: 24 },     animate: { opacity: 1, y: 0 }     },
  "slide-down":  { initial: { opacity: 0, y: -24 },    animate: { opacity: 1, y: 0 }     },
  "slide-left":  { initial: { opacity: 0, x: 24 },     animate: { opacity: 1, x: 0 }     },
  "slide-right": { initial: { opacity: 0, x: -24 },    animate: { opacity: 1, x: 0 }     },
  "fade-in":     { initial: { opacity: 0 },             animate: { opacity: 1 }           },
  "scale-up":    { initial: { opacity: 0, scale: 0.82 }, animate: { opacity: 1, scale: 1 } },
  "scale-down":  { initial: { opacity: 0, scale: 1.18 }, animate: { opacity: 1, scale: 1 } },
  "none":        { initial: {},                          animate: {}                       },
};

const NOISE_URL =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

// ─── Locked Screen ────────────────────────────────────────────────────────────
function LockedScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg tracking-tight">EZ<span className="text-indigo-400">.to</span></span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", damping: 20, stiffness: 200 }}
        className="relative z-10 flex flex-col items-center text-center max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", damping: 12 }}
          className="mb-8"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shadow-2xl">
              <Lock className="w-10 h-10 text-zinc-400" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-3xl border border-indigo-500/30"
            />
          </div>
        </motion.div>

        <div className="space-y-3 mb-8">
          <h1 className="text-3xl tracking-tight">Page is locked</h1>
          <p className="text-zinc-400 leading-relaxed">
            This page is currently locked. The owner has restricted access.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2 mb-8">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          <span className="text-sm text-zinc-400">Access Restricted</span>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <a
            href="mailto:support@ez.to"
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
          <button
            onClick={() => window.history.length > 1 ? window.history.back() : window.close()}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>

      <div className="absolute bottom-6 flex items-center gap-1.5 text-xs text-zinc-600">
        <span>Powered by</span>
        <span className="text-zinc-400">EZ.to</span>
      </div>
    </div>
  );
}

// ─── Navigation Menu ──────────────────────────────────────────────────────────
function NavMenu({
  open,
  onClose,
  textColor,
  accentColor,
  bg,
}: {
  open: boolean;
  onClose: () => void;
  textColor: string;
  accentColor: string;
  bg: string;
}) {
  const navItems = ["Home", "About", "Links", "Contact"];
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-72 z-50 flex flex-col shadow-2xl"
            style={{ background: bg }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: `${textColor}15` }}>
              <span style={{ color: textColor }} className="font-medium">Menu</span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: `${textColor}10` }}
              >
                <X className="w-4 h-4" style={{ color: textColor }} />
              </button>
            </div>

            <nav className="flex-1 px-6 py-6 space-y-1">
              {navItems.map((item, i) => (
                <motion.button
                  key={item}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={onClose}
                  className="w-full text-left py-3 px-3 rounded-xl transition-colors"
                  style={{ color: textColor }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${textColor}08`)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {item}
                </motion.button>
              ))}
            </nav>

            <div className="px-6 pb-8">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-white text-sm font-medium transition-colors"
                style={{ backgroundColor: accentColor }}
              >
                Get in touch
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Actual Page ──────────────────────────────────────────────────────────────
function ActualPage() {
  const { blocks, appearance, profile } = useBuilderStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const visibleBlocks = blocks.filter((b) => b.visible);

  // Resolved font — same logic as PhoneCanvas
  const resolvedFont = appearance.typographyFont || appearance.fontFamily;

  // Load Google Font dynamically
  useEffect(() => {
    const toLoad = [appearance.fontFamily, appearance.typographyFont].filter(Boolean);
    toLoad.forEach(name => {
      const GF_MAP: Record<string, string> = {
        "Outfit":"Outfit:wght@400;500;600;700","Inter":"Inter:wght@400;500;600;700",
        "Plus Jakarta Sans":"Plus+Jakarta+Sans:wght@400;500;600;700",
        "DM Sans":"DM+Sans:wght@400;500;600;700",
        "Space Grotesk":"Space+Grotesk:wght@400;500;600;700",
        "Nunito":"Nunito:wght@400;500;600;700","Lato":"Lato:wght@400;700",
        "Montserrat":"Montserrat:wght@400;500;600;700",
        "Open Sans":"Open+Sans:wght@400;500;600;700",
        "Poppins":"Poppins:wght@400;500;600;700","Raleway":"Raleway:wght@400;500;600;700",
        "Roboto Mono":"Roboto+Mono:wght@400;500;600",
        "Playfair Display":"Playfair+Display:wght@400;600;700",
        "Merriweather":"Merriweather:wght@400;700","Pacifico":"Pacifico",
      };
      if (!name || !GF_MAP[name]) return;
      const id = `gf-${name.replace(/\s+/g, "-").toLowerCase()}`;
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id; link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${GF_MAP[name]}&display=swap`;
      document.head.appendChild(link);
    });
  }, [appearance.fontFamily, appearance.typographyFont]);

  const btnRadius =
    appearance.buttonStyle === "pill"
      ? "9999px"
      : appearance.buttonStyle === "sharp"
      ? "2px"
      : "12px";

  const anim = ANIM_VARIANTS[appearance.animation] ?? ANIM_VARIANTS["slide-up"];

  // Background style
  const bgValue =
    appearance.bgType === "gradient"
      ? `linear-gradient(${appearance.gradientAngle}deg, ${appearance.bgColor}, ${appearance.bgColor2}, ${appearance.bgColor3})`
      : appearance.bgType === "image" && appearance.bgImageUrl
      ? undefined
      : appearance.bgGradient
      ? `linear-gradient(to bottom, ${appearance.bgColor}, ${appearance.gradientEnd})`
      : appearance.bgColor;

  // CSS filter (brightness + blur) — applied to bg layer ONLY
  const bgFilter = (() => {
    const parts: string[] = [];
    if (appearance.brightness !== 0) parts.push(`brightness(${1 + appearance.brightness * 0.08})`);
    if (appearance.blur > 0) parts.push(`blur(${appearance.blur * 0.8}px)`);
    return parts.join(" ") || undefined;
  })();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollTop(el.scrollTop > 300);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* ── Background layer (blur/brightness applied here only) ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          ...(bgValue ? { background: bgValue } : {}),
          ...(appearance.bgType === "image" && appearance.bgImageUrl
            ? { backgroundImage: `url(${appearance.bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : {}),
          filter: bgFilter,
        }}
      />

      {/* ── Noise overlay ── */}
      {appearance.noise && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("${NOISE_URL}")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
            opacity: 0.04,
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* ── Header bar ── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-3"
        style={{ background: `${appearance.bgColor}cc`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${appearance.textColor}10` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-indigo-500 rounded-md flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm" style={{ color: appearance.textColor, opacity: 0.7 }}>
            ez.to/{profile.handle || "alexmorgan"}
          </span>
        </div>

        {appearance.showMenuButton && (
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col gap-1 p-2 rounded-lg transition-colors"
            style={{ color: appearance.textColor }}
            aria-label="Open menu"
          >
            <MenuIcon className="w-5 h-5" style={{ color: appearance.textColor }} />
          </button>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <div
          className="max-w-lg mx-auto px-5 pt-8 pb-20 space-y-3"
          style={{ color: appearance.textColor, fontFamily: resolvedFont }}
        >
          {visibleBlocks.map((block, i) => (
            <motion.div
              key={block.id}
              initial={anim.initial}
              animate={anim.animate}
              transition={{ delay: i * 0.06, duration: 0.35 }}
            >
              <BlockRenderer
                block={block}
                profile={profile}
                appearance={appearance}
                btnRadius={btnRadius}
              />
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs opacity-30 hover:opacity-60 transition-opacity"
            style={{ color: appearance.textColor }}
          >
            <Zap className="w-3 h-3" />
            Built with EZ.to
          </a>
        </div>
      </div>

      {/* ── Scroll-to-top button ── */}
      <AnimatePresence>
        {appearance.scrollToTop && showScrollTop && (
          <motion.button
            key="scroll-top"
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 10 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full shadow-xl flex items-center justify-center transition-opacity hover:opacity-90"
            style={{ backgroundColor: appearance.accentColor }}
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Nav menu ── */}
      <NavMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        textColor={appearance.textColor}
        accentColor={appearance.accentColor}
        bg={
          appearance.bgType === "gradient"
            ? `linear-gradient(${appearance.gradientAngle}deg, ${appearance.bgColor}, ${appearance.bgColor2})`
            : appearance.bgColor
        }
      />
    </div>
  );
}

// ─── Entry point ──────────────────────────────────────────────────────────────
export function PreviewPage() {
  const { settings } = useBuilderStore();
  return settings.isLocked ? <LockedScreen /> : <ActualPage />;
}