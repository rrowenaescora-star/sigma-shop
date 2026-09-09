import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bloxhop Request Item",
};

export default function MetadataLayout({ children }: { children: React.ReactNode }) {
  return children;
}