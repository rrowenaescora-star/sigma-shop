import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bloxhop Checkout" };

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#06101d]">{children}</div>;
}