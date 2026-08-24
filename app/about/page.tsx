export const metadata = { title: "About Bloxhop", description: "About Bloxhop Online Store, an independent digital gaming marketplace based in Cebu City, Philippines." };

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#06101d] px-6 py-12 text-white">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-400">ABOUT BLOXHOP</p>
        <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">BLOXHOP ONLINE STORE is an independent digital gaming marketplace based in Cebu City, Philippines.</h1>
        <p className="mt-6 leading-8 text-slate-400">Bloxhop is operated by BLOXHOP ONLINE STORE, a DTI-registered business in the Philippines under DTI Registration No. 8089785. Bloxhop provides digital gaming-related products and services through an online store, with product information, online checkout, payment confirmation, digital fulfillment, order tracking, and customer support. Digital orders are typically fulfilled within approximately 2–3 minutes after successful payment verification under normal conditions.</p>

        <h2 className="mt-10 text-2xl font-black">How Bloxhop Works</h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-2">
          {["Browse available products.", "Select a product.", "Review its description, price, delivery method, and requirements.", "Provide the required order information and complete checkout.", "Processing begins after successful payment confirmation.", "The order is fulfilled digitally using the stated delivery method.", "Track the order online or contact support if assistance is needed."].map((step, index) => <li key={step} className="rounded-2xl border border-white/10 bg-[#0a1527] p-5 text-sm leading-7 text-slate-300"><span className="mr-2 font-black text-blue-400">{index + 1}.</span>{step}</li>)}
        </ol>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-[#0a1527] p-6"><h2 className="text-xl font-black">Customer Support</h2><p className="mt-3 leading-7 text-slate-400"><a className="text-sky-300 hover:underline" href="mailto:support@bloxhop.site">support@bloxhop.site</a><br />BLOXHOP ONLINE STORE<br />DTI Registration No. 8089785<br />Sitio Lower Cogon, Labangon<br />Cebu City, Philippines<br />Mobile: 09453392304<br />Landline: 0323460146</p></section>
          <section className="rounded-2xl border border-white/10 bg-[#0a1527] p-6"><h2 className="text-xl font-black">Independence Disclaimer</h2><p className="mt-3 leading-7 text-slate-400">Bloxhop is an independent third-party digital gaming marketplace. We are not affiliated with, endorsed by, sponsored by, or officially connected with Roblox Corporation, Blox Fruits, Gamer Robot Inc., or other game developers or publishers unless expressly stated. All third-party trademarks, game names, logos, and related intellectual property belong to their respective owners.</p></section>
        </div>
      </section>
    </main>
  );
}
