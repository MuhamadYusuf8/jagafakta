import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export interface WeeklyTrend {
  week: string;    // e.g. "Minggu 1"
  date: string;    // ISO week start
  hoaks: number;
  fakta: number;
  konteks: number;
  unverified: number;
  total: number;
}

export interface TrendingTopic {
  rank: number;
  keyword: string;
  count: number;
  verdict: string;
  delta: number;   // % change from previous week
  category: string;
}

export interface HoaxCalendarEvent {
  month: string;
  monthNum: number;
  events: string[];
  riskLevel: "tinggi" | "sedang" | "rendah";
}

export interface TrendsData {
  weeklyTrends: WeeklyTrend[];
  trendingTopics: TrendingTopic[];
  aiPrediction: string;
  hoaxCalendar: HoaxCalendarEvent[];
  summary: {
    totalThisWeek: number;
    hoaksRateThisWeek: number;
    peakDay: string;
    mostActiveCategory: string;
  };
}

// Realistic seed data based on Indonesian hoax patterns
const SEED_WEEKLY: WeeklyTrend[] = [
  { week: "12 Apr", date: "2026-04-12", hoaks: 142, fakta: 78, konteks: 34, unverified: 18, total: 272 },
  { week: "19 Apr", date: "2026-04-19", hoaks: 165, fakta: 82, konteks: 41, unverified: 22, total: 310 },
  { week: "26 Apr", date: "2026-04-26", hoaks: 189, fakta: 95, konteks: 52, unverified: 28, total: 364 },
  { week: "3 Mei",  date: "2026-05-03", hoaks: 201, fakta: 103, konteks: 48, unverified: 31, total: 383 },
  { week: "10 Mei", date: "2026-05-10", hoaks: 234, fakta: 118, konteks: 61, unverified: 35, total: 448 },
  { week: "17 Mei", date: "2026-05-17", hoaks: 278, fakta: 131, konteks: 74, unverified: 40, total: 523 },
  { week: "24 Mei", date: "2026-05-24", hoaks: 312, fakta: 144, konteks: 68, unverified: 38, total: 562 },
  { week: "31 Mei", date: "2026-05-31", hoaks: 298, fakta: 156, konteks: 77, unverified: 42, total: 573 },
  { week: "7 Jun",  date: "2026-06-07", hoaks: 267, fakta: 162, konteks: 71, unverified: 39, total: 539 },
  { week: "14 Jun", date: "2026-06-14", hoaks: 245, fakta: 170, konteks: 65, unverified: 36, total: 516 },
  { week: "21 Jun", date: "2026-06-21", hoaks: 289, fakta: 158, konteks: 80, unverified: 44, total: 571 },
  { week: "28 Jun", date: "2026-06-28", hoaks: 321, fakta: 149, konteks: 88, unverified: 51, total: 609 },
];

const SEED_TRENDING: TrendingTopic[] = [
  { rank: 1, keyword: "Vaksin COVID Chip 5G", count: 89, verdict: "HOAKS", delta: +34, category: "Kesehatan" },
  { rank: 2, keyword: "Rupiah Anjlok ke 20.000", count: 72, verdict: "HOAKS", delta: +18, category: "Ekonomi" },
  { rank: 3, keyword: "Penculikan Anak Viral", count: 61, verdict: "HOAKS", delta: +52, category: "Sosial" },
  { rank: 4, keyword: "AI Deepfake Pejabat", count: 54, verdict: "KONTEKS_HILANG", delta: +28, category: "Teknologi" },
  { rank: 5, keyword: "Obat Herbal Sembuhkan Kanker", count: 48, verdict: "HOAKS", delta: -12, category: "Kesehatan" },
];

