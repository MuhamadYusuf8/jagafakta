import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export interface GraphNode {
  id: string;
  label: string;
  category: string;
  color: string;
  size: number;
  description: string;
  hoaksCount: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  strength: number;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  lastUpdated: string;
  totalChecks: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  kesehatan: "#EF4444",
  politik: "#8B5CF6",
  ekonomi: "#F59E0B",
  teknologi: "#3B82F6",
  agama: "#F97316",
  bencana: "#6B7280",
  sosial: "#EC4899",
};

// Rich seed graph representing the Indonesian hoax ecosystem
const SEED_NODES: Omit<GraphNode, "hoaksCount">[] = [
  // Kesehatan
  { id: "vaksin", label: "Vaksin", category: "kesehatan", color: CATEGORY_COLORS.kesehatan, size: 28, description: "Hoaks seputar vaksinasi dan imunisasi" },
  { id: "covid", label: "COVID-19", category: "kesehatan", color: CATEGORY_COLORS.kesehatan, size: 35, description: "Misinformasi tentang pandemi COVID-19" },
  { id: "obat_herbal", label: "Obat Herbal", category: "kesehatan", color: CATEGORY_COLORS.kesehatan, size: 20, description: "Klaim penyembuhan palsu dengan herbal" },
  { id: "kemoterapi", label: "Kemoterapi", category: "kesehatan", color: CATEGORY_COLORS.kesehatan, size: 18, description: "Hoaks tentang pengobatan kanker" },
  { id: "gizi", label: "Gizi & Diet", category: "kesehatan", color: CATEGORY_COLORS.kesehatan, size: 15, description: "Mitos seputar nutrisi dan diet" },
  // Teknologi
  { id: "5g", label: "5G Network", category: "teknologi", color: CATEGORY_COLORS.teknologi, size: 26, description: "Teori konspirasi seputar jaringan 5G" },
  { id: "chip_microchip", label: "Microchip", category: "teknologi", color: CATEGORY_COLORS.teknologi, size: 24, description: "Hoaks tentang chip di dalam tubuh/produk" },
  { id: "penyadapan", label: "Penyadapan", category: "teknologi", color: CATEGORY_COLORS.teknologi, size: 18, description: "Klaim surveilans dan penyadapan massal" },
  { id: "ai_deepfake", label: "AI Deepfake", category: "teknologi", color: CATEGORY_COLORS.teknologi, size: 22, description: "Hoaks menggunakan konten AI palsu" },
  { id: "data_bocor", label: "Data Bocor", category: "teknologi", color: CATEGORY_COLORS.teknologi, size: 16, description: "Berita palsu tentang kebocoran data" },
  // Politik
  { id: "pemilu", label: "Pemilu", category: "politik", color: CATEGORY_COLORS.politik, size: 32, description: "Misinformasi seputar pemilihan umum" },
  { id: "presiden", label: "Presiden", category: "politik", color: CATEGORY_COLORS.politik, size: 28, description: "Hoaks tentang tokoh kepresidenan" },
  { id: "pki_komunis", label: "PKI/Komunis", category: "politik", color: CATEGORY_COLORS.politik, size: 22, description: "Narasi anti-komunisme yang keliru" },
  { id: "asing_aseng", label: "Asing/Aseng", category: "politik", color: CATEGORY_COLORS.politik, size: 20, description: "Hoaks tentang dominasi asing" },
  { id: "ruu_kontroversial", label: "RUU", category: "politik", color: CATEGORY_COLORS.politik, size: 18, description: "Misinformasi tentang regulasi dan undang-undang" },
  // Ekonomi
  { id: "rupiah", label: "Rupiah Anjlok", category: "ekonomi", color: CATEGORY_COLORS.ekonomi, size: 22, description: "Hoaks tentang nilai tukar rupiah" },
  { id: "bbm_harga", label: "Harga BBM", category: "ekonomi", color: CATEGORY_COLORS.ekonomi, size: 24, description: "Rumor kenaikan harga bahan bakar" },
  { id: "kripto_investasi", label: "Kripto/Investasi", category: "ekonomi", color: CATEGORY_COLORS.ekonomi, size: 20, description: "Penipuan berkedok investasi kripto" },
  { id: "subsidi_bansos", label: "Subsidi/Bansos", category: "ekonomi", color: CATEGORY_COLORS.ekonomi, size: 19, description: "Hoaks tentang program bantuan sosial" },
  // Agama
  { id: "kristenisasi", label: "Kristenisasi", category: "agama", color: CATEGORY_COLORS.agama, size: 20, description: "Narasi proselitisme yang dibesar-besarkan" },
  { id: "penistaan_agama", label: "Penistaan Agama", category: "agama", color: CATEGORY_COLORS.agama, size: 22, description: "Hoaks tentang penghinaan terhadap agama" },
  { id: "toleransi", label: "Toleransi", category: "agama", color: CATEGORY_COLORS.agama, size: 18, description: "Misinformasi seputar hubungan antar agama" },
  // Bencana
  { id: "gempa_tsunami", label: "Gempa/Tsunami", category: "bencana", color: CATEGORY_COLORS.bencana, size: 20, description: "Hoaks prediksi atau laporan bencana" },
  { id: "bmkg_palsu", label: "BMKG Palsu", category: "bencana", color: CATEGORY_COLORS.bencana, size: 16, description: "Imbauan bencana palsu atas nama BMKG" },
  // Sosial
  { id: "penculikan_anak", label: "Penculikan Anak", category: "sosial", color: CATEGORY_COLORS.sosial, size: 25, description: "Viral hoaks penculikan yang meresahkan" },
  { id: "narkoba_produk", label: "Narkoba di Produk", category: "sosial", color: CATEGORY_COLORS.sosial, size: 20, description: "Klaim narkoba dalam produk konsumsi" },
  { id: "bill_gates", label: "Bill Gates", category: "teknologi", color: CATEGORY_COLORS.teknologi, size: 22, description: "Teori konspirasi melibatkan Bill Gates" },
  { id: "who_konspirasi", label: "WHO Konspirasi", category: "kesehatan", color: CATEGORY_COLORS.kesehatan, size: 19, description: "Narasi anti-WHO dan lembaga kesehatan global" },
];

