import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bloxhop Adopt Me",
};

export default function MetadataLayout({ children }: { children: React.ReactNode }) {
  return children;
}