"use client";

import { motion } from "motion/react";
import { Lock, Mail, ArrowLeft, Zap } from "lucide-react";

export function LockedPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="absolute top-6 left-6 flex items-center gap-2"
      >
        <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg tracking-tight">EZ<span className="text-indigo-400">.to</span></span>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", damping: 20, stiffness: 200 }}
        className="relative z-10 flex flex-col items-center text-center max-w-sm"
      >
        {/* Lock Icon */}
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
            {/* Animated rings */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-3xl border border-indigo-500/30"
            />
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="absolute inset-0 rounded-3xl border border-indigo-500/20"
            />
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 mb-8"
        >
          <h1 className="text-3xl tracking-tight">Page is locked</h1>
          <p className="text-zinc-400 leading-relaxed">
            This page is currently locked. The owner has restricted access.
            Please contact support to request access.
          </p>
        </motion.div>

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2 mb-8"
        >
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          <span className="text-sm text-zinc-400">Access Restricted</span>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3 w-full"
        >
          <a
            href="mailto:support@ez.to"
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
          <button
            onClick={() => window.close()}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>
      </motion.div>

      {/* Bottom branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 flex items-center gap-1.5 text-xs text-zinc-600"
      >
        <span>Powered by</span>
        <span className="text-zinc-400">EZ.to</span>
        <span className="text-zinc-700">·</span>
        <span>Build your own page</span>
      </motion.div>
    </div>
  );
}
