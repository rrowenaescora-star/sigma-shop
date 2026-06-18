import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adopt Me Shop | Buy Adopt Me Pets",
  description:
    "Buy Adopt Me pets and items with fast delivery and secure checkout at Bloxhop.",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}