"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ExampleCasesProps {
  onSelect: (text: string) => void;
}

const EXAMPLES = [
  {
    label: "Vaksin COVID mengandung chip 5G",
    text: "BAHAYA! Vaksin COVID-19 ternyata mengandung chip 5G yang bisa melacak posisi kita. Bill Gates bekerja sama dengan WHO untuk menanamkan microchip ke tubuh manusia melalui vaksinasi. Jangan mau divaksin! Sebar ke semua grup!",
  },
  {
    label: "Gempa besar akan terjadi di Jawa besok",
    text: "INFO PENTING! BMKG memperingatkan akan terjadi gempa besar 8.5 SR di Pulau Jawa BESOK! Segera evakuasi keluarga Anda! Ini bukan hoax, langsung dari BMKG pusat! Tolong sebarkan sebelum terlambat!",
  },
  {
    label: "BPJS Kesehatan gratis mulai bulan depan",
    text: "KABAR GEMBIRA! Mulai bulan depan, pemerintah resmi menggratiskan BPJS Kesehatan untuk SEMUA warga Indonesia. Tidak perlu bayar iuran lagi. Keputusan ini sudah ditandatangani Presiden. Share ke semua grup agar semua tahu!",
  },
  {
    label: "Air lemon bisa menyembuhkan kanker",
    text: "TERNYATA air lemon hangat yang diminum setiap pagi bisa menyembuhkan kanker stadium 4! Penelitian di Amerika membuktikan bahwa lemon 10.000x lebih kuat dari kemoterapi. Rumah sakit menyembunyikan fakta ini agar tetap untung!",
  },
];

export default function ExampleCases({ onSelect }: ExampleCasesProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs text-text-muted">
        <Sparkles className="w-3.5 h-3.5 text-accent" />
        <span>Coba contoh kasus nyata:</span>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {EXAMPLES.map((example, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(example.text)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium
                       bg-accent/8 text-accent/80 border border-accent/15
                       hover:bg-accent/12 hover:text-accent hover:border-accent/25
                       transition-all whitespace-nowrap"
          >
            {example.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
