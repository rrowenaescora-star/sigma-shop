import LegalPageShell from "@/components/legal-page-shell";

export const metadata = {
  title: "Terms of Service | Bloxhop",
  description: "Terms of Service for Bloxhop.",
};

export default function TermsPage() {
  return (
     <LegalPageShell title="Terms of Services">
      

        <div className="space-y-4 text-white/90 leading-7">
          <p>
            Welcome to Bloxhop. By using our website and purchasing our
            products, you agree to the following terms.
          </p>

          <section>
            <h2 className="text-xl font-semibold mb-2">1. Products</h2>
            <p>
              All products sold on Bloxhop are digital in-game items and
              services. No physical goods are shipped.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Delivery</h2>
            <p>
              Orders are typically delivered within 5 to 30 minutes. In rare
              cases, delivery may take up to 3 hours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. User Responsibility</h2>
            <p>
              Customers must provide accurate Roblox username and contact
              information. We are not responsible for incorrect information
              submitted by the customer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Payments</h2>
            <p>
              All payments must be completed through our supported payment
              methods. Unauthorized chargebacks may result in order refusal or
              account restriction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Account Safety</h2>
            <p>
              We do not ask for your Roblox password. Never share your account
              credentials with anyone.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Changes</h2>
            <p>
              We reserve the right to update these terms at any time without
              prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Contact</h2>
            <p>Email: bloxhop@bloxhop.site</p>
          </section>
        </div>
      </LegalPageShell>
  );
}