"use client";

import { useState, useRef, ReactNode } from "react";
import { useBuilderStore } from "../../store/builderStore";
import { ThemeBrowserModal } from "./ThemeBrowserModal";
import { ColorInput, ColorSwatch, ColorPill } from "../ui/ColorPicker";
import {
  Sparkles, Layers, Zap, Menu as MenuIcon, ChevronDown,
  Palette, Type, Layout, Image, Wand2,
  ArrowUp, BoxSelect, LayoutGrid, SlidersHorizontal, Minus,
  FileText, WrapText, Map, Square, Film, CreditCard, AlignCenter,
  Star, Clock, PlayCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
// (block styles use Record<string, string | number | boolean> inline)

// ─── Constants ────────────────────────────────────────────────────────────────
const BORDER_TYPES  = ["None", "Solid", "Dashed", "Dotted", "Double"];
const ALIGN_OPTIONS = ["Left", "Center", "Right"];
const SHADOW_TYPES  = ["None", "Soft", "Medium", "Hard", "Elevated"];
const TYPOGRAPHY_FONTS = [
  "Outfit", "Inter", "Plus Jakarta Sans", "DM Sans", "Space Grotesk",
  "Nunito", "Lato", "Montserrat", "Open Sans", "Poppins", "Raleway",
  "Roboto Mono", "Playfair Display", "Merriweather", "Pacifico",
];
const ANIMATION_OPTIONS = [
  { value: "none",         label: "None"        },
  { value: "slide-up",    label: "Slide Up"    },
  { value: "slide-down",  label: "Slide Down"  },
  { value: "slide-left",  label: "Slide Left"  },
  { value: "slide-right", label: "Slide Right" },
  { value: "fade-in",     label: "Fade In"     },
  { value: "scale-up",    label: "Scale Up"    },
  { value: "scale-down",  label: "Scale Down"  },
];
const ACCENT_COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#ef4444",
  "#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#111111",
];
const BUTTON_STYLES = [
  { id: "rounded", label: "Rounded", radius: "8px"   },
  { id: "pill",    label: "Pill",    radius: "9999px" },
  { id: "sharp",   label: "Sharp",   radius: "2px"    },
] as const;

