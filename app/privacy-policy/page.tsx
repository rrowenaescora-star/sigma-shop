import LegalPageShell from "@/components/legal-page-shell";

export const metadata = {
  title: "Privacy Policy | Bloxhop",
  description: "Privacy Policy for Bloxhop.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <div className="space-y-5 text-white/90 leading-7">
	<p className="text-sm text-white/70">
          Effective Date: April 24, 2026
        </p>
        <p>
          Bloxhop respects your privacy and is committed to protecting customer information.
          This Privacy Policy explains what information we collect, how it is used,
          and how customer data is protected.
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">1. Information Collected</h2>
          <p>We may collect the following information:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account or service fulfillment information</li>
            <li>Email address, contact details, and support communication</li>
            <li>Order details and transaction references</li>
            <li>Payment status and payment provider confirmation details</li>
            <li>Customer support requests and delivery coordination messages</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. How We Use Information</h2>
          <p>Your information is used only to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Process and confirm orders</li>
            <li>Complete digital fulfillment and service coordination</li>
            <li>Provide customer support and order tracking assistance</li>
            <li>Prevent fraud, abuse, chargebacks, and suspicious transactions</li>
            <li>Comply with legal obligations and payment provider requirements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Data Protection</h2>
          <p>
            We do not sell personal data to unrelated third parties.
            Information may only be shared when necessary for payment processing,
            fraud prevention, legal compliance, customer support,
            or successful order fulfillment.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Payment Security</h2>
          <p>
            Payments are securely processed by trusted third-party payment providers.
            Bloxhop does not store full payment card details, banking credentials,
            or sensitive financial information directly on its website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Data Retention</h2>
          <p>
            Customer information may be retained for order history,
            fraud prevention, refund review, dispute resolution,
            and compliance with legal or payment provider requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Customer Responsibility</h2>
          <p>
            Customers are responsible for providing accurate account details,
            contact information, and order instructions.
            Incorrect information may cause delays in fulfillment or support resolution.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Policy Updates</h2>
          <p>
            Bloxhop may update this Privacy Policy when necessary to reflect
            business operations, legal requirements, or payment compliance changes.
            Continued use of the website means acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Contact</h2>
          <p>
            For privacy concerns, data requests, or support regarding customer information,
            contact: support@bloxhop.site
          </p>
        </section>
      </div>
    </LegalPageShell>
  );
}
