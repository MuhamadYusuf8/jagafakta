import { supabaseAdmin } from "@/lib/supabase";
import { redis } from "@/lib/redis";
import { PROVINCES, mapKeywordsToProvince } from "@/lib/provinces";

export interface HeatmapProvinceData {
  id: string;
  name: string;
  x: number;
  y: number;
  total: number;
  hoaks: number;
  fakta: number;
  konteks: number;
  recentTitles: string[];
}

export async function GET() {
  try {
    // Try cache first (5 min TTL)
    if (redis) {
      try {
        const cached = await redis.get("heatmap:data");
        if (cached) {
          const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
          return Response.json(parsed, { status: 200 });
        }
      } catch {
        // Continue to DB
      }
    }

    // Fetch recent fact checks (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: factChecks, error } = await supabaseAdmin
      .from("fact_checks")
      .select("title, explanation, keywords, verdict, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("Heatmap query error:", error);
      return Response.json({ provinces: [], totalChecks: 0 }, { status: 200 });
    }

    // Aggregate by province
    const provinceMap = new Map<string, {
      total: number;
      hoaks: number;
      fakta: number;
      konteks: number;
      titles: string[];
    }>();

    // Initialize all provinces
    for (const p of PROVINCES) {
      provinceMap.set(p.id, { total: 0, hoaks: 0, fakta: 0, konteks: 0, titles: [] });
    }
    provinceMap.set("nasional", { total: 0, hoaks: 0, fakta: 0, konteks: 0, titles: [] });

    for (const check of factChecks || []) {
      const keywords = Array.isArray(check.keywords) ? check.keywords : [];
      const provinceId = mapKeywordsToProvince(keywords, check.title || "", check.explanation || "");
      const bucket = provinceMap.get(provinceId);
      if (!bucket) continue;

      bucket.total += 1;
      if (check.verdict === "HOAKS") bucket.hoaks += 1;
      else if (check.verdict === "FAKTA") bucket.fakta += 1;
      else bucket.konteks += 1;

      if (bucket.titles.length < 3 && check.title) {
        bucket.titles.push(check.title);
      }
    }

    // Build response
    const provinces: HeatmapProvinceData[] = PROVINCES.map((p) => {
      const data = provinceMap.get(p.id)!;
      return {
        id: p.id,
        name: p.name,
        x: p.x,
        y: p.y,
        total: data.total,
        hoaks: data.hoaks,
        fakta: data.fakta,
        konteks: data.konteks,
        recentTitles: data.titles,
      };
    });

    const nasional = provinceMap.get("nasional")!;
    const totalChecks = (factChecks || []).length;

    const result = {
      provinces,
      nasional: {
        total: nasional.total,
        hoaks: nasional.hoaks,
        fakta: nasional.fakta,
        konteks: nasional.konteks,
        recentTitles: nasional.titles,
      },
      totalChecks,
    };

    // Cache for 5 minutes
    if (redis) {
      try {
        await redis.setex("heatmap:data", 300, JSON.stringify(result));
      } catch {
        // Non-critical
      }
    }

    return Response.json(result, { status: 200 });
  } catch (err) {
    console.error("Heatmap API error:", err);
    return Response.json({ provinces: [], totalChecks: 0 }, { status: 200 });
  }
}
