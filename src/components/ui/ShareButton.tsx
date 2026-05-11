"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, MessageCircle, Link2, Check, ImageDown, X, Loader2, Shield, Search } from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import type { FactCheckResult } from "@/types";
import { VERDICT_CONFIG } from "@/lib/utils";

interface ShareButtonProps {
  result: FactCheckResult;
}

export default function ShareButton({ result }: ShareButtonProps) {
  const [copied, setCopied]         = useState(false);
  const [cardOpen, setCardOpen]     = useState(false);
  const [cardLoading, setCardLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const appUrl = typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "https://jagafakta.id";

  const config = VERDICT_CONFIG[result.verdict];

  const whatsappMessage = `🛡️ *JagaFakta* mendeteksi ini sebagai *${config.labelShort}*\n\n📋 ${result.title}\n\nTingkat keyakinan AI: ${result.confidence_score}%\n\nCek sendiri di: ${appUrl}\n\n#JagaFakta #CekSebelumSebar`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const handleCopyLink = async () => {
    try {
      const link = result.id ? `${appUrl}/result/${result.id}` : appUrl;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const generateImage = async () => {
    if (!cardRef.current) return null;
    try {
      // Temporarily make it visible for rendering but keep it off-screen
      cardRef.current.style.display = "flex";
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // High resolution
        backgroundColor: "#0A0F1E",
        logging: false,
        useCORS: true,
      });
      cardRef.current.style.display = "none";
      return canvas.toDataURL("image/png");
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleOpenCard = async () => {
    setCardOpen(true);
    setCardLoading(true);
    // Give modal time to mount DOM
    setTimeout(async () => {
      const url = await generateImage();
      if (url) {
        setPreviewUrl(url);
      } else {
        toast.error("Gagal memuat preview kartu.");
        setCardOpen(false);
      }
      setCardLoading(false);
    }, 100);
  };

  const handleDownloadCard = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `jagafakta-${result.verdict.toLowerCase()}.png`;
    a.click();
    toast.success("Kartu berhasil diunduh! 🎉");
  };

  const verdictStyles: Record<string, { color: string; bg: string; emoji: string; label: string }> = {
    HOAKS: { color: "#EF4444", bg: "#EF444415", emoji: "🚨", label: "HOAKS TERDETEKSI" },
    FAKTA: { color: "#22C55E", bg: "#22C55E15", emoji: "✅", label: "FAKTA TERVERIFIKASI" },
    KONTEKS_HILANG: { color: "#F59E0B", bg: "#F59E0B15", emoji: "⚠️", label: "KONTEKS TIDAK LENGKAP" },
    TIDAK_DAPAT_DIVERIFIKASI: { color: "#9CA3AF", bg: "#9CA3AF15", emoji: "❓", label: "TIDAK DAPAT DIVERIFIKASI" },
  };

  const style = verdictStyles[result.verdict] || verdictStyles.HOAKS;

  return (
    <div className="space-y-2">
      {/* Hidden Card Template for html2canvas */}
      <div 
        ref={cardRef}
        style={{
          width: "1080px",
          height: "1080px",
          display: "none",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0F1E",
          padding: "80px 100px",
          position: "fixed", // Keep off-screen
          top: "-2000px",
          left: "-2000px",
          fontFamily: "'Inter', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Decorative Grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(${style.color}08 1px, transparent 1px), linear-gradient(90deg, ${style.color}08 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
          zIndex: 0
        }} />

        {/* Glow */}
        <div style={{
          position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)",
          width: 900, height: 700, borderRadius: "50%",
          background: `radial-gradient(circle, ${style.color}15, transparent 70%)`,
          zIndex: 0
        }} />

        <div style={{ zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "60px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #3B82F6, #1D4ED8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield style={{ color: "white", width: "28px", height: "28px" }} />
            </div>
            <div style={{ fontSize: "30px", fontWeight: 800, color: "#F9FAFB", letterSpacing: "-0.5px" }}>
              Jaga<span style={{ color: "#3B82F6" }}>Fakta</span>
            </div>
          </div>

          {/* Verdict Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "18px 36px", borderRadius: "20px", border: `2px solid ${style.color}60`, backgroundColor: style.bg, marginBottom: "44px" }}>
            <span style={{ fontSize: "48px" }}>{style.emoji}</span>
            <span style={{ fontSize: "38px", fontWeight: 900, color: style.color, letterSpacing: "2px" }}>{style.label}</span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: "36px", fontWeight: 800, color: "#F9FAFB", textAlign: "center", lineHeight: 1.4, marginBottom: "28px", maxWidth: "840px" }}>
            "{result.title}"
          </h1>

          {/* Explanation */}
          <p style={{ fontSize: "24px", color: "#9CA3AF", textAlign: "center", lineHeight: 1.5, marginBottom: "48px", maxWidth: "820px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {result.explanation}
          </p>

          {/* Confidence Meter */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "60px", width: "100%" }}>
            <div style={{ fontSize: "18px", color: "#6B7280", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" }}>Tingkat Keyakinan AI</div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "center" }}>
              <div style={{ width: "420px", height: "12px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ width: `${result.confidence_score}%`, height: "100%", borderRadius: "6px", background: `linear-gradient(90deg, ${style.color}aa, ${style.color})` }} />
              </div>
              <span style={{ fontSize: "28px", fontWeight: 800, color: style.color }}>{result.confidence_score}%</span>
            </div>
          </div>

          {/* Watermark */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 28px", borderRadius: "50px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}>
            <Search style={{ color: "#9CA3AF", width: "20px", height: "20px" }} />
            <span style={{ fontSize: "20px", color: "#6B7280" }}>jagafakta.id · Cek Sebelum Sebar</span>
          </div>
        </div>
      </div>

      {/* Share row */}
      <div className="flex items-center gap-2">
        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                     bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20
                     hover:bg-[#25D366]/15 transition-colors text-sm font-medium"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Bagikan ke</span> WhatsApp
        </motion.a>

        <motion.button
          onClick={handleCopyLink}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                     bg-surface-2 text-text-muted border border-border-subtle
                     hover:text-text-primary hover:border-accent/30 transition-all text-sm font-medium"
        >
          {copied ? (
            <><Check className="w-4 h-4 text-fakta" /><span className="text-fakta">Tersalin!</span></>
          ) : (
            <><Link2 className="w-4 h-4" />Salin Link</>
          )}
        </motion.button>
      </div>

      {/* Buat Kartu Fakta button */}
      <motion.button
        onClick={handleOpenCard}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        id="buat-kartu-btn"
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                   bg-gradient-to-r from-accent/10 to-purple-600/10
                   text-text-muted border border-accent/15
                   hover:border-accent/35 hover:text-text-primary transition-all text-sm font-medium"
      >
        <ImageDown className="w-4 h-4 text-accent" />
        <span>Buat Kartu Fakta</span>
        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent font-bold">PNG</span>
      </motion.button>

      {/* Card preview modal */}
      <AnimatePresence>
        {cardOpen && (
          <motion.div
            key="card-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setCardOpen(false); }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="glass-strong rounded-2xl border border-white/[0.1] shadow-2xl overflow-hidden w-full max-w-sm"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
                <div className="flex items-center gap-2">
                  <ImageDown className="w-4 h-4 text-accent" />
                  <span className="font-jakarta font-bold text-text-primary text-sm">Kartu Fakta</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent font-bold">Instagram-Ready</span>
                </div>
                <button onClick={() => setCardOpen(false)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Card preview */}
              <div className="p-5 space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-white/[0.06] bg-black/20 flex items-center justify-center" style={{ aspectRatio: "1/1" }}>
                  {cardLoading || !previewUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-6 h-6 text-accent animate-spin" />
                      <span className="text-xs text-text-muted">Membuat kartu...</span>
                    </div>
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Preview Kartu Fakta"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                        <span className="text-xs text-white/60 bg-black/40 px-3 py-1 rounded-full">Preview</span>
                      </div>
                    </>
                  )}
                </div>

                <p className="text-xs text-text-muted text-center leading-relaxed">
                  Kartu 1080×1080px siap untuk <strong className="text-text-primary">Instagram Story</strong>, 
                  {" "}<strong className="text-text-primary">WhatsApp Status</strong>, atau <strong className="text-text-primary">Twitter/X</strong>
                </p>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleDownloadCard}
                    disabled={cardLoading || !previewUrl}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                               bg-accent text-white text-sm font-semibold
                               hover:bg-blue-500 disabled:opacity-60 transition-all"
                  >
                    <ImageDown className="w-4 h-4" />
                    Unduh PNG
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
