"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  { id: 1, name: "Permanent Dragon", image: "/Dragon2.webp", hoverImage: "/Dragon_29_Fruit.webp", href: "/home#permanent-dragon" },
  { id: 2, name: "Permanent Control", image: "/Control.webp", hoverImage: "/Control_Fruit.webp", href: "/home#permanent-control" },
  { id: 3, name: "Permanent Kitsune", image: "/kitsune12.png", hoverImage: "/Kitsune_Fruit.webp", href: "/home#permanent-kitsune" },
  { id: 4, name: "Permanent Yeti", image: "/Yeti.webp", hoverImage: "/Yeti_Fruit.webp", href: "/home#permanent-yeti" },
  { id: 5, name: "Black Dragon", image: "", hoverImage: "", href: "/grow-a-garden-2#black-dragon", flipHover: true },
  { id: 6, name: "Ice Serpent", image: "", hoverImage: "", href: "/grow-a-garden-2#ice-serpent", flipHover: true },
  { id: 7, name: "Unicorn", image: "", hoverImage: "", href: "/grow-a-garden-2#unicorn", flipHover: true },
];
const trustCards = [
  {
    icon: Zap,
    title: "Digital Delivery",
    text: "Orders are processed and delivered digitally after successful payment confirmation.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    text: "Payments are processed through available third-party payment providers.",
  },
  {
    icon: Package,
    title: "Order Tracking",
    text: "Check your order status through our online order-tracking system.",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    text: "Help is available for orders, delivery issues, refunds, and transaction concerns.",
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
    title: "Digital Fulfillment",
    text: "Timing varies by product, availability, verification, and order volume.",
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
  const [liveFeaturedImages, setLiveFeaturedImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    async function loadFeaturedImages() {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const result = await response.json();
        const products = Array.isArray(result?.products) ? result.products : [];
        const requestedNames = new Set(["black dragon", "ice serpent", "unicorn"]);
        const images: Record<string, string> = {};

        products.forEach((product: { name?: string; image_url?: string | null }) => {
          const name = product.name?.trim().toLowerCase();
          if (name && requestedNames.has(name) && product.image_url) images[name] = product.image_url;
        });

        if (active) setLiveFeaturedImages(images);
      } catch {
        // Static featured items stay visible if live product data is unavailable.
      }
    }

    loadFeaturedImages();
    return () => { active = false; };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#06101d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(37,99,235,0.16),transparent_30%),radial-gradient(circle_at_18%_85%,rgba(14,165,233,0.10),transparent_32%)]" />

      <section className="group relative overflow-hidden border-b border-white/10 bg-[#06101d]">
        <img src="/bloxhop-header-background.png" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,16,29,0.98)_0%,rgba(6,16,29,0.88)_40%,rgba(6,16,29,0.52)_68%,rgba(6,16,29,0.72)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(37,99,235,0.24),transparent_28%),radial-gradient(circle_at_20%_45%,rgba(14,165,233,0.07),transparent_25%)]" />

        <div className="pointer-events-none absolute right-[-120px] top-1/2 z-0 h-[420px] w-[420px] -translate-y-1/2 opacity-30 sm:right-[-40px] sm:h-[520px] sm:w-[520px] lg:right-[50px] lg:h-[650px] lg:w-[700px] lg:max-w-[58vw] lg:opacity-100">
          <img
            src="/videos/layer1.png"
            alt=""
            aria-hidden="true"
            className="hero-layer1-pulse absolute inset-0 h-full w-full object-contain"
          />
          <img
            src="/videos/layer2.png"
            alt="Bloxhop hero"
            className="hero-layer2-drift absolute inset-0 h-full w-full object-contain drop-shadow-[0_0_90px_rgba(59,130,246,0.45)]"
          />          <img
            src="/videos/layer3.png"
            alt=""
            aria-hidden="true"
            className="hero-layer3-float absolute inset-0 h-full w-full object-contain opacity-90"
          />
          <img
            src="/videos/layer4.png"
            alt=""
            aria-hidden="true"
            className="hero-layer4-float absolute inset-0 h-full w-full object-contain opacity-90"
          />
        </div>

        <div className="relative z-10 mx-auto grid max-w-[1500px] items-center gap-12 px-5 py-16 sm:px-6 lg:right-[50px] lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
          <div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Level Up Your Game
              <span className="mt-2 block text-3xl bg-gradient-to-r from-blue-400 via-blue-300 to-white bg-clip-text text-transparent sm:text-4xl md:text-5xl">
                Get What You Want, Fast.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg font-normal leading-8 text-slate-300 sm:text-xl">
              Find what you need, check out in seconds, and get back in the game.
            </p>

            <div className="mt-7 flex flex-wrap gap-4">
              <Link
                href="/request-item"
                className="flex h-14 items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-7 text-base font-black text-white shadow-[0_6px_0_#1d4ed8] transition hover:translate-y-0.5 hover:bg-[#60a5fa] hover:shadow-[0_4px_0_#1d4ed8] active:translate-y-1 active:shadow-[0_2px_0_#1d4ed8]"
              >
                <Search className="h-5 w-5" />
