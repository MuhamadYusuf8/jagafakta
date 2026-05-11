"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Search, BookOpen, CheckSquare, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import type { FactCheckResult, VerdictType } from "@/types";
import { audioManager } from "@/lib/audio";

// ── Stage config ────────────────────────────────────────────────────────────
const STAGES = [
  { icon: Search,      label: "Membaca dan memindai konten...",     duration: 900 },
  { icon: BookOpen,    label: "Mencari sumber terpercaya...",        duration: 900 },
  { icon: CheckSquare, label: "Menganalisis klaim dan data...",       duration: 900 },
  { icon: Shield,      label: "Memverifikasi fakta akhir...",         duration: 600 },
  { icon: Sparkles,    label: "Menentukan verdict...",               duration: 500 },
];
const TOTAL_STAGES = STAGES.length;

// ── Verdict style map ────────────────────────────────────────────────────────
const VERDICT_STYLE: Record<VerdictType, { color: string; glow: string; bg: string; emoji: string; label: string }> = {
  HOAKS:                     { color: "#EF4444", glow: "rgba(239,68,68,0.45)", bg: "rgba(239,68,68,0.08)", emoji: "🚨", label: "HOAKS TERDETEKSI" },
  FAKTA:                     { color: "#22C55E", glow: "rgba(34,197,94,0.45)",  bg: "rgba(34,197,94,0.08)",  emoji: "✅", label: "FAKTA TERVERIFIKASI" },
  KONTEKS_HILANG:            { color: "#F59E0B", glow: "rgba(245,158,11,0.45)", bg: "rgba(245,158,11,0.08)", emoji: "⚠️", label: "KONTEKS TIDAK LENGKAP" },
  TIDAK_DAPAT_DIVERIFIKASI:  { color: "#6B7280", glow: "rgba(107,114,128,0.4)", bg: "rgba(107,114,128,0.08)", emoji: "❓", label: "TIDAK DAPAT DIVERIFIKASI" },
};

// ── Confetti burst helper ────────────────────────────────────────────────────
function fireConfetti(verdict: VerdictType) {
  const origin = { x: 0.5, y: 0.55 };

  if (verdict === "FAKTA") {
    // Two-burst green confetti celebration
    confetti({ particleCount: 80,  spread: 60, origin, colors: ["#22C55E","#4ADE80","#86EFAC","#34D399","#FFFFFF"], startVelocity: 40, gravity: 0.9, ticks: 200 });
    setTimeout(() => {
      confetti({ particleCount: 60, spread: 80, origin, colors: ["#22C55E","#4ADE80","#3B82F6","#FFFFFF"], startVelocity: 35, gravity: 1.0, ticks: 180, angle: 60 });
      confetti({ particleCount: 60, spread: 80, origin, colors: ["#22C55E","#4ADE80","#3B82F6","#FFFFFF"], startVelocity: 35, gravity: 1.0, ticks: 180, angle: 120 });
    }, 200);
  } else if (verdict === "HOAKS") {
    // Sharp red burst — warning, not celebration
    confetti({ particleCount: 60, spread: 50, origin, colors: ["#EF4444","#DC2626","#F87171","#991B1B"], startVelocity: 30, gravity: 1.2, ticks: 120, shapes: ["square"] });
  } else if (verdict === "KONTEKS_HILANG") {
    confetti({ particleCount: 45, spread: 55, origin, colors: ["#F59E0B","#FCD34D","#D97706","#FBBF24"], startVelocity: 28, gravity: 1.1, ticks: 130 });
  } else {
    confetti({ particleCount: 30, spread: 45, origin, colors: ["#6B7280","#9CA3AF","#D1D5DB"], startVelocity: 22, gravity: 1.3, ticks: 100 });
  }
}

// ── Scan animation overlay ──────────────────────────────────────────────────
function ScanOverlay() {
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
      {/* Moving horizontal scan beam */}
      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #3B82F6, #60A5FA, #3B82F6, transparent)" }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 2.2, ease: "linear", repeat: Infinity }}
      />
      {/* Scan corner brackets */}
      {["top-2 left-2","top-2 right-2","bottom-2 left-2","bottom-2 right-2"].map((pos, i) => (
        <div key={i} className={`absolute w-5 h-5 ${pos}`}
          style={{
            borderColor: "#3B82F6",
            borderTopWidth:    i < 2 ? 2 : 0,
            borderBottomWidth: i >= 2 ? 2 : 0,
            borderLeftWidth:   i % 2 === 0 ? 2 : 0,
            borderRightWidth:  i % 2 === 1 ? 2 : 0,
          }}
        />
      ))}
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />
    </div>
  );
}

