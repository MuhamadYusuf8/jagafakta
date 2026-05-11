"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar, AlertTriangle, CheckCircle, TrendingUp,
  Lightbulb, BarChart2, RefreshCw, Loader2,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { DailyDigest } from "@/types";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function DailyPage() {
  const [data, setData] = useState<DailyDigest | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDigest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/daily");
      const json = await res.json();
      setData(json);
    } catch {
      // Fallback handled by API
    }
    setLoading(false);
  };

  useEffect(() => { fetchDigest(); }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold border border-accent/20 mb-4">
              <Calendar className="w-3.5 h-3.5" />
              Rangkuman Harian
            </div>
            <h1 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-text-primary mb-2">
              Daily <span className="text-accent">Digest</span>
            </h1>
            <p className="text-sm text-text-muted">{dateStr}</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
          ) : data ? (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

              {/* Stats Row */}
              <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total Dicek", value: data.stats.total, icon: BarChart2, color: "text-accent" },
                  { label: "Hoaks", value: data.stats.hoaks, icon: AlertTriangle, color: "text-hoaks" },
                  { label: "Fakta", value: data.stats.fakta, icon: CheckCircle, color: "text-fakta" },
                  { label: "Konteks", value: data.stats.konteks, icon: TrendingUp, color: "text-konteks" },
                ].map((s, i) => (
                  <div key={i} className="glass rounded-xl p-4 text-center">
                    <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
                    <p className={`font-jakarta font-extrabold text-2xl ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </motion.div>

              {/* Two columns: Top Hoaks + Top Fakta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top Hoaks */}
                <motion.div variants={item} className="glass rounded-2xl p-5 border border-hoaks/10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-hoaks/10 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-hoaks" />
                    </div>
                    <div>
                      <h3 className="font-jakarta font-bold text-sm text-text-primary">🔴 Top 5 Hoaks</h3>
                      <p className="text-[10px] text-text-muted">Paling banyak dicek hari ini</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {data.top_hoaks.map((h, i) => (
                      <div key={i} className="flex items-start gap-3 group">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-hoaks/15 text-hoaks text-[10px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-text-primary leading-snug line-clamp-2 group-hover:text-hoaks transition-colors">{h.title}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">{h.count} kali dicek</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Top Fakta */}
                <motion.div variants={item} className="glass rounded-2xl p-5 border border-fakta/10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-fakta/10 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-fakta" />
                    </div>
                    <div>
                      <h3 className="font-jakarta font-bold text-sm text-text-primary">🟢 Top 5 Fakta</h3>
                      <p className="text-[10px] text-text-muted">Dikonfirmasi benar hari ini</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {data.top_fakta.map((f, i) => (
                      <div key={i} className="flex items-start gap-3 group">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-fakta/15 text-fakta text-[10px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-text-primary leading-snug line-clamp-2 group-hover:text-fakta transition-colors">{f.title}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">{f.count} kali dicek</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Literacy Tip */}
              <motion.div variants={item} className="glass rounded-2xl p-5 border border-konteks/15 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 opacity-[0.04]">
                  <Lightbulb className="w-28 h-28" />
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-konteks/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-konteks" />
                  </div>
                  <div>
                    <h3 className="font-jakarta font-bold text-sm text-text-primary mb-1">💡 Tips Literasi Digital</h3>
                    <p className="text-sm text-text-muted leading-relaxed">{data.tip}</p>
                  </div>
                </div>
              </motion.div>

              {/* Refresh button */}
              <motion.div variants={item} className="flex justify-center">
                <button onClick={fetchDigest} className="flex items-center gap-2 text-xs text-text-muted hover:text-accent transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </motion.div>

            </motion.div>
          ) : (
            <p className="text-center text-text-muted">Tidak dapat memuat data.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
