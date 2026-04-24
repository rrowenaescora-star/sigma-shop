import LegalPageShell from "@/components/legal-page-shell";

export const metadata = {
  title: "Contact Us | Bloxhop",
  description: "Contact Bloxhop support.",
};

export default function ContactPage() {
  return (
    <LegalPageShell title="Contact Us">
      <div className="space-y-5 text-white/90 leading-7">
	<p className="text-sm text-white/70">
          Effective Date: April 24, 2026
        </p>
        <p>
          Need help? Our support team is here to assist you with order tracking,
          payment concerns, delivery issues, refund requests, and general support inquiries.
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">Support Email</h2>
          <p>support@bloxhop.site</p>
          <p className="text-sm text-white/70">
            Please include your Order ID when contacting support for faster assistance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Support Availability</h2>
          <p>Monday to Sunday</p>
          <p>9:00 AM to 11:00 PM (Philippine Time)</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Response Time</h2>
          <p>
            Most support requests are answered within 5 to 30 minutes depending on
            current order volume, payment verification, and fulfillment status.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Business Information</h2>
          <p>Bloxhop Online Store</p>
          <p>Digital Products and Online Services</p>
          <p>Philippines</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Order & Delivery Support</h2>
          <p>
            For delayed delivery, missing orders, incorrect fulfillment,
            or tracking issues, please contact support immediately with your Order ID.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Refund Support</h2>
          <p>
            Refund requests are reviewed manually based on our Refund Policy.
            Include your Order ID, payment details, and reason for the request
            when contacting support.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Payment Concerns</h2>
          <p>
            For payment verification delays, duplicate charges,
            or transaction concerns, our support team will assist after payment review.
          </p>
        </section>
      </div>
    </LegalPageShell>
  );
}
