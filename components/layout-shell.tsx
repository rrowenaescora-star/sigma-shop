"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SiteFooter from "@/components/site-footer";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideGlobalLayout =
  pathname.startsWith("/checkout") ||
  pathname.startsWith("/home") ||
  pathname.startsWith("/terms") ||
  pathname.startsWith("/refund-policy") ||
  pathname.startsWith("/privacy-policy") ||
  pathname.startsWith("/delivery") ||
  pathname.startsWith("/contact");
  return (
    <>
      {!hideGlobalLayout && (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#07111f]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5 px-4 py-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link href="/" className="group relative flex items-center gap-4">
  {/* GLOW */}
  <div className="absolute -left-2 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-blue-500/20 blur-2xl transition duration-500 group-hover:bg-blue-400/30" />

  {/* LOGO */}
  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur-xl transition duration-300 group-hover:-translate-y-1 group-hover:border-blue-400/40">
    <Image
      src="/logo.png"
      alt="Bloxhop Logo"
      width={46}
      height={46}
      className="rounded-xl transition duration-500 group-hover:scale-110"
      priority
    />

    {/* SHINE EFFECT */}
    <div className="absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.18),transparent)] transition duration-1000 group-hover:translate-x-full" />
  </div>

  {/* TEXT */}
  <div className="hidden leading-tight sm:block">
    <span className="block bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-xl font-black tracking-wide text-transparent">
      BLOXHOP
    </span>

    <span className="block text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
      Online Store
    </span>
  </div>
</Link>

              <div className="group relative hidden lg:block">
                

                <div className="invisible absolute left-0 top-full z-50 mt-3 w-72 translate-y-2 rounded-2xl border border-white/10 bg-[#0b1628]/95 p-3 opacity-0 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="grid gap-2">
                    {[
                      {
                        href: "/home",
                        img: "/games/bloxfruits.png",
                        alt: "Blox Fruits",
                        name: "Blox Fruits",
                      },
                      {
                        href: "/mm2",
                        img: "/games/mm2.png",
                        alt: "MM2",
                        name: "MM2",
                      },
                      {
                        href: "/adopt-me",
                        img: "/games/adoptme.png",
                        alt: "Adopt Me",
                        name: "Adopt Me",
                      },
                      {
                        href: "/pet-simulator",
                        img: "/games/petsim.png",
                        alt: "Pet Simulator",
                        name: "Pet Simulator",
                      },
                      {
                        href: "/blade-ball",
                        img: "/games/bladeball.png",
                        alt: "Blade Ball",
                        name: "Blade Ball",
                      },
                      {
                        href: "/anime-defenders",
                        img: "/games/animedefender.png",
                        alt: "Anime Defender",
                        name: "Anime Defender",
                      },
                    ].map((shop) => (
                      <Link
                        key={shop.name}
                        href={shop.href}
                        className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 transition-all duration-200 hover:border-white/10 hover:bg-white/5"
                      >
                        <img
                          src={shop.img}
                          alt={shop.alt}
                          className="h-9 w-9 rounded-lg object-cover"
                        />
                        <span className="text-sm font-bold text-white">
                          {shop.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

            <div className="flex items-center gap-10">
  <div className="group relative hidden xl:block">
    <button className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-300 transition duration-200 hover:text-white after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all after:duration-300 group-hover:after:w-full"> 
      Shop Now

      <svg
        className="h-4 w-4 transition duration-300 group-hover:rotate-180 "
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <div className="invisible absolute left-0 top-full z-50 mt-5 w-72 translate-y-2 rounded-2xl border border-white/10 bg-[#0b1628]/95 p-3 opacity-0 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <div className="grid gap-2">
        {[
          {
            href: "/home",
            img: "/games/bloxfruits.png",
            alt: "Blox Fruits",
            name: "Blox Fruits",
          },
          {
            href: "/mm2",
            img: "/games/mm2.png",
            alt: "MM2",
            name: "MM2",
          },
          {
            href: "/adopt-me",
            img: "/games/adoptme.png",
            alt: "Adopt Me",
            name: "Adopt Me",
          },
          {
            href: "/pet-simulator",
            img: "/games/petsim.png",
            alt: "Pet Simulator",
            name: "Pet Simulator",
          },
          {
            href: "/blade-ball",
            img: "/games/bladeball.png",
            alt: "Blade Ball",
            name: "Blade Ball",
          },
          {
            href: "/anime-defenders",
            img: "/games/animedefender.png",
            alt: "Anime Defender",
            name: "Anime Defender",
          },
        ].map((shop) => (
          <Link
            key={shop.name}
            href={shop.href}
            className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 transition-all duration-200 hover:border-white/10 hover:bg-white/5"
          >
            <img
              src={shop.img}
              alt={shop.alt}
              className="h-9 w-9 rounded-lg object-cover"
            />

            <span className="text-sm font-bold text-white">
              {shop.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  </div>

  <nav className="hidden items-center gap-8 xl:flex">
    <Link
      href="/"
      className="group relative text-sm font-semibold tracking-wide text-slate-300 transition duration-200 hover:text-white"
    >
      <span className="relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all after:duration-300 group-hover:after:w-full">
        Home
      </span>
    </Link>

    <Link
      href="/tutorial"
      className="group relative text-sm font-semibold tracking-wide text-slate-300 transition duration-200 hover:text-white"
    >
      <span className="relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all after:duration-300 group-hover:after:w-full">
        Tutorial
      </span>
    </Link>

    <Link
      href="/track-order"
      className="group relative text-sm font-semibold tracking-wide text-slate-300 transition duration-200 hover:text-white"
    >
      <span className="relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all after:duration-300 group-hover:after:w-full">
        Track Order
      </span>
    </Link>

    <a
      href="https://discord.gg/evM2G5c9Vr"
      target="_blank"
      rel="noopener noreferrer"
      className="group relative text-sm font-semibold tracking-wide text-slate-300 transition duration-200 hover:text-white"
    >
      <span className="relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all after:duration-300 group-hover:after:w-full">
        Discord
      </span>
    </a>
  </nav>
</div>
            </div>

                      </div>
        </header>
      )}

      <main className="flex-1">{children}</main>

      {!hideGlobalLayout && <SiteFooter />}
    </>
  );
}