// ─── Accordion Section ────────────────────────────────────────────────────────
interface SectionProps {
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}
function Section({ icon: Icon, iconColor = "text-indigo-400", title, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800/50 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <span className="text-sm text-zinc-200 flex-1 text-left">{title}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-zinc-800 px-4 py-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Sub-group label (within a section) ──────────────────────────────────────
function SubGroup({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-1 pb-0.5">
      <div className="h-px flex-1 bg-zinc-800" />
      <span className="text-[10px] text-zinc-600 uppercase tracking-wider px-1">{label}</span>
      <div className="h-px flex-1 bg-zinc-800" />
    </div>
  );
}

// ─── Row wrappers ─────────────────────────────────────────────────────────────
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-zinc-400 flex-shrink-0 min-w-[80px]">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─── Range slider ─────────────────────────────────────────────────────────────
function SliderInput({ value, onChange, min = 0, max = 100, step = 1, unit = "" }: {
  value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; unit?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-2">
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right,#6366f1 ${pct}%,#3f3f46 ${pct}%)` }}
      />
      <span className="text-xs text-zinc-400 w-9 text-right flex-shrink-0 tabular-nums">{value}{unit}</span>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${value ? "bg-indigo-500" : "bg-zinc-700"}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full mx-0.5 transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

// ─── Block divider heading ────────────────────────────────────────────────────
function BlockHeading() {
  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <div className="h-px flex-1 bg-zinc-800" />
      <div className="flex items-center gap-2">
        <LayoutGrid className="w-3 h-3 text-zinc-500" />
        <span className="text-xs text-zinc-500 uppercase tracking-widest">Block</span>
      </div>
      <div className="h-px flex-1 bg-zinc-800" />
    </div>
  );
}

// ─── Main Panel ──────────────────────────────────────────────────────────────
export function AppearancePanel() {
  const { appearance, setAppearance } = useBuilderStore();
  const [themeBrowserOpen, setThemeBrowserOpen] = useState(false);
  const bgImageRef = useRef<HTMLInputElement>(null);

  // Block-style helpers
  const bs = (block: string, key: string, def: string | number | boolean): string | number | boolean =>
    (appearance.blockStyles?.[block]?.[key]) ?? def;

  const setBs = (block: string, key: string, val: string | number | boolean) =>
    setAppearance({
      blockStyles: {
        ...appearance.blockStyles,
        [block]: { ...(appearance.blockStyles?.[block] || {}), [key]: val },
      },
    });

  // Theme swatch style — use longhand props only so React doesn't warn about
  // mixing the `background` shorthand with `backgroundSize`/`backgroundPosition`.
  const themeBgStyle: React.CSSProperties =
    appearance.bgType === "gradient"
      ? {
          backgroundImage: `linear-gradient(${appearance.gradientAngle}deg,${appearance.bgColor},${appearance.bgColor2},${appearance.bgColor3})`,
          backgroundSize: "cover",
        }
      : appearance.bgType === "image" && appearance.bgImageUrl
      ? {
          backgroundImage: `url(${appearance.bgImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { backgroundColor: appearance.bgColor };

  // Typed helpers
  const sbs  = (block: string, key: string, def: string)  => bs(block, key, def) as string;
  const nbs  = (block: string, key: string, def: number)  => bs(block, key, def) as number;
  const bbs  = (block: string, key: string, def: boolean) => bs(block, key, def) as boolean;

  return (
    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-sm text-white">Appearance</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Customize the look of your page</p>
      </div>

      <div className="p-3 space-y-2">

        {/* ══ GENERAL ══ */}
        <Section icon={Sparkles} iconColor="text-indigo-400" title="General" defaultOpen>
          {/* Theme row */}
          <div className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg border border-zinc-700 flex-shrink-0"
                style={themeBgStyle} />
              <div>
                <p className="text-xs text-zinc-200">Theme</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Tap to browse</p>
              </div>
            </div>
            <button onClick={() => setThemeBrowserOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs transition-colors flex-shrink-0">
              <Wand2 className="w-3 h-3" />Browse themes
            </button>
          </div>

          {/* Accent Color */}
          <div>
            <div className="flex items-center gap-1.5 mb-2"><Palette className="w-3 h-3 text-zinc-500" /><span className="text-xs text-zinc-400">Accent Color</span></div>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {ACCENT_COLORS.map((c) => (
                <button key={c} onClick={() => setAppearance({ accentColor: c })}
                  className={`aspect-square rounded-lg border-2 transition-all ${appearance.accentColor === c ? "border-white scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-600">Custom</span>
              <ColorSwatch
                value={appearance.accentColor}
                onChange={(v) => setAppearance({ accentColor: v })}
                className="w-9 h-9 rounded-xl flex-shrink-0"
              />
              <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs font-mono text-zinc-400 uppercase">
                {appearance.accentColor}
              </div>
            </div>
          </div>

          {/* Text Color */}
          <div>
            <div className="flex items-center gap-1.5 mb-2"><Type className="w-3 h-3 text-zinc-500" /><span className="text-xs text-zinc-400">Text Color</span></div>
            <div className="flex items-center gap-2 mb-2">
              <ColorSwatch
                value={appearance.textColor}
                onChange={(v) => setAppearance({ textColor: v })}
                className="w-9 h-9 rounded-xl flex-shrink-0"
              />
              <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs font-mono text-zinc-400 uppercase">
                {appearance.textColor}
              </div>
            </div>
            <div className="flex gap-2">
              {["#ffffff","#f5f5f5","#111111","#1e293b"].map((c) => (
                <button key={c} onClick={() => setAppearance({ textColor: c })}
                  className={`w-7 h-7 rounded-lg border-2 transition-all ${appearance.textColor === c ? "border-indigo-500" : "border-zinc-700"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          {/* Button Style */}
          <div>
            <div className="flex items-center gap-1.5 mb-2"><Layout className="w-3 h-3 text-zinc-500" /><span className="text-xs text-zinc-400">Button Style</span></div>
            <div className="grid grid-cols-3 gap-2">
              {BUTTON_STYLES.map((s) => (
                <button key={s.id} onClick={() => setAppearance({ buttonStyle: s.id })}
                  className={`flex flex-col items-center gap-1.5 py-2 px-1 border rounded-xl transition-all ${appearance.buttonStyle === s.id ? "border-indigo-500 bg-indigo-500/10" : "border-zinc-700 hover:border-zinc-600"}`}>
                  <div className="w-full h-5" style={{ backgroundColor: appearance.accentColor, borderRadius: s.radius }} />
                  <span className="text-[10px] text-zinc-400">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

        </Section>

        {/* ══ SCROLL-TO-TOP BUTTON ══ */}
        <Section icon={ArrowUp} iconColor="text-sky-400" title="Scroll-to-top Button">
          <Row label="Show button">
            <div className="flex items-center justify-end">
              <Toggle value={appearance.scrollToTop} onChange={(v) => setAppearance({ scrollToTop: v })} />
            </div>
          </Row>
          {appearance.scrollToTop && (
            <div className="bg-zinc-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: appearance.accentColor }}>
                <ArrowUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-zinc-300">↑ button appears bottom-right</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">Visible when scrolled down</p>
              </div>
            </div>
          )}
        </Section>

        {/* ══ SHADOW ══ */}
        <Section icon={BoxSelect} iconColor="text-slate-400" title="Shadow">
          <Row label="Type">
            <SelectInput value={appearance.shadowType} onChange={(v) => setAppearance({ shadowType: v })} options={SHADOW_TYPES} />
          </Row>
          <Row label="Color">
            <ColorInput value={appearance.shadowColor} onChange={(v) => setAppearance({ shadowColor: v })} />
          </Row>
        </Section>

        {/* ══ TYPOGRAPHY ══ */}
        <Section icon={Type} iconColor="text-rose-400" title="Typography">
          <Row label="Font">
            <SelectInput
              value={appearance.typographyFont}
              onChange={(v) => setAppearance({ typographyFont: v })}
              options={TYPOGRAPHY_FONTS}
            />
          </Row>
          <div className="bg-zinc-800 rounded-xl p-3">
            <p className="text-xs text-zinc-400 mb-1">Preview</p>
            <p className="text-sm text-zinc-200" style={{ fontFamily: appearance.typographyFont }}>
              The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </Section>

        {/* ══ BACKGROUND ══ */}
        <Section icon={Layers} iconColor="text-purple-400" title="Background">
          <Row label="Type">
            <SelectInput
              value={appearance.bgType === "flat" ? "Flat Color" : appearance.bgType === "gradient" ? "Gradient Color" : "Image"}
              onChange={(v) => {
                const map: Record<string, "flat" | "gradient" | "image"> = {
                  "Flat Color": "flat", "Gradient Color": "gradient", "Image": "image",
                };
                setAppearance({ bgType: map[v] ?? "flat" });
              }}
              options={["Flat Color", "Gradient Color", "Image"]}
            />
          </Row>
          {appearance.bgType !== "image" && (
            <div>
              <span className="text-xs text-zinc-500 block mb-2">Colors</span>
              <div className="flex items-end gap-4">
                <ColorPill label="Color 1" value={appearance.bgColor} onChange={(v) => setAppearance({ bgColor: v })} />
                {appearance.bgType === "gradient" && (
                  <>
                    <ColorPill label="Color 2" value={appearance.bgColor2} onChange={(v) => setAppearance({ bgColor2: v })} />
                    <ColorPill label="Color 3" value={appearance.bgColor3} onChange={(v) => setAppearance({ bgColor3: v })} />
                  </>
                )}
                <div className="flex-1 h-9 rounded-xl border border-zinc-700 min-w-0"
                  style={{ background: appearance.bgType === "gradient"
                    ? `linear-gradient(${appearance.gradientAngle}deg,${appearance.bgColor},${appearance.bgColor2},${appearance.bgColor3})`
                    : appearance.bgColor }} />
              </div>
            </div>
          )}
          {appearance.bgType === "image" && (
            <div>
              <span className="text-xs text-zinc-500 block mb-2">Background Image</span>
              <div className="flex gap-2">
                <input type="url" value={appearance.bgImageUrl} onChange={(e) => setAppearance({ bgImageUrl: e.target.value })}
                  placeholder="https://..." className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500" />
                <button onClick={() => bgImageRef.current?.click()} className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors">
                  <Image className="w-3.5 h-3.5 text-zinc-400" />
                </button>
                <input ref={bgImageRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setAppearance({ bgImageUrl: URL.createObjectURL(f) }); }} />
              </div>
              {appearance.bgImageUrl && <div className="mt-2 h-16 rounded-xl border border-zinc-700 overflow-hidden"
                style={{ backgroundImage: `url(${appearance.bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />}
            </div>
          )}
          {appearance.bgType === "gradient" && (
            <Row label="Angle"><SliderInput value={appearance.gradientAngle} onChange={(v) => setAppearance({ gradientAngle: v })} min={0} max={360} unit="°" /></Row>
          )}
          <Row label="Brightness"><SliderInput value={appearance.brightness} onChange={(v) => setAppearance({ brightness: v })} min={-10} max={10} /></Row>
          <Row label="Blur"><SliderInput value={appearance.blur} onChange={(v) => setAppearance({ blur: v })} min={0} max={10} step={0.5} /></Row>
          <Row label="Noise"><div className="flex justify-end"><Toggle value={appearance.noise} onChange={(v) => setAppearance({ noise: v })} /></div></Row>
        </Section>

        {/* ══ ANIMATION ══ */}
        <Section icon={Zap} iconColor="text-amber-400" title="Animation">
          <Row label="Style">
            <SelectInput
              value={ANIMATION_OPTIONS.find(o => o.value === appearance.animation)?.label ?? "Slide Up"}
              onChange={(label) => {
                const opt = ANIMATION_OPTIONS.find(o => o.label === label);
                if (opt) setAppearance({ animation: opt.value });
              }}
              options={ANIMATION_OPTIONS.map((o) => o.label)}
            />
          </Row>
          <div className="bg-zinc-800 rounded-xl p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${appearance.accentColor}20` }}>
              <Sparkles className="w-4 h-4" style={{ color: appearance.accentColor }} />
            </div>
            <div>
              <p className="text-xs text-zinc-300">
                {appearance.animation === "none" || appearance.animation === "None"
                  ? "No animation — blocks appear instantly"
                  : `Blocks enter with "${appearance.animation}" effect`}
              </p>
              <p className="text-[10px] text-zinc-600 mt-0.5">Applied when your page loads</p>
            </div>
          </div>
        </Section>

        {/* ══ MENU BUTTON ══ */}
        <Section icon={MenuIcon} iconColor="text-emerald-400" title="Menu Button">
          <Row label="Show menu button">
            <div className="flex justify-end"><Toggle value={appearance.showMenuButton} onChange={(v) => setAppearance({ showMenuButton: v })} /></div>
          </Row>
          {appearance.showMenuButton && (
            <div className="bg-zinc-800 rounded-xl p-3 space-y-2">
              <p className="text-xs text-zinc-300">Hamburger menu visible at top-right of your page</p>
              <div className="rounded-xl p-3 flex items-center justify-between" style={{ backgroundColor: `${appearance.bgColor}` }}>
                <div className="flex flex-col gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-0.5 rounded-full" style={{ width: i === 1 ? 14 : 18, backgroundColor: appearance.textColor, opacity: 0.8 }} />
                  ))}
                </div>
                <span className="text-[10px]" style={{ color: appearance.textColor, opacity: 0.5 }}>Menu preview</span>
              </div>
              <p className="text-[10px] text-zinc-600">Nav items: Home · About · Links · Contact</p>
            </div>
          )}
        </Section>

        {/* ══════════ BLOCK heading ══════════ */}
        <BlockHeading />

        {/* ── Accordion ── */}
        <Section icon={SlidersHorizontal} iconColor="text-indigo-400" title="Accordion">
          <Row label="Background"><ColorInput value={sbs("accordion","bgColor","#ffffff")} onChange={(v) => setBs("accordion","bgColor",v)} /></Row>
          <Row label="Label color"><ColorInput value={sbs("accordion","labelColor","#111111")} onChange={(v) => setBs("accordion","labelColor",v)} /></Row>
          <Row label="Description"><ColorInput value={sbs("accordion","descColor","#888888")} onChange={(v) => setBs("accordion","descColor",v)} /></Row>
          <Row label="Icon color"><ColorInput value={sbs("accordion","iconColor","#6366f1")} onChange={(v) => setBs("accordion","iconColor",v)} /></Row>
          <Row label="Border type"><SelectInput value={sbs("accordion","borderType","Solid")} onChange={(v) => setBs("accordion","borderType",v)} options={BORDER_TYPES} /></Row>
          <Row label="Border color"><ColorInput value={sbs("accordion","borderColor","#e5e7eb")} onChange={(v) => setBs("accordion","borderColor",v)} /></Row>
          <Row label="Border width"><SliderInput value={nbs("accordion","borderWidth",1)} onChange={(v) => setBs("accordion","borderWidth",v)} min={0} max={8} unit="px" /></Row>
          <Row label="Roundness"><SliderInput value={nbs("accordion","cornerRadius",12)} onChange={(v) => setBs("accordion","cornerRadius",v)} min={0} max={32} unit="px" /></Row>
          <Row label="Shadow"><div className="flex justify-end"><Toggle value={bbs("accordion","shadow",false)} onChange={(v) => setBs("accordion","shadow",v)} /></div></Row>
        </Section>

        {/* ── Button ── */}
        <Section icon={Square} iconColor="text-violet-400" title="Button">
          <Row label="Alignment"><SelectInput value={sbs("button","alignment","Center")} onChange={(v) => setBs("button","alignment",v)} options={ALIGN_OPTIONS} /></Row>
          <Row label="Background"><ColorInput value={sbs("button","bgColor","#6366f1")} onChange={(v) => setBs("button","bgColor",v)} /></Row>
          <Row label="Label color"><ColorInput value={sbs("button","labelColor","#ffffff")} onChange={(v) => setBs("button","labelColor",v)} /></Row>
          <Row label="Description"><ColorInput value={sbs("button","descColor","#e0e7ff")} onChange={(v) => setBs("button","descColor",v)} /></Row>
          <Row label="Border type"><SelectInput value={sbs("button","borderType","None")} onChange={(v) => setBs("button","borderType",v)} options={BORDER_TYPES} /></Row>
          <Row label="Border color"><ColorInput value={sbs("button","borderColor","#4f46e5")} onChange={(v) => setBs("button","borderColor",v)} /></Row>
          <Row label="Border width"><SliderInput value={nbs("button","borderWidth",0)} onChange={(v) => setBs("button","borderWidth",v)} min={0} max={8} unit="px" /></Row>
          <Row label="Roundness"><SliderInput value={nbs("button","cornerRadius",12)} onChange={(v) => setBs("button","cornerRadius",v)} min={0} max={32} unit="px" /></Row>
          <Row label="Shadow"><div className="flex justify-end"><Toggle value={bbs("button","shadow",false)} onChange={(v) => setBs("button","shadow",v)} /></div></Row>
        </Section>

        {/* ── Card ── */}
        <Section icon={CreditCard} iconColor="text-cyan-400" title="Card">
          <Row label="Background"><ColorInput value={sbs("card","bgColor","#ffffff")} onChange={(v) => setBs("card","bgColor",v)} /></Row>
          <Row label="Border type"><SelectInput value={sbs("card","borderType","None")} onChange={(v) => setBs("card","borderType",v)} options={BORDER_TYPES} /></Row>
          <Row label="Border color"><ColorInput value={sbs("card","borderColor","#e5e7eb")} onChange={(v) => setBs("card","borderColor",v)} /></Row>
          <Row label="Border width"><SliderInput value={nbs("card","borderWidth",0)} onChange={(v) => setBs("card","borderWidth",v)} min={0} max={8} unit="px" /></Row>
          <Row label="Roundness"><SliderInput value={nbs("card","cornerRadius",16)} onChange={(v) => setBs("card","cornerRadius",v)} min={0} max={32} unit="px" /></Row>
          <Row label="Shadow"><div className="flex justify-end"><Toggle value={bbs("card","shadow",false)} onChange={(v) => setBs("card","shadow",v)} /></div></Row>
        </Section>

        {/* ── Carousel ── */}
        <Section icon={Film} iconColor="text-pink-400" title="Carousel">
          <Row label="Btn background"><ColorInput value={sbs("carousel","btnBgColor","#ffffff")} onChange={(v) => setBs("carousel","btnBgColor",v)} /></Row>
          <Row label="Btn icon color"><ColorInput value={sbs("carousel","btnIconColor","#111111")} onChange={(v) => setBs("carousel","btnIconColor",v)} /></Row>
          <Row label="Btn border type"><SelectInput value={sbs("carousel","btnBorderType","None")} onChange={(v) => setBs("carousel","btnBorderType",v)} options={BORDER_TYPES} /></Row>
          <Row label="Btn border color"><ColorInput value={sbs("carousel","btnBorderColor","#e5e7eb")} onChange={(v) => setBs("carousel","btnBorderColor",v)} /></Row>
          <Row label="Btn border width"><SliderInput value={nbs("carousel","btnBorderWidth",0)} onChange={(v) => setBs("carousel","btnBorderWidth",v)} min={0} max={8} unit="px" /></Row>
          <Row label="Btn radius"><SliderInput value={nbs("carousel","btnBorderRadius",9999)} onChange={(v) => setBs("carousel","btnBorderRadius",v)} min={0} max={9999} unit="px" /></Row>
          <Row label="Btn shadow"><div className="flex justify-end"><Toggle value={bbs("carousel","btnShadow",false)} onChange={(v) => setBs("carousel","btnShadow",v)} /></div></Row>
          <Row label="Indicator"><ColorInput value={sbs("carousel","indicatorColor","#6366f1")} onChange={(v) => setBs("carousel","indicatorColor",v)} /></Row>
        </Section>

        {/* ── Divider ── */}
        <Section icon={Minus} iconColor="text-zinc-400" title="Divider">
          <Row label="Line color"><ColorInput value={sbs("divider","lineColor","#e5e7eb")} onChange={(v) => setBs("divider","lineColor",v)} /></Row>
        </Section>

        {/* ── File ── */}
        <Section icon={FileText} iconColor="text-orange-400" title="File">
          <Row label="Alignment"><SelectInput value={sbs("file","alignment","Center")} onChange={(v) => setBs("file","alignment",v)} options={ALIGN_OPTIONS} /></Row>
          <Row label="Background"><ColorInput value={sbs("file","bgColor","#f3f4f6")} onChange={(v) => setBs("file","bgColor",v)} /></Row>
          <Row label="Label color"><ColorInput value={sbs("file","labelColor","#111111")} onChange={(v) => setBs("file","labelColor",v)} /></Row>
          <Row label="Description"><ColorInput value={sbs("file","descColor","#888888")} onChange={(v) => setBs("file","descColor",v)} /></Row>
          <Row label="Icon color"><ColorInput value={sbs("file","iconColor","#6366f1")} onChange={(v) => setBs("file","iconColor",v)} /></Row>
          <Row label="Border type"><SelectInput value={sbs("file","borderType","None")} onChange={(v) => setBs("file","borderType",v)} options={BORDER_TYPES} /></Row>
          <Row label="Border color"><ColorInput value={sbs("file","borderColor","#e5e7eb")} onChange={(v) => setBs("file","borderColor",v)} /></Row>
          <Row label="Border width"><SliderInput value={nbs("file","borderWidth",0)} onChange={(v) => setBs("file","borderWidth",v)} min={0} max={8} unit="px" /></Row>
          <Row label="Roundness"><SliderInput value={nbs("file","cornerRadius",12)} onChange={(v) => setBs("file","cornerRadius",v)} min={0} max={32} unit="px" /></Row>
          <Row label="Shadow"><div className="flex justify-end"><Toggle value={bbs("file","shadow",false)} onChange={(v) => setBs("file","shadow",v)} /></div></Row>
        </Section>

        {/* ── Form ── */}
        <Section icon={WrapText} iconColor="text-teal-400" title="Form">
          <SubGroup label="Input Fields" />
          <Row label="Label color"><ColorInput value={sbs("form","inputLabelColor","#111111")} onChange={(v) => setBs("form","inputLabelColor",v)} /></Row>
          <Row label="Text color"><ColorInput value={sbs("form","inputTextColor","#111111")} onChange={(v) => setBs("form","inputTextColor",v)} /></Row>
          <Row label="Background"><ColorInput value={sbs("form","inputBgColor","#f9fafb")} onChange={(v) => setBs("form","inputBgColor",v)} /></Row>
          <Row label="Border type"><SelectInput value={sbs("form","inputBorderType","Solid")} onChange={(v) => setBs("form","inputBorderType",v)} options={BORDER_TYPES} /></Row>
          <Row label="Border color"><ColorInput value={sbs("form","inputBorderColor","#e5e7eb")} onChange={(v) => setBs("form","inputBorderColor",v)} /></Row>
          <Row label="Focus border"><ColorInput value={sbs("form","inputFocusBorderColor","#6366f1")} onChange={(v) => setBs("form","inputFocusBorderColor",v)} /></Row>
          <Row label="Border width"><SliderInput value={nbs("form","inputBorderWidth",1)} onChange={(v) => setBs("form","inputBorderWidth",v)} min={0} max={8} unit="px" /></Row>
          <Row label="Roundness"><SliderInput value={nbs("form","inputCornerRadius",8)} onChange={(v) => setBs("form","inputCornerRadius",v)} min={0} max={32} unit="px" /></Row>
          <Row label="Shadow"><div className="flex justify-end"><Toggle value={bbs("form","inputShadow",false)} onChange={(v) => setBs("form","inputShadow",v)} /></div></Row>

          <SubGroup label="Button" />
          <Row label="Text color"><ColorInput value={sbs("form","formBtnTextColor","#ffffff")} onChange={(v) => setBs("form","formBtnTextColor",v)} /></Row>
          <Row label="Background"><ColorInput value={sbs("form","formBtnBgColor","#6366f1")} onChange={(v) => setBs("form","formBtnBgColor",v)} /></Row>
          <Row label="Border type"><SelectInput value={sbs("form","formBtnBorderType","None")} onChange={(v) => setBs("form","formBtnBorderType",v)} options={BORDER_TYPES} /></Row>
          <Row label="Border color"><ColorInput value={sbs("form","formBtnBorderColor","#4f46e5")} onChange={(v) => setBs("form","formBtnBorderColor",v)} /></Row>
          <Row label="Border width"><SliderInput value={nbs("form","formBtnBorderWidth",0)} onChange={(v) => setBs("form","formBtnBorderWidth",v)} min={0} max={8} unit="px" /></Row>
          <Row label="Roundness"><SliderInput value={nbs("form","formBtnCornerRadius",8)} onChange={(v) => setBs("form","formBtnCornerRadius",v)} min={0} max={32} unit="px" /></Row>
          <Row label="Shadow"><div className="flex justify-end"><Toggle value={bbs("form","formBtnShadow",false)} onChange={(v) => setBs("form","formBtnShadow",v)} /></div></Row>
        </Section>

        {/* ── Map ── */}
        <Section icon={Map} iconColor="text-green-400" title="Map">
          <Row label="Roundness"><SliderInput value={nbs("map","cornerRadius",12)} onChange={(v) => setBs("map","cornerRadius",v)} min={0} max={32} unit="px" /></Row>
          <Row label="Shadow"><div className="flex justify-end"><Toggle value={bbs("map","shadow",false)} onChange={(v) => setBs("map","shadow",v)} /></div></Row>
        </Section>

        {/* ── Photo ── */}
        <Section icon={Image} iconColor="text-sky-400" title="Photo">
          <Row label="Title color"><ColorInput value={sbs("photo","titleColor","#111111")} onChange={(v) => setBs("photo","titleColor",v)} /></Row>
          <Row label="Description"><ColorInput value={sbs("photo","descColor","#888888")} onChange={(v) => setBs("photo","descColor",v)} /></Row>
          <Row label="Roundness"><SliderInput value={nbs("photo","cornerRadius",12)} onChange={(v) => setBs("photo","cornerRadius",v)} min={0} max={32} unit="px" /></Row>
          <Row label="Shadow"><div className="flex justify-end"><Toggle value={bbs("photo","shadow",false)} onChange={(v) => setBs("photo","shadow",v)} /></div></Row>
        </Section>

        {/* ── Popup ── */}
        <Section icon={LayoutGrid} iconColor="text-fuchsia-400" title="Popup">
          <SubGroup label="Trigger Button" />
          <Row label="Alignment"><SelectInput value={sbs("popup","alignment","Center")} onChange={(v) => setBs("popup","alignment",v)} options={ALIGN_OPTIONS} /></Row>
          <Row label="Background"><ColorInput value={sbs("popup","bgColor","#6366f1")} onChange={(v) => setBs("popup","bgColor",v)} /></Row>
          <Row label="Label color"><ColorInput value={sbs("popup","labelColor","#ffffff")} onChange={(v) => setBs("popup","labelColor",v)} /></Row>
          <Row label="Description"><ColorInput value={sbs("popup","descColor","#e0e7ff")} onChange={(v) => setBs("popup","descColor",v)} /></Row>
          <Row label="Border type"><SelectInput value={sbs("popup","borderType","None")} onChange={(v) => setBs("popup","borderType",v)} options={BORDER_TYPES} /></Row>
          <Row label="Border color"><ColorInput value={sbs("popup","borderColor","#4f46e5")} onChange={(v) => setBs("popup","borderColor",v)} /></Row>
          <Row label="Border width"><SliderInput value={nbs("popup","borderWidth",0)} onChange={(v) => setBs("popup","borderWidth",v)} min={0} max={8} unit="px" /></Row>
          <Row label="Roundness"><SliderInput value={nbs("popup","cornerRadius",12)} onChange={(v) => setBs("popup","cornerRadius",v)} min={0} max={32} unit="px" /></Row>
          <Row label="Shadow"><div className="flex justify-end"><Toggle value={bbs("popup","shadow",false)} onChange={(v) => setBs("popup","shadow",v)} /></div></Row>

          <SubGroup label="Popup Window" />
          <Row label="Background"><ColorInput value={sbs("popup","popupBgColor","#ffffff")} onChange={(v) => setBs("popup","popupBgColor",v)} /></Row>
          <Row label="Title color"><ColorInput value={sbs("popup","popupTitleColor","#111111")} onChange={(v) => setBs("popup","popupTitleColor",v)} /></Row>
          <Row label="Roundness"><SliderInput value={nbs("popup","popupCornerRadius",16)} onChange={(v) => setBs("popup","popupCornerRadius",v)} min={0} max={32} unit="px" /></Row>
          <Row label="Close button"><ColorInput value={sbs("popup","popupCloseBtnColor","#888888")} onChange={(v) => setBs("popup","popupCloseBtnColor",v)} /></Row>
        </Section>

        {/* ── Profile ── */}
        <Section icon={AlignCenter} iconColor="text-indigo-400" title="Profile">
          <Row label="Alignment"><SelectInput value={sbs("profile","alignment","Center")} onChange={(v) => setBs("profile","alignment",v)} options={ALIGN_OPTIONS} /></Row>
          <Row label="Text color"><ColorInput value={sbs("profile","textColor","#111111")} onChange={(v) => setBs("profile","textColor",v)} /></Row>
          <Row label="Photo border"><SelectInput value={sbs("profile","photoBorderType","None")} onChange={(v) => setBs("profile","photoBorderType",v)} options={BORDER_TYPES} /></Row>
          <Row label="Border color"><ColorInput value={sbs("profile","photoBorderColor","#6366f1")} onChange={(v) => setBs("profile","photoBorderColor",v)} /></Row>
          <Row label="Border width"><SliderInput value={nbs("profile","photoBorderWidth",0)} onChange={(v) => setBs("profile","photoBorderWidth",v)} min={0} max={8} unit="px" /></Row>
          <Row label="Roundness"><SliderInput value={nbs("profile","photoRoundness",9999)} onChange={(v) => setBs("profile","photoRoundness",v)} min={0} max={9999} unit="px" /></Row>
          <Row label="Shadow"><div className="flex justify-end"><Toggle value={bbs("profile","photoShadow",false)} onChange={(v) => setBs("profile","photoShadow",v)} /></div></Row>
        </Section>

        {/* ── Social ── */}
        <Section icon={Sparkles} iconColor="text-blue-400" title="Social">
          <Row label="Alignment"><SelectInput value={sbs("social","alignment","Center")} onChange={(v) => setBs("social","alignment",v)} options={ALIGN_OPTIONS} /></Row>
          <Row label="Icon color"><ColorInput value={sbs("social","iconColor","#6366f1")} onChange={(v) => setBs("social","iconColor",v)} /></Row>
        </Section>

        {/* ── Testimonial ── */}
        <Section icon={Star} iconColor="text-yellow-400" title="Testimonial">
          <Row label="Alignment"><SelectInput value={sbs("testimonial","alignment","Left")} onChange={(v) => setBs("testimonial","alignment",v)} options={ALIGN_OPTIONS} /></Row>
          <Row label="Primary text"><ColorInput value={sbs("testimonial","primaryTextColor","#111111")} onChange={(v) => setBs("testimonial","primaryTextColor",v)} /></Row>
          <Row label="Secondary text"><ColorInput value={sbs("testimonial","secondaryTextColor","#888888")} onChange={(v) => setBs("testimonial","secondaryTextColor",v)} /></Row>
          <Row label="Paragraph"><ColorInput value={sbs("testimonial","paragraphColor","#444444")} onChange={(v) => setBs("testimonial","paragraphColor",v)} /></Row>
          <Row label="Stars color"><ColorInput value={sbs("testimonial","starsColor","#f59e0b")} onChange={(v) => setBs("testimonial","starsColor",v)} /></Row>
          <Row label="Photo border"><SelectInput value={sbs("testimonial","photoBorderType","None")} onChange={(v) => setBs("testimonial","photoBorderType",v)} options={BORDER_TYPES} /></Row>
          <Row label="Border color"><ColorInput value={sbs("testimonial","photoBorderColor","#6366f1")} onChange={(v) => setBs("testimonial","photoBorderColor",v)} /></Row>
          <Row label="Border width"><SliderInput value={nbs("testimonial","photoBorderWidth",0)} onChange={(v) => setBs("testimonial","photoBorderWidth",v)} min={0} max={8} unit="px" /></Row>
          <Row label="Roundness"><SliderInput value={nbs("testimonial","photoRoundness",9999)} onChange={(v) => setBs("testimonial","photoRoundness",v)} min={0} max={9999} unit="px" /></Row>
          <Row label="Shadow"><div className="flex justify-end"><Toggle value={bbs("testimonial","photoShadow",false)} onChange={(v) => setBs("testimonial","photoShadow",v)} /></div></Row>
        </Section>

        {/* ── Text ── */}
        <Section icon={Type} iconColor="text-zinc-400" title="Text">
          <Row label="Text color"><ColorInput value={sbs("text","textColor","#111111")} onChange={(v) => setBs("text","textColor",v)} /></Row>
          <Row label="Link color"><ColorInput value={sbs("text","linkColor","#6366f1")} onChange={(v) => setBs("text","linkColor",v)} /></Row>
          <Row label="Highlight bg"><ColorInput value={sbs("text","highlightBg","#fef9c3")} onChange={(v) => setBs("text","highlightBg",v)} /></Row>
          <Row label="Code bg"><ColorInput value={sbs("text","codeBg","#f3f4f6")} onChange={(v) => setBs("text","codeBg",v)} /></Row>
        </Section>

        {/* ── Timeline ── */}
        <Section icon={Clock} iconColor="text-amber-400" title="Timeline">
          <Row label="Bullet color"><ColorInput value={sbs("timeline","bulletColor","#6366f1")} onChange={(v) => setBs("timeline","bulletColor",v)} /></Row>
          <Row label="Line color"><ColorInput value={sbs("timeline","lineColor","#e5e7eb")} onChange={(v) => setBs("timeline","lineColor",v)} /></Row>
          <Row label="Title color"><ColorInput value={sbs("timeline","titleColor","#111111")} onChange={(v) => setBs("timeline","titleColor",v)} /></Row>
          <Row label="Description"><ColorInput value={sbs("timeline","descColor","#888888")} onChange={(v) => setBs("timeline","descColor",v)} /></Row>
          <Row label="Date color"><ColorInput value={sbs("timeline","dateColor","#9ca3af")} onChange={(v) => setBs("timeline","dateColor",v)} /></Row>
        </Section>

        {/* ── Video ── */}
        <Section icon={PlayCircle} iconColor="text-red-400" title="Video">
          <Row label="Roundness"><SliderInput value={nbs("video","cornerRadius",12)} onChange={(v) => setBs("video","cornerRadius",v)} min={0} max={32} unit="px" /></Row>
          <Row label="Shadow"><div className="flex justify-end"><Toggle value={bbs("video","shadow",false)} onChange={(v) => setBs("video","shadow",v)} /></div></Row>
        </Section>

      </div>

      {/* Theme Browser Modal */}
      <ThemeBrowserModal open={themeBrowserOpen} onClose={() => setThemeBrowserOpen(false)} />
    </div>
  );
}