"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  Info,
  HelpCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Shield,
  ArrowLeft,
  Filter,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { VERDICT_CONFIG, formatRelativeTime, formatNumber } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { VerdictType, FactCheckRecord } from "@/types";

const verdictIcons: Record<VerdictType, React.ReactNode> = {
  HOAKS: <AlertTriangle className="w-3.5 h-3.5" />,
  FAKTA: <CheckCircle className="w-3.5 h-3.5" />,
  KONTEKS_HILANG: <Info className="w-3.5 h-3.5" />,
  TIDAK_DAPAT_DIVERIFIKASI: <HelpCircle className="w-3.5 h-3.5" />,
};

const verdictTextClasses: Record<VerdictType, string> = {
  HOAKS: "text-hoaks bg-hoaks/10 border-hoaks/20",
  FAKTA: "text-fakta bg-fakta/10 border-fakta/20",
  KONTEKS_HILANG: "text-konteks bg-konteks/10 border-konteks/20",
  TIDAK_DAPAT_DIVERIFIKASI: "text-unverified bg-unverified/10 border-unverified/20",
};

const ITEMS_PER_PAGE = 20;

interface StatsOverview {
  total_checks: number;
  total_hoaks: number;
  total_fakta: number;
  total_konteks: number;
  total_unverified: number;
}

