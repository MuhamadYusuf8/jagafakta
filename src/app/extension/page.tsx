"use client";

import { motion } from "framer-motion";
import {
  Chrome, MousePointerClick, Shield, Zap, Download,
  CheckCircle, Eye, Palette, ArrowRight,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const features = [
  {
    icon: MousePointerClick,
    title: "Klik Kanan → Cek Hoaks",
    description: "Select teks di halaman manapun, klik kanan, pilih \"Cek dengan JagaFakta\" — langsung dapat verdict.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Eye,
    title: "Auto-Detect Klaim Meragukan",
    description: "Ekstensi otomatis scan halaman dan highlight kalimat yang mengandung pola hoaks umum.",
    color: "text-konteks",
    bg: "bg-konteks/10",
  },
  {
    icon: Palette,
    title: "Badge Kredibilitas",
    description: "Ikon ekstensi berubah warna: hijau (kredibel), kuning (hati-hati), merah (mencurigakan).",
    color: "text-fakta",
    bg: "bg-fakta/10",
  },
  {
    icon: Zap,
    title: "Instan & Ringan",
    description: "Ukuran < 500KB, tidak memperlambat browser. Verifikasi selesai dalam 2-3 detik.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
];

const steps = [
  { num: "1", title: "Download Ekstensi", desc: "Klik tombol download di bawah untuk mendapat file .zip" },
  { num: "2", title: "Buka chrome://extensions", desc: "Aktifkan Developer mode di kanan atas" },
  { num: "3", title: "Load Unpacked", desc: 'Klik "Load unpacked" dan pilih folder ekstensi yang sudah diekstrak' },
  { num: "4", title: "Mulai Cek Hoaks!", desc: "Select teks → klik kanan → Cek dengan JagaFakta" },
];

export default function ExtensionPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20 mb-4">
              <Chrome className="w-3.5 h-3.5" />
              Browser Extension
            </div>
            <h1 className="font-jakarta font-extrabold text-3xl sm:text-5xl text-text-primary mb-3">
              Cek Hoaks <span className="text-accent">Tanpa Buka Website</span>
            </h1>
            <p className="text-text-muted max-w-lg mx-auto">
              Ekstensi Chrome JagaFakta memungkinkan kamu cek klaim mencurigakan langsung dari halaman manapun.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-bold text-sm
                           hover:bg-blue-500 shadow-glow-md transition-all"
                onClick={() => {
                  window.open("https://github.com/jagafakta/extension/releases", "_blank");
                }}
              >
                <Download className="w-5 h-5" />
                Download Ekstensi Chrome
              </motion.button>
              <span className="text-xs text-text-muted">v1.0.0 · 320KB · Chrome / Edge / Brave</span>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={item}
                className="glass rounded-2xl p-5 border border-white/[0.05] hover:border-white/[0.1] transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-3`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-jakarta font-bold text-text-primary mb-1">{f.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* How to Install */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 sm:p-8 border border-white/[0.05] mb-14"
          >
            <h2 className="font-jakarta font-extrabold text-xl text-text-primary mb-6 text-center">
              Cara Install <span className="text-accent">4 Langkah</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {steps.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-accent">
                    {s.num}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-primary">{s.title}</h4>
                    <p className="text-xs text-text-muted mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Browser compatibility */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <p className="text-xs text-text-muted mb-3">Kompatibel dengan:</p>
            <div className="flex items-center justify-center gap-6">
              {["Chrome", "Edge", "Brave", "Opera"].map((b) => (
                <div key={b} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                    <Chrome className="w-5 h-5 text-text-muted" />
                  </div>
                  <span className="text-[10px] text-text-muted">{b}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
