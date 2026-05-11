import { Shield } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.06] bg-bg">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-jakarta font-bold text-lg">
                Jaga<span className="text-accent">Fakta</span>
              </span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              Cek sebelum sebar. Saring sebelum sharing. Platform verifikasi
              fakta berbasis AI untuk masyarakat Indonesia.
            </p>
            <p className="text-xs text-text-muted/60">
              Made with ❤️ for Indonesia
            </p>
          </div>

          {/* Column 2: Links */}
          <div className="space-y-4">
            <h3 className="font-jakarta font-semibold text-sm text-text-primary">
              Navigasi
            </h3>
            <nav className="flex flex-col gap-2.5">
              <Link
                href="/"
                className="text-sm text-text-muted hover:text-accent transition-colors"
              >
                Beranda
              </Link>
              <Link
                href="/peta-hoaks"
                className="text-sm text-text-muted hover:text-accent transition-colors"
              >
                🗺️ Peta Hoaks Indonesia
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm text-text-muted hover:text-accent transition-colors"
              >
                🏆 Leaderboard & Badges
              </Link>
              <Link
                href="/whatsapp"
                className="text-sm text-text-muted hover:text-accent transition-colors"
              >
                📱 WhatsApp Bot
              </Link>
              <Link
                href="/history"
                className="text-sm text-text-muted hover:text-accent transition-colors"
              >
                Riwayat Pengecekan
              </Link>
            </nav>
          </div>

          {/* Column 3: Tech */}
          <div className="space-y-4">
            <h3 className="font-jakarta font-semibold text-sm text-text-primary">
              Teknologi
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Gemini 2.0 Flash",
                "Google Cloud Run",
                "Next.js",
                "#JuaraVibeCoding",
              ].map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium
                             bg-accent/8 text-accent/80 border border-accent/10"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted/50">
            © {new Date().getFullYear()} JagaFakta. All rights reserved.
          </p>
          <p className="text-[11px] text-text-muted/40 text-center sm:text-right max-w-md">
            ⚠️ JagaFakta adalah alat bantu verifikasi. Selalu cek sumber resmi
            untuk keputusan penting.
          </p>
        </div>
      </div>
    </footer>
  );
}
