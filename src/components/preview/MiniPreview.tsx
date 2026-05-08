"use client";

import { useBuilderStore } from "../../store/builderStore";
import { BlockRenderer } from "./BlockRenderer";
import { motion } from "motion/react";

export function MiniPreview() {
  const { profile, blocks, appearance } = useBuilderStore();
  const visibleBlocks = blocks.filter((b) => b.visible);

  const btnRadius =
    appearance.buttonStyle === "pill"
      ? "9999px"
      : appearance.buttonStyle === "sharp"
      ? "4px"
      : "10px";

  return (
    <div className="relative" style={{ width: 220, height: 420 }}>
      {/* Phone Frame */}
      <div className="absolute inset-0 rounded-[36px] border-4 border-zinc-700 shadow-2xl overflow-hidden bg-zinc-800">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-800 rounded-b-xl z-10" />

        {/* Screen */}
        <div
          className="w-full h-full overflow-y-auto"
          style={{
            background:
              appearance.bgType === "gradient"
                ? `linear-gradient(${appearance.gradientAngle ?? 135}deg, ${appearance.bgColor}, ${appearance.bgColor2 || appearance.gradientEnd}, ${appearance.bgColor3 || appearance.gradientEnd})`
                : appearance.bgType === "image" && appearance.bgImageUrl
                ? undefined
                : appearance.bgGradient
                ? `linear-gradient(to bottom, ${appearance.bgColor}, ${appearance.gradientEnd})`
                : appearance.bgColor,
            ...(appearance.bgType === "image" && appearance.bgImageUrl
              ? { backgroundImage: `url(${appearance.bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : {}),
            color: appearance.textColor,
            scrollbarWidth: "none",
          }}
        >
          <div className="pt-7 pb-4 px-3 space-y-2">
            {visibleBlocks.map((block) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <BlockRenderer
                  block={block}
                  profile={profile}
                  appearance={appearance}
                  compact
                  btnRadius={btnRadius}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-zinc-600 rounded-full" />
    </div>
  );
}