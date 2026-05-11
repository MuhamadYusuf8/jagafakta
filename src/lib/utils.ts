import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createHash } from "crypto";
import type { VerdictType, VerdictConfig } from "@/types";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** SHA-256 hash of a string */
export function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

/** Format date to Indonesian relative time */
export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return "baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays === 1) return "kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffWeeks < 4) return `${diffWeeks} minggu lalu`;
  if (diffMonths < 12) return `${diffMonths} bulan lalu`;
  return `${Math.floor(diffMonths / 12)} tahun lalu`;
}

/** Format large numbers: 1200 → "1.2K" */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toString();
}

/** Truncate text with ellipsis */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/** Validate image MIME type */
export function isValidImageType(type: string): boolean {
  return ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(type);
}

/** Convert File to base64 string (no data:url prefix) */
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Gagal membaca file gambar"));
    reader.readAsDataURL(file);
  });
}

/** Verdict configuration map */
export const VERDICT_CONFIG: Record<VerdictType, VerdictConfig> = {
  HOAKS: {
    label: "HOAKS TERDETEKSI",
    labelShort: "HOAKS",
    colorVar: "--color-hoaks",
    bgVar: "--color-hoaks-bg",
    borderVar: "--color-hoaks-border",
    icon: "AlertTriangle",
    emoji: "🚨",
    description: "Informasi ini terbukti salah atau menyesatkan",
    gradientFrom: "#EF4444",
    gradientTo: "#DC2626",
  },
  FAKTA: {
    label: "FAKTA TERVERIFIKASI",
    labelShort: "FAKTA",
    colorVar: "--color-fakta",
    bgVar: "--color-fakta-bg",
    borderVar: "--color-fakta-border",
    icon: "CheckCircle",
    emoji: "✅",
    description: "Informasi ini terbukti benar berdasarkan sumber terpercaya",
    gradientFrom: "#22C55E",
    gradientTo: "#16A34A",
  },
  KONTEKS_HILANG: {
    label: "KONTEKS TIDAK LENGKAP",
    labelShort: "KONTEKS",
    colorVar: "--color-konteks",
    bgVar: "--color-konteks-bg",
    borderVar: "--color-konteks-border",
    icon: "Info",
    emoji: "⚠️",
    description: "Informasi mungkin benar tapi konteksnya tidak lengkap",
    gradientFrom: "#F59E0B",
    gradientTo: "#D97706",
  },
  TIDAK_DAPAT_DIVERIFIKASI: {
    label: "TIDAK DAPAT DIVERIFIKASI",
    labelShort: "N/A",
    colorVar: "--color-unverified",
    bgVar: "--color-unverified-bg",
    borderVar: "--color-unverified-border",
    icon: "HelpCircle",
    emoji: "❓",
    description: "Klaim tidak bisa dikonfirmasi karena bukti tidak cukup",
    gradientFrom: "#6B7280",
    gradientTo: "#4B5563",
  },
};
