import type { Metadata } from "next";
import "./globals.css";
import LayoutShell from "@/components/layout-shell";

export const metadata: Metadata = {
  metadataBase: new URL("https://bloxhop.site"),
  title: {
    default: "Bloxhop Online Store | Fast & Safe Blox Fruits Store",
    template: "%s | Bloxhop",
  },
  description:
    "Shop Blox Fruits digital products with fast fulfillment, secure checkout, order tracking, and reliable customer support.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-screen flex-col bg-[#070b14] text-white">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}