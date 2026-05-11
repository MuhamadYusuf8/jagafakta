"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface ConfidenceMeterProps {
  score: number;
}

export default function ConfidenceMeter({ score }: ConfidenceMeterProps) {
  const barRef = useRef<HTMLDivElement>(null);

  const getColor = (s: number) => {
    if (s >= 80) return { from: "#22C55E", to: "#16A34A" };
    if (s >= 60) return { from: "#F59E0B", to: "#D97706" };
    return { from: "#EF4444", to: "#DC2626" };
  };

  const colors = getColor(score);

  useEffect(() => {
    // Trigger re-render for animation
  }, [score]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted font-medium">
          Tingkat Keyakinan AI
        </span>
        <span className="text-sm font-jakarta font-bold text-text-primary">
          {score}%
        </span>
      </div>
      <div className="h-2.5 w-full bg-surface-2 rounded-full overflow-hidden">
        <motion.div
          ref={barRef}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className="h-full rounded-full relative"
          style={{
            background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
          }}
        >
          <div className="absolute inset-0 rounded-full opacity-50"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
            }}
          />
        </motion.div>
      </div>
      <div className="flex justify-between text-[10px] text-text-muted/50">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
