import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tren Hoaks Indonesia — JagaFakta Intelligence",
  description:
    "Dashboard tren hoaks real-time Indonesia. Pantau topik viral, grafik mingguan, prediksi AI, dan kalender hoaks musiman.",
  keywords: [
    "tren hoaks indonesia",
    "hoaks viral minggu ini",
    "dashboard misinformasi",
    "fact check trend",
    "jagafakta tren",
  ],
  openGraph: {
    title: "Tren Hoaks Indonesia — JagaFakta",
    description:
      "Google Trends untuk hoaks. Pantau misinformasi yang sedang viral di Indonesia.",
    type: "website",
    locale: "id_ID",
  },
};

export default function TrenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
