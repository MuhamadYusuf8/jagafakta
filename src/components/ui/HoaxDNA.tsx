"use client";

import { motion } from "framer-motion";
import { Dna, AlertTriangle, ShieldAlert, Heart, Clock, Quote, MousePointerClick, Eye, Database, Video, Scissors } from "lucide-react";
import type { HoaxDNAItem, HoaxDNAPattern } from "@/types";

const DNA_CONFIG: Record<HoaxDNAPattern, {
  label: string;
  icon: any;
  color: string;
  description: string;
}> = {
  URGENCY: {
    label: "Urgensi Palsu",
    icon: AlertTriangle,
    color: "#EF4444",
    description: '"SEGERA!", "DARURAT!", "SEBARKAN SEBELUM DIHAPUS!"',
  },
  AUTHORITY_FAKE: {
    label: "Otoritas Palsu",
    icon: ShieldAlert,
    color: "#F97316",
    description: "Mengaku dari dokter, polisi, atau pejabat tanpa bukti",
  },
  EMOTIONAL_MANIPULATION: {
    label: "Manipulasi Emosi",
    icon: Heart,
    color: "#EC4899",
    description: "Memainkan rasa takut, marah, atau kasihan",
  },
  OUTDATED_RECYCLED: {
    label: "Daur Ulang",
    icon: Clock,
    color: "#F59E0B",
    description: "Berita lama yang diedarkan ulang sebagai baru",
  },
  MISATTRIBUTION: {
    label: "Salah Atribusi",
    icon: Quote,
    color: "#8B5CF6",
    description: "Kutipan, foto, atau video yang salah diatribusikan",
  },
  CLICKBAIT: {
    label: "Clickbait",
    icon: MousePointerClick,
    color: "#06B6D4",
    description: "Judul sensasional yang tidak sesuai isi",
  },
  CONSPIRACY: {
    label: "Konspirasi",
    icon: Eye,
    color: "#6366F1",
    description: 'Narasi "mereka menyembunyikan kebenaran"',
  },
  FABRICATED_DATA: {
    label: "Data Palsu",
    icon: Database,
    color: "#10B981",
    description: "Statistik, grafik, atau data yang difabrikasi",
  },
  DEEPFAKE: {
    label: "Deepfake",
    icon: Video,
    color: "#F43F5E",
    description: "Gambar/video yang dimanipulasi dengan AI",
  },
  OUT_OF_CONTEXT: {
    label: "Di Luar Konteks",
    icon: Scissors,
    color: "#78716C",
    description: "Fakta asli dipotong/diubah konteksnya",
  },
};

interface HoaxDNAProps {
  dna: HoaxDNAItem[];
}

export default function HoaxDNA({ dna }: HoaxDNAProps) {
  if (!dna || dna.length === 0) return null;

  // Sort by confidence descending
  const sorted = [...dna].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <Dna className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Hoax DNA</h4>
          <p className="text-[10px] text-text-muted">Pola manipulasi yang terdeteksi</p>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((item, i) => {
          const cfg = DNA_CONFIG[item.pattern];
          if (!cfg) return null;
          const Icon = cfg.icon;

          return (
            <motion.div
              key={item.pattern}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group"
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${cfg.color}15` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                </div>

                {/* Bar + label */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-text-primary">{cfg.label}</span>
                    <span className="text-[10px] font-bold" style={{ color: cfg.color }}>
                      {item.confidence}%
                    </span>
                  </div>

                  {/* DNA bar */}
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.confidence}%` }}
                      transition={{ delay: i * 0.08 + 0.2, duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* Description tooltip on hover */}
              <div className="ml-10 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-[10px] text-text-muted italic">{item.description || cfg.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* DNA Summary */}
      <div className="mt-2 p-2.5 rounded-lg bg-purple-500/[0.04] border border-purple-500/10">
        <p className="text-[10px] text-text-muted leading-relaxed">
          <span className="text-purple-400 font-bold">🧬 DNA Analysis:</span>{" "}
          Konten ini menunjukkan {sorted.length} pola manipulasi.
          {sorted[0] && (
            <> Pola dominan: <strong className="text-text-primary">{DNA_CONFIG[sorted[0].pattern]?.label}</strong> ({sorted[0].confidence}%).</>
          )}
        </p>
      </div>
    </div>
  );
}
