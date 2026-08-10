import LegalPageShell from "@/components/legal-page-shell";

export const metadata = { title: "Refund Policy | Bloxhop", description: "Refund eligibility, review, timing, and dispute information for Bloxhop orders." };

export default function RefundPage() {
  return (
    <LegalPageShell title="Refund Policy">
      <div className="space-y-5 text-white/90 leading-7">
        <p className="text-sm text-white/70">Effective Date: April 24, 2026</p>
        <p>Bloxhop provides digital products and services. Refund requests are reviewed according to the circumstances, applicable law, and relevant payment-provider rules.</p>
        <section><h2 className="mb-2 text-xl font-semibold">1. When a Refund May Be Considered</h2><ul className="ml-6 list-disc space-y-1"><li>A duplicate payment is confirmed.</li><li>Bloxhop cannot fulfill a paid order.</li><li>A Bloxhop fulfillment or technical failure is confirmed.</li><li>Payment succeeded but an order could not be created or fulfilled.</li><li>A refund is required by applicable law or payment-provider rules.</li></ul></section>
        <section><h2 className="mb-2 text-xl font-semibold">2. Situations That May Not Qualify</h2><ul className="ml-6 list-disc space-y-1"><li>The product was already successfully delivered.</li><li>The customer supplied an incorrect username or delivery information.</li><li>The customer did not meet stated product requirements.</li><li>The customer changed their mind after successful digital fulfillment.</li><li>The transaction involved fraudulent or unauthorized activity.</li><li>The customer violated the Terms of Service.</li></ul><p className="mt-2">These conditions do not limit rights that cannot legally be excluded under applicable consumer-protection law.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold">3. How to Request a Refund</h2><p>Email <a className="text-sky-300 hover:underline" href="mailto:support@bloxhop.site">support@bloxhop.site</a> and provide your order number, name, email address, a description of the issue, and supporting evidence where applicable.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold">4. Investigation and Verification</h2><p>Bloxhop may review order records, payment records, delivery records, customer communications, and transaction-verification records. Proportionate verification may be required before a refund is processed.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold">5. Refund Timing</h2><p>Approved refunds will be initiated within 14 calendar days or within any shorter period required by applicable law or the relevant payment channel. The bank or payment provider may require additional time to return funds to the original payment method.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold">6. Chargebacks</h2><p>Customers should contact Bloxhop first regarding legitimate order or delivery problems. During a chargeback investigation, Bloxhop may provide relevant transaction, delivery, verification, and communication records to the payment provider.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold">7. Contact</h2><p><a className="text-sky-300 hover:underline" href="mailto:support@bloxhop.site">support@bloxhop.site</a><br />+63 945 339 2304<br />Cebu City, Cebu, Philippines</p></section>
      </div>
    </LegalPageShell>
  );
}