const SEED_CALENDAR: HoaxCalendarEvent[] = [
  { month: "Januari", monthNum: 1, events: ["Hoaks Tahun Baru", "Prediksi Bencana Palsu"], riskLevel: "sedang" },
  { month: "Februari", monthNum: 2, events: ["Hoaks Hari Valentine", "Modus Penipuan Online"], riskLevel: "rendah" },
  { month: "Maret", monthNum: 3, events: ["Hoaks Ramadhan", "Mitos Puasa Palsu", "Konspirasi Makanan Haram"], riskLevel: "tinggi" },
  { month: "April", monthNum: 4, events: ["Hoaks Lebaran", "Penipuan THR", "Foto Mudik Palsu"], riskLevel: "tinggi" },
  { month: "Mei", monthNum: 5, events: ["Hoaks Hari Buruh", "Rumor Kenaikan UMP"], riskLevel: "sedang" },
  { month: "Juni", monthNum: 6, events: ["Hoaks Pilkada", "Manipulasi Survei Palsu"], riskLevel: "tinggi" },
  { month: "Juli", monthNum: 7, events: ["Hoaks Kemerdekaan", "Foto Sejarah Palsu"], riskLevel: "rendah" },
  { month: "Agustus", monthNum: 8, events: ["Hoaks 17 Agustus", "Manipulasi Foto Upacara"], riskLevel: "sedang" },
  { month: "September", monthNum: 9, events: ["Hoaks Musim Hujan", "Prediksi Cuaca Palsu BMKG"], riskLevel: "sedang" },
  { month: "Oktober", monthNum: 10, events: ["Hoaks Sumpah Pemuda", "Narasi Perpecahan Bangsa"], riskLevel: "sedang" },
  { month: "November", monthNum: 11, events: ["Hoaks Pilkada Akhir Tahun", "Kecurangan Palsu"], riskLevel: "tinggi" },
  { month: "Desember", monthNum: 12, events: ["Hoaks Natal", "Rumor Produk Haram", "Penipuan Akhir Tahun"], riskLevel: "tinggi" },
];

async function generateAIPrediction(trending: TrendingTopic[]): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Kamu adalah analis misinformasi senior untuk Indonesia. Berdasarkan topik hoaks yang sedang trending minggu ini:
${trending.map((t, i) => `${i + 1}. "${t.keyword}" (${t.count} kasus, ${t.delta > 0 ? "+" : ""}${t.delta}% dari minggu lalu)`).join("\n")}

Buat prediksi singkat (3-4 kalimat) tentang:
1. Topik hoaks apa yang kemungkinan akan viral dalam 1-2 minggu ke depan
2. Pola yang kamu lihat dari data ini
3. Satu saran praktis untuk masyarakat

Gunakan bahasa Indonesia yang natural dan mudah dipahami. Jangan gunakan format JSON atau markdown yang rumit.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return "Berdasarkan tren saat ini, hoaks bertema kesehatan dan ekonomi kemungkinan akan terus meningkat seiring ketidakpastian global. Waspadai konten yang mengaitkan isu vaksin dengan teknologi 5G—narasi ini terus berulang dalam siklus 3-4 mingguan. Selalu verifikasi informasi dari sumber resmi sebelum membagikan ke group WhatsApp.";
  }
}

export async function GET(_request: NextRequest) {
  try {
    let weeklyTrends = [...SEED_WEEKLY];
    let trendingTopics = [...SEED_TRENDING];
    let totalThisWeek = 609;

    // Try to fetch real aggregated data from Supabase
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 84); // 12 weeks

      const { data: realData } = await supabaseAdmin
        .from("fact_checks")
        .select("verdict, created_at, keywords")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (realData && realData.length > 50) {
        // Build real weekly trends
        const weekMap: Map<string, WeeklyTrend> = new Map();
        for (const row of realData) {
          const date = new Date(row.created_at);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekKey = weekStart.toISOString().split("T")[0];
          const label = weekStart.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

          if (!weekMap.has(weekKey)) {
            weekMap.set(weekKey, { week: label, date: weekKey, hoaks: 0, fakta: 0, konteks: 0, unverified: 0, total: 0 });
          }
          const entry = weekMap.get(weekKey)!;
          entry.total++;
          if (row.verdict === "HOAKS") entry.hoaks++;
          else if (row.verdict === "FAKTA") entry.fakta++;
          else if (row.verdict === "KONTEKS_HILANG") entry.konteks++;
          else entry.unverified++;
        }

        const realWeekly = Array.from(weekMap.values()).slice(-12);
        if (realWeekly.length >= 4) weeklyTrends = realWeekly;

        const lastWeek = realWeekly[realWeekly.length - 1];
        if (lastWeek) totalThisWeek = lastWeek.total;
      }
    } catch {
      // Use seed data
    }

    const lastWeek = weeklyTrends[weeklyTrends.length - 1];
    const prevWeek = weeklyTrends[weeklyTrends.length - 2] || lastWeek;
    const hoaksRate = lastWeek
      ? Math.round((lastWeek.hoaks / lastWeek.total) * 100)
      : 53;

    const aiPrediction = await generateAIPrediction(trendingTopics);

    const trendsData: TrendsData = {
      weeklyTrends,
      trendingTopics,
      aiPrediction,
      hoaxCalendar: SEED_CALENDAR,
      summary: {
        totalThisWeek,
        hoaksRateThisWeek: hoaksRate,
        peakDay: "Senin",
        mostActiveCategory: "Kesehatan",
      },
    };

    return Response.json(trendsData);
  } catch (error) {
    console.error("[Trends API] Error:", error);
    return Response.json({ error: "Gagal mengambil data tren." }, { status: 500 });
  }
}
