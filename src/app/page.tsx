"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ImageIcon, Newspaper, AlertCircle, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StatsBar from "@/components/ui/StatsBar";
import InputTabs from "@/components/ui/InputTabs";
import ExampleCases from "@/components/ui/ExampleCases";
import VerdictCard from "@/components/ui/VerdictCard";
import VerdictReveal from "@/components/ui/VerdictReveal";
import BadgeNotification from "@/components/ui/BadgeNotification";
import { recordCheck, getUserProfile, type Badge } from "@/lib/gamification";
import { Map, Trophy, MessageCircle, ChevronRight, Zap, Users, BarChart2, Network, Brain, Dna, Chrome, Globe, Newspaper as NewspaperIcon } from "lucide-react";
import Link from "next/link";
import type { FactCheckResult } from "@/types";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");
  const [inputText, setInputText] = useState("");
  const [uploadedImage, setUploadedImage] = useState<{
    file: File;
    base64: string;
    preview: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  /** Sync user profile to leaderboard after a check */
  const syncToLeaderboard = useCallback(async () => {
    try {
      const profile = getUserProfile();
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymousId: profile.anonymousId,
          displayName: profile.displayName,
          totalChecks: profile.totalChecks,
          currentStreak: profile.currentStreak,
          longestStreak: profile.longestStreak,
          badges: profile.badges,
        }),
      });
    } catch {
      // Non-critical — don't block UX
    }
  }, []);

  useEffect(() => {
    // Handle extension query param ?q=
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("q");
      if (query) {
        setInputText(query);
      }
    }
  }, []);
  const handleExampleSelect = (text: string) => {
    setActiveTab("text");
    setInputText(text);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    // Validate
    if (activeTab === "text" && inputText.trim().length === 0) {
      toast.error("Masukkan teks untuk diverifikasi");
      return;
    }
    if (activeTab === "image" && !uploadedImage) {
      toast.error("Upload gambar untuk diverifikasi");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const body =
        activeTab === "text"
          ? { inputType: "text", content: inputText.trim() }
          : {
              inputType: "image",
              imageBase64: uploadedImage!.base64,
              imageMimeType: uploadedImage!.file.type,
            };

      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan saat memverifikasi.");
      }

      setResult(data as FactCheckResult);

      // Track gamification
      try {
        const { newBadges } = recordCheck();
        if (newBadges.length > 0) {
          // Show the first new badge (queue if multiple)
          setNewBadge(newBadges[0]);
        }
        // Sync to leaderboard in background
        syncToLeaderboard();
      } catch {
        // Gamification is non-critical
      }

      // Scroll to reveal after a short delay (animation plays first)
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak terduga.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setInputText("");
    setUploadedImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Badge unlock celebration */}
      <BadgeNotification badge={newBadge} onClose={() => setNewBadge(null)} />
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 noise-bg" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full
                         bg-accent/[0.04] blur-[120px] pointer-events-none" />
          <div className="absolute top-40 right-0 w-32 h-32 rounded-full
                         bg-blue-500/[0.06] blur-[80px] animate-float pointer-events-none" />
          <div className="absolute top-60 left-10 w-20 h-20 rounded-full
                         bg-accent/[0.08] blur-[60px] animate-float pointer-events-none"
               style={{ animationDelay: "2s" }} />

          <div className="relative max-w-2xl mx-auto px-4 pt-12 sm:pt-16 pb-8">
            {/* Powered by badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-6"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                             text-[11px] font-medium bg-accent/8 text-accent/70 border border-accent/15">
                <span className="text-sm">🤖</span>
                Powered by Gemini 2.0 Flash
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center font-jakarta font-extrabold text-3xl sm:text-4xl md:text-5xl
                         leading-tight tracking-tight text-text-primary mb-4"
            >
              Cek Hoaks,
              <br />
              <span className="bg-gradient-to-r from-accent via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Sebelum Terlambat.
              </span>
            </motion.h1>

            {/* Sub-heading */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-center text-sm sm:text-base text-text-muted leading-relaxed max-w-lg mx-auto mb-8"
            >
              Verifikasi teks atau gambar dari WhatsApp secara instan dengan AI.
              <br className="hidden sm:block" />
              <span className="text-text-primary/70 font-medium"> Gratis. Akurat. Real-time.</span>
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mb-8"
            >
              <StatsBar />
            </motion.div>

            {/* Main Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="glass-strong rounded-2xl p-4 sm:p-6 shadow-glow-sm space-y-5"
            >
              <InputTabs
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  setError(null);
                }}
                inputText={inputText}
                onTextChange={setInputText}
                uploadedImage={uploadedImage}
                onImageChange={setUploadedImage}
                isLoading={isLoading}
                onSubmit={handleSubmit}
              />

              <ExampleCases onSelect={handleExampleSelect} />
            </motion.div>

          </div>
        </section>

        {/* ── VerdictReveal: handles loading scanner + dramatic reveal ── */}
        <div ref={resultRef} className="scroll-mt-20">
          <VerdictReveal isLoading={isLoading} result={result}>
            <div className="space-y-6">
              {result && <VerdictCard result={result} />}
              <div className="flex justify-center">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl glass-strong
                             text-text-muted hover:text-text-primary transition-all group"
                >
                  <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" />
                  Cek Konten Lain
                </button>
              </div>
            </div>
          </VerdictReveal>
        </div>

        {/* Features Dashboard Section */}
        {!isLoading && !result && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-20 mb-12 max-w-5xl mx-auto px-4"
          >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-jakarta font-extrabold text-xl sm:text-2xl text-text-primary">
                      Eksplorasi JagaFakta
                    </h2>
                    <p className="text-sm text-text-muted">Platform lengkap anti-misinformasi Indonesia.</p>
                  </div>
                  <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-accent/10 text-accent border border-accent/20 uppercase tracking-wider">
                    🌟 Phase 5 Aktif
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Peta Hoaks */}
                  <Link href="/peta-hoaks" className="group">
                    <div className="glass h-full p-6 rounded-2xl border border-white/[0.05] group-hover:border-hoaks/30 
                                    transition-all hover:-translate-y-1 relative overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
                        <Map className="w-32 h-32" />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-hoaks/10 flex items-center justify-center mb-4">
                        <Map className="w-6 h-6 text-hoaks" />
                      </div>
                      <h3 className="font-jakarta font-bold text-lg text-text-primary mb-2">Peta Hoaks</h3>
                      <p className="text-sm text-text-muted mb-4">Lihat sebaran hoaks secara real-time di seluruh wilayah Indonesia.</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-hoaks">
                        Lihat Peta <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>

                  {/* Tren Hoaks — NEW Phase 2 */}
                  <Link href="/tren" className="group">
                    <div className="glass h-full p-6 rounded-2xl border border-white/[0.05] group-hover:border-accent/30 
                                    transition-all hover:-translate-y-1 relative overflow-hidden">
                      <div className="absolute top-3 right-3">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">NEW</span>
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
                        <BarChart2 className="w-32 h-32" />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                        <BarChart2 className="w-6 h-6 text-accent" />
                      </div>
                      <h3 className="font-jakarta font-bold text-lg text-text-primary mb-2">Tren Hoaks</h3>
                      <p className="text-sm text-text-muted mb-4">Dashboard tren mingguan, topik viral, dan prediksi AI seperti Google Trends.</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-accent">
                        Lihat Tren <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>

                  {/* Jaringan Hoaks — NEW Phase 2 */}
                  <Link href="/jaringan-hoaks" className="group">
                    <div className="glass h-full p-6 rounded-2xl border border-white/[0.05] group-hover:border-purple-500/30 
                                    transition-all hover:-translate-y-1 relative overflow-hidden">
                      <div className="absolute top-3 right-3">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">NEW</span>
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
                        <Network className="w-32 h-32" />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                        <Network className="w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="font-jakarta font-bold text-lg text-text-primary mb-2">Jaringan Hoaks</h3>
                      <p className="text-sm text-text-muted mb-4">Graf interaktif yang menunjukkan bagaimana satu hoaks terhubung dengan yang lain.</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                        Lihat Graph <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>

                  {/* Leaderboard */}
                  <Link href="/leaderboard" className="group">
                    <div className="glass h-full p-6 rounded-2xl border border-white/[0.05] group-hover:border-yellow-500/30 
                                    transition-all hover:-translate-y-1 relative overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
                        <Trophy className="w-32 h-32" />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                      </div>
                      <h3 className="font-jakarta font-bold text-lg text-text-primary mb-2">Leaderboard</h3>
                      <p className="text-sm text-text-muted mb-4">Kumpulkan badge dan jadilah pejuang anti-hoaks terbaik.</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-500">
                        Cek Peringkat <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>

                  {/* AI Chat — NEW Phase 2 hint */}
                  <div className="group">
                    <div className="glass h-full p-6 rounded-2xl border border-white/[0.05] group-hover:border-cyan-500/30 
                                    transition-all hover:-translate-y-1 relative overflow-hidden">
                      <div className="absolute top-3 right-3">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">NEW</span>
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
                        <Brain className="w-32 h-32" />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                        <Brain className="w-6 h-6 text-cyan-400" />
                      </div>
                      <h3 className="font-jakarta font-bold text-lg text-text-primary mb-2">AI Chat Mode</h3>
                      <p className="text-sm text-text-muted mb-4">Tanya lebih dalam ke AI setelah verifikasi. Muncul otomatis di bawah hasil cek.</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                        Cek konten dulu ↑
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Bot */}
                  <Link href="/whatsapp" className="group">
                    <div className="glass h-full p-6 rounded-2xl border border-white/[0.05] group-hover:border-green-500/30 
                                    transition-all hover:-translate-y-1 relative overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
                        <MessageCircle className="w-32 h-32" />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                        <MessageCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <h3 className="font-jakarta font-bold text-lg text-text-primary mb-2">WhatsApp Bot</h3>
                      <p className="text-sm text-text-muted mb-4">Forward pesan mencurigakan langsung ke nomor WhatsApp kami.</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-green-500">
                        Coba Bot <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>

                  {/* Community Reports — Phase 4 */}
                  <Link href="/komunitas" className="group">
                    <div className="glass h-full p-6 rounded-2xl border border-white/[0.05] group-hover:border-green-400/30 
                                    transition-all hover:-translate-y-1 relative overflow-hidden">
                      <div className="absolute top-3 right-3">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">P4</span>
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
                        <Users className="w-32 h-32" />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-green-400" />
                      </div>
                      <h3 className="font-jakarta font-bold text-lg text-text-primary mb-2">Komunitas</h3>
                      <p className="text-sm text-text-muted mb-4">Laporkan hoaks, vote verdict AI, dan jadilah kontributor terbaik.</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-green-400">
                        Lihat Laporan <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>

                  {/* Daily Digest — Phase 4 */}
                  <Link href="/daily" className="group">
                    <div className="glass h-full p-6 rounded-2xl border border-white/[0.05] group-hover:border-orange-400/30 
                                    transition-all hover:-translate-y-1 relative overflow-hidden">
                      <div className="absolute top-3 right-3">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">P4</span>
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
                        <NewspaperIcon className="w-32 h-32" />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-orange-400/10 flex items-center justify-center mb-4">
                        <NewspaperIcon className="w-6 h-6 text-orange-400" />
                      </div>
                      <h3 className="font-jakarta font-bold text-lg text-text-primary mb-2">Daily Digest</h3>
                      <p className="text-sm text-text-muted mb-4">Rangkuman top hoaks & fakta hari ini + tips literasi digital.</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
                        Baca Digest <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>

                  {/* Browser Extension — Phase 4 */}
                  <Link href="/extension" className="group">
                    <div className="glass h-full p-6 rounded-2xl border border-white/[0.05] group-hover:border-sky-400/30 
                                    transition-all hover:-translate-y-1 relative overflow-hidden">
                      <div className="absolute top-3 right-3">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/20">P4</span>
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
                        <Chrome className="w-32 h-32" />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-sky-400/10 flex items-center justify-center mb-4">
                        <Chrome className="w-6 h-6 text-sky-400" />
                      </div>
                      <h3 className="font-jakarta font-bold text-lg text-text-primary mb-2">Ekstensi Browser</h3>
                      <p className="text-sm text-text-muted mb-4">Cek hoaks langsung dari browser tanpa buka website.</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                        Download <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>

                  {/* Hoax DNA — Phase 5 */}
                  <div className="group">
                    <div className="glass h-full p-6 rounded-2xl border border-white/[0.05] group-hover:border-purple-400/30 
                                    transition-all hover:-translate-y-1 relative overflow-hidden">
                      <div className="absolute top-3 right-3">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">P5</span>
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
                        <Dna className="w-32 h-32" />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center mb-4">
                        <Dna className="w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="font-jakarta font-bold text-lg text-text-primary mb-2">Hoax DNA</h3>
                      <p className="text-sm text-text-muted mb-4">Identifikasi pola manipulasi unik di setiap konten hoaks.</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                        Otomatis di hasil cek ↑
                      </div>
                    </div>
                  </div>

                  {/* Multi-Language — Phase 5 */}
                  <div className="group">
                    <div className="glass h-full p-6 rounded-2xl border border-white/[0.05] group-hover:border-emerald-400/30 
                                    transition-all hover:-translate-y-1 relative overflow-hidden">
                      <div className="absolute top-3 right-3">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">P5</span>
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
                        <Globe className="w-32 h-32" />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center mb-4">
                        <Globe className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="font-jakarta font-bold text-lg text-text-primary mb-2">Multi-Bahasa</h3>
                      <p className="text-sm text-text-muted mb-4">Cek hoaks dalam Bahasa Jawa, Sunda, Melayu, Tagalog, dan English.</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        Ganti bahasa di header ↑
                      </div>
                    </div>
                  </div>
                </div>

                {/* Viral Stats Mini Dashboard */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass p-5 rounded-2xl border border-white/[0.05] flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Komunitas</p>
                      <p className="text-sm text-text-primary font-medium">Bergabung dengan 1.2k+ pemeriksa fakta hari ini.</p>
                    </div>
                  </div>
                  <div className="glass p-5 rounded-2xl border border-white/[0.05] flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Kecepatan AI</p>
                      <p className="text-sm text-text-primary font-medium">Verifikasi instan dalam &lt; 3 detik dengan Gemini 2.0.</p>
                    </div>
                  </div>
                </div>
          </motion.section>
        )}


        {/* Error Display */}
        {error && !isLoading && (
          <section className="max-w-2xl mx-auto px-4 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 verdict-hoaks space-y-3"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-hoaks" />
                <p className="text-sm font-medium text-hoaks">Terjadi Kesalahan</p>
              </div>
              <p className="text-sm text-text-muted">{error}</p>
              <button
                onClick={handleSubmit}
                className="text-sm text-accent hover:underline underline-offset-2"
              >
                Coba lagi →
              </button>
            </motion.div>
          </section>
        )}

        {/* Features Section */}
        {!result && !isLoading && (
          <section className="max-w-2xl mx-auto px-4 pb-16 pt-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {[
                {
                  icon: <Search className="w-5 h-5 text-accent" />,
                  title: "Analisis Teks",
                  desc: "Paste teks forward-an langsung",
                },
                {
                  icon: <ImageIcon className="w-5 h-5 text-accent" />,
                  title: "Deteksi Gambar",
                  desc: "Upload screenshot hoaks",
                },
                {
                  icon: <Newspaper className="w-5 h-5 text-accent" />,
                  title: "Sumber Terpercaya",
                  desc: "Didukung Google Search",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="glass rounded-xl p-4 flex flex-col items-center text-center gap-2
                             hover:-translate-y-0.5 transition-transform"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="font-jakarta font-semibold text-sm text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-text-muted">{feature.desc}</p>
                </div>
              ))}
            </motion.div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
