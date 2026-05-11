"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, Check } from "lucide-react";
import type { SupportedLanguage } from "@/types";

const LANGUAGES: { code: SupportedLanguage; label: string; native: string; flag: string }[] = [
  { code: "id", label: "Bahasa Indonesia", native: "Indonesia", flag: "🇮🇩" },
  { code: "jv", label: "Bahasa Jawa",      native: "Boso Jowo",  flag: "🏛️" },
  { code: "su", label: "Bahasa Sunda",     native: "Basa Sunda",  flag: "🏔️" },
  { code: "ms", label: "Bahasa Melayu",    native: "Melayu",      flag: "🇲🇾" },
  { code: "en", label: "English",          native: "English",     flag: "🇬🇧" },
  { code: "tl", label: "Tagalog",          native: "Filipino",    flag: "🇵🇭" },
];

interface LanguageSelectorProps {
  onLanguageChange?: (lang: SupportedLanguage) => void;
}

export default function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SupportedLanguage>("id");
  const ref = useRef<HTMLDivElement>(null);

  // Load saved language
  useEffect(() => {
    const saved = localStorage.getItem("jf-lang") as SupportedLanguage | null;
    if (saved && LANGUAGES.some((l) => l.code === saved)) {
      setSelected(saved);
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (code: SupportedLanguage) => {
    setSelected(code);
    localStorage.setItem("jf-lang", code);
    setOpen(false);
    onLanguageChange?.(code);
  };

  const current = LANGUAGES.find((l) => l.code === selected) || LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <motion.button
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
          ${open
            ? "bg-accent/10 text-accent border border-accent/25"
            : "bg-white/[0.04] text-text-muted border border-white/[0.08] hover:text-text-primary hover:bg-white/[0.07]"
          }`}
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{current.flag}</span>
        <span className="hidden md:inline">{current.native}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 w-56 glass-strong rounded-xl border border-white/[0.1] shadow-2xl overflow-hidden z-50"
          >
            <div className="p-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                    ${selected === lang.code
                      ? "bg-accent/10 text-accent"
                      : "text-text-muted hover:bg-white/[0.05] hover:text-text-primary"
                    }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-medium">{lang.label}</p>
                    <p className="text-[10px] opacity-60">{lang.native}</p>
                  </div>
                  {selected === lang.code && <Check className="w-3.5 h-3.5 text-accent" />}
                </button>
              ))}
            </div>
            <div className="px-3 py-2 border-t border-white/[0.05]">
              <p className="text-[10px] text-text-muted text-center">
                🌐 AI otomatis mendeteksi bahasa input
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
