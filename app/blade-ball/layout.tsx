import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blade Ball Shop | Buy Blade Ball Items",
  description:
    "Buy Blade Ball items with secure checkout and fast delivery at Bloxhop.",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}