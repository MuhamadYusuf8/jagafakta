import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jaringan Hoaks Indonesia — JagaFakta Graph",
  description:
    "Visualisasi interaktif jaringan hoaks Indonesia. Lihat bagaimana satu hoaks terhubung dengan yang lain dalam web of lies.",
  keywords: [
    "jaringan hoaks",
    "network graph hoaks",
    "koneksi misinformasi",
    "web of lies indonesia",
    "jagafakta graph",
  ],
  openGraph: {
    title: "Jaringan Hoaks Indonesia — JagaFakta",
    description:
      "Graf interaktif jaringan misinformasi Indonesia. Temukan pola konspirasi di balik hoaks.",
    type: "website",
    locale: "id_ID",
  },
};

export default function JaringanHoaksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
