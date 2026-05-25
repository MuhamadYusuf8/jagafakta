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
        <section className="relative overflow-hidden min-h-[90vh] flex flex-col justify-center">
          {/* Enhanced Background Effects */}
          <div className="absolute inset-0 noise-bg opacity-40 mix-blend-overlay" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-background to-background" />
          
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full
                         bg-gradient-to-b from-accent/20 to-transparent blur-[120px] pointer-events-none" />
          <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full
                         bg-blue-600/10 blur-[120px] animate-pulse-slow pointer-events-none" />
          <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] rounded-full
                         bg-purple-600/10 blur-[120px] animate-pulse-slow pointer-events-none"
               style={{ animationDelay: "2s" }} />

          <div className="relative max-w-3xl mx-auto px-4 pt-20 sm:pt-28 pb-12 z-10">
            {/* Premium Powered by badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex justify-center mb-8"
            >
              <div className="relative group cursor-default">
                <div className="absolute inset-0 bg-gradient-to-r from-accent via-blue-500 to-purple-500 rounded-full blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="relative flex items-center gap-2 px-5 py-2 rounded-full
                               bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
                  <span className="text-sm">🤖</span>
                  <span className="text-xs sm:text-sm font-semibold text-white/90 tracking-wide">
                    Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Gemini 2.0 Flash</span>
                  </span>
                  <span className="w-px h-3 bg-white/20 mx-1"></span>
                  <span className="text-xs font-bold text-accent flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Ultra-Fast
                  </span>
                </div>
              </div>
            </motion.div>

            {/* H1 - Massive & Bold */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
              className="text-center font-jakarta font-black text-5xl sm:text-6xl md:text-7xl
                         leading-[1.1] tracking-tight text-white mb-6 drop-shadow-xl"
            >
              Cek Hoaks,
              <br />
              <span className="relative inline-block mt-2">
                <span className="absolute -inset-2 bg-gradient-to-r from-accent via-blue-500 to-purple-500 blur-2xl opacity-20"></span>
                <span className="relative bg-gradient-to-r from-accent via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Sebelum Terlambat.
                </span>
              </span>
            </motion.h1>

            {/* Sub-heading */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              className="text-center text-base sm:text-lg text-text-muted leading-relaxed max-w-xl mx-auto mb-10"
            >
              Verifikasi teks atau gambar dari WhatsApp secara instan dengan kecerdasan buatan terdepan.
              <span className="block mt-2 text-white/80 font-medium">Gratis. Akurat. Real-time.</span>
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              className="mb-12 max-w-2xl mx-auto"
            >
              <StatsBar />
            </motion.div>

            {/* Main Card - Premium Glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
              className="relative group mx-auto max-w-2xl"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-b from-white/15 to-white/5 rounded-[2rem] blur-sm opacity-50 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-background/60 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-8 border border-white/[0.08] shadow-[0_0_40px_rgba(0,0,0,0.5)] space-y-6">
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

                <div className="pt-2">
                  <ExampleCases onSelect={handleExampleSelect} />
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Decorative scroll indicator */}
          {!isLoading && !result && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted/50"
            >
              <span className="text-[10px] uppercase tracking-widest font-bold">Scroll</span>
              <div className="w-px h-8 bg-gradient-to-b from-text-muted/50 to-transparent"></div>
            </motion.div>
          )}
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
            className="mt-12 mb-20 max-w-[1200px] mx-auto px-4"
          >
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 mb-3">
                      <span className="w-8 h-[2px] bg-accent rounded-full"></span>
                      <span className="text-accent font-bold text-sm tracking-wider uppercase">Ekosistem</span>
                    </div>
                    <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-white">
                      Eksplorasi JagaFakta
                    </h2>
                    <p className="text-base text-text-muted mt-2">Platform lengkap anti-misinformasi Indonesia.</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
                      Semua Sistem Online
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                  <div className="group lg:col-span-2">
                    <div className="glass h-full p-6 sm:p-8 rounded-[1.5rem] border border-white/[0.05] group-hover:border-emerald-400/30 
                                    transition-all hover:-translate-y-1 relative overflow-hidden bg-gradient-to-br from-white/[0.02] to-emerald-500/[0.02]">
                      <div className="absolute top-4 right-4">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">P5</span>
                      </div>
                      <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all group-hover:scale-110 duration-500">
                        <Globe className="w-48 h-48" />
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 flex items-center justify-center mb-5 border border-emerald-500/20">
                        <Globe className="w-7 h-7 text-emerald-400" />
                      </div>
                      <h3 className="font-jakarta font-bold text-xl text-white mb-2">Multi-Bahasa & Daerah</h3>
                      <p className="text-sm text-text-muted mb-6 max-w-sm">Verifikasi misinformasi yang beredar dalam berbagai bahasa daerah dan regional secara otomatis.</p>
                      <div className="flex flex-wrap gap-2">
                        {['Jawa', 'Sunda', 'Melayu', 'Tagalog', 'English'].map(lang => (
                          <span key={lang} className="px-3 py-1 text-[10px] font-bold rounded-md bg-white/5 text-white/70 border border-white/10">{lang}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Viral Stats Mini Dashboard */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="glass p-6 rounded-[1.5rem] border border-white/[0.05] flex items-center gap-5 hover:bg-white/[0.02] transition-colors">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 border border-accent/20">
                      <Users className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Komunitas Aktif</p>
                      <p className="text-base text-white font-medium">1.2k+ Pemeriksa</p>
                    </div>
                  </div>
                  <div className="glass p-6 rounded-[1.5rem] border border-white/[0.05] flex items-center gap-5 hover:bg-white/[0.02] transition-colors">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                      <Zap className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Kecepatan AI</p>
                      <p className="text-base text-white font-medium">&lt; 3 Detik / Verifikasi</p>
                    </div>
                  </div>
                  <div className="glass p-6 rounded-[1.5rem] border border-white/[0.05] flex items-center gap-5 hover:bg-white/[0.02] transition-colors">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 border border-green-500/20">
                      <search className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Akurasi Sistem</p>
                      <p className="text-base text-white font-medium">99.8% Terverifikasi</p>
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

        {/* Removed duplicate Features Section, since we have Eksplorasi JagaFakta */}
      </main>

      <Footer />
    </>
  );
}
