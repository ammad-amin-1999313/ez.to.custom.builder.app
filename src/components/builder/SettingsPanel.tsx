"use client";

import { useState, useRef, ReactNode } from "react";
import { useBuilderStore } from "../../store/builderStore";
import {
  Globe,
  Lock,
  Search,
  Copy,
  ChevronDown,
  BarChart2,
  Target,
  Music2,
  CreditCard,
  Info,
  Image,
  Save,
  Link2,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

// ─── Accordion Section ────────────────────────────────────────────────────────
interface SettingSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

function SettingSection({
  icon: Icon,
  iconColor = "text-indigo-400",
  title,
  children,
  defaultOpen = false,
}: SettingSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800/50 transition-colors"
      >
        <div className={`w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <span className="text-sm text-zinc-200 flex-1 text-left">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-zinc-800 px-4 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Save Button ──────────────────────────────────────────────────────────────
function SaveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs transition-colors flex-shrink-0"
    >
      <Save className="w-3 h-3" />
      Save
    </button>
  );
}

// ─── Info Tooltip (YouTube-style hover card) ──────────────────────────────────
function InfoCard({ label, title, content }: { label: string; title: string; content: string }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(true);
  };
  const hide = () => {
    timerRef.current = setTimeout(() => setVisible(false), 150);
  };

  return (
    <div className="relative inline-flex">
      <button
        onMouseEnter={show}
        onMouseLeave={hide}
        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-indigo-400 transition-colors"
      >
        <Info className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>

      {visible && (
        <div
          onMouseEnter={show}
          onMouseLeave={hide}
          className="absolute bottom-full left-0 mb-2 w-72 bg-zinc-800 border border-zinc-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
        >
          {/* YouTube-style header bar */}
          <div className="bg-zinc-700/60 px-4 py-2.5 flex items-center gap-2 border-b border-zinc-700">
            <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="text-xs text-zinc-200">{title}</span>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-zinc-400 leading-relaxed">{content}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function SettingsPanel() {
  const { settings, setSettings, profile } = useBuilderStore();

  // Built-in domain local state
  const [builtInDomain, setBuiltInDomain] = useState(
    settings.builtInDomain || `ez.to/${profile.handle || "alexmorgan"}`
  );

  // Custom domain
  const [customDomain, setCustomDomain] = useState(settings.customDomainValue || "");

  // Tracking IDs
  const [gaId, setGaId] = useState(settings.googleAnalyticsId || "");
  const [metaPixel, setMetaPixel] = useState(settings.metaPixelId || "");
  const [tikTokPixel, setTikTokPixel] = useState(settings.tikTokPixelId || "");

  // SEO fields
  const [seoTitle, setSeoTitle] = useState(settings.seoTitle || "");
  const [seoDesc, setSeoDesc] = useState(settings.seoDescription || "");
  const [favicon, setFavicon] = useState(settings.seoFavicon || "");
  const [thumbnail, setThumbnail] = useState(settings.seoThumbnail || "");
  const faviconRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  // vCard
  const [vCardFile, setVCardFile] = useState<File | null>(null);
  const vCardRef = useRef<HTMLInputElement>(null);

  const pageUrl = `https://${builtInDomain || `ez.to/${profile.handle || "alexmorgan"}`}`;

  const handleSave = (key: string, value: unknown, label: string) => {
    setSettings({ [key]: value } as Parameters<typeof setSettings>[0]);
    toast.success(`${label} saved!`);
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error("Favicon must be under 1 MB");
      return;
    }
    const url = URL.createObjectURL(file);
    setFavicon(url);
  };

  const handleVCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVCardFile(file);
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  return (
    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-sm text-white">Settings</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Page configuration & integrations</p>
      </div>

      <div className="p-3 space-y-2.5">

        {/* ── Page Lock (always visible, no accordion) ── */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-200">Page Lock</p>
                <p className="text-xs text-zinc-500 mt-0.5">Prevent public access</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ isLocked: !settings.isLocked })}
              className={`w-10 h-5 rounded-full transition-colors ${settings.isLocked ? "bg-amber-500" : "bg-zinc-700"}`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full mx-0.5 transition-transform ${
                  settings.isLocked ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          {settings.isLocked && (
            <div className="mt-3 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              <Lock className="w-3 h-3 text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-400">Your page is locked. Visitors see a locked screen.</p>
            </div>
          )}
        </div>

        {/* ── Built-in Domain ── */}
        <SettingSection icon={Globe} iconColor="text-indigo-400" title="Built-in Domain" defaultOpen>
          <p className="text-xs text-zinc-500 mb-3">
            Your free EZ.to subdomain. Edit the handle to customise your URL.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
              <span className="text-xs text-zinc-500 pl-3 pr-1 whitespace-nowrap">ez.to/</span>
              <input
                type="text"
                value={builtInDomain.replace(/^ez\.to\//, "")}
                onChange={(e) => setBuiltInDomain(`ez.to/${e.target.value}`)}
                placeholder="yourhandle"
                className="flex-1 bg-transparent py-2 pr-3 text-xs text-zinc-200 focus:outline-none min-w-0"
              />
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(pageUrl);
                toast.success("Link copied!");
              }}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
              title="Copy link"
            >
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
            </button>
            <SaveBtn
              onClick={() => handleSave("builtInDomain", builtInDomain, "Built-in domain")}
            />
          </div>
          <p className="text-xs text-zinc-600 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            {pageUrl}
          </p>
        </SettingSection>

        {/* ── Custom Domain ── */}
        <SettingSection icon={Link2} iconColor="text-purple-400" title="Custom Domain">
          <p className="text-xs text-zinc-500 mb-3">
            Connect your own domain (e.g. <span className="text-zinc-400">mysite.com</span>). Point your DNS CNAME to{" "}
            <span className="text-indigo-400">cname.ez.to</span> first.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="yourdomain.com"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <SaveBtn onClick={() => handleSave("customDomainValue", customDomain, "Custom domain")} />
          </div>
        </SettingSection>

        {/* ── Google Analytics ── */}
        <SettingSection icon={BarChart2} iconColor="text-orange-400" title="Google Analytics">
          <p className="text-xs text-zinc-500 mb-3">
            Paste your Google Analytics 4 Measurement ID (e.g. <span className="text-zinc-400">G-XXXXXXXXXX</span>).
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={gaId}
              onChange={(e) => setGaId(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            />
            <SaveBtn onClick={() => handleSave("googleAnalyticsId", gaId, "Google Analytics ID")} />
          </div>
        </SettingSection>

        {/* ── Meta Pixel ── */}
        <SettingSection icon={Target} iconColor="text-blue-400" title="Meta Pixel">
          <p className="text-xs text-zinc-500 mb-3">
            Add your Meta (Facebook) Pixel ID to track conversions and build retargeting audiences.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={metaPixel}
              onChange={(e) => setMetaPixel(e.target.value)}
              placeholder="1234567890123456"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            />
            <SaveBtn onClick={() => handleSave("metaPixelId", metaPixel, "Meta Pixel ID")} />
          </div>
        </SettingSection>

        {/* ── TikTok Pixel ── */}
        <SettingSection icon={Music2} iconColor="text-pink-400" title="TikTok Pixel">
          <p className="text-xs text-zinc-500 mb-3">
            Add your TikTok Pixel ID to track page events and retarget visitors from TikTok ads.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={tikTokPixel}
              onChange={(e) => setTikTokPixel(e.target.value)}
              placeholder="CXXXXXXXXXXXXXXX"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            />
            <SaveBtn onClick={() => handleSave("tikTokPixelId", tikTokPixel, "TikTok Pixel ID")} />
          </div>
        </SettingSection>

        {/* ── SEO & Metadata ── */}
        <SettingSection icon={Search} iconColor="text-emerald-400" title="SEO & Metadata">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-xs text-zinc-500 block mb-1.5">Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Alex Morgan | Designer & Developer"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-zinc-500 block mb-1.5">Description</label>
              <textarea
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
                rows={2}
                placeholder="A short description that appears in search results…"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Favicon */}
            <div>
              <label className="text-xs text-zinc-500 block mb-1.5">
                Favicon <span className="text-zinc-600">(Max 1 MB · ICO / PNG / SVG)</span>
              </label>
              <div className="flex items-center gap-2">
                {favicon ? (
                  <div className="w-8 h-8 rounded-lg border border-zinc-700 overflow-hidden bg-zinc-800 flex items-center justify-center">
                    <img src={favicon} alt="favicon" className="w-6 h-6 object-contain" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg border border-dashed border-zinc-700 bg-zinc-800 flex items-center justify-center">
                    <Image className="w-3.5 h-3.5 text-zinc-600" />
                  </div>
                )}
                <button
                  onClick={() => faviconRef.current?.click()}
                  className="flex-1 text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 hover:bg-zinc-700 transition-colors text-left"
                >
                  {favicon ? "Change favicon…" : "Choose file…"}
                </button>
                {favicon && (
                  <button
                    onClick={() => setFavicon("")}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-zinc-600 hover:text-red-400" />
                  </button>
                )}
                <input ref={faviconRef} type="file" accept="image/*" className="hidden" onChange={handleFaviconChange} />
              </div>
            </div>

            {/* Thumbnail / OG image */}
            <div>
              <label className="text-xs text-zinc-500 block mb-1.5">
                Thumbnail <span className="text-zinc-600">(OG image · 1200×630 recommended)</span>
              </label>
              <div className="space-y-2">
                {thumbnail && (
                  <div className="w-full h-20 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                    <img src={thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="https://your-image-url.com/og.jpg"
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    onClick={() => thumbRef.current?.click()}
                    className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
                    title="Upload image"
                  >
                    <Image className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                  <input
                    ref={thumbRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setThumbnail(URL.createObjectURL(f));
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Search preview */}
            <div className="bg-zinc-800 rounded-xl p-3 border border-zinc-700">
              <p className="text-xs text-zinc-600 mb-2">Search preview</p>
              <p className="text-xs text-blue-400 leading-tight truncate">{seoTitle || "Page title"}</p>
              <p className="text-xs text-green-500/70 mt-0.5">{pageUrl}</p>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{seoDesc || "Your page description…"}</p>
            </div>

            <div className="flex justify-end">
              <SaveBtn
                onClick={() => {
                  setSettings({
                    seoTitle,
                    seoDescription: seoDesc,
                    seoFavicon: favicon,
                    seoThumbnail: thumbnail,
                  });
                  toast.success("SEO & Metadata saved!");
                }}
              />
            </div>
          </div>
        </SettingSection>

        {/* ── vCard ── */}
        <SettingSection icon={CreditCard} iconColor="text-cyan-400" title="vCard">
          {/* Info rows */}
          <div className="flex flex-col gap-2 mb-4">
            <InfoCard
              label="What's a vCard?"
              title="What's a vCard?"
              content="A vCard (.vcf) is a standard file format for storing contact information. Visitors can download it and instantly add you to their phone or email contacts with a single tap."
            />
            <InfoCard
              label="Where will it be available?"
              title="Where will it be available?"
              content="Once uploaded, a 'Save Contact' button will appear on your public EZ.to page. Visitors on any device can tap it to download your contact card directly to their address book."
            />
          </div>

          {/* File picker */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => vCardRef.current?.click()}
              className="flex-1 flex items-center gap-2 bg-zinc-800 border border-zinc-700 border-dashed rounded-lg px-3 py-2.5 hover:bg-zinc-700 transition-colors text-left"
            >
              <CreditCard className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
              <span className="text-xs text-zinc-400 truncate">
                {vCardFile ? vCardFile.name : "Choose .vcf file…"}
              </span>
            </button>
            <input
              ref={vCardRef}
              type="file"
              accept=".vcf,.vcard"
              className="hidden"
              onChange={handleVCardChange}
            />
            <SaveBtn
              onClick={() => {
                if (!vCardFile) {
                  toast.error("Please select a .vcf file first");
                  return;
                }
                toast.success(`vCard "${vCardFile.name}" saved!`);
              }}
            />
          </div>

          {vCardFile && (
            <div className="mt-2 flex items-center justify-between bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs text-cyan-400">{vCardFile.name}</span>
              </div>
              <button
                onClick={() => setVCardFile(null)}
                className="text-zinc-600 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </SettingSection>

        {/* ── Danger Zone ── */}
        <div className="border border-red-500/20 rounded-xl p-4 bg-red-500/5 mt-2">
          <h3 className="text-xs text-red-400 uppercase tracking-wider mb-3">Danger Zone</h3>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 transition-colors"
            >
              Delete Page
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-red-300 leading-relaxed">
                This will permanently delete your page and all its content.
                Type <span className="font-mono bg-red-500/10 px-1 rounded">DELETE</span> to confirm.
              </p>
              <input
                type="text"
                value={deleteText}
                onChange={e => setDeleteText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full bg-zinc-800 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-400 transition-colors placeholder:text-zinc-600"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteText(""); }}
                  className="flex-1 py-2 rounded-lg border border-zinc-700 text-zinc-400 text-xs hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={deleteText !== "DELETE"}
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteText("");
                    toast.error("Page deleted (demo)", { description: "In production this would be permanent" });
                  }}
                  className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs transition-colors"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}