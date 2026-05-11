/**
 * Gamification system — badge definitions, scoring rules, and tracking helpers.
 * All tracking is localStorage-based (anonymous, zero-friction).
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  tier: "bronze" | "silver" | "gold" | "diamond" | "legendary";
  requirement: number;
  type: "total_checks" | "streak";
  gradient: string;
}

export interface UserProfile {
  anonymousId: string;
  displayName: string;
  totalChecks: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckDate: string | null;
  badges: string[]; // badge IDs
  createdAt: string;
}

export const BADGES: Badge[] = [
  {
    id: "pemula",
    name: "Pemula",
    description: "Melakukan 5 pengecekan pertama",
    emoji: "🥉",
    tier: "bronze",
    requirement: 5,
    type: "total_checks",
    gradient: "from-amber-700 to-amber-900",
  },
  {
    id: "detektif-digital",
    name: "Detektif Digital",
    description: "Melakukan 25 pengecekan",
    emoji: "🥈",
    tier: "silver",
    requirement: 25,
    type: "total_checks",
    gradient: "from-slate-300 to-slate-500",
  },
  {
    id: "guardian-of-truth",
    name: "Guardian of Truth",
    description: "Melakukan 100 pengecekan",
    emoji: "🥇",
    tier: "gold",
    requirement: 100,
    type: "total_checks",
    gradient: "from-yellow-400 to-amber-500",
  },
  {
    id: "jagafakta-legend",
    name: "JagaFakta Legend",
    description: "Melakukan 500 pengecekan",
    emoji: "💎",
    tier: "diamond",
    requirement: 500,
    type: "total_checks",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    id: "streak-3",
    name: "Konsisten",
    description: "3 hari berturut-turut mengecek",
    emoji: "🔥",
    tier: "bronze",
    requirement: 3,
    type: "streak",
    gradient: "from-orange-500 to-red-600",
  },
  {
    id: "streak-7",
    name: "Streak Master",
    description: "7 hari berturut-turut mengecek",
    emoji: "⚡",
    tier: "gold",
    requirement: 7,
    type: "streak",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "streak-30",
    name: "Pejuang Anti-Hoaks",
    description: "30 hari berturut-turut mengecek",
    emoji: "🛡️",
    tier: "legendary",
    requirement: 30,
    type: "streak",
    gradient: "from-emerald-400 to-teal-600",
  },
];

const STORAGE_KEY = "jagafakta_user_profile";

function generateId(): string {
  return "jf_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function generateName(): string {
  const adjectives = [
    "Cerdas", "Kritis", "Waspada", "Bijak", "Tangguh",
    "Sigap", "Gesit", "Teliti", "Cermat", "Jitu",
  ];
  const nouns = [
    "Pejuang", "Detektif", "Pengawal", "Pelindung", "Penjaga",
    "Pahlawan", "Ksatria", "Guardian", "Sentinel", "Ranger",
  ];
  const num = Math.floor(Math.random() * 9999) + 1;
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]} #${num}`;
}

export function getUserProfile(): UserProfile {
  if (typeof window === "undefined") {
    return createDefaultProfile();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UserProfile;
    }
  } catch {
    // Ignore parse errors
  }

  const profile = createDefaultProfile();
  saveUserProfile(profile);
  return profile;
}

function createDefaultProfile(): UserProfile {
  return {
    anonymousId: generateId(),
    displayName: generateName(),
    totalChecks: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCheckDate: null,
    badges: [],
    createdAt: new Date().toISOString(),
  };
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Storage full or blocked
  }
}

/**
 * Record a new fact-check and return any newly unlocked badges.
 */
export function recordCheck(): { profile: UserProfile; newBadges: Badge[] } {
  const profile = getUserProfile();
  const today = new Date().toISOString().split("T")[0];

  // Update total checks
  profile.totalChecks += 1;

  // Update streak
  if (profile.lastCheckDate) {
    const lastDate = new Date(profile.lastCheckDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      profile.currentStreak += 1;
    } else if (diffDays > 1) {
      // Streak broken
      profile.currentStreak = 1;
    }
    // diffDays === 0 means same day, don't change streak
  } else {
    profile.currentStreak = 1;
  }

  profile.lastCheckDate = today;
  profile.longestStreak = Math.max(profile.longestStreak, profile.currentStreak);

  // Check for new badges
  const newBadges: Badge[] = [];
  for (const badge of BADGES) {
    if (profile.badges.includes(badge.id)) continue;

    let earned = false;
    if (badge.type === "total_checks" && profile.totalChecks >= badge.requirement) {
      earned = true;
    }
    if (badge.type === "streak" && profile.currentStreak >= badge.requirement) {
      earned = true;
    }

    if (earned) {
      profile.badges.push(badge.id);
      newBadges.push(badge);
    }
  }

  saveUserProfile(profile);
  return { profile, newBadges };
}

/**
 * Get all badges with earned status for the current user.
 */
export function getBadgesWithStatus(): Array<Badge & { earned: boolean }> {
  const profile = getUserProfile();
  return BADGES.map((badge) => ({
    ...badge,
    earned: profile.badges.includes(badge.id),
  }));
}

/**
 * Get progress towards next badge.
 */
export function getNextBadgeProgress(): { badge: Badge; current: number; percentage: number } | null {
  const profile = getUserProfile();

  // Find first unearned total_checks badge
  const nextCheckBadge = BADGES
    .filter((b) => b.type === "total_checks" && !profile.badges.includes(b.id))
    .sort((a, b) => a.requirement - b.requirement)[0];

  if (nextCheckBadge) {
    const current = profile.totalChecks;
    const percentage = Math.min(100, Math.round((current / nextCheckBadge.requirement) * 100));
    return { badge: nextCheckBadge, current, percentage };
  }

  return null;
}
