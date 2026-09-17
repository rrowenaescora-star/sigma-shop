import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bloxhop Steal an Egg",
};

export default function MetadataLayout({ children }: { children: React.ReactNode }) {
  return children;
}
