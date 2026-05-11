"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Badge } from "@/lib/gamification";

interface BadgeNotificationProps {
  badge: Badge | null;
  onClose: () => void;
}

export default function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

  const generateParticles = useCallback(() => {
    const colors = ["#FFD700", "#FF6B6B", "#4ADE80", "#60A5FA", "#F59E0B", "#A78BFA", "#FB923C"];
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (badge) {
      generateParticles();
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [badge, onClose, generateParticles]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />

          {/* Confetti particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                opacity: 1,
                x: "50%",
                y: "50%",
                scale: 0,
              }}
              animate={{
                opacity: [1, 1, 0],
                x: `${p.x}%`,
                y: `${p.y}%`,
                scale: [0, 1.5, 0.5],
                rotate: [0, 360, 720],
              }}
              transition={{
                duration: 2,
                delay: p.delay,
                ease: "easeOut",
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
          ))}

          {/* Badge card */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 12, delay: 0.2 }}
            className="relative z-10 pointer-events-auto"
            onClick={onClose}
          >
            <div className="bg-surface-2/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 
                            shadow-2xl text-center min-w-[280px] max-w-[340px]">
              {/* Glow ring */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(255, 215, 0, 0.2)",
                    "0 0 60px rgba(255, 215, 0, 0.4)",
                    "0 0 20px rgba(255, 215, 0, 0.2)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 
                            flex items-center justify-center mb-4"
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-4xl"
                >
                  {badge.emoji}
                </motion.span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xs text-yellow-500 font-medium mb-1"
              >
                🎉 BADGE BARU DIPEROLEH!
              </motion.p>

              <motion.h3
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="font-jakarta font-bold text-xl text-text-primary mb-1"
              >
                {badge.name}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-sm text-text-muted"
              >
                {badge.description}
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-[10px] text-text-muted/50 mt-4"
              >
                Ketuk untuk menutup
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
