"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { audioManager } from "@/lib/audio";

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(audioManager.isEnabled);
  }, []);

  const toggle = () => {
    const next = audioManager.toggle();
    setEnabled(next);
    if (next) audioManager.playTick();
  };

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.88 }}
      id="sound-toggle-btn"
      aria-label={enabled ? "Matikan suara" : "Aktifkan suara"}
      title={enabled ? "Suara: Aktif" : "Suara: Mati"}
      className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all
        ${enabled
          ? "bg-accent/15 text-accent border border-accent/25 hover:bg-accent/25"
          : "bg-white/[0.04] text-text-muted border border-white/[0.08] hover:text-text-primary hover:bg-white/[0.07]"
        }`}
    >
      {enabled ? (
        <Volume2 className="w-4 h-4" />
      ) : (
        <VolumeX className="w-4 h-4" />
      )}
      {enabled && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
      )}
    </motion.button>
  );
}
