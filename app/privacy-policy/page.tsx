import LegalPageShell from "@/components/legal-page-shell";

export const metadata = { title: "Privacy Policy | Bloxhop", description: "How Bloxhop collects, uses, shares, protects, and retains customer information." };

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <div className="space-y-5 text-white/90 leading-7">
        <p className="text-sm text-white/70">Effective Date: April 24, 2026</p>
        <p>This Privacy Policy explains how Bloxhop Online Store handles information used for checkout, payment confirmation, digital fulfillment, support, and compliance.</p>
        <section><h2 className="mb-2 text-xl font-semibold">1. Information We May Collect</h2><p>Depending on how you use Bloxhop, we may collect your name, email address, phone number, billing or transaction information, gaming username or account identifier supplied for fulfillment, order details, payment references, customer-support communications, technical information such as device, browser, IP address, cookies, and logs where collected, and information reasonably required for fraud prevention or transaction verification.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold">2. How We Use Information</h2><p>We may use information for order processing, digital fulfillment, customer support, payment confirmation, fraud prevention, transaction verification, refund processing, dispute resolution, business records, and legal or regulatory compliance.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold">3. Payments</h2><p>Payments may be processed through third-party payment providers such as Xendit or other providers made available through checkout. Where payment information is collected directly by a payment provider, that provider may process it under its own privacy policy, security controls, and applicable terms. Bloxhop receives payment status and transaction information needed to confirm and support an order.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold">4. KYC and Transaction Verification</h2><p>Bloxhop may collect additional identity or transaction information where reasonably necessary for fraud prevention, legal compliance, payment-provider requirements, suspicious activity review, or dispute handling. KYC information will only be requested when appropriate, using a risk-based and proportionate approach, and will be handled according to applicable privacy requirements.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold">5. Sharing Information</h2><p>Relevant information may be shared when necessary with payment processors; banks and financial institutions; fraud and security providers; hosting and service providers; professional advisers; government or regulatory authorities where legally required; and Xendit or relevant affiliates where necessary for payment processing, compliance, fraud prevention, transaction review, KYC or customer due diligence, or related payment services. Bloxhop does not sell customer personal information.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold">6. Data Security</h2><p>Bloxhop uses reasonable technical and organizational measures intended to protect customer data. No online system can be guaranteed to be completely secure, so customers should also protect their devices and communications.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold">7. Data Retention</h2><p>Information may be retained as reasonably necessary for orders, customer support, accounting, tax, fraud prevention, dispute resolution, legal or regulatory requirements, and payment-provider requirements. Retention periods depend on the nature of the information and the applicable obligation.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold">8. Customer Requests</h2><p>Customers may request access, correction, or deletion where available under applicable law. Some information may need to be retained for legal, accounting, security, fraud-prevention, or dispute purposes.</p></section>
        <section><h2 className="mb-2 text-xl font-semibold">9. Contact</h2><p>For privacy questions or requests, email <a className="text-sky-300 hover:underline" href="mailto:support@bloxhop.site">support@bloxhop.site</a>.<br />Bloxhop Online Store<br />Cebu City, Cebu, Philippines<br />+63 945 339 2304</p></section>
      </div>
    </LegalPageShell>
  );
}
