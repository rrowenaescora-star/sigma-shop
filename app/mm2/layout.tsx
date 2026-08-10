import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MM2 Shop | Buy MM2 Godlys & Weapons",
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
