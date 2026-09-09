import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bloxhop MM2",
};

export default function MetadataLayout({ children }: { children: React.ReactNode }) {
  return children;
}