import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blade Ball Shop | Buy Blade Ball Items",
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
