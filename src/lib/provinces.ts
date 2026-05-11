/**
 * Indonesia Province Data for Hoax Heatmap
 * Contains province names, coordinates (approximate center for SVG positioning),
 * and keyword patterns for region detection from fact-check data.
 */

export interface ProvinceData {
  id: string;
  name: string;
  /** SVG x coordinate (0-1000 viewBox scale) */
  x: number;
  /** SVG y coordinate (0-500 viewBox scale) */
  y: number;
  /** Keywords that map a fact-check to this province */
  keywords: string[];
}

export const PROVINCES: ProvinceData[] = [
  { id: "aceh", name: "Aceh", x: 115, y: 105, keywords: ["aceh", "banda aceh", "lhokseumawe"] },
  { id: "sumut", name: "Sumatera Utara", x: 135, y: 135, keywords: ["medan", "sumatera utara", "sumut", "deli serdang"] },
  { id: "sumbar", name: "Sumatera Barat", x: 130, y: 175, keywords: ["padang", "sumatera barat", "sumbar", "bukittinggi"] },
  { id: "riau", name: "Riau", x: 160, y: 155, keywords: ["pekanbaru", "riau", "dumai"] },
  { id: "jambi", name: "Jambi", x: 155, y: 195, keywords: ["jambi"] },
  { id: "sumsel", name: "Sumatera Selatan", x: 155, y: 220, keywords: ["palembang", "sumatera selatan", "sumsel"] },
  { id: "bengkulu", name: "Bengkulu", x: 140, y: 235, keywords: ["bengkulu"] },
  { id: "lampung", name: "Lampung", x: 165, y: 260, keywords: ["lampung", "bandar lampung"] },
  { id: "babel", name: "Bangka Belitung", x: 185, y: 210, keywords: ["bangka", "belitung", "babel", "pangkal pinang"] },
  { id: "kepri", name: "Kepulauan Riau", x: 180, y: 145, keywords: ["batam", "kepri", "tanjung pinang", "kepulauan riau"] },
  { id: "dki", name: "DKI Jakarta", x: 220, y: 280, keywords: ["jakarta", "dki", "ibu kota"] },
  { id: "jabar", name: "Jawa Barat", x: 240, y: 285, keywords: ["bandung", "jawa barat", "jabar", "bogor", "bekasi", "depok", "karawang"] },
  { id: "jateng", name: "Jawa Tengah", x: 280, y: 285, keywords: ["semarang", "jawa tengah", "jateng", "solo", "surakarta"] },
  { id: "diy", name: "DI Yogyakarta", x: 278, y: 298, keywords: ["yogyakarta", "jogja", "diy"] },
  { id: "jatim", name: "Jawa Timur", x: 320, y: 285, keywords: ["surabaya", "jawa timur", "jatim", "malang", "sidoarjo"] },
  { id: "banten", name: "Banten", x: 205, y: 280, keywords: ["banten", "serang", "tangerang", "cilegon"] },
  { id: "bali", name: "Bali", x: 355, y: 300, keywords: ["bali", "denpasar", "kuta"] },
  { id: "ntb", name: "Nusa Tenggara Barat", x: 385, y: 305, keywords: ["lombok", "ntb", "mataram", "nusa tenggara barat"] },
  { id: "ntt", name: "Nusa Tenggara Timur", x: 430, y: 320, keywords: ["kupang", "ntt", "flores", "nusa tenggara timur"] },
  { id: "kalbar", name: "Kalimantan Barat", x: 240, y: 190, keywords: ["pontianak", "kalimantan barat", "kalbar"] },
  { id: "kalteng", name: "Kalimantan Tengah", x: 280, y: 200, keywords: ["palangkaraya", "kalimantan tengah", "kalteng"] },
  { id: "kalsel", name: "Kalimantan Selatan", x: 300, y: 225, keywords: ["banjarmasin", "kalimantan selatan", "kalsel"] },
  { id: "kaltim", name: "Kalimantan Timur", x: 310, y: 175, keywords: ["samarinda", "balikpapan", "kalimantan timur", "kaltim"] },
  { id: "kaltara", name: "Kalimantan Utara", x: 320, y: 140, keywords: ["tarakan", "kalimantan utara", "kaltara"] },
  { id: "sulut", name: "Sulawesi Utara", x: 420, y: 145, keywords: ["manado", "sulawesi utara", "sulut"] },
  { id: "sulteng", name: "Sulawesi Tengah", x: 400, y: 185, keywords: ["palu", "sulawesi tengah", "sulteng"] },
  { id: "sulsel", name: "Sulawesi Selatan", x: 390, y: 235, keywords: ["makassar", "sulawesi selatan", "sulsel"] },
  { id: "sultra", name: "Sulawesi Tenggara", x: 415, y: 230, keywords: ["kendari", "sulawesi tenggara", "sultra"] },
  { id: "gorontalo", name: "Gorontalo", x: 410, y: 155, keywords: ["gorontalo"] },
  { id: "sulbar", name: "Sulawesi Barat", x: 380, y: 215, keywords: ["mamuju", "sulawesi barat", "sulbar"] },
  { id: "maluku", name: "Maluku", x: 490, y: 200, keywords: ["ambon", "maluku"] },
  { id: "malut", name: "Maluku Utara", x: 480, y: 150, keywords: ["ternate", "maluku utara", "malut"] },
  { id: "papbar", name: "Papua Barat", x: 545, y: 185, keywords: ["manokwari", "papua barat", "sorong"] },
  { id: "papua", name: "Papua", x: 620, y: 185, keywords: ["jayapura", "papua", "wamena", "merauke"] },
];

/** National-level keywords that don't map to a specific province */
export const NATIONAL_KEYWORDS = [
  "indonesia", "nasional", "pemerintah", "presiden", "dpr", "kemenkes",
  "covid", "vaksin", "pemilu", "rupiah", "bnpb", "polri",
];

/**
 * Map a list of keywords from a fact-check to a province ID.
 * Returns province ID or "nasional" if no match found.
 */
export function mapKeywordsToProvince(keywords: string[], title: string, explanation: string): string {
  const searchText = [...keywords, title, explanation].join(" ").toLowerCase();

  for (const province of PROVINCES) {
    for (const kw of province.keywords) {
      if (searchText.includes(kw.toLowerCase())) {
        return province.id;
      }
    }
  }

  return "nasional";
}
