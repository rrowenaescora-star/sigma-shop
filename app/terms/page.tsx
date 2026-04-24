import LegalPageShell from "@/components/legal-page-shell";

export const metadata = {
  title: "Terms of Service | Bloxhop",
  description: "Terms of Service for Bloxhop.",
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service">
      <div className="space-y-5 text-white/90 leading-7">
	<p className="text-sm text-white/70">
          Effective Date: April 24, 2026
        </p>
        <p>
          By using Bloxhop, you agree to the following Terms of Service.
          Please read them carefully before placing an order.
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">1. Digital Products and Services</h2>
          <p>
            All products and services sold on Bloxhop are digital only.
            No physical shipment is required.
          </p>
          <p>
            Fulfillment is completed through digital delivery, online coordination,
            account fulfillment, or service access after payment confirmation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Customer Responsibility</h2>
          <p>
            Customers are responsible for providing accurate account details,
            contact information, and order instructions during checkout.
          </p>
          <p>
            Bloxhop is not responsible for delays, failed fulfillment, or losses caused by
            incorrect information submitted by the customer.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Delivery Time</h2>
          <p>
            Standard fulfillment time is typically 5 to 30 minutes.
            During high-demand periods, payment verification checks,
            or support delays, fulfillment may take up to 3 hours.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Refund Policy</h2>
          <p>
            Refunds are only reviewed for non-delivery, duplicate payment,
            or fulfillment issues caused by our side.
          </p>
          <p>
            Completed and successfully fulfilled digital services are non-refundable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Payment Processing</h2>
          <p>
            Payments are securely processed through trusted third-party payment providers.
            Bloxhop does not store full payment card details.
          </p>
          <p>
            Orders may be placed on hold for fraud prevention,
            payment verification, or security review.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Order Refusal and Cancellation</h2>
          <p>
            We reserve the right to refuse, delay, suspend, or cancel orders involving
            suspicious activity, fraud risk, payment verification issues,
            abuse, or violations of these Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Limitation of Liability</h2>
          <p>
            Bloxhop is not liable for delays caused by third-party payment providers,
            platform outages, customer input errors, or circumstances outside our control.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Compliance and Applicable Law</h2>
          <p>
            These Terms are governed by applicable laws and regulations of the Philippines.
            By using this website, customers agree to comply with all applicable laws,
            payment regulations, and anti-fraud requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Changes to Terms</h2>
          <p>
            Bloxhop may update these Terms of Service at any time without prior notice.
            Continued use of the website after updates means acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">10. Contact</h2>
          <p>
            For questions regarding these Terms of Service, contact:
            support@bloxhop.site
          </p>
        </section>
      </div>
    </LegalPageShell>
  );
}
