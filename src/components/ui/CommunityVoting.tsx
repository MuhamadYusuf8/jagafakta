"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Users } from "lucide-react";
import { getUserProfile } from "@/lib/gamification";

interface CommunityVotingProps {
  checkId?: string;
}

export default function CommunityVoting({ checkId }: CommunityVotingProps) {
  const [agree, setAgree]       = useState(0);
  const [disagree, setDisagree] = useState(0);
  const [userVote, setUserVote] = useState<"agree" | "disagree" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load existing votes
  useEffect(() => {
    if (!checkId) return;

    // Check local storage for user's previous vote
    const stored = localStorage.getItem(`jf-vote-${checkId}`);
    if (stored === "agree" || stored === "disagree") setUserVote(stored);

    // Fetch vote counts
    fetch(`/api/community?action=votes&check_id=${checkId}`)
      .then((r) => r.json())
      .then((data) => {
        setAgree(data.agree || 0);
        setDisagree(data.disagree || 0);
      })
      .catch(() => {});
  }, [checkId]);

  const handleVote = async (vote: "agree" | "disagree") => {
    if (submitting || !checkId) return;
    if (userVote === vote) return; // Already voted this way

    setSubmitting(true);
    const profile = getUserProfile();

    // Optimistic update
    if (userVote) {
      // Changing vote
      if (userVote === "agree") setAgree((a) => Math.max(0, a - 1));
      else setDisagree((d) => Math.max(0, d - 1));
    }
    if (vote === "agree") setAgree((a) => a + 1);
    else setDisagree((d) => d + 1);
    setUserVote(vote);

    // Persist locally
    localStorage.setItem(`jf-vote-${checkId}`, vote);

    try {
      await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "vote",
          check_id: checkId,
          vote,
          anonymous_id: profile.anonymousId,
        }),
      });
    } catch {
      // Already saved locally
    }

    setSubmitting(false);
  };

  const total = agree + disagree;
  const agreePercent = total > 0 ? Math.round((agree / total) * 100) : 50;

  if (!checkId) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Users className="w-3.5 h-3.5" />
        <span className="font-semibold uppercase tracking-wider">Pendapat Komunitas</span>
        {total > 0 && (
          <span className="text-text-muted">· {total} suara</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Agree button */}
        <motion.button
          onClick={() => handleVote("agree")}
          whileTap={{ scale: 0.95 }}
          disabled={submitting}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all
            ${userVote === "agree"
              ? "bg-fakta/15 text-fakta border border-fakta/30"
              : "glass border border-white/[0.06] text-text-muted hover:text-fakta hover:border-fakta/20"
            }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Setuju</span>
          <AnimatePresence>
            {agree > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs opacity-70"
              >
                ({agree})
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Disagree button */}
        <motion.button
          onClick={() => handleVote("disagree")}
          whileTap={{ scale: 0.95 }}
          disabled={submitting}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all
            ${userVote === "disagree"
              ? "bg-hoaks/15 text-hoaks border border-hoaks/30"
              : "glass border border-white/[0.06] text-text-muted hover:text-hoaks hover:border-hoaks/20"
            }`}
        >
          <ThumbsDown className="w-4 h-4" />
          <span>Tidak Setuju</span>
          <AnimatePresence>
            {disagree > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs opacity-70"
              >
                ({disagree})
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Agree/Disagree bar */}
      {total > 0 && (
        <div className="relative h-1.5 rounded-full overflow-hidden bg-white/[0.06]">
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-fakta to-green-400"
            animate={{ width: `${agreePercent}%` }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="absolute right-0 top-0 h-full rounded-full bg-gradient-to-l from-hoaks to-red-400"
            animate={{ width: `${100 - agreePercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </div>
  );
}
