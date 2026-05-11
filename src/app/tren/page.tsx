"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2, TrendingUp, TrendingDown, Flame, Calendar,
  Brain, Loader2, RefreshCw, ArrowUpRight, ArrowDownRight, AlertTriangle
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Legend, Area, AreaChart
} from "recharts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { TrendsData, TrendingTopic } from "@/app/api/trends/route";

const VERDICT_COLORS = {
  hoaks:       "#EF4444",
  fakta:       "#22C55E",
  konteks:     "#F59E0B",
  unverified:  "#6B7280",
};

const MONTH_BG: Record<string, string> = {
  tinggi: "border-hoaks/30 bg-hoaks/5",
  sedang: "border-konteks/30 bg-konteks/5",
  rendah: "border-fakta/30 bg-fakta/5",
};
const MONTH_DOT: Record<string, string> = {
  tinggi: "bg-hoaks",
  sedang: "bg-konteks",
  rendah: "bg-fakta",
};
const MONTH_LABEL: Record<string, string> = {
  tinggi: "🔴 Risiko Tinggi",
  sedang: "🟡 Risiko Sedang",
  rendah: "🟢 Risiko Rendah",
};

// Custom tooltip for recharts
interface CTooltipProps { active?: boolean; payload?: {name:string;value:number;color:string}[]; label?: string; }
function CustomTooltip({ active, payload, label }: CTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2.5 text-xs border border-white/10 shadow-xl">
      <p className="font-semibold text-text-primary mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-muted capitalize">{p.name}:</span>
          <span className="font-medium text-text-primary">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function TopicBadge({ topic }: { topic: TrendingTopic }) {
  const isUp = topic.delta > 0;
  const verdictColors: Record<string, string> = {
    HOAKS: "text-hoaks bg-hoaks/10 border-hoaks/20",
    FAKTA: "text-fakta bg-fakta/10 border-fakta/20",
    KONTEKS_HILANG: "text-konteks bg-konteks/10 border-konteks/20",
    TIDAK_DAPAT_DIVERIFIKASI: "text-unverified bg-unverified/10 border-unverified/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: topic.rank * 0.1 }}
      className="flex items-center gap-3 p-3 rounded-xl glass border border-white/[0.05] hover:border-white/[0.1] transition-all"
    >
      {/* Rank */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-jakarta font-extrabold text-sm flex-shrink-0 ${
        topic.rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
        topic.rank === 2 ? "bg-slate-400/20 text-slate-400" :
        topic.rank === 3 ? "bg-orange-700/20 text-orange-600" :
        "bg-white/[0.05] text-text-muted"
      }`}>
        {topic.rank === 1 ? "🥇" : topic.rank === 2 ? "🥈" : topic.rank === 3 ? "🥉" : `#${topic.rank}`}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{topic.keyword}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${verdictColors[topic.verdict] || verdictColors.HOAKS}`}>
            {topic.verdict.replace(/_/g, " ")}
          </span>
          <span className="text-[10px] text-text-muted">{topic.category}</span>
        </div>
      </div>

      {/* Count + delta */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-text-primary">{topic.count}</p>
        <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${isUp ? "text-hoaks" : "text-fakta"}`}>
          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(topic.delta)}%
        </div>
      </div>
    </motion.div>
  );
}

export default function TrenPage() {
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const [activeMonth, setActiveMonth] = useState<number | null>(null);
  const currentMonth = new Date().getMonth() + 1;

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/trends");
      if (!res.ok) throw new Error("Gagal mengambil data");
      setData(await res.json());
    } catch {
      setError("Gagal memuat data tren. Coba lagi.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (data) setActiveMonth(currentMonth); }, [data, currentMonth]);

  const activeCalendar = data?.hoaxCalendar.find(c => c.monthNum === activeMonth);

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Page hero */}
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0 noise-bg" />
          <div className="absolute top-0 right-0 w-[400px] h-[300px] rounded-full bg-accent/[0.04] blur-[100px] pointer-events-none" />
          <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-10 flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center shadow-lg">
                  <BarChart2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Phase 2 · Intelligence Layer</span>
                  <h1 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-text-primary">Tren Hoaks Indonesia</h1>
                </div>
              </div>
              <p className="text-sm text-text-muted max-w-xl">Google Trends untuk hoaks — pantau naik-turunnya misinformasi, topik yang sedang viral, dan prediksi AI tentang apa yang mungkin trending berikutnya.</p>
            </div>
            <button onClick={fetchData} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass text-sm text-text-muted hover:text-text-primary transition-all disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Perbarui
            </button>
          </div>
        </section>

        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
            <p className="text-sm text-text-muted">Menganalisis tren hoaks... AI sedang bekerja 🤖</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center py-32 gap-4">
            <p className="text-text-muted">{error}</p>
            <button onClick={fetchData} className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm hover:bg-blue-500 transition-colors">Coba Lagi</button>
          </div>
        )}

        {data && !loading && (
          <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Dicek Minggu Ini", value: data.summary.totalThisWeek.toLocaleString("id"), icon: BarChart2, color: "text-accent", bg: "bg-accent/10" },
                { label: "Tingkat Hoaks", value: `${data.summary.hoaksRateThisWeek}%`, icon: AlertTriangle, color: "text-hoaks", bg: "bg-hoaks/10" },
                { label: "Hari Paling Aktif", value: data.summary.peakDay, icon: Flame, color: "text-konteks", bg: "bg-konteks/10" },
                { label: "Kategori Terbanyak", value: data.summary.mostActiveCategory, icon: TrendingUp, color: "text-fakta", bg: "bg-fakta/10" },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="glass rounded-2xl p-4 border border-white/[0.05]">
                  <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <p className={`font-jakarta font-extrabold text-xl ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Main chart */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-5 border border-white/[0.05]">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h2 className="font-jakarta font-bold text-text-primary text-lg">Tren 12 Minggu Terakhir</h2>
                  <p className="text-xs text-text-muted mt-0.5">Jumlah konten yang diverifikasi per kategori verdict</p>
                </div>
                <div className="flex rounded-xl overflow-hidden border border-white/[0.08]">
                  {(["area","bar"] as const).map(t => (
                    <button key={t} onClick={() => setChartType(t)}
                      className={`px-3 py-1.5 text-xs font-medium transition-all ${chartType === t ? "bg-accent/20 text-accent" : "text-text-muted hover:text-text-primary"}`}>
                      {t === "area" ? "Area" : "Bar"}
                    </button>
                  ))}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                {chartType === "area" ? (
                  <AreaChart data={data.weeklyTrends} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                    <defs>
                      {[["hoaks", VERDICT_COLORS.hoaks], ["fakta", VERDICT_COLORS.fakta], ["konteks", VERDICT_COLORS.konteks]].map(([key, color]) => (
                        <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="week" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <ReTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#9CA3AF" }} />
                    <Area type="monotone" dataKey="hoaks" stroke={VERDICT_COLORS.hoaks} strokeWidth={2} fill={`url(#grad-hoaks)`} dot={false} activeDot={{ r: 4 }} />
                    <Area type="monotone" dataKey="fakta" stroke={VERDICT_COLORS.fakta} strokeWidth={2} fill={`url(#grad-fakta)`} dot={false} activeDot={{ r: 4 }} />
                    <Area type="monotone" dataKey="konteks" stroke={VERDICT_COLORS.konteks} strokeWidth={2} fill={`url(#grad-konteks)`} dot={false} activeDot={{ r: 4 }} />
                  </AreaChart>
                ) : (
                  <BarChart data={data.weeklyTrends} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="week" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <ReTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#9CA3AF" }} />
                    <Bar dataKey="hoaks" fill={VERDICT_COLORS.hoaks} radius={[3,3,0,0]} fillOpacity={0.85} />
                    <Bar dataKey="fakta" fill={VERDICT_COLORS.fakta} radius={[3,3,0,0]} fillOpacity={0.85} />
                    <Bar dataKey="konteks" fill={VERDICT_COLORS.konteks} radius={[3,3,0,0]} fillOpacity={0.85} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </motion.div>

            {/* Trending + AI prediction row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trending topics */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-5 border border-white/[0.05]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-hoaks/10 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-hoaks" />
                  </div>
                  <div>
                    <h2 className="font-jakarta font-bold text-text-primary">Trending Hoaks</h2>
                    <p className="text-[11px] text-text-muted">5 klaim paling banyak dicek minggu ini</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {data.trendingTopics.map(t => <TopicBadge key={t.rank} topic={t} />)}
                </div>
              </motion.div>

              {/* AI Prediction */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-5 border border-white/[0.05] flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="font-jakarta font-bold text-text-primary">Prediksi AI</h2>
                    <p className="text-[11px] text-text-muted">Analisis tren oleh Gemini AI</p>
                  </div>
                </div>

                <div className="flex-1 relative rounded-xl overflow-hidden border border-purple-500/10 bg-purple-500/[0.03] p-4">
                  <div className="absolute top-3 right-3 text-purple-400/30">
                    <Brain className="w-16 h-16" />
                  </div>
                  <div className="relative">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse inline-block" />
                      Gemini 2.0 Flash · Analisis Real-time
                    </span>
                    <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">
                      {data.aiPrediction}
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-text-muted mt-3 text-center">
                  ⚠️ Prediksi AI bersifat indikatif dan dapat berubah seiring perkembangan situasi.
                </p>
              </motion.div>
            </div>

            {/* Hoax Calendar */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-5 border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h2 className="font-jakarta font-bold text-text-primary">Kalender Hoaks</h2>
                  <p className="text-[11px] text-text-muted">Pola hoaks berulang setiap tahun — klik bulan untuk detail</p>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5 mb-5">
                {data.hoaxCalendar.map((m) => {
                  const isActive = activeMonth === m.monthNum;
                  const isCurrent = currentMonth === m.monthNum;
                  return (
                    <button key={m.monthNum} onClick={() => setActiveMonth(m.monthNum)}
                      className={`relative flex flex-col items-center py-2 px-1 rounded-xl text-[10px] font-medium transition-all border ${
                        isActive ? `${MONTH_BG[m.riskLevel]} border-opacity-100` : "border-white/[0.05] hover:border-white/[0.15] hover:bg-white/[0.03]"
                      }`}>
                      {isCurrent && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />}
                      <span className={`w-1.5 h-1.5 rounded-full mb-1 ${isActive ? MONTH_DOT[m.riskLevel] : "bg-white/20"}`} />
                      <span className={isActive ? "text-text-primary font-bold" : "text-text-muted"}>{m.month.slice(0,3)}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {activeCalendar && (
                  <motion.div key={activeMonth} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className={`rounded-xl border p-4 ${MONTH_BG[activeCalendar.riskLevel]}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-jakarta font-bold text-text-primary">{activeCalendar.month}</h3>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${MONTH_BG[activeCalendar.riskLevel]}`}>
                        {MONTH_LABEL[activeCalendar.riskLevel]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeCalendar.events.map((ev, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.05] text-text-muted border border-white/[0.08]">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
