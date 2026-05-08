"use client";

import { SignUp } from "@clerk/nextjs";
import { motion } from "motion/react";
import { Zap, Sparkles } from "lucide-react";
import Link from "next/link";

export function SignUpPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center gap-2.5 mb-8"
      >
        <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl text-white tracking-tight">EZ<span className="text-indigo-400">.to</span></span>
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 text-center mb-7"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-300 mb-3">
          <Sparkles className="w-3 h-3" />
          Free to get started
        </div>
        <h1 className="text-3xl text-white">Create your EZ.to page</h1>
        <p className="text-zinc-400 mt-2">Build once, share everywhere.</p>
      </motion.div>

      {/* Clerk SignUp form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="relative z-10"
      >
        <SignUp
          forceRedirectUrl="/onboarding"
          signInUrl="/sign-in"
        />
      </motion.div>

      <p className="relative z-10 mt-6 text-xs text-zinc-600 text-center">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}