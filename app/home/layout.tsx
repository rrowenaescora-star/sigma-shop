import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blox Fruits Shop | Buy Blox Fruits Items",
  description:
    "Browse digital gaming-related products with online checkout, digital fulfillment, order tracking, and customer support at Bloxhop.",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
