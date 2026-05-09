import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import "./globals.css";
import SiteFooter from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bloxhop.site"),

  title: {
    default: "BLOXHOP ONLINE STORE| Fast & Safe Blox Fruits Store",
    template: "%s | Bloxhop",
  },

  description:
    "Shop Blox Fruits digital products with fast fulfillment, secure checkout, order tracking, and reliable customer support.",

  keywords: [
    "BLOXHOP ONLINE STORE",
    "Blox Fruits store",
    "Blox Fruits digital products",
    "Roblox digital store",
    "Blox Fruits shop",
    "Permanent fruits",
    "Fast fulfillment",
    "Secure checkout",
    "Order tracking",
  ],

  alternates: {
    canonical: "https://bloxhop.site",
  },

  openGraph: {
    title: "BLOXHOP ONLINE STORE | Fast & Safe Blox Fruits Store",
    description:
      "Shop Blox Fruits digital products with fast fulfillment, secure checkout, order tracking, and reliable customer support.",
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
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Bloxhop | Fast & Safe Blox Fruits Store",
    description:
      "Shop Blox Fruits digital products with fast fulfillment, secure checkout, order tracking, and reliable customer support.",
    images: ["/logo.png"],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isCheckout = pathname.startsWith("/checkout");

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-[#070b14] text-white">
        {!isCheckout && (
          <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0b1220]/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
              <Link href="/" className="group flex items-center gap-3">
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-1 transition-all duration-300 ease-in-out group-hover:border-cyan-300/20 group-hover:bg-white/[0.06]">
                  <Image
                    src="/logo.png"
                    alt="Bloxhop Logo"
                    width={40}
                    height={40}
                    className="rounded-lg"
                    priority
                  />
                </div>

                <div className="leading-tight">
                  <span className="block text-lg font-black tracking-wide text-white">
                    BLOXHOP ONLINE STORE
                  </span>
                  <span className="block text-xs text-slate-400">
                    Fast & Reliable Gaming Services
                  </span>
                </div>
              </Link>

              <nav className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 transition-all duration-300 ease-in-out hover:border-cyan-300/20 hover:bg-white/[0.08] hover:text-white"
                >
                  Home
                </Link>

                <Link
                  href="/track-order"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 transition-all duration-300 ease-in-out hover:border-cyan-300/20 hover:bg-white/[0.08] hover:text-white"
                >
                  Track Order
                </Link>
              </nav>
            </div>
          </header>
        )}

        <main className="flex-1">{children}</main>

        {!isCheckout && <SiteFooter />}
      </body>
    </html>
  );
}