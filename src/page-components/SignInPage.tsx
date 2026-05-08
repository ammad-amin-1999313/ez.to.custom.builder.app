"use client";

import { SignIn } from "@clerk/nextjs";
import { motion } from "motion/react";
import { Zap, Link2, BarChart2, Palette } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  { icon: Link2,      label: "19 block types",        sub: "Links, forms, maps & more"   },
  { icon: Palette,    label: "Beautiful themes",       sub: "Fully customizable design"   },
  { icon: BarChart2,  label: "Built-in analytics",     sub: "See who visits your page"    },
];

export function SignInPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex overflow-hidden">

      {/* ── Left: Branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12 relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl text-white tracking-tight">EZ<span className="text-indigo-400">.to</span></span>
        </div>

        {/* Hero */}
        <div className="relative z-10 space-y-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl text-white leading-tight mb-4"
            >
              Your link in bio,<br />
              <span className="text-indigo-400">made beautiful.</span>
            </motion.h1>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Build a stunning personal page in minutes. No code required.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, label, sub }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="relative z-10 text-xs text-zinc-600">
          Free to start · No credit card required
        </p>
      </div>

      {/* ── Right: Clerk SignIn form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg text-white tracking-tight">EZ<span className="text-indigo-400">.to</span></span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <SignIn
            forceRedirectUrl="/builder"
            signUpUrl="/sign-up"
          />
        </motion.div>

        <p className="mt-6 text-xs text-zinc-600 text-center">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}