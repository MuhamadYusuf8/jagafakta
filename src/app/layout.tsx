import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://jagafakta.id"
  ),
  title: "JagaFakta — Cek Hoaks dengan AI",
  description:
    "Verifikasi hoaks dan fakta dari WhatsApp secara real-time menggunakan Gemini AI. Cek sebelum sebar.",
  keywords: [
    "cek hoaks",
    "fact checker indonesia",
    "berita hoaks",
    "verifikasi fakta",
    "jagafakta",
  ],
  openGraph: {
    title: "JagaFakta — AI Hoax Detector Indonesia",
    description:
      "Cek sebelum sebar. Verifikasi konten WhatsApp dengan Gemini AI.",
    type: "website",
    locale: "id_ID",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.ico" },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-bg font-sans text-text-primary antialiased">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1F2937",
              color: "#F9FAFB",
              border: "1px solid #374151",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#22C55E", secondary: "#F9FAFB" },
            },
            error: {
              iconTheme: { primary: "#EF4444", secondary: "#F9FAFB" },
            },
          }}
        />
        <div className="min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
