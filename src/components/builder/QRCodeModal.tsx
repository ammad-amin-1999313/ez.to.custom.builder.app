"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { X, Download, Copy, FileImage, Code2 } from "lucide-react";
import { toast } from "sonner";

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  handle?: string;
}

export function QRCodeModal({ open, onClose, url, handle }: QRCodeModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  // Fall back to a slug derived from the URL so downloaded files always have a sensible name.
  const slug = handle || url.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "page";

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const handleDownloadSVG = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ezto-${slug}-qr.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("QR Code downloaded as SVG!");
  };

  const handleDownloadPNG = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) { toast.error("QR not ready yet"); return; }

    const size = 512;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      const a = document.createElement("a");
      a.download = `ezto-${slug}-qr.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
      toast.success("QR Code downloaded as PNG!");
    };
    img.onerror = () => toast.error("Failed to generate PNG");
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
          >
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 shadow-2xl pointer-events-auto w-full max-w-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white text-lg">QR Code</h2>
                  <p className="text-zinc-500 text-xs mt-0.5">Scan to open your page</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              {/* QR Code */}
              <div ref={qrRef} className="flex items-center justify-center mb-6">
                <div className="bg-white p-4 rounded-2xl shadow-lg">
                  <QRCodeSVG
                    value={url}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#111111"
                    level="H"
                  />
                </div>
              </div>

              {/* URL */}
              <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-4 py-3 mb-5">
                <span className="text-indigo-400 text-sm flex-1 truncate">{url}</span>
                <button onClick={handleCopy} className="text-zinc-500 hover:text-zinc-300 transition-colors" title="Copy URL">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Link
                  </button>
                  <button
                    onClick={handleDownloadPNG}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500 text-white text-sm hover:bg-indigo-600 transition-colors"
                  >
                    <FileImage className="w-3.5 h-3.5" />
                    PNG
                  </button>
                </div>
                <button
                  onClick={handleDownloadSVG}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 text-sm hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  Download SVG (vector)
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
