import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bloxhop Wallet Payment Confirmation",
};

export default function MetadataLayout({ children }: { children: React.ReactNode }) {
  return children;
}