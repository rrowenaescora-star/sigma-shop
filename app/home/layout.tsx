import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blox Fruits Shop | Buy Blox Fruits Items",
  description:
    "Buy Blox Fruits items with fast delivery, secure checkout, order tracking, and customer support at Bloxhop.",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}