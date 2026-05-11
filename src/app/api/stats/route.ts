import { supabaseAdmin } from "@/lib/supabase";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    // Try cache first
    if (redis) {
      try {
        const cachedStats = await redis.get("app:stats");
        if (cachedStats) {
          const parsed = typeof cachedStats === "string" ? JSON.parse(cachedStats) : cachedStats;
          return Response.json(parsed, { status: 200 });
        }
      } catch {
        // Continue to DB query
      }
    }

    // Query from Supabase
    const { data: stats, error: statsError } = await supabaseAdmin
      .from("app_stats")
      .select("*")
      .eq("id", 1)
      .single();

    if (statsError) {
      console.error("Stats query error:", statsError);
      return Response.json(
        { total_checks: 0, total_hoaks: 0, total_fakta: 0, total_konteks: 0, total_unverified: 0, hoaks_percentage: 0 },
        { status: 200 }
      );
    }

    const result = {
      total_checks: stats?.total_checks || 0,
      total_hoaks: stats?.total_hoaks || 0,
      total_fakta: stats?.total_fakta || 0,
      total_konteks: stats?.total_konteks || 0,
      total_unverified: stats?.total_unverified || 0,
      hoaks_percentage:
        stats?.total_checks > 0
          ? Math.round((stats.total_hoaks / stats.total_checks) * 100)
          : 0,
    };

    // Cache for 5 minutes
    if (redis) {
      try {
        await redis.setex("app:stats", 300, JSON.stringify(result));
      } catch {
        // Non-critical
      }
    }

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Stats API error:", error);
    return Response.json(
      { total_checks: 0, total_hoaks: 0, total_fakta: 0, total_konteks: 0, total_unverified: 0, hoaks_percentage: 0 },
      { status: 200 }
    );
  }
}
