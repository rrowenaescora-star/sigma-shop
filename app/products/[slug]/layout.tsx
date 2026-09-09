import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bloxhop Product",
};

export default function MetadataLayout({ children }: { children: React.ReactNode }) {
  return children;
}