import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";

export interface LeaderboardEntry {
  anonymousId: string;
  displayName: string;
  totalChecks: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  rank?: number;
}

/**
 * GET: Retrieve leaderboard
 * POST: Submit/update user stats
 */
export async function GET() {
  try {
    const leaderboard = await getLeaderboard();
    return Response.json({ leaderboard }, { status: 200 });
  } catch (err) {
    console.error("Leaderboard GET error:", err);
    return Response.json({ leaderboard: [] }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { anonymousId, displayName, totalChecks, currentStreak, longestStreak, badges } = body;

    if (!anonymousId || !displayName) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Store in Redis sorted set (score = totalChecks)
    if (redis) {
      const entry: LeaderboardEntry = {
        anonymousId,
        displayName,
        totalChecks: totalChecks || 0,
        currentStreak: currentStreak || 0,
        longestStreak: longestStreak || 0,
        badges: badges || [],
      };

      // Store user data as hash
      await redis.hset(`lb:user:${anonymousId}`, {
        anonymousId: entry.anonymousId,
        displayName: entry.displayName,
        totalChecks: entry.totalChecks,
        currentStreak: entry.currentStreak,
        longestStreak: entry.longestStreak,
        badges: JSON.stringify(entry.badges),
      });

      // Update sorted set score
      await redis.zadd("lb:ranking", { score: totalChecks || 0, member: anonymousId });

      // Set expiry (7 days for weekly leaderboard)
      await redis.expire(`lb:user:${anonymousId}`, 7 * 24 * 60 * 60);
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Leaderboard POST error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!redis) return [];

  try {
    // Get top 50 from sorted set (descending)
    const topIds = await redis.zrange("lb:ranking", 0, 49, { rev: true });

    if (!topIds || topIds.length === 0) return [];

    const entries: LeaderboardEntry[] = [];

    for (let i = 0; i < topIds.length; i++) {
      const id = topIds[i] as string;
      const userData = await redis.hgetall(`lb:user:${id}`);

      if (userData && Object.keys(userData).length > 0) {
        entries.push({
          anonymousId: (userData.anonymousId as string) || id,
          displayName: (userData.displayName as string) || "Anonim",
          totalChecks: Number(userData.totalChecks) || 0,
          currentStreak: Number(userData.currentStreak) || 0,
          longestStreak: Number(userData.longestStreak) || 0,
          badges: Array.isArray(userData.badges) ? userData.badges as string[] : 
                  typeof userData.badges === "string" ? JSON.parse(userData.badges || "[]") : [],
          rank: i + 1,
        });
      }
    }

    return entries;
  } catch (err) {
    console.error("getLeaderboard error:", err);
    return [];
  }
}
