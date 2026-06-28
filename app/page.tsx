"use client";

import PremiumHero from "@/components/premium-hero";
import Link from "next/link";
import { useState } from "react";
import {
  BadgeCheck,
  Box,
  ChevronDown,
  ClipboardList,
  Headphones,
  Package,
  ShieldCheck,
  ShoppingCart,
  Star,
  Zap,
  Users,
  Rocket,
  Tags,
  Search,
} from "lucide-react";

const featuredProducts = [
  {
    id: 1,
    name: "Permanent Dragon",
    price: "$46.99",
    image: "/Dragon2.webp",
    hoverImage: "/Dragon_29_Fruit.webp",
    href: "/home#permanent-dragon",
  },
  {
    id: 2,
    name: "Permanent Control",
    price: "$24.99",
    image: "/Control.webp",
    hoverImage: "/Control_Fruit.webp",
    href: "/home#permanent-control",
  },
  {
    id: 3,
    name: "Permanent Kitsune",
    price: "$54.99",
    image: "/kitsune12.png",
    hoverImage: "/Kitsune_Fruit.webp",
    href: "/home#permanent-kitsune",
  },
  {
    id: 4,
    name: "Permanent Yeti",
    price: "$39.99",
    image: "/Yeti.webp",
    hoverImage: "/Yeti_Fruit.webp",
    href: "/home#permanent-yeti",
  },
];
const trustCards = [
  {
    icon: Zap,
    title: "Digital Delivery",
    text: "Orders are fulfilled digitally after review.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    text: "Protected checkout and payment flow.",
  },
  {
    icon: Package,
    title: "Track Your Order",
    text: "Use tracking for order status updates.",
  },
  {
    icon: Headphones,
    title: "Customer Service",
    text: "Support for order and delivery concerns.",
  },
];

const whyCards = [
  {
    icon: BadgeCheck,
    title: "Clean Store",
    text: "Simple shopping experience.",
  },
  {
    icon: Tags,
    title: "Clear Prices",
    text: "Products shown with pricing.",
  },
  {
    icon: Rocket,
    title: "Fast Delivery",
    text: "3-5 Minutes",
  },
  {
    icon: ShieldCheck,
    title: "Secure Flow",
    text: "Checkout safety comes first.",
  },
];

const reviews = [
  {
    name: "Fast Support",
    text: "Our team aims to respond quickly to order and delivery concerns through Discord support.",
  },
  {
    name: "Organized Delivery",
    text: "Orders are reviewed carefully to help provide a smoother and more organized delivery process.",
  },
  {
    name: "Growing Marketplace",
    text: "Bloxhop is preparing for future products, game categories, and additional marketplace features.",
  },
];

