"use client";

import Link from "next/link";

const steps = [
  {
    title: "Choose Your Game",
    desc: "Click Shop Now and select the Roblox game you want to buy items for.",
    video: "/tutorial/choose-game.mp4",
  },
  {
    title: "Browse Products",
    desc: "Check available items, prices, and product details before adding anything to your cart.",
    video: "/tutorial/browse-products.mp4",
  },
  {
    title: "Add to Cart",
    desc: "Click Add to Cart on the item you want. You can review your cart before checkout.",
    video: "/tutorial/add-cart.mp4",
  },
  {
    title: "Checkout Securely",
    desc: "Enter your Roblox username and contact information correctly so we can deliver your order properly.",
    video: "/tutorial/checkout.mp4",
  },
  {
    title: "Wait for Delivery",
    desc: "After payment, our team will process and deliver your order as fast as possible.",
    video: "/tutorial/delivery.mp4",
  },
  {
    title: "Track Your Order",
    desc: "Use the Track Order page to check your order status anytime.",
    video: "/tutorial/track-order.mp4",
  },
];

export default function TutorialPage() {
  return (
    <main className="min-h-screen bg-[#07111f] px-4 py-16 text-white">
      <section className="mx-auto max-w-5xl text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-blue-400">
          Tutorial
        </p>

        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          How To Navigate Bloxhop
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
          Follow this quick step-by-step guide to learn how to browse products,
          checkout safely, and receive your Roblox items.
        </p>
      </section>

      <section className="mx-auto mt-14 grid max-w-7xl gap-7 lg:grid-cols-2">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_20px_80px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-white/[0.06]"
          >
            <div className="relative overflow-hidden border-b border-white/10 bg-[#0b1628]">
             <video
  src={step.video}
  className="h-[360px] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
  muted
  playsInline
  preload="metadata"
  controls={false}
  onMouseEnter={(e) => {
    e.currentTarget.play();
  }}
  onMouseLeave={(e) => {
    e.currentTarget.pause();
    e.currentTarget.currentTime = 0;
  }}
/>
            </div>

            <div className="p-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500 text-sm font-black text-white shadow-[0_0_30px_rgba(59,130,246,0.45)]">
                  {index + 1}
                </div>

                <h2 className="text-2xl font-black tracking-tight">
                  {step.title}
                </h2>
              </div>

              <p className="text-sm leading-7 text-slate-300">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-20 max-w-5xl overflow-hidden rounded-[2.5rem] border border-blue-400/20 bg-gradient-to-br from-blue-500/10 via-[#0b1628] to-purple-500/10 p-10 text-center shadow-[0_0_120px_rgba(59,130,246,0.12)]">
        <h2 className="text-3xl font-black tracking-tight">
          Ready To Start Shopping?
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Browse your favorite Roblox game items, checkout safely, and track
          your order anytime directly from Bloxhop.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/home"
            className="rounded-2xl bg-blue-500 px-8 py-4 text-sm font-black text-white shadow-[0_0_40px_rgba(59,130,246,0.45)] transition duration-300 hover:-translate-y-1 hover:bg-blue-400"
          >
            Shop Now
          </Link>

          <Link
            href="/track-order"
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-8 py-4 text-sm font-bold text-slate-200 transition duration-300 hover:bg-white/[0.08] hover:text-white"
          >
            Track Order
          </Link>
        </div>
      </section>
    </main>
  );
}