Request an Item
              </Link>

              <a
                href="https://discord.gg/evM2G5c9Vr"
                target="_blank"
                rel="noopener noreferrer"
                className="button-3d flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-7 text-base font-bold text-white hover:bg-white/10"
              >
                <Headphones className="h-5 w-5 text-blue-400" />
                Join Our Discord
              </a>
            </div>

            <Link
              href="/home"
              className="group/new-fruit relative isolate mt-8 flex max-w-xl items-center justify-between gap-5 overflow-hidden rounded-2xl border border-emerald-300/40 bg-[#ffffff] px-5 py-10 shadow-[0_0_34px_rgba(16,185,129,0.16)] transition hover:-translate-y-0.5 hover:border-emerald-200/70 hover:shadow-[0_0_42px_rgba(16,185,129,0.28)]"
            >
              <img src="/magnetfruit.png" alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover object-right opacity-75 transition duration-500 group-hover/new-fruit:scale-105" />
              <span className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,24,20,0.96)_0%,rgba(4,37,30,0.78)_48%,rgba(2,24,20,0.3)_100%)]" />
              <div className="flex items-center gap-3">
                
                <span>
                  <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-red-500">COMMING SOON</span>
                  <span className="mt-2 block text-lg font-black text-white">New Fruit Are Here!</span>
                  <span className="block text-sm text-slate-200">See the newest Blox Fruit arrivals.</span>
                </span>
              </div>
              <span className="shrink-0 rounded-lg bg-blue-400/80 px-5 py-5 text-xs font-black text-[#05231d] transition group-hover/new-fruit:bg-white">Shop now →</span>
            </Link>
            <div className="mt-7 flex items-center gap-4">
              

              
            </div>
          </div>

          <div className="hidden lg:block" />
        </div>
      </section>

      <section className="relative z-10 border-b border-white/10 bg-[#06101d] px-6 py-6">
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

      <section className="relative mx-auto max-w-[1500px] px-6 py-14">
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

         <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2  xl:grid-cols-4">
            {featuredProducts.map((product) => {
              const displayImage = liveFeaturedImages[product.name.toLowerCase()] || product.image;
              const hoverImage = product.hoverImage || displayImage;

              return (
                <Link
                  key={product.id}
                  href={product.href}
                  aria-label={`Open ${product.name} in the Blox Fruit shop`}
                  className="group block overflow-hidden rounded-2xl border border-emerald-200/45 bg-[radial-gradient(circle_at_82%_30%,rgba(59,130,246,0.34),transparent_34%),linear-gradient(110deg,#071f25_0%,#10343a_55%,#1d2b4d_100%)] shadow-[0_0_26px_rgba(52,211,153,0.1)] transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_0_36px_rgba(52,211,153,0.22)]"
                >
                  <div className="relative flex h-[190px] items-center overflow-hidden p-5">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,18,23,0.78)_0%,rgba(3,18,23,0.26)_58%,rgba(3,18,23,0.05)_100%)]" />
                    <div className="relative z-10 max-w-[56%]">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">Featured Drop</p>
                      <h3 className="mt-2 text-lg font-black leading-tight text-white">{product.name}</h3>
                    </div>
                    {displayImage ? (
                      <>
                        <img
                          src={displayImage}
                          alt={product.name}
                          className="absolute right-0 top-0 h-full w-[68%] object-contain transition duration-700 group-hover:rotate-180 group-hover:scale-75 group-hover:opacity-0"
                        />
                        <img
                          src={hoverImage}
                          alt={`${product.name} alternate view`}
                          className={`absolute h-full w-full object-contain opacity-0 transition duration-700 group-hover:opacity-100 ${product.flipHover ? "-scale-x-75 scale-y-75 group-hover:-scale-x-100 group-hover:scale-y-100" : "scale-75 group-hover:scale-100"}`}
                        />
                      </>
                    ) : (
                      <div className="text-xs font-semibold text-slate-500">Loading item...</div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex w-full items-center justify-center rounded-xl bg-white py-3 text-sm font-black text-[#10212b] transition group-hover:scale-[1.02] group-hover:bg-emerald-100">
                      Shop now →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <section id="how-it-works" className="mt-28 border-t border-white/10 pt-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              How It <span className="text-blue-400">Works</span>
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
              Shop with confidence through a simple and secure digital order flow.
            </p>

            <div className="mt-12 flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-4">
              {[
                {
                  title: "1. Choose Your Items",
                  text: "Browse the shop, pick your favorites, and add them to your cart.",
                  image: "/how-it-works/choose-your-items.png",
                },
                {
                  title: "2. Secure Checkout",
                  text: "Enter your details, review your order, and continue to Shopify's secure checkout to complete payment.",
                  image: "/how-it-works/secure-checkout.png",
                },
                {
                  title: "3. Digital Delivery",
                  text: "After payment verification, your order is prepared for digital fulfillment.",
                  image: "/how-it-works/digital-delivery.png",
                },
              ].map((step, index) => (
                <div key={step.title} className="flex min-w-0 flex-1 flex-col gap-5 lg:flex-row lg:items-center">
                  <article className="flex min-h-[330px] flex-1 flex-col items-center rounded-2xl border border-white/10 bg-[#0a1527] px-6 py-8 text-center shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
                    <div className="flex h-40 w-full items-center justify-center p-2">
                      <img
                        src={step.image}
                        alt={`${step.title} illustration`}
                        className="h-full max-w-full object-contain"
                      />
                    </div>
                    <h3 className="mt-7 text-xl font-black text-white">{step.title}</h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">{step.text}</p>
                  </article>
                  {index < 2 && (
                    <div className="mx-auto hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-300/40 bg-white text-2xl font-black text-blue-500 shadow-[0_4px_0_#1d4ed8] lg:flex" aria-hidden="true">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1500px] px-6 pt-14 pb-20">
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

            <div className="grid items-start gap-5 md:grid-cols-2">
              {[0, 1].map((column) => (
                <div key={column} className="flex flex-col gap-5">
                  {faqs.map((faq, index) =>
                    index % 2 === column ? (
                      <div
                        key={faq.q}
                        className="overflow-hidden rounded-xl border border-white/10 bg-[#0a1527]"
                      >
                        <button
                          onClick={() => setOpenFaq(openFaq === index ? null : index)}
                          aria-expanded={openFaq === index}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-bold"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                              openFaq === index ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <div
                          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                            openFaq === index
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <p className="px-4 pb-4 text-xs leading-5 text-slate-400">
                              {faq.a}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null,
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14">
            <div className="relative overflow-hidden px-2 py-14">
              <div className="mx-auto max-w-5xl text-center">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-400">
                  OUR STORY
                </p>

                <h3 className="mt-4 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
                  Built for players who want a cleaner and more modern gaming
                  marketplace.
                </h3>

               <p className="mt-6 text-sm leading-8 text-slate-400 md:text-[15px]">
		 Bloxhop Online Store is an independent digital gaming marketplace offering
		 products and services for Blox Fruits and Grow a Garden 2. Shop digital
		 gaming-related products with online checkout, order tracking, and customer
		 support for players worldwide.
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

            <section className="mt-8 py-8">
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

        <section id="reviews" className="mt-20 border-t border-white/10 pt-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">The Bloxhop Experience</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white">What You Can Expect</h2>
            </div>
            <Link href="/about" className="text-sm font-bold text-blue-300 hover:text-blue-200">
              Learn more about Bloxhop →
            </Link>
          </div>

          <div className="mt-8 grid gap-7 md:grid-cols-3">
            {reviews.map((review, index) => (
              <article key={review.name} className="flex min-h-[185px] items-start gap-5 rounded-2xl border border-white/10 bg-[#0a1527] p-7">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-sm font-black text-blue-300">
                  {review.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-white">{review.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{review.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <div className="mt-16 flex flex-col gap-6 rounded-2xl border border-white/10 bg-[#0a1527] p-8 lg:flex-row lg:items-center lg:justify-between">
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




















