"use client";

import { motion } from "framer-motion";
import {
  MessageCircle,
  ArrowLeft,
  Forward,
  Bot,
  CheckCircle,
  Zap,
  Shield,
  Smartphone,
  ArrowRight,
  Copy,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const WHATSAPP_NUMBER = "+1 415 523 8886";

const steps = [
  {
    icon: Forward,
    title: "Forward Pesan",
    description: "Forward pesan mencurigakan dari grup atau chat ke nomor JagaFakta Bot.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Bot,
    title: "AI Menganalisis",
    description: "JagaFakta AI akan menganalisis konten menggunakan berbagai sumber terpercaya.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: CheckCircle,
    title: "Terima Hasil",
    description: "Dalam hitungan detik, Anda akan menerima hasil verifikasi lengkap via WhatsApp.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
];

const features = [
  {
    icon: Zap,
    title: "Instan",
    description: "Hasil dalam hitungan detik, langsung di WhatsApp Anda.",
  },
  {
    icon: Shield,
    title: "Akurat",
    description: "Didukung Gemini AI dan sumber-sumber terpercaya Indonesia.",
  },
  {
    icon: Smartphone,
    title: "Tanpa Install",
    description: "Tidak perlu download aplikasi tambahan. Cukup WhatsApp biasa.",
  },
];

export default function WhatsAppPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(WHATSAPP_NUMBER.replace(/\s/g, ""));
      setCopied(true);
      toast.success("Nomor disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin nomor");
    }
  };

  return (
    <>
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 noise-bg" />
          <div className="absolute top-20 left-1/3 w-[400px] h-[400px] rounded-full bg-green-500/[0.03] blur-[120px] pointer-events-none" />
          <div className="absolute top-60 right-1/4 w-[300px] h-[300px] rounded-full bg-green-600/[0.03] blur-[100px] pointer-events-none" />

          <div className="relative max-w-3xl mx-auto px-4 pt-8 sm:pt-12 pb-12">
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

            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium
                              bg-green-500/8 text-green-500/70 border border-green-500/15 mb-4">
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp Bot
              </div>
              <h1 className="font-jakarta font-extrabold text-2xl sm:text-3xl md:text-4xl text-text-primary mb-3">
                Cek Hoaks via{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  WhatsApp
                </span>
              </h1>
              <p className="text-sm sm:text-base text-text-muted max-w-lg mx-auto">
                Forward pesan mencurigakan langsung ke bot JagaFakta.
                Dapatkan hasil verifikasi dalam hitungan detik tanpa membuka website.
              </p>
            </motion.div>

            {/* WhatsApp CTA Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-strong rounded-2xl p-6 sm:p-8 text-center mb-10 relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-green-500/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-green-600/10 blur-3xl" />

              <div className="relative">
                {/* Bot avatar */}
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 
                                flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>

                <h2 className="font-jakarta font-bold text-xl text-text-primary mb-2">
                  JagaFakta Bot
                </h2>

                {/* Number */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/80 border border-white/10 mb-4">
                  <span className="font-mono text-lg text-green-400 font-bold tracking-wider">
                    {WHATSAPP_NUMBER}
                  </span>
                  <button
                    onClick={handleCopyNumber}
                    className="p-1 rounded-md hover:bg-white/10 transition-colors text-text-muted hover:text-green-400"
                    aria-label="Copy number"
                  >
                    <Copy className={`w-4 h-4 ${copied ? "text-green-400" : ""}`} />
                  </button>
                </div>

                <p className="text-xs text-text-muted mb-6 max-w-sm mx-auto">
                  Simpan nomor ini di kontak Anda, lalu forward pesan mencurigakan ke chat ini.
                </p>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                                bg-green-500/10 text-green-500 text-sm font-medium border border-green-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  Bot Aktif — Siap Melayani
                </div>
              </div>
            </motion.div>

            {/* How it works */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-10"
            >
              <h2 className="font-jakarta font-bold text-lg text-text-primary mb-6 text-center">
                Cara Kerja
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="glass rounded-xl p-5 text-center relative"
                  >
                    {/* Step number */}
                    <div className="absolute top-3 left-3 w-5 h-5 rounded-md bg-surface-2 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-text-muted">{i + 1}</span>
                    </div>

                    <div className={`w-12 h-12 mx-auto rounded-xl ${step.bgColor} flex items-center justify-center mb-3`}>
                      <step.icon className={`w-6 h-6 ${step.color}`} />
                    </div>
                    <h3 className="font-jakarta font-semibold text-sm text-text-primary mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {step.description}
                    </p>

                    {/* Arrow connector */}
                    {i < steps.length - 1 && (
                      <div className="hidden sm:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                        <ArrowRight className="w-4 h-4 text-text-muted/30" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-10"
            >
              <h2 className="font-jakarta font-bold text-lg text-text-primary mb-6 text-center">
                Keunggulan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {features.map((feature, i) => (
                  <div
                    key={i}
                    className="glass rounded-xl p-4 flex flex-col items-center text-center gap-2
                               hover:-translate-y-0.5 transition-transform"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="font-jakarta font-semibold text-sm text-text-primary">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-text-muted">{feature.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Example Preview */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-strong rounded-2xl p-5 sm:p-6"
            >
              <h2 className="font-jakarta font-bold text-sm text-text-primary mb-4 text-center">
                📱 Contoh Percakapan
              </h2>

              <div className="space-y-3 max-w-sm mx-auto">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-green-600/20 border border-green-600/20 rounded-xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                    <p className="text-xs text-text-primary">
                      &quot;BREAKING NEWS! Mulai besok, semua sim card akan diblokir jika tidak registrasi ulang dengan KTP!&quot;
                    </p>
                    <p className="text-[9px] text-text-muted/60 mt-1 text-right">14:32</p>
                  </div>
                </div>

                {/* Bot reply */}
                <div className="flex justify-start">
                  <div className="bg-surface-2/80 border border-white/[0.06] rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                    <p className="text-[10px] text-green-400 font-medium mb-1">JagaFakta Bot</p>
                    <p className="text-xs text-text-primary font-medium mb-1.5">
                      🛡️ Hasil Verifikasi
                    </p>
                    <p className="text-xs text-text-primary">
                      🚨 <span className="font-bold text-hoaks">HOAKS TERDETEKSI</span>
                    </p>
                    <p className="text-[10px] text-text-muted mt-1.5 leading-relaxed">
                      📊 Keyakinan: 92%
                    </p>
                    <p className="text-[10px] text-text-muted leading-relaxed mt-1">
                      📝 Klaim tentang pemblokiran SIM card adalah hoaks yang sudah beredar sejak 2018.
                      Kemenkominfo telah mengonfirmasi bahwa ini bukan kebijakan resmi.
                    </p>
                    <p className="text-[9px] text-text-muted/60 mt-2 text-right">14:32</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center"
            >
              <p className="text-xs text-text-muted mb-3">
                Sementara menunggu bot aktif, gunakan website untuk cek fakta:
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                           bg-gradient-to-r from-accent to-blue-600 text-white text-sm font-medium
                           hover:shadow-glow-md transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Cek via Website
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