// ── Stage progress bar ───────────────────────────────────────────────────────
function StageProgress({ stage, total }: { stage: number; total: number }) {
  const pct = Math.min(100, Math.round((stage / total) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] text-text-muted mb-1.5">
        <span>Tahap {Math.min(stage + 1, total)} / {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ── Pulse ring for dramatic pause ────────────────────────────────────────────
function PulseRing({ color }: { color: string }) {
  return (
    <div className="relative flex items-center justify-center">
      {[1, 1.6, 2.2].map((scale, i) => (
        <motion.div key={i} className="absolute w-16 h-16 rounded-full border"
          style={{ borderColor: color }}
          animate={{ scale: [scale, scale * 1.15, scale], opacity: [0.6, 0.15, 0.6] }}
          transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
      <motion.div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: `radial-gradient(circle, ${color}30, ${color}10)`, border: `2px solid ${color}` }}
        animate={{ boxShadow: [`0 0 20px ${color}40`, `0 0 45px ${color}70`, `0 0 20px ${color}40`] }}
        transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}>
        <Shield className="w-8 h-8" style={{ color }} />
      </motion.div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
type Phase = "scanning" | "suspense" | "revealed";

interface VerdictRevealProps {
  isLoading: boolean;
  result: FactCheckResult | null;
  children: React.ReactNode; // The VerdictCard + reset button
}

export default function VerdictReveal({ isLoading, result, children }: VerdictRevealProps) {
  const [phase, setPhase]         = useState<Phase>("scanning");
  const [stageIdx, setStageIdx]   = useState(0);
  const [stageLabel, setStageLabel] = useState(STAGES[0].label);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageRef   = useRef(0);
  const resultRef  = useRef<FactCheckResult | null>(null);

  const clear = () => { if (timerRef.current) clearTimeout(timerRef.current); };

  // Advance stages while scanning
  const advanceStage = useCallback(() => {
    const next = stageRef.current + 1;
    if (next < TOTAL_STAGES) {
      stageRef.current = next;
      setStageIdx(next);
      setStageLabel(STAGES[next].label);
      audioManager.playTick();
      timerRef.current = setTimeout(advanceStage, STAGES[next].duration);
    }
    // If we have result AND reached last stage → suspense
    if (resultRef.current && next >= TOTAL_STAGES - 1) {
      clear();
      enterSuspense();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function enterSuspense() {
    audioManager.stopScan();
    audioManager.playSuspense();
    setPhase("suspense");
    timerRef.current = setTimeout(enterReveal, 900);
  }

  function enterReveal() {
    setPhase("revealed");
    if (resultRef.current) {
      fireConfetti(resultRef.current.verdict);
      audioManager.playVerdict(resultRef.current.verdict);
    }
  }

  // Start scanning cycle when loading begins
  useEffect(() => {
    if (isLoading) {
      stageRef.current = 0;
      setStageIdx(0);
      setStageLabel(STAGES[0].label);
      setPhase("scanning");
      resultRef.current = null;
      audioManager.playWhoosh();
      audioManager.startScan();
      clear();
      timerRef.current = setTimeout(advanceStage, STAGES[0].duration);
    }
    return clear;
  }, [isLoading, advanceStage]);

  // When result arrives, store it; if stages are done → suspense immediately
  useEffect(() => {
    if (result) {
      resultRef.current = result;
      if (stageRef.current >= TOTAL_STAGES - 1) {
        clear();
        enterSuspense();
      }
      // Otherwise advanceStage will detect it and trigger suspense
    }
  }, [result]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset when both loading=false and result=null (user clicked "Cek Lain")
  useEffect(() => {
    if (!isLoading && !result) {
      clear();
      setPhase("scanning");
      stageRef.current = 0;
      resultRef.current = null;
    }
  }, [isLoading, result]);

  const style = result ? VERDICT_STYLE[result.verdict] : null;

  if (!isLoading && !result) return null;

  return (
    <div className="mt-8 max-w-2xl mx-auto px-4">
      {/* ── SCANNING phase ── */}
      <AnimatePresence mode="wait">
        {phase === "scanning" && (
          <motion.div key="scanning"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
            className="relative glass-strong rounded-2xl p-6 sm:p-8 space-y-6 overflow-hidden">

            <ScanOverlay />

            {/* Animated icon */}
            <div className="flex justify-center">
              <AnimatePresence mode="wait">
                {STAGES.map((s, i) => i === stageIdx && (
                  <motion.div key={i}
                    initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 1.3, rotate: 15 }}
                    transition={{ duration: 0.35 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center shadow-glow-md"
                  >
                    <s.icon className="w-8 h-8 text-white" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Stage label */}
            <div className="text-center space-y-1">
              <AnimatePresence mode="wait">
                <motion.p key={stageLabel}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="text-sm font-medium text-text-primary">
                  {stageLabel}
                </motion.p>
              </AnimatePresence>
              <p className="text-xs text-text-muted">AI JagaFakta sedang bekerja...</p>
            </div>

            {/* Progress bar */}
            <StageProgress stage={stageIdx} total={TOTAL_STAGES} />

            {/* Stage dots */}
            <div className="flex justify-center gap-1.5">
              {STAGES.map((_, i) => (
                <motion.div key={i}
                  className="rounded-full"
                  animate={{ width: i === stageIdx ? 20 : 6, height: 6, background: i <= stageIdx ? "#3B82F6" : "rgba(255,255,255,0.1)" }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── SUSPENSE phase ── */}
        {phase === "suspense" && style && (
          <motion.div key="suspense"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 py-8">
            <PulseRing color={style.color} />
            <motion.div className="text-center"
              animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity }}>
              <p className="text-sm font-semibold text-text-primary">Menentukan verdict akhir...</p>
              <p className="text-xs text-text-muted mt-1">Jangan tutup halaman ini</p>
            </motion.div>
          </motion.div>
        )}

        {/* ── REVEALED phase ── */}
        {phase === "revealed" && result && style && (
          <motion.div key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}>

            {/* Verdict flash banner */}
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
              className="mb-4 rounded-2xl py-4 flex items-center justify-center gap-3 overflow-hidden relative"
              style={{ background: style.bg, border: `1px solid ${style.color}40`, boxShadow: `0 0 40px ${style.glow}` }}
            >
              {/* Radial glow */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% -30%, ${style.color}20, transparent 65%)` }}
              />
              <motion.span className="text-3xl"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 15 }}>
                {style.emoji}
              </motion.span>
              <motion.span
                className="font-jakarta font-extrabold text-xl sm:text-2xl tracking-wide"
                style={{ color: style.color }}
                initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}>
                {style.label}
              </motion.span>
            </motion.div>

            {/* Actual VerdictCard + reset button passed as children */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}>
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
