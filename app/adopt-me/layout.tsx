import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adopt Me Shop | Buy Adopt Me Pets",
  description:
    "Browse digital gaming-related products with online checkout, digital fulfillment, order tracking, and customer support at Bloxhop.",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
