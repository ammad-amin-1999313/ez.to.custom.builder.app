"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Zap, Home, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 flex items-center gap-2"
      >
        <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg tracking-tight">EZ<span className="text-indigo-400">.to</span></span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", damping: 12 }}
          className="text-[96px] leading-none mb-4 select-none"
        >
          404
        </motion.div>
        <p className="text-zinc-400 text-lg mb-2">Page not found</p>
        <p className="text-zinc-600 text-sm mb-10">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </button>
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>

      <div className="absolute bottom-6 text-xs text-zinc-700">
        Powered by EZ.to
      </div>
    </div>
  );
}
