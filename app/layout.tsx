import type { Metadata } from "next";
import "./globals.css";
import LayoutShell from "@/components/layout-shell";

export const metadata: Metadata = {
  metadataBase: new URL("https://bloxhop.site"),

  title: {
    default:
      "Bloxhop | Buy Blox Fruits, MM2, Adopt Me, Blade Ball & Pet Simulator Items",
    template: "%s | Bloxhop",
  },

  description:
    "Buy Roblox items and services for Blox Fruits, MM2, Adopt Me, Blade Ball, Pet Simulator, and Anime Defenders. Fast delivery, secure checkout, order tracking, and reliable support.",

  keywords: [
    "Bloxhop",
    "Blox Fruits Shop",
    "Buy Blox Fruits Items",
    "MM2 Shop",
    "Buy MM2 Godlys",
    "Adopt Me Shop",
    "Buy Adopt Me Pets",
    "Blade Ball Shop",
    "Pet Simulator Shop",
    "Anime Defenders Shop",
    "Roblox Marketplace",
    "Roblox Items Store",
  ],

  openGraph: {
    title:
      "Bloxhop | Buy Roblox Items for Blox Fruits, MM2, Adopt Me & More",
    description:
      "Buy Roblox items and services with fast delivery, secure checkout, order tracking, and reliable support.",
    url: "https://bloxhop.site",
    siteName: "Bloxhop",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Bloxhop Logo",
      },
    ],
  },

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