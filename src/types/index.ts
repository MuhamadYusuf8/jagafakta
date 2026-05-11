export type VerdictType = "HOAKS" | "FAKTA" | "KONTEKS_HILANG" | "TIDAK_DAPAT_DIVERIFIKASI";
export type InputType = "text" | "image" | "video" | "audio";

export interface Source {
  title: string;
  url: string;
  snippet: string;
  credibility: "tinggi" | "sedang";
}

// ── Hoax DNA Pattern Types ──────────────────────────────────────────────────
export type HoaxDNAPattern =
  | "URGENCY"
  | "AUTHORITY_FAKE"
  | "EMOTIONAL_MANIPULATION"
  | "OUTDATED_RECYCLED"
  | "MISATTRIBUTION"
  | "CLICKBAIT"
  | "CONSPIRACY"
  | "FABRICATED_DATA"
  | "DEEPFAKE"
  | "OUT_OF_CONTEXT";

export interface HoaxDNAItem {
  pattern: HoaxDNAPattern;
  confidence: number; // 0-100
  description: string;
}

// ── Fact Check Result ───────────────────────────────────────────────────────
export interface FactCheckResult {
  id?: string;
  verdict: VerdictType;
  confidence_score: number;
  title: string;
  explanation: string;
  key_claims: string[];
  misleading_elements: string[];
  sources: Source[];
  keywords: string[];
  context: string;
  hoax_dna?: HoaxDNAItem[];
  detected_language?: string;
  is_cached?: boolean;
  created_at?: string;
}

export interface FactCheckRecord extends FactCheckResult {
  id: string;
  input_type: InputType;
  created_at: string;
  share_count: number;
}

// ── Community ───────────────────────────────────────────────────────────────
export interface CommunityVote {
  check_id: string;
  vote: "agree" | "disagree";
  anonymous_id: string;
  created_at: string;
}

export interface CommunityReport {
  id: string;
  reporter_id: string;
  reporter_name: string;
  content: string;
  content_type: "text" | "url";
  status: "pending" | "checked" | "dismissed";
  upvotes: number;
  created_at: string;
  verdict?: VerdictType;
}

// ── App Stats ───────────────────────────────────────────────────────────────
export interface AppStats {
  total_checks: number;
  total_hoaks: number;
  total_fakta: number;
}

// ── Verdict Config ──────────────────────────────────────────────────────────
export interface VerdictConfig {
  label: string;
  labelShort: string;
  colorVar: string;
  bgVar: string;
  borderVar: string;
  icon: string;
  emoji: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
}

// ── Daily Digest ────────────────────────────────────────────────────────────
export interface DailyDigest {
  date: string;
  top_hoaks: Array<{ title: string; verdict: VerdictType; count: number }>;
  top_fakta: Array<{ title: string; verdict: VerdictType; count: number }>;
  stats: { total: number; hoaks: number; fakta: number; konteks: number };
  tip: string;
}

// ── i18n ────────────────────────────────────────────────────────────────────
export type SupportedLanguage =
  | "id"      // Bahasa Indonesia
  | "jv"      // Javanese
  | "su"      // Sundanese
  | "ms"      // Malay
  | "en"      // English
  | "tl";     // Tagalog
