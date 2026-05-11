"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Activity, Map, Trophy, MessageCircle, Menu, X, BarChart2, Network, Users, Newspaper, Chrome } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatNumber } from "@/lib/utils";
import SoundToggle from "@/components/ui/SoundToggle";
import LanguageSelector from "@/components/ui/LanguageSelector";

const navLinks = [
  { href: "/peta-hoaks", label: "Peta Hoaks", icon: Map, mobileOnly: false },
  { href: "/tren", label: "Tren", icon: BarChart2, mobileOnly: false },
  { href: "/jaringan-hoaks", label: "Jaringan", icon: Network, mobileOnly: false },
  { href: "/komunitas", label: "Komunitas", icon: Users, mobileOnly: true },
  { href: "/daily", label: "Daily", icon: Newspaper, mobileOnly: true },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, mobileOnly: false },
  { href: "/history", label: "Riwayat", icon: Activity, mobileOnly: false },
];

export default function Header() {
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setTodayCount(data.total_checks || 0))
      .catch(() => setTodayCount(0));
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 border-b border-white/[0.06]"
      style={{
        background: "rgba(10, 15, 30, 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 rounded-lg blur-md group-hover:bg-accent/30 transition-colors" />
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center shadow-glow-sm">
              <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <span className="font-jakarta font-bold text-lg text-text-primary tracking-tight">
            Jaga<span className="text-accent">Fakta</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks
            .filter((link) => !link.mobileOnly)
            .map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all
                    ${
                      isActive
                        ? "text-accent bg-accent/10"
                        : "text-text-muted hover:text-text-primary hover:bg-white/[0.03]"
                    }`}
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}

          {todayCount !== null && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                         bg-accent/10 text-accent border border-accent/20 ml-2"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
              </span>
              {formatNumber(todayCount)} dicek
            </motion.div>
          )}
          <SoundToggle />
          <LanguageSelector />
        </div>

        {/* Mobile: Stats + Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {todayCount !== null && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium
                         bg-accent/10 text-accent border border-accent/20"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
              </span>
              {formatNumber(todayCount)}
            </motion.div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-all"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-white/[0.06]"
            style={{ background: "rgba(10, 15, 30, 0.95)" }}
          >
            <nav className="px-4 py-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                      ${
                        isActive
                          ? "text-accent bg-accent/10"
                          : "text-text-muted hover:text-text-primary hover:bg-white/[0.03]"
                      }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
