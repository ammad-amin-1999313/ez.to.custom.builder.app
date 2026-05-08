"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { useBuilderStore } from "../store/builderStore";
import { BlocksSidebar }   from "../components/builder/BlocksSidebar";
import { ContentPanel }    from "../components/builder/ContentPanel";
import { AppearancePanel } from "../components/builder/AppearancePanel";
import { SettingsPanel }   from "../components/builder/SettingsPanel";
import { AnalyticsPanel }  from "../components/builder/AnalyticsPanel";
import { PhoneCanvas }     from "../components/builder/PhoneCanvas";
import { QRCodeModal }     from "../components/builder/QRCodeModal";
import { PublishModal }    from "../components/builder/PublishModal";
import {
  Zap, ExternalLink, Copy, QrCode, Layout, Palette,
  Settings, BarChart2, ChevronLeft, Sparkles, HelpCircle,
  Smartphone, Monitor,
} from "lucide-react";
import { toast } from "sonner";

const tabs = [
  { id: "content",    label: "Content",    icon: Layout    },
  { id: "appearance", label: "Appearance", icon: Palette   },
  // { id: "settings",   label: "Settings",   icon: Settings  },
  // { id: "analytics",  label: "Analytics",  icon: BarChart2 },
] as const;

export function BuilderPage() {
  const router = useRouter();

  // Clerk user — may be undefined if Clerk hasn't initialised yet
  const { user, isLoaded: clerkLoaded, isSignedIn } = useUser();

  const {
    activeTab, setActiveTab,
    profile, setProfile,
    settings, blocks, savedBlocks,
    previewMode, setPreviewMode,
  } = useBuilderStore();

  const [qrOpen,       setQrOpen]       = useState(false);
  const [publishOpen,  setPublishOpen]  = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);

  const pageUrl     = `https://ez.to/${profile.handle || "alexmorgan"}`;
  const isAnalytics = activeTab === "analytics";

  // ── Sync Clerk user → builder store (runs when Clerk user ID changes) ────
  useEffect(() => {
    if (!user) return;

    // Derive a sensible handle: Clerk username → email prefix → existing
    const emailPrefix = user.primaryEmailAddress?.emailAddress?.split("@")[0] ?? "";
    const derivedHandle = (user.username || emailPrefix || "").toLowerCase().replace(/[^a-z0-9_-]/g, "");

    // Only overwrite handle if it's still the seeded default or empty —
    // never clobber a handle the user has customised.
    const isDefaultHandle = !profile.handle || profile.handle === "alexmorgan";

    setProfile({
      firstName: user.firstName  || profile.firstName,
      lastName:  user.lastName   || profile.lastName,
      image:     user.imageUrl   || profile.image,
      handle:    isDefaultHandle && derivedHandle ? derivedHandle : profile.handle,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Unsaved-changes indicator (fast dirty-check)
  const hasUnsaved =
    JSON.stringify(blocks.map(b => b.id + b.visible)) !==
    JSON.stringify(savedBlocks.map(b => b.id + b.visible));

  const handleOpenPage = () => window.open("/preview", "_blank");
  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    toast.success("Link copied to clipboard!");
  };

  // Fallback initials avatar shown while Clerk hasn't loaded yet
  const initials =
    (`${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`)
      .toUpperCase() || "U";

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col overflow-hidden">

      {/* ── Top Navigation Bar ── */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-800 flex-shrink-0 bg-zinc-950 z-20">

        {/* Left ─ logo + handle + badges */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm tracking-tight">
              EZ<span className="text-indigo-400">.to</span>
            </span>
          </div>
          {isSignedIn && (
            <>
              <div className="w-px h-5 bg-zinc-800" />
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span className="text-xs text-zinc-400">
                  ez.to/<span className="text-white">{profile.handle || "alexmorgan"}</span>
                </span>
                {hasUnsaved && (
                  <span className="ml-1 text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-1.5 py-0.5 rounded-full">
                    unsaved
                  </span>
                )}
              </div>
            </>
          )}
          {settings.isLocked && (
            <span className="flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
              🔒 Locked
            </span>
          )}
        </div>

        {/* Center Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  activeTab === tab.id
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQrOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">QR Code</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copy Link</span>
          </button>
          <button
            onClick={handleOpenPage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open Page</span>
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setPublishOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-500 text-white text-xs hover:bg-indigo-600 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Publish
          </motion.button>

          {/* ── Right-most slot: UserButton (signed in) / SignInButton (signed out) / placeholder (loading) ── */}
          <div className="ml-1">
            {!clerkLoaded ? (
              /* Fallback gradient avatar while Clerk initialises */
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-transparent cursor-default select-none"
                style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)" }}
              >
                {initials}
              </div>
            ) : isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 ring-2 ring-transparent hover:ring-indigo-500/50 transition-all rounded-full",
                    userButtonPopoverCard: {
                      background: "#18181b",
                      border: "1px solid #27272a",
                      boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
                    },
                    userButtonPopoverActionButton: {
                      color: "#e4e4e7",
                      "&:hover": { background: "#27272a" },
                    },
                    userButtonPopoverActionButtonText: { color: "#e4e4e7" },
                    userButtonPopoverActionButtonIcon: { color: "#a1a1aa" },
                    userButtonPopoverFooter: { borderTop: "1px solid #27272a" },
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Support"
                    labelIcon={<HelpCircle className="w-4 h-4" />}
                    onClick={() => window.open("https://help.ezbio.com/", "_blank")}
                  />
                </UserButton.MenuItems>
              </UserButton>
            ) : (
              <SignInButton mode="modal">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500 text-white text-xs hover:bg-indigo-600 transition-colors"
                >
                  Sign in
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Analytics: full-page dashboard — hides sidebar & canvas */}
        <AnimatePresence mode="wait">
          {isAnalytics ? (
            <motion.div
              key="analytics-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden"
            >
              <AnalyticsPanel fullPage />
            </motion.div>
          ) : (
            <motion.div
              key="builder-layout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex overflow-hidden"
            >
              {/* Block-type sidebar */}
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 224, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 overflow-hidden"
                  >
                    <BlocksSidebar />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sidebar toggle rail */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex-shrink-0 w-4 bg-zinc-900 border-r border-zinc-800 hover:bg-zinc-800 transition-colors flex items-center justify-center group"
                title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              >
                <div className="w-0.5 h-8 bg-zinc-700 group-hover:bg-zinc-500 rounded-full transition-colors" />
              </button>

              {/* Properties panel — width controlled here. Tweak the `w-…`
                  Tailwind class to resize the Content/Appearance/Settings tab
                  panels. Use w-72 (288px), w-80 (320px), w-96 (384px), or any
                  arbitrary value like w-[420px]. */}
              <div className="w-96 flex-shrink-0 border-r border-zinc-800 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {activeTab === "content"    && <ContentPanel />}
                    {activeTab === "appearance" && <AppearancePanel />}
                    {activeTab === "settings"   && <SettingsPanel />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Preview canvas + bottom action bar */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <PhoneCanvas />

                <div className="h-12 flex items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-950 flex-shrink-0 px-4">
                  {/* Left: Mobile / Desktop preview-mode toggle */}
                  <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-xl p-1">
                    {([
                      { id: "mobile", label: "Mobile",  Icon: Smartphone },
                      { id: "web",    label: "Desktop", Icon: Monitor    },
                    ] as const).map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        onClick={() => setPreviewMode(id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                          previewMode === id
                            ? "bg-zinc-700 text-white"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Right: existing action buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleOpenPage}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Page
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Link
                    </button>
                    <button
                      onClick={() => setQrOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      QR Code
                    </button>
                    <div className="w-px h-5 bg-zinc-800" />
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setPublishOpen(true)}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-500 text-white text-xs hover:bg-indigo-600 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Publish
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Modals ── */}
      <QRCodeModal  open={qrOpen}      onClose={() => setQrOpen(false)}      url={pageUrl} />
      <PublishModal open={publishOpen} onClose={() => setPublishOpen(false)} />
    </div>
  );
}
