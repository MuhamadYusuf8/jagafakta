"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Send, AlertTriangle, TrendingUp, Award, ThumbsUp,
  Loader2, CheckCircle, Clock, X, Shield,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getUserProfile } from "@/lib/gamification";
import toast from "react-hot-toast";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

interface Report {
  id: string;
  reporter_name: string;
  content: string;
  content_type: string;
  status: string;
  upvotes: number;
  created_at: string;
  verdict?: string;
}

export default function KomunitasPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [localReports, setLocalReports] = useState<Report[]>([]); // Store newly added reports
  const [accuracy, setAccuracy] = useState(92);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reportText, setReportText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reportsRes, accuracyRes] = await Promise.all([
        fetch("/api/community?action=reports"),
        fetch("/api/community?action=accuracy"),
      ]);
      const reportsData = await reportsRes.json();
      const accuracyData = await accuracyRes.json();
      setReports(reportsData.reports || []);
      setAccuracy(accuracyData.accuracy ?? 92);
      setTotalVotes(accuracyData.total_votes ?? 0);
    } catch {
      // Use defaults
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Seed reports if empty
  const apiReports = reports.length > 0 ? reports : [
    { id: "seed-1", reporter_name: "Andi_Jakarta", content: "Ada broadcast WA soal ATM BCA yang kena hack, minta ganti PIN segera", content_type: "text", status: "checked", upvotes: 23, created_at: new Date().toISOString(), verdict: "HOAKS" },
    { id: "seed-2", reporter_name: "Sarah_Bandung", content: "Video kucing berbicara bahasa Jawa viral di TikTok, diklaim AI deepfake", content_type: "text", status: "checked", upvotes: 18, created_at: new Date().toISOString(), verdict: "HOAKS" },
    { id: "seed-3", reporter_name: "Budi_Surabaya", content: "Harga BBM turun mulai bulan depan menurut surat edaran yang beredar", content_type: "text", status: "pending", upvotes: 15, created_at: new Date().toISOString() },
    { id: "seed-4", reporter_name: "Rina_Medan", content: "Screenshot berita Kompas tentang gempa Sumut, tapi tanggalnya 2019", content_type: "text", status: "checked", upvotes: 12, created_at: new Date().toISOString(), verdict: "KONTEKS_HILANG" },
    { id: "seed-5", reporter_name: "Dimas_Solo", content: "Forwarded message soal vitamin C dosis tinggi menyembuhkan COVID", content_type: "text", status: "checked", upvotes: 9, created_at: new Date().toISOString(), verdict: "HOAKS" },
  ];

  // Combine newly added local reports (at the top) with API/seed reports
  const displayReports: Report[] = [...localReports, ...apiReports];

  const handleSubmitReport = async () => {
    if (!reportText.trim() || submitting) return;
    setSubmitting(true);
    const profile = getUserProfile();

    try {
      const response = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "report",
          content: reportText.trim(),
          content_type: "text",
          reporter_id: profile.anonymousId,
          reporter_name: profile.displayName,
        }),
      });
      const data = await response.json();
      
      toast.success("Laporan berhasil dikirim! 🎉");
      
      // Add to local state so it appears immediately
      const newReport: Report = {
        id: data.id || `local-${Date.now()}`,
        reporter_name: profile.displayName,
        content: reportText.trim(),
        content_type: "text",
        status: "pending",
        upvotes: 0,
        created_at: new Date().toISOString()
      };
      setLocalReports(prev => [newReport, ...prev]);
      
      setReportText("");
      setShowForm(false);
      fetchData(); // Attempt to refresh API
    } catch {
      toast.error("Gagal mengirim laporan.");
    }
    setSubmitting(false);
  };

  const handleUpvote = async (reportId: string) => {
    try {
      await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upvote", report_id: reportId }),
      });
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, upvotes: r.upvotes + 1 } : r))
      );
    } catch { /* silent */ }
  };

  const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
    pending: { label: "Menunggu", icon: Clock, color: "text-konteks" },
    checked: { label: "Dicek", icon: CheckCircle, color: "text-fakta" },
    dismissed: { label: "Ditolak", icon: X, color: "text-hoaks" },
  };

  const verdictBadge: Record<string, { color: string; label: string }> = {
    HOAKS: { color: "bg-hoaks/15 text-hoaks border-hoaks/20", label: "HOAKS" },
    FAKTA: { color: "bg-fakta/15 text-fakta border-fakta/20", label: "FAKTA" },
    KONTEKS_HILANG: { color: "bg-konteks/15 text-konteks border-konteks/20", label: "KONTEKS" },
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 mb-4">
              <Users className="w-3.5 h-3.5" />
              Komunitas
            </div>
            <h1 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-text-primary mb-2">
              Laporan <span className="text-green-400">Komunitas</span>
            </h1>
            <p className="text-sm text-text-muted">Laporkan hoaks, vote verdict, dan bantu jaga kebenaran informasi.</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

              {/* Stats Cards */}
              <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* AI Accuracy */}
                <div className="glass rounded-xl p-5 text-center relative overflow-hidden">
                  <div className="absolute -right-3 -bottom-3 opacity-[0.03]"><Shield className="w-20 h-20" /></div>
                  <Award className="w-5 h-5 mx-auto mb-2 text-accent" />
                  <p className="font-jakarta font-extrabold text-3xl text-accent">{accuracy}%</p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Akurasi AI</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Berdasarkan {totalVotes} votes</p>
                </div>
                {/* Reports */}
                <div className="glass rounded-xl p-5 text-center">
                  <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-konteks" />
                  <p className="font-jakarta font-extrabold text-3xl text-konteks">{displayReports.length}</p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Laporan Aktif</p>
                </div>
                {/* Community */}
                <div className="glass rounded-xl p-5 text-center">
                  <TrendingUp className="w-5 h-5 mx-auto mb-2 text-fakta" />
                  <p className="font-jakarta font-extrabold text-3xl text-fakta">
                    {displayReports.reduce((s, r) => s + r.upvotes, 0)}
                  </p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Total Upvotes</p>
                </div>
              </motion.div>

              {/* Report Button / Form */}
              <motion.div variants={item}>
                <AnimatePresence mode="wait">
                  {!showForm ? (
                    <motion.button
                      key="btn"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setShowForm(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-accent/10 to-green-500/10 text-text-primary border border-accent/15 hover:border-accent/30 transition-all font-medium text-sm"
                    >
                      <Send className="w-4 h-4 text-accent" />
                      📝 Laporkan Hoaks Baru
                    </motion.button>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="glass rounded-2xl p-5 space-y-3 border border-accent/10"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-jakarta font-bold text-sm text-text-primary">Laporkan Hoaks</h3>
                        <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
                      </div>
                      <textarea
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                        placeholder="Paste teks hoaks yang kamu temukan di sini..."
                        rows={3}
                        maxLength={1000}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 text-sm text-text-primary placeholder:text-text-muted/50 resize-none focus:outline-none focus:border-accent/30"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-text-muted">{reportText.length}/1000</span>
                        <button
                          onClick={handleSubmitReport}
                          disabled={submitting || !reportText.trim()}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 transition-all"
                        >
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Kirim Laporan
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Reports List */}
              <motion.div variants={item} className="space-y-3">
                <h3 className="font-jakarta font-bold text-sm text-text-primary">Laporan Terbaru</h3>
                {displayReports.map((report, i) => {
                  const status = statusConfig[report.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  const badge = report.verdict ? verdictBadge[report.verdict] : null;

                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass rounded-xl p-4 border border-white/[0.04] hover:border-white/[0.08] transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-xs font-bold text-accent">@{report.reporter_name}</span>
                            <span className={`flex items-center gap-1 text-[10px] ${status.color}`}>
                              <StatusIcon className="w-3 h-3" /> {status.label}
                            </span>
                            {badge && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${badge.color}`}>
                                {badge.label}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-text-primary leading-relaxed line-clamp-2">{report.content}</p>
                          <p className="text-[10px] text-text-muted mt-1.5">
                            {new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        {/* Upvote */}
                        <button
                          onClick={() => handleUpvote(report.id)}
                          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg glass hover:bg-accent/5 transition-all group flex-shrink-0"
                        >
                          <ThumbsUp className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                          <span className="text-[10px] font-bold text-text-muted group-hover:text-accent">{report.upvotes}</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