const faqs = [
  {
    q: "How does Bloxhop delivery work?",
    a: "After placing your order, our team reviews the payment and order details. Once confirmed, we prepare the delivery process based on the product purchased. Customers may receive instructions through the provided contact information or Discord support if needed. Delivery is coordinated digitally and updates can be tracked through the order system or customer support.",
  },
  {
    q: "Do I need to be online during delivery?",
    a: "Some deliveries may require the customer to be available in-game depending on the product purchased. If needed, our support team will contact you with instructions and delivery coordination details.",
  },
  {
    q: "How long does delivery take?",
    a: "Delivery times may vary depending on product availability, queue volume, payment confirmation, and order review. Most orders begin processing shortly after successful payment confirmation.",
  },
  {
    q: "What if I enter the wrong username?",
    a: "Please double-check your username before completing checkout. If you entered incorrect information, contact customer support immediately before delivery begins so the order details can be reviewed.",
  },
  {
    q: "Is my payment information safe?",
    a: "Bloxhop uses a protected checkout process and does not request sensitive banking passwords or private account credentials. Always make sure you are purchasing only through the official Bloxhop website.",
  },
  {
    q: "Can I track my order?",
    a: "Yes. Customers can monitor their order progress through the order tracking system or by contacting customer support for updates regarding review, processing, or delivery status.",
  },
  {
    q: "Do you offer refunds?",
    a: "Refund requests may be reviewed for eligible situations such as duplicate payments, failed delivery attempts, or orders that could not be completed after review.",
  },
  {
    q: "How can I contact support?",
    a: "Customers can contact the Bloxhop support team through our official Discord server for order questions, delivery assistance, and general support concerns.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="min-h-screen overflow-hidden bg-[#06101d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(37,99,235,0.16),transparent_30%),radial-gradient(circle_at_18%_85%,rgba(14,165,233,0.10),transparent_32%)]" />

      <section className="group relative overflow-hidden border-b border-white/10 bg-[#06101d]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,16,29,0.98)_0%,rgba(6,16,29,0.88)_40%,rgba(6,16,29,0.52)_68%,rgba(6,16,29,0.72)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(37,99,235,0.24),transparent_28%),radial-gradient(circle_at_20%_45%,rgba(14,165,233,0.07),transparent_25%)]" />

        <div className="pointer-events-none absolute right-[-120px] top-1/2 z-0 h-[420px] w-[420px] -translate-y-1/2 opacity-30 sm:right-[-40px] sm:h-[520px] sm:w-[520px] lg:right-[50px] lg:h-[650px] lg:w-[700px] lg:max-w-[58vw] lg:opacity-100">
          <img
            src="/bloxlogo2.png"
            alt="Bloxhop Hero"
            className="absolute inset-0 h-full w-full object-contain opacity-95 drop-shadow-[0_0_80px_rgba(59,130,246,0.35)] transition-all duration-700 group-hover:rotate-6 group-hover:scale-90 group-hover:opacity-0"
          />

          <img
            src="/bloxlogo.png"
            alt="Bloxhop Hero Hover"
            className="absolute inset-0 h-full w-full scale-90 object-contain opacity-0 drop-shadow-[0_0_120px_rgba(59,130,246,0.55)] transition-all duration-700 group-hover:scale-100 group-hover:opacity-100"
          />
        </div>

        <div className="relative z-10 mx-auto grid max-w-[1500px] items-center gap-8 px-5 py-12 sm:px-6 lg:right-[50px] lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
          <div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Trusted Bloxhop Marketplace,
              <span className="mt-1 block bg-gradient-to-r from-blue-400 via-blue-300 to-white bg-clip-text text-transparent">
                Fast & Secure Delivery
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Shop at Bloxhop items with secure checkout, fast delivery
              coordination, live order tracking, and active customer support.
            </p>

            <div className="mt-7 flex flex-wrap gap-4">
              <Link
                href="/request-item"
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-500 px-7 text-base font-black text-white shadow-[0_0_40px_rgba(59,130,246,0.35)] transition hover:-translate-y-1 hover:bg-blue-400"
              >
                <Search className="h-5 w-5" />
Request an Item
              </Link>

              <a
                href="https://discord.gg/evM2G5c9Vr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-7 text-base font-bold text-white transition hover:-translate-y-1 hover:bg-white/10"
              >
                <Headphones className="h-5 w-5 text-blue-400" />
                Join Our Discord
              </a>
            </div>

            <div className="mt-7 flex items-center gap-4">
              <div className="flex -space-x-3">
                {["B", "H", "X", "P", "+"].map((item) => (
                  <div
                    key={item}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#06101d] bg-blue-500 text-xs font-black"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xl font-black">Trusted By Players</p>
                <p className="text-sm text-[15px] font-medium leading-9 text-slate-300">
                  Fast support and organized delivery system.
                </p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block" />
        </div>
      </section>

      <section className="relative z-10 border-b border-white/10 bg-[#06101d] px-6 py-3">
        <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-4">
          {trustCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="flex items-center gap-5 rounded-2xl border border-white/10 bg-[#0a1527]/95 p-3 shadow-[0_12px_45px_rgba(0,0,0,0.18)]"
              >
                <div className="flex h-6 w-5 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15">
                  <Icon className="h-7 w-6 text-blue-400" />
                </div>

                <div>
                  <p className="font-black text-white">{card.title}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-400">
                    {card.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative mx-auto grid max-w-[1500px] gap-6 px-6 py-7 xl:grid-cols-[1.45fr_0.55fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black">Featured Products</h2>

            <Link
              href="/home"
              className="text-sm font-bold text-blue-400 transition hover:text-blue-300"
            >
              View All Products →
            </Link>
          </div>

         <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1527] transition hover:-translate-y-1 hover:border-blue-400/30"
              >
                <div className="group relative flex h-[190px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.18),transparent_65%)] p-5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="absolute h-full w-full object-contain transition duration-700 group-hover:rotate-180 group-hover:scale-75 group-hover:opacity-0"
                  />

                  <img
                    src={product.hoverImage || product.image}
                    alt={product.name}
                    className="absolute h-full w-full scale-75 object-contain opacity-0 transition duration-700 group-hover:scale-100 group-hover:opacity-100"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-black text-white">{product.name}</h3>

                 <div className="mt-4">
  <Link
    href={product.href}
    className="flex w-full items-center justify-center rounded-xl bg-blue-500 py-3 text-sm font-black text-white transition hover:scale-[1.02] hover:bg-blue-400"
  >
    Shop Now
  </Link>
</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0a1527] p-4">
              <Users className="h-9 w-9 text-blue-400" />
              <div>
  <div className="flex items-center gap-2">
    <span className="relative flex h-3 w-3">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
    </span>

    <p className="text-2xl font-black text-green-400">
      Open
    </p>
  </div>

  <p className="ml-5 text-xs text-slate-400">
    Shop Now
  </p>
</div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0a1527] p-4">
              <Headphones className="h-9 w-9 text-blue-400" />
              <div>
                <p className="text-2xl font-black">Support</p>
                <p className="text-xs text-slate-400">Customer Service</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0a1527] p-4">
              <ShieldCheck className="h-9 w-9 text-blue-400" />
              <div>
                <p className="text-2xl font-black">Protected</p>
                <p className="text-xs text-slate-400">Payment Flow</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0a1527] p-4">
              <Star className="h-9 w-9 fill-blue-400 text-blue-400" />
              <div>
                <p className="text-2xl font-black">Multi</p>
                <p className="text-xs text-slate-400">Game Ready</p>
              </div>
            </div>
          </div>

          <div id="how-it-works" className="mt-7">
            <h2 className="mb-4 text-2xl font-black">How It Works</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex min-h-[128px] items-center gap-5 rounded-2xl border border-white/10 bg-[#0a1527] p-5">
                <p className="shrink-0 text-5xl font-black text-blue-400">1</p>
                <ClipboardList className="h-9 w-9 shrink-0 text-slate-300" />
                <div>
                  <h3 className="font-black">Place Your Order</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Choose your item and complete the checkout.
                  </p>
                </div>
              </div>

              <div className="flex min-h-[128px] items-center gap-5 rounded-2xl border border-white/10 bg-[#0a1527] p-5">
                <p className="shrink-0 text-5xl font-black text-blue-400">2</p>
                <Box className="h-9 w-9 shrink-0 text-slate-300" />
                <div>
                  <h3 className="font-black">We Deliver</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Orders are reviewed and fulfilled digitally.
                  </p>
                </div>
              </div>

              <div className="flex min-h-[128px] items-center gap-5 rounded-2xl border border-white/10 bg-[#0a1527] p-5">
                <p className="shrink-0 text-5xl font-black text-blue-400">3</p>
                <BadgeCheck className="h-9 w-9 shrink-0 text-slate-300" />
                <div>
                  <h3 className="font-black">Enjoy Your Items</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Track your order or contact support if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-[#0a1527] p-5">
            <h2 className="text-2xl font-black">Why Choose Bloxhop?</h2>

            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {whyCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="rounded-xl border border-white/5 bg-[#0e1b31] p-4"
                  >
                    <Icon className="h-7 w-7 text-blue-400" />
                    <p className="mt-3 text-sm font-black text-white">
                      {card.title}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      {card.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section
            id="reviews"
            className="rounded-2xl border border-white/10 bg-[#06101d]"
          >
            <div className="mb-6 flex items-center gap-4 px-2 py-4">
              <h2 className="text-2xl font-black">What You Can Expect</h2>
              <Link
                href="/about"
                className="ml-auto text-xs font-bold text-blue-400 transition hover:text-blue-300"
              >
                About Bloxhop →
              </Link>
            </div>

            <div className="grid gap-3 px-2 md:grid-cols-1">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-[#0a1527] p-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-black">
                      {review.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="text-sm font-black">{review.name}</p>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="h-3.5 w-3.5 fill-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-slate-400">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section className="relative mx-auto max-w-[1500px] px-6 pt-6 pb-10">
        <div>
          <section
            id="faq"
            className="rounded-2xl border border-white/10 bg-[#06101d] px-1 py-1 pt-1"
          >
            <div className="relative mb-6 flex items-center justify-center px-1 pt-1 text-center">
              <h2 className="text-center text-3xl font-black">
                Frequently Asked Questions
              </h2>

              <button className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-400">
                View All FAQs →
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {faqs.map((faq, index) => (
                <div
                  key={faq.q}
                  className="overflow-hidden rounded-xl border border-white/10 bg-[#0a1527]"
                >
                  <button
                    onClick={() =>
                      setOpenFaq(openFaq === index ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-bold"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === index
                        ? "max-h-40 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="px-4 pb-4 text-xs leading-5 text-slate-400">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <PremiumHero />
          </section>

          <section className="mt-8">
            <div className="relative overflow-hidden px-2 py-8">
              <div className="mx-auto max-w-5xl text-center">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-400">
                  OUR STORY
                </p>

                <h3 className="mt-4 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
                  Built for players who want a cleaner and more modern gaming
                  marketplace.
                </h3>

               <p className="mt-6 text-sm leading-8 text-slate-400 md:text-[15px]">
  		 Bloxhop Online Store is a Roblox marketplace offering products and services for
 		 Blox Fruits, MM2, Adopt Me, Blade Ball, Pet Simulator, and Anime
 		 Defenders. Buy Roblox items with fast delivery, secure checkout,
		  order tracking, and customer support for players worldwide.
		</p>

                <p className="mt-5 text-sm leading-8 text-slate-400 md:text-[15px]">
                  Instead of a confusing layout or random checkout experience,
                  Bloxhop focuses on a modern store design, simple product
                  pages, secure checkout flow, order tracking, and customer
                  service support that helps customers feel more confident
                  before and after ordering.
                </p>

                <p className="mt-5 text-sm leading-8 text-slate-400 md:text-[15px]">
                  As Bloxhop continues to improve, the store is being prepared
                  for more product categories, smoother support systems, and
                  future game shops so customers can find more digital gaming
                  services in one place.
                </p>
              </div>
            </div>

            <section className="mt-2 py-4">
              <div className="rounded-3xl px-8 py-10 text-center">
                <h3 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                  BLOXHOP ONLINE STORE
                </h3>

                <p className="mx-auto mt-6 max-w-5xl text-sm leading-8 text-slate-400 md:text-[15px]">
                  Bloxhop.site is an independent digital gaming marketplace and
                  is not affiliated, associated, authorized, endorsed, or
                  sponsored by Roblox Corporation or any game developers. All
                  trademarks, game names, logos, and related assets belong to
                  their respective owners.
                </p>
              </div>
            </section>
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#0a1527] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 px-1 pt-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15">
              <Headphones className="h-8 w-8 text-blue-400" />
            </div>

            <div>
              <p className="text-lg font-black">Join Our Discord Community</p>
              <p className="text-sm text-slate-400">
                Customer service, updates, and support announcements.
              </p>
            </div>
          </div>

          <a
            href="https://discord.gg/evM2G5c9Vr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-500 px-8 font-black text-white shadow-[0_0_38px_rgba(59,130,246,0.35)] transition hover:bg-blue-400"
          >
            <Headphones className="h-5 w-5" />
            Join Discord
          </a>
        </div>
      </section>
    </main>
  );
}