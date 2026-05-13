"use client";

import { Headphones } from "lucide-react";

const particles = [
  { width: 8, height: 8, left: 12, top: 20, duration: 8 },
  { width: 12, height: 12, left: 28, top: 65, duration: 10 },
  { width: 7, height: 7, left: 45, top: 30, duration: 9 },
  { width: 14, height: 14, left: 62, top: 75, duration: 12 },
  { width: 9, height: 9, left: 80, top: 22, duration: 11 },
  { width: 11, height: 11, left: 90, top: 55, duration: 13 },
];

export default function PremiumHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#06101d]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,16,29,0.98)_0%,rgba(6,16,29,0.88)_40%,rgba(6,16,29,0.52)_68%,rgba(6,16,29,0.72)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(37,99,235,0.24),transparent_28%),radial-gradient(circle_at_20%_45%,rgba(14,165,233,0.07),transparent_25%)]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400/20 blur-xl"
            style={{
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `float ${particle.duration}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1500px] items-center gap-10 px-6 py-20 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
            Trusted Roblox Marketplace
          </div>

          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">
            Buy Roblox Items
            <span className="mt-2 block bg-gradient-to-r from-blue-400 via-blue-300 to-white bg-clip-text text-transparent">
              Faster & Safer
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
            Shop digital Roblox items with organized delivery, secure checkout,
            active support, and live order tracking.
          </p>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
            {[
              ["Active", "Support"],
              ["Fast", "Delivery"],
              ["Secure", "Checkout"],
            ].map(([main, sub]) => (
              <div
                key={main}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center backdrop-blur-xl"
              >
                <p className="text-2xl font-black text-white">{main}</p>
                <p className="mt-1 text-xs font-semibold tracking-wide text-slate-400">
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute inset-0 rounded-[3rem] bg-blue-500/20 blur-[90px]" />

          <div className="relative rounded-[3rem] border border-white/10 bg-white/[0.05] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="grid gap-5">
              {[
                {
                  game: "Blox Fruits",
                  tag: "Popular",
                  image: "/games/bloxfruits.png",
                },
                {
                  game: "Pet Simulator",
                  tag: "Trending",
                  image: "/games/petsim.png",
                },
                {
                  game: "MM2",
                  tag: "Hot",
                  image: "/games/mm2.png",
                },
              ].map((game, index) => (
                <div
                  key={game.game}
                  className={`group flex items-center gap-4 rounded-3xl border border-white/10 bg-[#0b1628]/90 p-4 transition duration-300 hover:-translate-y-1 hover:border-blue-400/40 ${
                    index === 1 ? "ml-10" : ""
                  }`}
                >
                  <img
                    src={game.image}
                    alt={game.game}
                    className="h-16 w-16 rounded-2xl object-cover transition duration-500 group-hover:scale-110"
                  />

                  <div className="flex-1">
                    <h3 className="text-lg font-black text-white">
                      {game.game}
                    </h3>
                    <p className="text-sm text-slate-400">
                      Digital items available
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-black text-blue-300">
                    {game.tag}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-blue-400/20 bg-blue-500/10 p-5">
              <p className="text-sm font-black tracking-wide text-blue-300">
                DELIVERY FLOW
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs font-black text-slate-300">
                <div className="rounded-2xl bg-white/[0.05] p-4">Order</div>
                <div className="rounded-2xl bg-white/[0.05] p-4">Process</div>
                <div className="rounded-2xl bg-white/[0.05] p-4">Deliver</div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-3xl border border-white/10 bg-[#0f1d35] p-5">
              <div>
                <p className="text-lg font-black text-white">Need Help?</p>
                <p className="mt-1 text-sm text-slate-400">
                  Join our support Discord server.
                </p>
              </div>

              <a
                href="https://discord.gg/evM2G5c9Vr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 text-sm font-black text-white shadow-[0_0_30px_rgba(59,130,246,0.35)] transition hover:bg-blue-400"
              >
                <Headphones className="h-4 w-4" />
                Discord
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </section>
  );
}