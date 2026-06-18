import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pet Simulator Shop | Buy Pet Simulator Items",
  description:
    "Buy Pet Simulator pets and items with secure checkout and fast delivery at Bloxhop.",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}