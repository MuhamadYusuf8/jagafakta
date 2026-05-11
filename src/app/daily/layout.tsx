import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rangkuman Harian — JagaFakta",
  description: "Ringkasan hoaks dan fakta terverifikasi hari ini, dilengkapi statistik dan tips literasi digital.",
};

export default function DailyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
