"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Network, Share2, Info, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import dynamic from "next/dynamic";
import type { GraphData } from "@/app/api/graph/route";

// Dynamic import to avoid SSR issues with canvas
const HoaxGraph = dynamic(() => import("@/components/ui/HoaxGraph"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center">
          <Network className="w-8 h-8 text-white animate-pulse" />
          <div className="absolute -inset-2 rounded-2xl border border-accent/20 animate-ping opacity-30" />
        </div>
        <p className="text-sm text-text-muted">Memuat graf hoaks...</p>
      </div>
    </div>
  ),
});

export default function JaringanHoaksPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGraph = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/graph");
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data: GraphData = await res.json();
      setGraphData(data);
    } catch {
      setError("Gagal memuat jaringan hoaks. Coba lagi.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchGraph(); }, []);

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col min-h-0">
        {/* Hero header */}
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0 noise-bg" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full bg-purple-600/[0.06] blur-[80px] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-10">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                    <Network className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 block">Phase 2 · Intelligence Layer</span>
                    <h1 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-text-primary">
                      Jaringan Hoaks Indonesia
                    </h1>
                  </div>
                </div>
                <p className="text-sm text-text-muted max-w-xl leading-relaxed">
                  Visualisasi <strong className="text-text-primary">web of lies</strong> — bagaimana satu hoaks terhubung dengan yang lain membentuk ekosistem misinformasi.
                  Hover node untuk detail, drag untuk mengatur, scroll untuk zoom.
                </p>

                {graphData && (
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                      <span><strong className="text-text-primary">{graphData.nodes.length}</strong> topik hoaks</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Share2 className="w-3.5 h-3.5 text-blue-400" />
                      <span><strong className="text-text-primary">{graphData.edges.length}</strong> koneksi terdeteksi</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Info className="w-3.5 h-3.5 text-accent" />
                      <span>Data dari <strong className="text-text-primary">{graphData.totalChecks.toLocaleString("id")}</strong> verifikasi</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={fetchGraph}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass text-text-muted
                           hover:text-text-primary hover:border-white/20 transition-all text-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </motion.div>
          </div>
        </section>

        {/* Graph area */}
        <div className="flex-1 relative" style={{ minHeight: "calc(100vh - 280px)" }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-glow-md">
                  <Network className="w-8 h-8 text-white animate-pulse" />
                  <div className="absolute -inset-2 rounded-2xl border border-purple-500/20 animate-ping opacity-40" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-text-primary font-medium">Membangun jaringan hoaks...</p>
                  <p className="text-xs text-text-muted mt-1">Menganalisis {`>`} 1.000 koneksi topik</p>
                </div>
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <p className="text-text-muted">{error}</p>
                <button onClick={fetchGraph} className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm hover:bg-blue-500 transition-colors">
                  Coba Lagi
                </button>
              </div>
            </div>
          )}

          {graphData && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <HoaxGraph data={graphData} />
            </motion.div>
          )}
        </div>

        {/* Info strip */}
        <div className="border-t border-white/[0.06] px-4 py-3">
          <p className="text-center text-xs text-text-muted max-w-2xl mx-auto">
            🔗 Ukuran node menunjukkan <strong className="text-text-primary">frekuensi kemunculan</strong> · Tebal garis menunjukkan <strong className="text-text-primary">kekuatan koneksi</strong> ·
            Warna menunjukkan <strong className="text-text-primary">kategori topik</strong>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
