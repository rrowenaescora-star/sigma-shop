import { ShieldCheck, Zap, Headphones, RotateCcw, Globe } from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    text: "Safe and protected payment process.",
  },
  {
    icon: Zap,
    title: "Fast Fulfillment",
    text: "Orders are processed quickly after payment confirmation.",
  },
  {
    icon: Headphones,
    title: "Trusted Support",
    text: "Get help with orders, delivery, and checkout.",
  },
  {
    icon: RotateCcw,
    title: "Refund Protection",
    text: "Clear refund process for eligible issues.",
  },
  {
    icon: Globe,
    title: "Worldwide Service",
    text: "Available for local and international customers.",
  },
];

export default function TrustBadges() {
  return (
    <section className="mx-auto mt-8 mb-8 max-w-6xl px-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {badges.map((badge) => {
          const Icon = badge.icon;

          return (
            <div
              key={badge.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center shadow-sm backdrop-blur transition hover:bg-white/10"
            >
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                <Icon className="h-5 w-5 text-white" />
              </div>

              <h3 className="text-sm font-bold text-white">{badge.title}</h3>
              <p className="mt-1 text-xs text-white/70">{badge.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}