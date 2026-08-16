import LegalPageShell from "@/components/legal-page-shell";

export const metadata = {
  title: "Delivery Policy | Bloxhop",
  description: "How Bloxhop delivers digital orders and services.",
};

export default function DeliveryPage() {
  return (
    <LegalPageShell title="Delivery Policy">
      <div className="space-y-5 text-slate-200 leading-7">
        <p className="text-sm text-sky-200/80">Effective Date: April 24, 2026</p>
        <section><h2 className="mb-2 text-xl font-semibold text-sky-200">1. Digital Fulfillment</h2><p>Orders are fulfilled digitally rather than through physical shipping unless a product page specifically states otherwise. The delivery method may include in-game coordination, digital access, online service fulfillment, or another method described on the product page.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold text-sky-200">2. Processing</h2><p>Orders begin processing after successful payment confirmation. Some transactions may require a reasonable security or transaction-verification review before fulfillment.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold text-sky-200">3. Estimated Delivery</h2><p>Most orders are processed shortly after payment confirmation. Actual delivery time may vary depending on product availability, order volume, transaction verification, customer availability, game or platform limitations, and technical circumstances.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold text-sky-200">4. Customer Requirements</h2><p>Customers may need to provide a correct gaming username, account identifier, contact information, or other requirements stated on the product page. Bloxhop does not normally require a customer&apos;s password. Customers should never send passwords, private keys, authentication codes, or unrelated credentials.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold text-sky-200">5. Delivery Problems</h2><p>Bloxhop will make reasonable efforts to resolve delayed, failed, or incorrect delivery. Customers should check their contact channels and order tracking, then contact support with the order number and relevant details. If Bloxhop cannot fulfill an order, it may be eligible for a refund under the <a className="text-sky-300 hover:underline" href="/refund-policy">Refund Policy</a>.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold text-sky-200">6. Contact</h2><p><a className="text-sky-300 hover:underline" href="mailto:support@bloxhop.site">support@bloxhop.site</a><br />+63 945 339 2304<br />Cebu City, Cebu, Philippines</p></section>
      </div>
    </LegalPageShell>
  );
}
