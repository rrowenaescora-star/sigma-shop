import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/layout-shell";
import CookieConsent from "@/components/cookie-consent";
import RouteLoadingBar from "@/components/route-loading-bar";
import VisitorAnalyticsTracker from "@/components/visitor-analytics-tracker";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bloxhop.site"),

  title: {
    default: "Bloxhop — Independent Digital Gaming Marketplace",
    template: "%s | Bloxhop",
  },

  description:
    "Bloxhop is an independent digital gaming marketplace providing digital gaming-related products, online checkout, digital fulfillment, and customer support.",

  keywords: [
    "Bloxhop",
    "Blox Fruits Shop",
    "Buy Blox Fruits Items",
    "Grow a Garden 2 Shop",
    "Buy Grow a Garden 2 Items",
    "Digital Gaming Marketplace",
    "Roblox Items Store",
  ],

  openGraph: {
    title: "Bloxhop — Independent Digital Gaming Marketplace",
    description:
      "Bloxhop is an independent digital gaming marketplace providing digital gaming-related products, online checkout, digital fulfillment, and customer support.",
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
    <html lang="en" className={`h-full antialiased ${plusJakartaSans.variable}`}>
      <body className="flex min-h-screen flex-col bg-[#070b14] text-white">
        <RouteLoadingBar />
        <VisitorAnalyticsTracker />
        <LayoutShell>{children}</LayoutShell>
        <footer className="border-t border-white/10 bg-[#111121] px-6 py-6 text-center text-sm leading-7 text-slate-500">
          © {new Date().getFullYear()} Bloxhop Online Store. Independent digital
          gaming marketplace.
        </footer>
        <CookieConsent />
      </body>
    </html>
  );
}



