import LegalPageShell from "@/components/legal-page-shell";

export const metadata = {
  title: "Privacy Policy | Bloxhop",
  description: "Privacy Policy for Bloxhop.",
};

export default function PrivacyPage() {
  return (
      <LegalPageShell title="Privacy Policy">
   

        <div className="space-y-4 text-white/90 leading-7">
          <p>Bloxhop respects your privacy.</p>

          <section>
            <h2 className="text-xl font-semibold mb-2">1. Information Collected</h2>
            <p>We may collect the following information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Roblox username</li>
              <li>Email or contact information</li>
              <li>Order details</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. How We Use Information</h2>
            <p>Your information is used only to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Process orders</li>
              <li>Deliver items</li>
              <li>Provide support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Data Protection</h2>
            <p>
              We do not sell or share your personal data with unrelated third
              parties except when required for payment processing, fraud
              prevention, legal compliance, or order fulfillment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Payment Security</h2>
            <p>
              Payments are handled securely through third-party payment
              providers. We do not store full payment card details on our
              website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Contact</h2>
            <p>For privacy concerns, contact: bloxhop@bloxhop.site</p>
          </section>
        </div>
     </LegalPageShell>

  );
}