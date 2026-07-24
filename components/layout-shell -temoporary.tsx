"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SiteFooter from "@/components/site-footer";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const hideGlobalLayout =
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/home") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/refund-policy") ||
    pathname.startsWith("/privacy-policy") ||
    pathname.startsWith("/delivery") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/adopt-me") ||
    pathname.startsWith("/pet-simulator") ||
    pathname.startsWith("/mm2") ||
    pathname.startsWith("/anime-defenders") ||
    pathname.startsWith("/manual-payment") ||
    pathname.startsWith("/grow-a-garden-2") ||
    pathname.startsWith("/wallet") ||
    pathname.startsWith("/blade-ball");

  const shops = [
    { href: "/home", img: "/games/bloxfruits.png", alt: "Blox Fruits", name: "Blox Fruits" },
    { href: "/mm2", img: "/games/mm2.png", alt: "MM2", name: "MM2" },
    { href: "/adopt-me", img: "/games/adoptme.png", alt: "Adopt Me", name: "Adopt Me" },
    { href: "/pet-simulator", img: "/games/petsim.png", alt: "Pet Simulator", name: "Pet Simulator" },
    { href: "/blade-ball", img: "/games/bladeball.png", alt: "Blade Ball", name: "Blade Ball" },
    { href: "/anime-defenders", img: "/games/animedefender.png", alt: "Anime Defender", name: "Anime Defender" },
    { href: "/grow-a-garden-2", img: "/games/grow-a-garden-2.png", alt: "Grow a Garden 2", name: "Grow a Garden 2" },
  ];

  return (
    <>
      {!hideGlobalLayout && (
        <>
          <header className="sticky top-0 z-[9999] w-full border-b border-white/10 bg-[#07111f]/95 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 md:px-6 lg:px-8">
              
              <Link href="/" className="group relative flex items-center gap-4">
                <div className="absolute -left-2 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-blue-500/20 blur-2xl" />

                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-2">
                  <Image
                    src="/logo.png"
                    alt="Bloxhop Logo"
                    width={46}
                    height={46}
                    className="rounded-xl"
                    priority
                  />
                </div>

                <div className="hidden leading-tight sm:block">
                  <span className="block bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-xl font-black tracking-wide text-transparent">
                    BLOXHOP
                  </span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Online Store
                  </span>
                </div>
              </Link>

              <div className="hidden items-center gap-8 xl:flex">
                <div className="group relative">
                  <button className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white">
                    Shop Now
                    <svg className="h-4 w-4 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div className="invisible absolute left-0 top-full z-[99999] mt-5 w-72 translate-y-2 rounded-2xl border border-white/10 bg-[#0b1628]/95 p-3 opacity-0 shadow-xl backdrop-blur-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="grid gap-2">
                      {shops.map((shop) => (
                        <Link
                          key={shop.name}
                          href={shop.href}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5"
                        >
                          <img src={shop.img} alt={shop.alt} className="h-9 w-9 rounded-lg object-cover" />
                          <span className="text-sm font-bold text-white">{shop.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <Link href="/" className="text-sm font-semibold text-slate-300 hover:text-white">
                  Home
                </Link>

                <Link href="/tutorial" className="text-sm font-semibold text-slate-300 hover:text-white">
                  Tutorial
                </Link>

                <Link href="/track-order" className="text-sm font-semibold text-slate-300 hover:text-white">
                  Track Order
                </Link>

                <a
                  href="https://discord.gg/evM2G5c9Vr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-slate-300 hover:text-white"
                >
                  Discord
                </a>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="relative z-[100000] flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#0b1628] text-2xl font-bold text-white shadow-xl xl:hidden"
              >
                {mobileMenuOpen ? "×" : "☰"}
              </button>
            </div>
          </header>

          {mobileMenuOpen && (
            <div className="fixed left-0 right-0 top-[78px] z-[9998] border-b border-white/10 bg-[#07111f]/95 px-4 py-5 backdrop-blur-xl xl:hidden">
              <div className="flex flex-col gap-4">
                <Link onClick={() => setMobileMenuOpen(false)} href="/" className="font-semibold text-white">
                  Home
                </Link>

                <Link onClick={() => setMobileMenuOpen(false)} href="/tutorial" className="font-semibold text-white">
                  Tutorial
                </Link>

                <Link onClick={() => setMobileMenuOpen(false)} href="/track-order" className="font-semibold text-white">
                  Track Order
                </Link>

                <a
                  href="https://discord.gg/evM2G5c9Vr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white"
                >
                  Discord
                </a>

                <div className="mt-3 grid gap-2 border-t border-white/10 pt-4">
                  {shops.map((shop) => (
                    <Link
                      key={shop.name}
                      href={shop.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2"
                    >
                      <img src={shop.img} alt={shop.alt} className="h-9 w-9 rounded-lg object-cover" />
                      <span className="text-sm font-bold text-white">{shop.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <main className="flex-1">{children}</main>

      {!hideGlobalLayout && <SiteFooter />}
    </>
  );
}