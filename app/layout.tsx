import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
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
  title: "Bloxhop",
  description:
    "Digital storefront for in-game products, order tracking, and customer support.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-[#070b14] text-white">
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
                  BLOXHOP
                </span>
                <span className="block text-xs text-slate-400">
                  Digital Item Storefront
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

        <main className="flex-1">{children}</main>

        <SiteFooter />
      </body>
    </html>
  );
}