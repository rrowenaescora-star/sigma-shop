import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bloxhop Admin Store Layout",
};

export default function MetadataLayout({ children }: { children: React.ReactNode }) {
  return children;
}