export default function HistoryPage() {
  const [records, setRecords] = useState<FactCheckRecord[]>([]);
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch stats
  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() =>
        setStats({ total_checks: 0, total_hoaks: 0, total_fakta: 0, total_konteks: 0, total_unverified: 0 })
      );
  }, []);

  // Fetch records
  const fetchRecords = useCallback(
    async (reset = false) => {
      try {
        if (reset) {
          setIsRefreshing(true);
          setPage(0);
        }

        const currentPage = reset ? 0 : page;
        const from = currentPage * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        let query = supabase
          .from("fact_checks")
          .select("id, verdict, confidence_score, title, explanation, keywords, created_at, input_type, share_count, key_claims, misleading_elements, sources, context")
          .order("created_at", { ascending: false })
          .range(from, to);

        if (filter !== "all") {
          query = query.eq("verdict", filter);
        }

        if (debouncedQuery.trim()) {
          query = query.or(
            `title.ilike.%${debouncedQuery}%,explanation.ilike.%${debouncedQuery}%`
          );
        }

        const { data, error } = await query;

        if (error) {
          console.error("Supabase query error:", error);
          return;
        }

        const fetched = (data || []) as unknown as FactCheckRecord[];
        setHasMore(fetched.length === ITEMS_PER_PAGE);

        if (reset) {
          setRecords(fetched);
        } else {
          setRecords((prev) => [...prev, ...fetched]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [page, filter, debouncedQuery]
  );

  useEffect(() => {
    setRecords([]);
    setPage(0);
    setHasMore(true);
    setIsLoading(true);
    fetchRecords(true);
  }, [filter, debouncedQuery]);

  useEffect(() => {
    if (page > 0) {
      fetchRecords();
    }
  }, [page]);

  const handleLoadMore = () => {
    setPage((p) => p + 1);
  };

  const statCards = [
    { label: "Total Dicek", value: stats?.total_checks || 0, icon: Search, color: "text-accent" },
    { label: "Hoaks", value: stats?.total_hoaks || 0, icon: AlertTriangle, color: "text-hoaks" },
    { label: "Fakta", value: stats?.total_fakta || 0, icon: CheckCircle, color: "text-fakta" },
    { label: "Lainnya", value: (stats?.total_konteks || 0) + (stats?.total_unverified || 0), icon: HelpCircle, color: "text-unverified" },
  ];

  const filterOptions = [
    { key: "all", label: "Semua" },
    { key: "HOAKS", label: "Hoaks" },
    { key: "FAKTA", label: "Fakta" },
    { key: "KONTEKS_HILANG", label: "Konteks" },
    { key: "TIDAK_DAPAT_DIVERIFIKASI", label: "Lainnya" },
  ];

  return (
    <>
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-6 sm:py-8 w-full">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </motion.div>

        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-jakarta font-bold text-xl sm:text-2xl text-text-primary">
            Riwayat Pengecekan
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Lihat semua konten yang pernah diverifikasi oleh JagaFakta
          </p>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {statCards.map((stat, i) => (
            <div key={i} className="glass rounded-xl p-3 sm:p-4 text-center space-y-1">
              <stat.icon className={`w-5 h-5 mx-auto ${stat.color}`} />
              <p className={`font-jakarta font-bold text-lg ${stat.color}`}>
                {formatNumber(stat.value)}
              </p>
              <p className="text-[10px] sm:text-xs text-text-muted">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Filter & Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-3 mb-6 space-y-3"
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan judul atau penjelasan..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface text-sm text-text-primary
                         border border-border-subtle placeholder:text-text-muted/50
                         focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30
                         transition-all"
              id="search-history"
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <Filter className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            {filterOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                           ${
                             filter === opt.key
                               ? "bg-accent/15 text-accent border border-accent/25"
                               : "bg-surface-2/50 text-text-muted border border-transparent hover:text-text-primary"
                           }`}
              >
                {opt.label}
              </button>
            ))}

            {/* Refresh */}
            <button
              onClick={() => fetchRecords(true)}
              disabled={isRefreshing}
              className="ml-auto flex-shrink-0 p-1.5 rounded-lg text-text-muted hover:text-accent transition-all"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </motion.div>

        {/* Records List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-6 skeleton rounded-md" />
                  <div className="flex-1 h-4 skeleton rounded" />
                </div>
                <div className="h-3 w-3/4 skeleton rounded" />
                <div className="h-3 w-1/2 skeleton rounded" />
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
              <Shield className="w-10 h-10 text-text-muted/30" />
            </div>
            <h3 className="font-jakarta font-semibold text-text-primary mb-2">
              Belum Ada Data Pengecekan
            </h3>
            <p className="text-sm text-text-muted mb-4 max-w-xs">
              {debouncedQuery || filter !== "all"
                ? "Tidak ditemukan hasil yang cocok dengan pencarian Anda."
                : "Mulai verifikasi konten untuk melihat riwayat di sini."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                         bg-gradient-to-r from-accent to-blue-600 text-white text-sm font-medium
                         hover:shadow-glow-md transition-all"
            >
              <Search className="w-4 h-4" />
              Mulai Cek Sekarang
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {records.map((record, i) => {
                const config = VERDICT_CONFIG[record.verdict];
                const isExpanded = expandedId === record.id;

                return (
                  <motion.div
                    key={record.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass rounded-xl overflow-hidden"
                  >
                    {/* Main row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : record.id)}
                      className="w-full p-4 text-left hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {/* Verdict badge */}
                        <span
                          className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md 
                                      text-[10px] font-bold border ${verdictTextClasses[record.verdict]}`}
                        >
                          {verdictIcons[record.verdict]}
                          {config.labelShort}
                        </span>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <h3 className="text-sm font-medium text-text-primary truncate">
                            {record.title}
                          </h3>
                          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                            {record.explanation}
                          </p>

                          {/* Meta row */}
                          <div className="flex items-center gap-3 pt-1">
                            <span className="text-[10px] text-text-muted/60">
                              {record.confidence_score}% keyakinan
                            </span>
                            <span className="text-[10px] text-text-muted/40">•</span>
                            <span className="text-[10px] text-text-muted/60">
                              {formatRelativeTime(record.created_at)}
                            </span>
                          </div>

                          {/* Keywords */}
                          {record.keywords && record.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {record.keywords.slice(0, 3).map((kw, ki) => (
                                <span
                                  key={ki}
                                  className="px-1.5 py-0.5 rounded text-[9px] bg-surface-2 text-text-muted/70"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Expand icon */}
                        <div className="flex-shrink-0 text-text-muted/40">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/[0.04]">
                            <div>
                              <p className="text-xs font-medium text-text-muted mb-1">Penjelasan Lengkap:</p>
                              <p className="text-sm text-text-primary/80 leading-relaxed">
                                {record.explanation}
                              </p>
                            </div>

                            {record.key_claims && record.key_claims.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-text-muted mb-1">Klaim:</p>
                                <ul className="space-y-1">
                                  {record.key_claims.map((c, ci) => (
                                    <li key={ci} className="text-xs text-text-muted flex gap-1.5">
                                      <span className="mt-1.5 w-1 h-1 rounded-full bg-accent/50 flex-shrink-0" />
                                      {c}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {record.context && (
                              <p className="text-xs text-text-muted/70 italic">
                                💡 {record.context}
                              </p>
                            )}

                            {record.sources && record.sources.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-text-muted mb-1">Sumber:</p>
                                <div className="space-y-1">
                                  {record.sources.map((s, si) => (
                                    <a
                                      key={si}
                                      href={typeof s === "object" && s !== null ? (s as { url?: string }).url : "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block text-xs text-accent hover:underline truncate"
                                    >
                                      {typeof s === "object" && s !== null ? (s as { title?: string }).title : "Sumber"}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Load More */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-2 pb-4"
              >
                <button
                  onClick={handleLoadMore}
                  className="w-full py-3 rounded-xl glass text-sm font-medium text-text-muted
                             hover:text-accent hover:border-accent/20 transition-all"
                >
                  Muat Lebih Banyak
                </button>
              </motion.div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
