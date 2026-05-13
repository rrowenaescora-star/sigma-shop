export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#06101d] px-6 py-12 text-white">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-400">
          ABOUT BLOXHOP
        </p>

        <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
          A cleaner digital marketplace for gaming items and services.
        </h1>

        <p className="mt-6 text-slate-400 leading-8">
          Bloxhop was built to give players a more organized way to browse digital
          gaming products, understand the order process, and get support when needed.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Fast Support",
              text: "Customers can contact support for order questions, delivery updates, and help through our official Discord.",
            },
            {
              title: "Organized Delivery",
              text: "Orders are reviewed after checkout and processed based on product availability, payment confirmation, and delivery requirements.",
            },
            {
              title: "Growing Marketplace",
              text: "Bloxhop is preparing for more products, more game categories, and future marketplace features.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-[#0a1527] p-5"
            >
              <h2 className="text-lg font-black">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}