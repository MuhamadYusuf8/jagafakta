import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Komunitas — JagaFakta",
  description: "Laporkan hoaks, vote verdict AI, dan jadilah kontributor JagaFakta.",
};

export default function KomunitasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
