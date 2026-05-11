"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Eye,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import IndonesiaMap from "@/components/ui/IndonesiaMap";

interface ProvinceData {
  id: string;
  name: string;
  x: number;
  y: number;
  total: number;
  hoaks: number;
  fakta: number;
  konteks: number;
  recentTitles: string[];
}

interface HeatmapData {
  provinces: ProvinceData[];
  nasional: {
    total: number;
    hoaks: number;
    fakta: number;
    konteks: number;
    recentTitles: string[];
  };
  totalChecks: number;
}

export default function PetaHoaksPage() {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    try {
      const res = await fetch("/api/heatmap");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch heatmap data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get top provinces by hoaks count
  const topProvinces = data?.provinces
    .filter((p) => p.total > 0)
    .sort((a, b) => b.hoaks - a.hoaks)
    .slice(0, 5) || [];

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 noise-bg" />
          <div className="absolute top-20 left-1/4 w-[400px] h-[400px] rounded-full bg-hoaks/[0.03] blur-[120px] pointer-events-none" />
          <div className="absolute top-40 right-1/4 w-[300px] h-[300px] rounded-full bg-fakta/[0.03] blur-[100px] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 pt-8 sm:pt-12 pb-8">
            {/* Back */}
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

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium
                              bg-hoaks/8 text-hoaks/70 border border-hoaks/15 mb-4">
                <MapPin className="w-3.5 h-3.5" />
                Peta Interaktif Real-time
              </div>
              <h1 className="font-jakarta font-extrabold text-2xl sm:text-3xl md:text-4xl text-text-primary mb-3">
                Peta Hoaks{" "}
                <span className="bg-gradient-to-r from-hoaks via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Indonesia
                </span>
              </h1>
              <p className="text-sm text-text-muted max-w-lg mx-auto">
                Lihat sebaran hoaks dan fakta yang telah diverifikasi di seluruh Indonesia.
                Klik pada titik provinsi untuk melihat detail.
              </p>
            </motion.div>

            {/* Stats summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8"
            >
              <div className="glass rounded-xl p-3 text-center">
                <Eye className="w-4 h-4 text-accent mx-auto mb-1" />
                <p className="font-jakarta font-bold text-lg text-accent">
                  {data?.totalChecks || 0}
                </p>
                <p className="text-[10px] text-text-muted">Total Dicek</p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <AlertTriangle className="w-4 h-4 text-hoaks mx-auto mb-1" />
                <p className="font-jakarta font-bold text-lg text-hoaks">
                  {data?.nasional.hoaks || 0}
                </p>
                <p className="text-[10px] text-text-muted">Hoaks</p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <CheckCircle className="w-4 h-4 text-fakta mx-auto mb-1" />
                <p className="font-jakarta font-bold text-lg text-fakta">
                  {data?.nasional.fakta || 0}
                </p>
                <p className="text-[10px] text-text-muted">Fakta</p>
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="glass-strong rounded-2xl p-4 sm:p-6 relative"
            >
              {/* Refresh button */}
              <button
                onClick={() => fetchData(true)}
                disabled={isRefreshing}
                className="absolute top-3 right-3 z-10 p-2 rounded-lg glass text-text-muted 
                           hover:text-accent transition-all"
                aria-label="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>

              {isLoading ? (
                <div className="aspect-[2/1] flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-hoaks/20 to-accent/20 
                                    flex items-center justify-center animate-pulse">
                      <MapPin className="w-6 h-6 text-text-muted" />
                    </div>
                    <p className="text-sm text-text-muted">Memuat peta...</p>
                  </div>
                </div>
              ) : data ? (
                <IndonesiaMap
                  provinces={data.provinces}
                  selectedProvince={selectedProvince}
                  onProvinceSelect={setSelectedProvince}
                />
              ) : (
                <div className="aspect-[2/1] flex items-center justify-center">
                  <p className="text-sm text-text-muted">Gagal memuat data peta.</p>
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-hoaks shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                  <span className="text-[10px] text-text-muted">Hoaks Dominan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-fakta shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                  <span className="text-[10px] text-text-muted">Fakta Dominan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-konteks shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                  <span className="text-[10px] text-text-muted">Campuran</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent/30" />
                  <span className="text-[10px] text-text-muted">Belum Ada Data</span>
                </div>
              </div>
            </motion.div>

            {/* Top Provinces */}
            {topProvinces.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-hoaks" />
                  <h2 className="font-jakarta font-bold text-sm text-text-primary">
                    Provinsi dengan Hoaks Terbanyak
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {topProvinces.map((prov, i) => (
                    <motion.button
                      key={prov.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      onClick={() => setSelectedProvince(prov.id)}
                      className={`glass rounded-xl p-4 text-left hover:border-accent/20 transition-all
                                 ${selectedProvince === prov.id ? "border-accent/30 bg-accent/[0.03]" : ""}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-hoaks/10 flex items-center justify-center 
                                         text-xs font-bold text-hoaks">
                          #{i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-jakarta font-semibold text-sm text-text-primary truncate">
                            {prov.name}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            {prov.total} total pengecekan
                          </p>
                        </div>
                      </div>

                      {/* Mini bar chart */}
                      <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-surface-2">
                        {prov.hoaks > 0 && (
                          <div
                            className="bg-hoaks/70 rounded-full transition-all"
                            style={{ width: `${(prov.hoaks / prov.total) * 100}%` }}
                          />
                        )}
                        {prov.fakta > 0 && (
                          <div
                            className="bg-fakta/70 rounded-full transition-all"
                            style={{ width: `${(prov.fakta / prov.total) * 100}%` }}
                          />
                        )}
                        {prov.konteks > 0 && (
                          <div
                            className="bg-konteks/70 rounded-full transition-all"
                            style={{ width: `${(prov.konteks / prov.total) * 100}%` }}
                          />
                        )}
                      </div>

                      <div className="flex gap-3 mt-2 text-[10px] text-text-muted">
                        <span className="text-hoaks">{prov.hoaks} hoaks</span>
                        <span className="text-fakta">{prov.fakta} fakta</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty state if no data at all */}
            {!isLoading && data && data.totalChecks === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-center"
              >
                <div className="glass rounded-xl p-8 max-w-md mx-auto">
                  <MapPin className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
                  <h3 className="font-jakarta font-semibold text-text-primary mb-2">
                    Belum Ada Data Peta
                  </h3>
                  <p className="text-xs text-text-muted mb-4">
                    Mulai verifikasi konten untuk melihat peta hoaks Indonesia terisi secara real-time.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                               bg-gradient-to-r from-accent to-blue-600 text-white text-sm font-medium
                               hover:shadow-glow-md transition-all"
                  >
                    Mulai Cek Sekarang
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
