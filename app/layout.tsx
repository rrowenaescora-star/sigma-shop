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
  description: "Fast and secure delivery of digital products.",
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
      <body className="min-h-screen flex flex-col bg-[#070b14] text-white">

        {/* 🔥 NAVBAR */}
        <header className="w-full border-b border-white/10 bg-[#0b1220]/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            
            {/* LOGO + NAME */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Bloxhop Logo"
                width={40}
                height={40}
                className="drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                priority
              />
              <span className="text-lg font-bold tracking-wide">
                Bloxhop
              </span>
            </Link>

            {/* NAV LINKS */}
            <div className="flex items-center gap-6 text-sm text-slate-300">
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
              <Link href="/track-order" className="hover:text-white transition">
                Track Order
              </Link>
              <Link href="/terms" className="hover:text-white transition">
                Terms
              </Link>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="flex-1">
          {children}
        </div>

        {/* FOOTER */}
        <SiteFooter />

      </body>
    </html>
  );
}
