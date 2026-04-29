"use client";

import Link from "next/link";
import { useState } from "react";

const trustItems = [
  {
    title: "Secure Checkout",
    text: "Your payment is processed through a secure checkout flow.",
  },
  {
    title: "Fast Fulfillment",
    text: "Most orders are completed within 5–30 minutes after payment confirmation.",
  },
  {
    title: "Order Tracking",
    text: "Track your order anytime using the details you entered at checkout.",
  },
  {
    title: "Refund Protection",
    text: "Eligible issues like non-delivery or duplicate payment are reviewed under our refund policy.",
  },
  {
    title: "Trusted Support",
    text: "Support is available through email, Discord, and order tracking.",
  },
  {
    title: "Digital Only",
    text: "All products are digital or online-based. No physical shipping is required.",
  },
];

const steps = [
  "Choose your product",
  "Enter correct order details",
  "Complete secure checkout",
  "Receive confirmation",
  "Track your order anytime",
];

const productPreview = [
  "Premium Support Packages",
  "Digital Services",
  "Bundles",
  "Limited Deals",
];

const afterPaymentSteps = [
  {
    title: "1. Order is saved",
    text: "Your order details are recorded safely after checkout.",
  },
  {
    title: "2. Payment is checked",
    text: "Payment confirmation is reviewed before fulfillment begins.",
  },
  {
    title: "3. Fulfillment starts",
    text: "Most orders are completed within 5–30 minutes.",
  },
  {
    title: "4. Track anytime",
    text: "You can track your order status using the Track Order page.",
  },
];

