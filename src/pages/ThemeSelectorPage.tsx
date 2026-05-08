"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import { useBuilderStore } from "../store/builderStore";
import { Check, Zap, LogIn, Sparkles } from "lucide-react";

interface Theme {
  id: string;
  name: string;
  description: string;
  bg: string;
  text: string;
  accent: string;
  buttonStyle: "rounded" | "sharp" | "pill";
  preview: {
    bg: string;
    card: string;
    btn: string;
    btnText: string;
    avatarBg: string;
    nameLine: string;
    bioLine: string;
  };
  gradient?: string;
}

const themes: Theme[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean white canvas",
    bg: "#ffffff",
    text: "#111111",
    accent: "#111111",
    buttonStyle: "rounded",
    preview: {
      bg: "bg-white",
      card: "bg-gray-100",
      btn: "bg-black",
      btnText: "text-white",
      avatarBg: "bg-gray-200",
      nameLine: "bg-gray-800",
      bioLine: "bg-gray-300",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Sleek dark mode",
    bg: "#0a0a0a",
    text: "#f5f5f5",
    accent: "#a855f7",
    buttonStyle: "rounded",
    preview: {
      bg: "bg-zinc-950",
      card: "bg-zinc-800",
      btn: "bg-purple-600",
      btnText: "text-white",
      avatarBg: "bg-zinc-700",
      nameLine: "bg-zinc-300",
      bioLine: "bg-zinc-600",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool blue gradient",
    bg: "#0f172a",
    text: "#e2e8f0",
    accent: "#38bdf8",
    buttonStyle: "pill",
    gradient: "from-blue-900 to-indigo-900",
    preview: {
      bg: "bg-gradient-to-b from-blue-900 to-indigo-900",
      card: "bg-blue-800/50",
      btn: "bg-sky-400",
      btnText: "text-blue-950",
      avatarBg: "bg-blue-700",
      nameLine: "bg-sky-200",
      bioLine: "bg-blue-600",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange glow",
    bg: "#1a0a00",
    text: "#fef3e2",
    accent: "#f97316",
    buttonStyle: "pill",
    gradient: "from-orange-900 to-rose-900",
    preview: {
      bg: "bg-gradient-to-b from-orange-900 to-rose-900",
      card: "bg-orange-800/50",
      btn: "bg-orange-400",
      btnText: "text-orange-950",
      avatarBg: "bg-orange-700",
      nameLine: "bg-orange-200",
      bioLine: "bg-orange-700",
    },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Nature & calm",
    bg: "#052e16",
    text: "#dcfce7",
    accent: "#4ade80",
    buttonStyle: "rounded",
    gradient: "from-green-950 to-teal-900",
    preview: {
      bg: "bg-gradient-to-b from-green-950 to-teal-900",
      card: "bg-green-800/50",
      btn: "bg-green-400",
      btnText: "text-green-950",
      avatarBg: "bg-green-700",
      nameLine: "bg-green-200",
      bioLine: "bg-green-700",
    },
  },
  {
    id: "neon",
    name: "Neon",
    description: "Vibrant & electric",
    bg: "#09090b",
    text: "#fafafa",
    accent: "#22d3ee",
    buttonStyle: "sharp",
    preview: {
      bg: "bg-zinc-950",
      card: "bg-zinc-900 border border-cyan-500/30",
      btn: "bg-cyan-400",
      btnText: "text-zinc-950",
      avatarBg: "bg-zinc-800 border-2 border-cyan-400",
      nameLine: "bg-cyan-300",
      bioLine: "bg-zinc-600",
    },
  },
  {
    id: "lavender",
    name: "Lavender",
    description: "Soft & elegant",
    bg: "#faf5ff",
    text: "#4a044e",
    accent: "#a855f7",
    buttonStyle: "pill",
    preview: {
      bg: "bg-gradient-to-b from-purple-50 to-fuchsia-50",
      card: "bg-purple-100",
      btn: "bg-purple-500",
      btnText: "text-white",
      avatarBg: "bg-purple-200",
      nameLine: "bg-purple-800",
      bioLine: "bg-purple-300",
    },
  },
  {
    id: "sand",
    name: "Sand",
    description: "Warm & minimal",
    bg: "#fef9f0",
    text: "#292524",
    accent: "#d97706",
    buttonStyle: "rounded",
    preview: {
      bg: "bg-amber-50",
      card: "bg-amber-100",
      btn: "bg-amber-600",
      btnText: "text-white",
      avatarBg: "bg-amber-200",
      nameLine: "bg-stone-700",
      bioLine: "bg-amber-300",
    },
  },
];

function ThemePreview({ theme }: { theme: Theme }) {
  const p = theme.preview;

  return (
    <div
      className={`flex h-full w-full flex-col items-center gap-3 overflow-hidden rounded-2xl ${p.bg} px-4 pt-6`}
    >
      <div className={`h-12 w-12 rounded-full ${p.avatarBg}`} />

      <div className="flex w-full flex-col items-center gap-1.5">
        <div className={`h-3 w-24 rounded ${p.nameLine}`} />
        <div className={`h-2 w-32 rounded ${p.bioLine}`} />
      </div>

      <div className="mt-1 flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`h-5 w-5 rounded-full ${p.avatarBg}`} />
        ))}
      </div>

      <div className="mt-2 flex w-full flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`h-7 w-full ${
              theme.buttonStyle === "pill"
                ? "rounded-full"
                : theme.buttonStyle === "sharp"
                ? "rounded-none"
                : "rounded-lg"
            } ${p.btn}`}
            style={{ opacity: 0.9 - i * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
}

export function ThemeSelectorPage() {
  const router = useRouter();
  const { setTheme, setAppearance } = useBuilderStore();
  const [selected, setSelected] = useState("minimal");
  const { isSignedIn, isLoaded } = useAuth();

  const handleSelect = (theme: Theme) => {
    setTheme(theme.id);

    setAppearance({
      bgColor: theme.bg,
      textColor: theme.text,
      accentColor: theme.accent,
      buttonStyle: theme.buttonStyle,
      bgGradient: !!theme.gradient,
    });

    setSelected(theme.id);

    // Signed-in users go through the post-signup onboarding step (which is
    // protected by middleware). Guests skip straight into the builder so
    // they can play with the page before being asked to sign up.
    const next = isSignedIn ? "/onboarding" : "/builder";
    setTimeout(() => router.push(next), 300);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#07070c] text-white">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-220px] h-[460px] w-[720px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute right-[-160px] top-40 h-[420px] w-[420px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-20 left-[-180px] h-[360px] w-[360px] rounded-full bg-blue-500/10 blur-[110px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_top,black,transparent_70%)]" />
      </div>

      {/* Top bar with auth */}
      <div className="relative z-20 flex items-center justify-between border-b border-white/10 bg-black/20 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
            <Zap className="h-4 w-4 text-white" />
          </div>

          <span className="text-sm font-semibold tracking-tight text-white">
            EZ<span className="text-indigo-300">.to</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isLoaded && !isSignedIn && (
            <SignInButton mode="modal">
              <button className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-white/[0.09]">
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </button>
            </SignInButton>
          )}

          {isLoaded && isSignedIn && (
            <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
          )}
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 px-6 pb-14 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mx-auto max-w-5xl text-center"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-white/[0.04] px-4 py-2 text-sm text-indigo-100 shadow-[0_0_40px_rgba(99,102,241,0.12)] backdrop-blur-xl">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/15 ring-1 ring-indigo-400/30">
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
            </span>

            <span className="font-medium tracking-tight">
              Step 1 of 3 — Choose your style
            </span>
          </div>

          <h1 className="mx-auto max-w-4xl text-balance text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl md:text-7xl">
            Pick your{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(129,140,248,0.35)]">
              theme
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-7 text-zinc-400 sm:text-lg">
            Start with a beautiful template that matches your brand. You can
            customize colors, buttons, content, and layout anytime.
          </p>

          <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3 text-xs text-zinc-500">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-700" />
            <span>Choose a starting point below</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-700" />
          </div>
        </motion.div>
      </section>

      {/* Themes Grid */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {themes.map((theme, index) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="group cursor-pointer"
              onClick={() => handleSelect(theme)}
            >
              <div
                className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${
                  selected === theme.id
                    ? "border-indigo-400/80 shadow-2xl shadow-indigo-500/20"
                    : "border-white/10 bg-white/[0.03] hover:border-indigo-400/40 hover:shadow-xl hover:shadow-indigo-500/10"
                }`}
              >
                {/* Preview Area */}
                <div className="relative h-52 p-2">
                  <ThemePreview theme={theme} />

                  {/* Selected Badge */}
                  {selected === theme.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/30"
                    >
                      <Check className="h-4 w-4 text-white" />
                    </motion.div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-2 rounded-2xl bg-black/0 transition-colors group-hover:bg-black/10" />
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between border-t border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {theme.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {theme.description}
                    </p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-lg px-3 py-1.5 text-xs transition-all ${
                      selected === theme.id
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                        : "bg-white/[0.06] text-zinc-300 group-hover:bg-white/[0.1]"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(theme);
                    }}
                  >
                    {selected === theme.id ? "Selected" : "Select"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}