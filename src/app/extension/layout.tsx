import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ekstensi Browser — JagaFakta",
  description: "Download ekstensi Chrome JagaFakta untuk cek hoaks tanpa buka website. Klik kanan pada teks manapun.",
};

export default function ExtensionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
