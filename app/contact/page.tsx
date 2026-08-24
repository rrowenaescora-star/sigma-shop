import LegalPageShell from "@/components/legal-page-shell";

export const metadata = {
  title: "Contact Us | Bloxhop",
  description: "Contact BLOXHOP ONLINE STORE support.",
};

export default function ContactPage() {
  return (
    <LegalPageShell title="Contact Us">
      <div className="space-y-5 leading-7 text-white/90">
        <p className="text-sm text-white/70">Effective Date: April 24, 2026</p>
        <p>
          Need help? Our support team is here to assist with order tracking,
          payment concerns, delivery issues, refund requests, and general
          support inquiries.
        </p>

        <section>
          <h2 className="mb-2 text-xl font-semibold">Support Email</h2>
          <p>
            <a className="text-sky-300 hover:text-white hover:underline" href="mailto:support@bloxhop.site">
              support@bloxhop.site
            </a>
          </p>
          <p className="text-sm text-white/70">
            Please include your Order ID when contacting support for faster assistance.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">Support Availability</h2>
          <p>Monday to Sunday</p>
          <p>9:00 AM to 11:00 PM (Philippine Time)</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">Response Time</h2>
          <p>
            Most support requests are answered within 5 to 30 minutes depending on
            current order volume, payment verification, and fulfillment status.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">Business Information</h2>
          <p>BLOXHOP ONLINE STORE</p>
          <p>DTI Registration No. 8089785</p>
          <p>Digital Products and Online Services</p>
          <p>Sitio Lower Cogon, Labangon, Cebu City, Philippines</p>
          <p>Mobile: 09453392304</p>
          <p>Landline: 0323460146</p>
          <p className="mt-2 text-sm text-white/70">
            Bloxhop is operated by BLOXHOP ONLINE STORE, a DTI-registered business in the Philippines under DTI Registration No. 8089785.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">Order & Delivery Support</h2>
          <p>
            Digital orders are typically fulfilled within approximately 2–3 minutes after successful payment verification under normal conditions. Timing may vary because of payment verification, product or platform availability, technical problems, incorrect customer information, or other circumstances outside Bloxhop’s direct control.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">Refund Support</h2>
          <p>
            Refund requests are reviewed manually based on our Refund Policy.
            Include your Order ID, payment details, and reason for the request
            when contacting support.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">Payment Concerns</h2>
          <p>
            For payment verification delays, duplicate charges, or transaction
            concerns, our support team will assist after payment review.
          </p>
        </section>
      </div>
    </LegalPageShell>
  );
}
