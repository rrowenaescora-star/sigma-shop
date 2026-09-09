import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bloxhop Sign Up",
};

export default function MetadataLayout({ children }: { children: React.ReactNode }) {
  return children;
}