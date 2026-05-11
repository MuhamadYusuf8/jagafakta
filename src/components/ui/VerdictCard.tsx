"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  HelpCircle,
  Zap,
  Tag,
  Lightbulb,
  ClipboardList,
  Search,
  Newspaper,
} from "lucide-react";
import type { FactCheckResult, VerdictType } from "@/types";
import { VERDICT_CONFIG } from "@/lib/utils";
import ConfidenceMeter from "./ConfidenceMeter";
import SourceCard from "./SourceCard";
import ShareButton from "./ShareButton";
import ChatMode from "./ChatMode";
import HoaxDNA from "./HoaxDNA";
import CommunityVoting from "./CommunityVoting";

interface VerdictCardProps {
  result: FactCheckResult;
}

const verdictIcons: Record<VerdictType, React.ReactNode> = {
  HOAKS: <AlertTriangle className="w-6 h-6" />,
  FAKTA: <CheckCircle className="w-6 h-6" />,
  KONTEKS_HILANG: <Info className="w-6 h-6" />,
  TIDAK_DAPAT_DIVERIFIKASI: <HelpCircle className="w-6 h-6" />,
};

const verdictBgClasses: Record<VerdictType, string> = {
  HOAKS: "verdict-hoaks",
  FAKTA: "verdict-fakta",
  KONTEKS_HILANG: "verdict-konteks",
  TIDAK_DAPAT_DIVERIFIKASI: "verdict-unverified",
};

const verdictTextClasses: Record<VerdictType, string> = {
  HOAKS: "text-hoaks",
  FAKTA: "text-fakta",
  KONTEKS_HILANG: "text-konteks",
  TIDAK_DAPAT_DIVERIFIKASI: "text-unverified",
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function VerdictCard({ result }: VerdictCardProps) {
  const config = VERDICT_CONFIG[result.verdict];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* 1. Verdict Banner */}
      <motion.div
        variants={item}
        className={`rounded-2xl p-5 sm:p-6 ${verdictBgClasses[result.verdict]} relative overflow-hidden`}
      >
        {/* Background glow */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl"
          style={{ background: config.gradientFrom }}
        />

        <div className="relative space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`${verdictTextClasses[result.verdict]}`}>
                {verdictIcons[result.verdict]}
              </div>
              <div>
                <div className={`font-jakarta font-bold text-lg sm:text-xl ${verdictTextClasses[result.verdict]}`}>
                  {config.emoji} {config.label}
                </div>
              </div>
            </div>

            {/* Confidence pill */}
            <div
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold
                          ${verdictBgClasses[result.verdict]} ${verdictTextClasses[result.verdict]}`}
              style={{ borderWidth: "1px" }}
            >
              {result.confidence_score}%
            </div>
          </div>

          <p className="text-sm sm:text-base text-text-primary/90 font-medium leading-relaxed">
            {result.title}
          </p>
        </div>

        {/* Cached badge */}
        {result.is_cached && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium
                           bg-accent/10 text-accent/70 border border-accent/15">
              <Zap className="w-3 h-3" />
              Cache
            </span>
          </div>
        )}
      </motion.div>

      {/* 2. Confidence Meter */}
      <motion.div variants={item} className="glass rounded-xl p-4">
        <ConfidenceMeter score={result.confidence_score} />
      </motion.div>

      {/* 3. Explanation */}
      <motion.div variants={item} className="glass rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-accent" />
          <h3 className="font-jakarta font-semibold text-sm text-text-primary">
            Analisis Detail
          </h3>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          {result.explanation}
        </p>

        {/* Misleading elements warning */}
        {result.misleading_elements && result.misleading_elements.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-hoaks/[0.05] border border-hoaks/15">
            <p className="text-xs font-semibold text-hoaks mb-2">
              ⚠️ Elemen Menyesatkan:
            </p>
            <ul className="space-y-1">
              {result.misleading_elements.map((el, i) => (
                <li key={i} className="text-xs text-hoaks/80 flex items-start gap-1.5">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-hoaks/60 flex-shrink-0" />
                  {el}
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      {/* 4. Key Claims */}
      {result.key_claims && result.key_claims.length > 0 && (
        <motion.div variants={item} className="glass rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-accent" />
            <h3 className="font-jakarta font-semibold text-sm text-text-primary">
              Klaim yang Ditemukan
            </h3>
          </div>
          <ul className="space-y-2">
            {result.key_claims.map((claim, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent/50 flex-shrink-0" />
                <span className="leading-relaxed">{claim}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* 5. Source References */}
      {result.sources && result.sources.length > 0 && (
        <motion.div variants={item} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Newspaper className="w-4 h-4 text-accent" />
            <h3 className="font-jakarta font-semibold text-sm text-text-primary">
              Sumber Terpercaya
            </h3>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1 snap-x snap-mandatory">
            {result.sources.map((source, i) => (
              <div key={i} className="snap-start">
                <SourceCard source={source} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 6. Keywords */}
      {result.keywords && result.keywords.length > 0 && (
        <motion.div variants={item} className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <Tag className="w-4 h-4 text-accent" />
            <h3 className="font-jakarta font-semibold text-sm text-text-primary">
              Topik Terkait
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.keywords.map((keyword, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium
                           bg-surface-2 text-text-muted border border-border-subtle"
              >
                {keyword}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* 7. Context note */}
      {result.context && (
        <motion.div variants={item} className="glass rounded-xl p-4">
          <p className="text-xs text-text-muted italic leading-relaxed flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-konteks flex-shrink-0 mt-0.5" />
            <span>
              <span className="font-medium text-konteks">Konteks:</span>{" "}
              {result.context}
            </span>
          </p>
        </motion.div>
      )}

      {/* 8. Hoax DNA Analysis */}
      {result.hoax_dna && result.hoax_dna.length > 0 && (
        <motion.div variants={item}>
          <HoaxDNA dna={result.hoax_dna} />
        </motion.div>
      )}

      {/* 9. Share Buttons */}
      <motion.div variants={item}>
        <ShareButton result={result} />
      </motion.div>

      {/* 10. Community Voting */}
      <motion.div variants={item}>
        <CommunityVoting checkId={result.id} />
      </motion.div>

      {/* 11. AI Conversation Mode */}
      <motion.div variants={item}>
        <ChatMode result={result} />
      </motion.div>
    </motion.div>
  );
}