const faqs = [
  {
    question: "How long does delivery take?",
    answer:
      "Most orders are fulfilled within 5–30 minutes after payment confirmation. In rare cases, fulfillment may take up to 3 hours.",
  },
  {
    question: "Do I need to be online?",
    answer:
      "Some products can be fulfilled even if you are offline, depending on the product type and fulfillment method.",
  },
  {
    question: "What if I enter the wrong username?",
    answer:
      "Contact support immediately before fulfillment starts. Incorrect information may delay or affect your order.",
  },
  {
    question: "Can I request a refund?",
    answer:
      "Refunds are reviewed for eligible issues such as non-delivery, duplicate payment, or fulfillment problems.",
  },
  {
    question: "How do I track my order?",
    answer:
      "Use the Track Order page and enter the same details you used during checkout.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_30%)]" />

      <section className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-[#0b1220]/85 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-14 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
              Premium Digital Fulfillment
            </p>

            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
              Bloxhop | Fast & Safe Blox Fruits Digital Store
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
              Shop Blox Fruits digital products with secure checkout, fast
              fulfillment, order tracking, refund protection, and reliable
              customer support.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-emerald-200">
                Secure Checkout
              </span>
              <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-2 text-blue-200">
                5–30 Min Fulfillment
              </span>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-cyan-200">
                Order Tracking
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/home"
                className="rounded-2xl bg-blue-500 px-7 py-3 font-bold text-white shadow-[0_0_30px_rgba(59,130,246,0.35)] transition hover:-translate-y-1 hover:bg-blue-400"
              >
                Browse Products
              </Link>

              <Link
                href="/track-order"
                className="rounded-2xl border border-white/10 bg-white/5 px-7 py-3 font-semibold text-white transition hover:-translate-y-1 hover:bg-white/10"
              >
                Track Order
              </Link>

              <a
                href="https://discord.gg/EEpftCnkgv"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-7 py-3 font-semibold text-cyan-200 transition hover:-translate-y-1 hover:bg-cyan-400/20"
              >
                Discord Support
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-400/10 p-6">
            <p className="text-sm font-bold text-cyan-300">Store Confidence</p>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-[#07111f]/75 p-4">
                <p className="text-xs text-slate-400">Fulfillment Time</p>
                <p className="text-3xl font-black text-emerald-300">5–30 mins</p>
              </div>

              <div className="rounded-2xl bg-[#07111f]/75 p-4">
                <p className="text-xs text-slate-400">Order Type</p>
                <p className="text-2xl font-black text-blue-300">Digital Only</p>
              </div>

              <div className="rounded-2xl bg-[#07111f]/75 p-4">
                <p className="text-xs text-slate-400">Support</p>
                <p className="text-2xl font-black text-cyan-300">Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[#0f1728]/90 p-6 shadow-xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
              Product Preview
            </p>

            <h2 className="mt-3 text-3xl font-black">
              What You Can Find Inside
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Browse Blox Fruits digital products, service packages, and limited
              offers with secure checkout and order tracking.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {productPreview.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4 transition hover:-translate-y-1 hover:bg-blue-500/15"
                >
                  <p className="font-bold text-white">{item}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Available depending on stock and store updates.
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/home"
              className="mt-6 inline-block rounded-2xl bg-blue-500 px-6 py-3 font-bold text-white transition hover:-translate-y-1 hover:bg-blue-400"
            >
              Browse Products
            </Link>
          </div>

          <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-6 shadow-xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
              After Payment
            </p>

            <h2 className="mt-3 text-3xl font-black">
              What Happens After You Pay?
            </h2>

            <div className="mt-6 space-y-4">
              {afterPaymentSteps.map((step) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-white/10 bg-[#07111f]/70 p-4"
                >
                  <p className="font-bold text-emerald-300">{step.title}</p>
                  <p className="mt-1 text-sm text-slate-300">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-3xl font-black">Why Customers Can Shop Safely</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-[#0f1728]/90 p-5 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-[#142033]"
            >
              <p className="text-lg font-bold text-white">✓ {item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-3xl font-black">How It Works</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {steps.map((step, index) => (
            <div
              key={step}
              className="rounded-2xl border border-white/10 bg-[#0f1728]/90 p-5 transition hover:-translate-y-1 hover:border-blue-400/30"
            >
              <p className="text-sm font-bold text-cyan-300">
                Step {index + 1}
              </p>
              <p className="mt-2 font-semibold">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-6">
            <h3 className="text-xl font-black text-emerald-300">Delivery</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Orders are processed after payment confirmation. Most orders are
              completed within 5–30 minutes, with rare delays up to 3 hours.
            </p>
          </div>

          <div className="rounded-[2rem] border border-yellow-400/20 bg-yellow-400/10 p-6">
            <h3 className="text-xl font-black text-yellow-200">Refunds</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Refunds are reviewed for non-delivery, duplicate payment, or
              eligible fulfillment issues based on store policy.
            </p>
          </div>

          <div className="rounded-[2rem] border border-blue-400/20 bg-blue-500/10 p-6">
            <h3 className="text-xl font-black text-blue-300">Support</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Need help? Use Track Order, email support@bloxhop.site, or join
              Discord for faster assistance.
            </p>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-3xl font-black">Quick FAQ</h2>

        <div className="mt-8 space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-white/10 bg-[#0f1728]/90"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="flex w-full items-center justify-between px-5 py-4 text-left font-bold"
              >
                <span>{faq.question}</span>
                <span>{openFaq === index ? "▲" : "▼"}</span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openFaq === index
                    ? "max-h-40 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-5 pb-5 text-sm leading-6 text-slate-300">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[2rem] border border-blue-400/20 bg-blue-500/10 p-8 text-center shadow-[0_20px_70px_rgba(0,0,0,0.25)]">
          <h2 className="text-3xl font-black">Ready to shop safely?</h2>
          <p className="mt-3 text-slate-300">
            Enter the store, choose your product, and complete secure checkout.
          </p>

          <Link
            href="/home"
            className="mt-6 inline-block rounded-2xl bg-blue-500 px-8 py-4 font-bold text-white shadow-[0_0_30px_rgba(59,130,246,0.35)] transition hover:-translate-y-1 hover:bg-blue-400"
          >
            Enter Store
          </Link>

          <p className="mt-5 text-xs leading-6 text-slate-500">
            Bloxhop is an independent digital services platform and is not
            affiliated with, endorsed by, or sponsored by Roblox Corporation or
            Blox Fruits.
          </p>
        </div>
      </section>
    </main>
  );
}