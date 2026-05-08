"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import {
  X, Copy, ExternalLink, CheckCircle2, Sparkles, Twitter, Linkedin,
  Globe, Share2,
} from "lucide-react";
import { toast } from "sonner";

interface PublishModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  handle: string;
}

export function PublishModal({ open, onClose, url, handle }: PublishModalProps) {
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Resolve the portal target on the client only. `document` doesn't exist
  // during SSR, so reading it at render time would crash the server render.
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  const handlePublish = async () => {
    setPublishing(true);
    // Simulate publish delay (real app: API call)
    await new Promise(r => setTimeout(r, 1400));
    setPublished(true);
    setPublishing(false);
    toast.success("Page published!", { description: `Live at ${url}` });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=Check+out+my+page!&url=${encodeURIComponent(url)}`, "_blank");
  };

  const shareLinkedIn = () => {
    window.open(`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
  };

  const handleClose = () => {
    onClose();
    // Reset state after animation
    setTimeout(() => { setPublished(false); setPublishing(false); }, 400);
  };

  // Don't render anything until we have a client-side portal target.
  if (!portalTarget) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[1001] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${published ? "bg-green-500/15" : "bg-indigo-500/15"}`}>
                    {published
                      ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                      : <Sparkles className="w-4 h-4 text-indigo-400" />
                    }
                  </div>
                  <div>
                    <h2 className="text-white text-sm font-medium">
                      {published ? "Your page is live! 🎉" : "Publish your page"}
                    </h2>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {published ? `Published just now · ${url}` : "Make your page visible to the world"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              </div>

              <div className="px-6 pb-6 space-y-4">
                {/* QR + URL row */}
                <div className="flex items-center gap-4 bg-zinc-800/60 rounded-2xl p-4">
                  <div className="bg-white p-2 rounded-xl flex-shrink-0">
                    <QRCodeSVG value={url} size={72} bgColor="#ffffff" fgColor="#111111" level="H" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-zinc-500 mb-1">Your page URL</p>
                    <p className="text-indigo-400 text-sm truncate">{url}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      {published && <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
                      {published && <span className="text-[10px] text-green-400">Live</span>}
                    </div>
                  </div>
                </div>

                {!published ? (
                  /* Pre-publish */
                  <div className="space-y-3">
                    <div className="bg-zinc-800/40 rounded-xl p-3 space-y-1.5">
                      {[
                        "All visible blocks will be published",
                        "Page is accessible via your URL",
                        "Changes auto-save when you publish",
                      ].map(item => (
                        <div key={item} className="flex items-center gap-2 text-xs text-zinc-400">
                          <CheckCircle2 className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePublish}
                      disabled={publishing}
                      className="w-full py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {publishing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Publishing…
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Publish Now
                        </>
                      )}
                    </motion.button>
                  </div>
                ) : (
                  /* Post-publish */
                  <div className="space-y-3">
                    {/* Copy URL */}
                    <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2.5">
                      <span className="text-indigo-400 text-xs flex-1 truncate">{url}</span>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors bg-zinc-700 hover:bg-zinc-600 px-2.5 py-1 rounded-lg"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => window.open("/preview", "_blank")}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
                      >
                        <Globe className="w-4 h-4 text-zinc-300" />
                        <span className="text-[11px] text-zinc-400">View Page</span>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={shareTwitter}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
                      >
                        <Twitter className="w-4 h-4 text-zinc-300" />
                        <span className="text-[11px] text-zinc-400">Share X</span>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={shareLinkedIn}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
                      >
                        <Linkedin className="w-4 h-4 text-zinc-300" />
                        <span className="text-[11px] text-zinc-400">LinkedIn</span>
                      </motion.button>
                    </div>

                    <button
                      onClick={() => window.open("/preview", "_blank")}
                      className="w-full py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center justify-center gap-2 hover:bg-green-500/15 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Live Page
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    portalTarget
  );
}
