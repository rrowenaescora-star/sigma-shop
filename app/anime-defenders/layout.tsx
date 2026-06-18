import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Defenders Shop | Buy Anime Defenders Items",
  description:
    "Buy Anime Defenders items with secure checkout and fast delivery at Bloxhop.",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}