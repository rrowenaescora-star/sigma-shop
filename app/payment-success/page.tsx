import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_30%)]" />

      <section className="relative mx-auto flex max-w-4xl px-6 py-20">
        <div className="w-full rounded-[2rem] border border-emerald-400/20 bg-[#0b1220]/90 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-12">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-4xl">
              ✓
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
              Payment Confirmed
            </p>

            <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              Payment Received Successfully
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-300 md:text-lg">
              Your order has been saved and is now being reviewed by our team.
              Most orders are fulfilled within 5–30 minutes after payment
              confirmation.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-6">
            <h2 className="text-lg font-bold text-yellow-200">
              Important Reminder
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Please do not submit another payment for the same order.
              Duplicate payments may delay fulfillment and require manual refund
              review.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-blue-400/20 bg-blue-500/10 p-6">
              <h3 className="text-lg font-bold text-blue-300">
                Track Your Order
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                You can check your order progress anytime using the Track Order
                page with the same details used during checkout.
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6">
              <h3 className="text-lg font-bold text-cyan-300">
                Check Your Email
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Payment confirmation and invoice details are usually sent to
                your checkout email. Please also check spam or promotions.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-[#111827]/80 p-6">
            <h3 className="text-lg font-bold text-white">
              Need Help?
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              For faster support, include your order email, Roblox username,
              product name, and payment proof when contacting us.
            </p>

            <p className="mt-3 text-sm text-slate-400">
              Support Email: support@bloxhop.site
            </p>

            <p className="text-sm text-slate-400">
              Business Location: Cebu City, Cebu, Philippines
            </p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/track-order"
              className="rounded-2xl bg-blue-500 px-8 py-4 font-bold text-white shadow-[0_0_30px_rgba(59,130,246,0.35)] transition hover:-translate-y-1 hover:bg-blue-400"
            >
              Track Order
            </Link>

            <a
              href="https://discord.gg/evM2G5c9Vr"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-8 py-4 font-bold text-cyan-200 transition hover:-translate-y-1 hover:bg-cyan-400/20"
            >
              Discord Support
            </a>

            <Link
              href="/home"
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-white/10"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}