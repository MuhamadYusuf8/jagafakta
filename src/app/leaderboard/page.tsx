"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  ArrowLeft,
  Crown,
  Flame,
  Medal,
  Star,
  Target,
  Sparkles,
  RefreshCw,
  Shield,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  getUserProfile,
  getBadgesWithStatus,
  getNextBadgeProgress,
  BADGES,
  type Badge,
  type UserProfile,
} from "@/lib/gamification";

interface LeaderboardEntry {
  anonymousId: string;
  displayName: string;
  totalChecks: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  rank?: number;
}

const tierColors: Record<string, string> = {
  bronze: "from-amber-700 to-amber-900",
  silver: "from-slate-300 to-slate-500",
  gold: "from-yellow-400 to-amber-500",
  diamond: "from-cyan-400 to-blue-500",
  legendary: "from-emerald-400 to-teal-600",
};

const rankIcons = [
  <Crown key="1" className="w-5 h-5 text-yellow-400" />,
  <Medal key="2" className="w-5 h-5 text-slate-300" />,
  <Medal key="3" className="w-5 h-5 text-amber-600" />,
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<Array<Badge & { earned: boolean }>>([]);
  const [nextBadge, setNextBadge] = useState<{ badge: Badge; current: number; percentage: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"leaderboard" | "badges">("leaderboard");

  useEffect(() => {
    // Load user data from localStorage
    const profile = getUserProfile();
    setUserProfile(profile);
    setBadges(getBadgesWithStatus());
    setNextBadge(getNextBadgeProgress());

    // Fetch leaderboard from API
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/leaderboard");
      const json = await res.json();
      setLeaderboard(json.leaderboard || []);
    } catch {
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  };

  const earnedBadges = badges.filter((b) => b.earned);
  const unearnedBadges = badges.filter((b) => !b.earned);

  return (
    <>
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 noise-bg" />
          <div className="absolute top-20 left-1/3 w-[400px] h-[400px] rounded-full bg-yellow-500/[0.03] blur-[120px] pointer-events-none" />
          <div className="absolute top-60 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/[0.03] blur-[100px] pointer-events-none" />

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

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium
                              bg-yellow-500/8 text-yellow-500/70 border border-yellow-500/15 mb-4">
                <Trophy className="w-3.5 h-3.5" />
                Pejuang Anti-Hoaks
              </div>
              <h1 className="font-jakarta font-extrabold text-2xl sm:text-3xl md:text-4xl text-text-primary mb-3">
                Leaderboard &{" "}
                <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Badges
                </span>
              </h1>
              <p className="text-sm text-text-muted max-w-lg mx-auto">
                Kumpulkan badge, pertahankan streak, dan jadilah pejuang anti-hoaks #1 Indonesia!
              </p>
            </motion.div>

            {/* User Stats Card */}
            {userProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-strong rounded-2xl p-5 mb-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-blue-600 
                                  flex items-center justify-center shadow-glow-sm">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-jakarta font-bold text-text-primary truncate">
                      {userProfile.displayName}
                    </p>
                    <p className="text-xs text-text-muted">
                      {earnedBadges.length} badge diperoleh
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-surface/50 rounded-lg p-3 text-center">
                    <Target className="w-4 h-4 text-accent mx-auto mb-1" />
                    <p className="font-jakarta font-bold text-lg text-accent">
                      {userProfile.totalChecks}
                    </p>
                    <p className="text-[10px] text-text-muted">Total Cek</p>
                  </div>
                  <div className="bg-surface/50 rounded-lg p-3 text-center">
                    <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                    <p className="font-jakarta font-bold text-lg text-orange-500">
                      {userProfile.currentStreak}
                    </p>
                    <p className="text-[10px] text-text-muted">Streak</p>
                  </div>
                  <div className="bg-surface/50 rounded-lg p-3 text-center">
                    <Star className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                    <p className="font-jakarta font-bold text-lg text-yellow-500">
                      {userProfile.longestStreak}
                    </p>
                    <p className="text-[10px] text-text-muted">Best Streak</p>
                  </div>
                </div>

                {/* Next badge progress */}
                {nextBadge && (
                  <div className="bg-surface/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-text-muted">
                        Progress ke{" "}
                        <span className="text-text-primary font-medium">
                          {nextBadge.badge.emoji} {nextBadge.badge.name}
                        </span>
                      </p>
                      <p className="text-xs text-accent font-medium">
                        {nextBadge.current}/{nextBadge.badge.requirement}
                      </p>
                    </div>
                    <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${nextBadge.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-accent to-blue-500"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab Switcher */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex gap-2 mb-6"
            >
              {[
                { key: "leaderboard" as const, label: "Leaderboard", icon: Trophy },
                { key: "badges" as const, label: "Koleksi Badge", icon: Sparkles },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSection(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all
                    ${
                      activeSection === tab.key
                        ? "bg-accent/15 text-accent border border-accent/25"
                        : "glass text-text-muted hover:text-text-primary"
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </motion.div>

            {/* Leaderboard Section */}
            <AnimatePresence mode="wait">
              {activeSection === "leaderboard" && (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {/* Refresh */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-text-muted">Top Pejuang Anti-Hoaks Minggu Ini</p>
                    <button
                      onClick={fetchLeaderboard}
                      className="p-1.5 rounded-lg text-text-muted hover:text-accent transition-all"
                      aria-label="Refresh leaderboard"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="glass rounded-xl p-4 flex items-center gap-3">
                          <div className="w-8 h-8 skeleton rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 skeleton rounded" />
                            <div className="h-3 w-1/4 skeleton rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : leaderboard.length === 0 ? (
                    <div className="glass rounded-xl p-8 text-center">
                      <Trophy className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
                      <h3 className="font-jakarta font-semibold text-text-primary mb-2">
                        Belum Ada Data Leaderboard
                      </h3>
                      <p className="text-xs text-text-muted mb-4">
                        Mulai cek fakta untuk masuk ke leaderboard!
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
                  ) : (
                    leaderboard.map((entry, i) => {
                      const isCurrentUser = userProfile?.anonymousId === entry.anonymousId;

                      return (
                        <motion.div
                          key={entry.anonymousId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`glass rounded-xl p-4 flex items-center gap-3 transition-all
                                     ${isCurrentUser ? "border-accent/30 bg-accent/[0.03]" : ""}`}
                        >
                          {/* Rank */}
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                                          ${i < 3 ? "bg-gradient-to-br from-yellow-500/20 to-amber-600/20" : "bg-surface-2"}`}>
                            {i < 3 ? rankIcons[i] : (
                              <span className="text-xs font-bold text-text-muted">
                                #{i + 1}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-jakarta font-semibold text-sm truncate
                                            ${isCurrentUser ? "text-accent" : "text-text-primary"}`}>
                                {entry.displayName}
                                {isCurrentUser && (
                                  <span className="text-[10px] ml-1.5 text-accent/70">(Kamu)</span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-text-muted mt-0.5">
                              <span>{entry.totalChecks} cek</span>
                              {entry.currentStreak > 0 && (
                                <span className="text-orange-500">🔥 {entry.currentStreak} streak</span>
                              )}
                            </div>
                          </div>

                          {/* Badges preview */}
                          <div className="flex -space-x-1 flex-shrink-0">
                            {(entry.badges || []).slice(0, 3).map((badgeId) => {
                              const badge = BADGES.find((b) => b.id === badgeId);
                              return badge ? (
                                <span
                                  key={badgeId}
                                  className="text-sm"
                                  title={badge.name}
                                >
                                  {badge.emoji}
                                </span>
                              ) : null;
                            })}
                          </div>

                          {/* Score */}
                          <div className="text-right flex-shrink-0">
                            <p className="font-jakarta font-bold text-sm text-accent">
                              {entry.totalChecks}
                            </p>
                            <p className="text-[9px] text-text-muted">poin</p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              )}

              {/* Badges Section */}
              {activeSection === "badges" && (
                <motion.div
                  key="badges"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Earned badges */}
                  {earnedBadges.length > 0 && (
                    <div>
                      <p className="text-xs text-text-muted font-medium mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                        Badge Diperoleh ({earnedBadges.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {earnedBadges.map((badge) => (
                          <motion.div
                            key={badge.id}
                            whileHover={{ scale: 1.02 }}
                            className="glass rounded-xl p-4 text-center relative overflow-hidden"
                          >
                            <div className={`absolute inset-0 bg-gradient-to-br ${tierColors[badge.tier] || tierColors.bronze} opacity-[0.06]`} />
                            <div className="relative">
                              <span className="text-3xl mb-2 block">{badge.emoji}</span>
                              <p className="font-jakarta font-bold text-sm text-text-primary">
                                {badge.name}
                              </p>
                              <p className="text-[10px] text-text-muted mt-1">
                                {badge.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unearned badges */}
                  <div>
                    <p className="text-xs text-text-muted font-medium mb-3 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />
                      Belum Diperoleh ({unearnedBadges.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {unearnedBadges.map((badge) => (
                        <div
                          key={badge.id}
                          className="glass rounded-xl p-4 text-center opacity-50"
                        >
                          <span className="text-3xl mb-2 block grayscale">{badge.emoji}</span>
                          <p className="font-jakarta font-semibold text-sm text-text-muted">
                            {badge.name}
                          </p>
                          <p className="text-[10px] text-text-muted/70 mt-1">
                            {badge.description}
                          </p>
                          <div className="mt-2 flex items-center justify-center gap-1 text-[9px] text-accent/60">
                            <ChevronRight className="w-3 h-3" />
                            {badge.type === "total_checks"
                              ? `${badge.requirement} pengecekan`
                              : `${badge.requirement} hari streak`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