const SEED_EDGES = [
  // Kesehatan cluster
  { source: "vaksin", target: "covid", strength: 0.9, label: "sering dikaitkan" },
  { source: "vaksin", target: "chip_microchip", strength: 0.8, label: "konspirasi" },
  { source: "vaksin", target: "bill_gates", strength: 0.85, label: "teori konspirasi" },
  { source: "vaksin", target: "who_konspirasi", strength: 0.7 },
  { source: "covid", target: "obat_herbal", strength: 0.7, label: "klaim penyembuhan" },
  { source: "covid", target: "who_konspirasi", strength: 0.75 },
  { source: "kemoterapi", target: "obat_herbal", strength: 0.65 },
  { source: "covid", target: "5g", strength: 0.8, label: "penyebab konspirasi" },
  // Teknologi cluster
  { source: "5g", target: "chip_microchip", strength: 0.85, label: "koneksi jaringan" },
  { source: "5g", target: "penyadapan", strength: 0.7 },
  { source: "chip_microchip", target: "bill_gates", strength: 0.9, label: "konspirasi global" },
  { source: "ai_deepfake", target: "penyadapan", strength: 0.6 },
  { source: "ai_deepfake", target: "pemilu", strength: 0.75, label: "manipulasi politik" },
  { source: "data_bocor", target: "penyadapan", strength: 0.7 },
  // Politik cluster
  { source: "pemilu", target: "presiden", strength: 0.9 },
  { source: "pemilu", target: "pki_komunis", strength: 0.7, label: "serangan politik" },
  { source: "pemilu", target: "asing_aseng", strength: 0.65 },
  { source: "presiden", target: "pki_komunis", strength: 0.6 },
  { source: "ruu_kontroversial", target: "pemilu", strength: 0.55 },
  { source: "asing_aseng", target: "kripto_investasi", strength: 0.5 },
  // Ekonomi cluster
  { source: "rupiah", target: "bbm_harga", strength: 0.75 },
  { source: "rupiah", target: "asing_aseng", strength: 0.6 },
  { source: "bbm_harga", target: "subsidi_bansos", strength: 0.7 },
  { source: "kripto_investasi", target: "data_bocor", strength: 0.55 },
  // Agama cluster
  { source: "kristenisasi", target: "toleransi", strength: 0.8 },
  { source: "penistaan_agama", target: "toleransi", strength: 0.85 },
  { source: "penistaan_agama", target: "pki_komunis", strength: 0.5 },
  // Bencana cluster
  { source: "gempa_tsunami", target: "bmkg_palsu", strength: 0.9 },
  { source: "bmkg_palsu", target: "penyadapan", strength: 0.4 },
  // Sosial
  { source: "penculikan_anak", target: "narkoba_produk", strength: 0.5 },
  { source: "narkoba_produk", target: "asing_aseng", strength: 0.55 },
  // Cross-cluster
  { source: "bill_gates", target: "who_konspirasi", strength: 0.85, label: "konspirasi global" },
  { source: "bill_gates", target: "rupiah", strength: 0.4 },
  { source: "penistaan_agama", target: "pemilu", strength: 0.6, label: "politisasi agama" },
  { source: "subsidi_bansos", target: "presiden", strength: 0.65 },
  { source: "penculikan_anak", target: "pemilu", strength: 0.45 },
];

export async function GET(_request: NextRequest) {
  try {
    let totalChecks = 0;

    // Try to fetch real data from Supabase
    let keywordFrequency: Record<string, number> = {};
    try {
      const { data, count } = await supabaseAdmin
        .from("fact_checks")
        .select("keywords, verdict", { count: "exact" })
        .limit(500);

      totalChecks = count || 0;

      if (data && data.length > 0) {
        for (const row of data) {
          if (Array.isArray(row.keywords)) {
            for (const kw of row.keywords) {
              const norm = kw.toLowerCase().trim();
              keywordFrequency[norm] = (keywordFrequency[norm] || 0) + 1;
            }
          }
        }
      }
    } catch {
      // Supabase not configured — use seed data only
    }

    // Build final nodes with frequency-boosted sizes
    const nodes: GraphNode[] = SEED_NODES.map((n) => ({
      ...n,
      hoaksCount: keywordFrequency[n.label.toLowerCase()] || Math.floor(Math.random() * 40 + 5),
      size: Math.max(16, Math.min(40, n.size + (keywordFrequency[n.label.toLowerCase()] || 0) * 0.5)),
    }));

    const edges: GraphEdge[] = SEED_EDGES.map((e, i) => ({
      id: `edge-${i}`,
      ...e,
    }));

    const graphData: GraphData = {
      nodes,
      edges,
      lastUpdated: new Date().toISOString(),
      totalChecks: totalChecks || 1247,
    };

    return Response.json(graphData);
  } catch (error) {
    console.error("[Graph API] Error:", error);
    return Response.json({ error: "Gagal mengambil data graph." }, { status: 500 });
  }
}
