"use client";

import { useState } from "react";

export default function SiteFooter() {
  const [openPolicy, setOpenPolicy] = useState<
    null | "privacy" | "terms" | "refund" | "delivery" | "contact" | "faq"
  >(null);

  return (
    <>
      <footer className="mt-16 border-t border-white/10 bg-[#0b1220] backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-slate-400">
          <div className="grid gap-8 md:grid-cols-3">

            <div>
              <h3 className="mb-2 font-bold text-white">Bloxhop</h3>
              <p className="text-slate-300">
                Digital products and online services store for premium support,
                digital access, and customer assistance.
              </p>

              <p className="mt-2 text-slate-500">
                All products and services are digital only. No physical shipment required.
              </p>

              <p className="mt-3 text-xs text-slate-500">
                Operated in the Philippines
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-white">Support</h3>

              <p>
                <a
                  href="mailto:support@bloxhop.site"
                  className="hover:text-white hover:underline"
                >
                  support@bloxhop.site
                </a>
              </p>

              <p className="mt-2 text-slate-500">
                Estimated fulfillment: 5–30 minutes
              </p>

              <p className="text-slate-500">
                Maximum service window: up to 3 hours
              </p>

              <div className="mt-4">
                <h4 className="mb-2 text-sm font-bold text-white">Social Media</h4>
                <div className="flex flex-wrap gap-3 text-xs">
                  <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300 hover:bg-white/10 hover:text-white">▶ YouTube</a>
                  <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300 hover:bg-white/10 hover:text-white">♫ TikTok</a>
                  <a href="https://discord.gg/evM2G5c9Vr" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300 hover:bg-white/10 hover:text-white">💬 Discord</a>
		  <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300 hover:bg-white/10 hover:text-white">𝕏 Twitter</a>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-white">Legal</h3>

              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setOpenPolicy("privacy")}
                    className="hover:text-white hover:underline"
                  >
                    Privacy Policy
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => setOpenPolicy("terms")}
                    className="hover:text-white hover:underline"
                  >
                    Terms of Service
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => setOpenPolicy("refund")}
                    className="hover:text-white hover:underline"
                  >
                    Refund Policy
                  </button>
                </li>
	<li>
                  <button
                    onClick={() => setOpenPolicy("delivery")}
                    className="hover:text-white hover:underline"
                  >
                    Delivery Policy
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => setOpenPolicy("contact")}
                    className="hover:text-white hover:underline"
                  >
                    Contact
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => setOpenPolicy("faq")}
                    className="hover:text-white hover:underline"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6 space-y-2">
            <p className="text-xs text-slate-400">
              Bloxhop is an independent digital products and online services store.
            </p>

            <p className="text-xs text-slate-500">
              All products and services are fulfilled digitally through online access,
              service coordination, or digital delivery. No physical items are shipped.
            </p>

            <p className="text-xs text-slate-500">
              Refunds are reviewed only for non-delivery, duplicate payment,
              or fulfillment issues based on store policy.
            </p>

            <p className="text-xs text-slate-500">
              Prices are displayed in USD with optional PHP estimate during checkout.
            </p>

            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Bloxhop. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          openPolicy ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpenPolicy(null)}
      />

      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-xl bg-[#0d1324]/90 backdrop-blur-xl border-l border-white/10 p-6 transition-transform duration-300 ease-in-out ${
          openPolicy ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-white">
            {openPolicy === "privacy" && "Privacy Policy"}
            {openPolicy === "terms" && "Terms of Service"}
            {openPolicy === "refund" && "Refund Policy"}
            {openPolicy === "contact" && "Contact"}
	    {openPolicy === "delivery" && "delivery"}
            {openPolicy === "faq" && "FAQ"}
          </h2>

          <button
            onClick={() => setOpenPolicy(null)}
            className="rounded-xl bg-[#0b1220]/10 px-3 py-1 text-sm hover:bg-[#0b1220]/20"
          >
            Close
          </button>
        </div>

        <div className="mt-5 max-h-[80vh] overflow-y-auto text-sm text-slate-300 space-y-4">
          {openPolicy === "privacy" && (
            <>
		 <p className="text-sm text-slate-400">Effective Date: April 24, 2026</p>
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
            contact: <a
  href="mailto:support@bloxhop.site"
  className="text-sky-300 hover:text-white hover:underline"
>
  support@bloxhop.site
</a>
          </p>
        </section>
            </>
          )}

          {openPolicy === "terms" && (
            <>
		 <p className="text-sm text-slate-400">Effective Date: April 24, 2026</p>
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
            <a
  href="mailto:support@bloxhop.site"
  className="text-sky-300 hover:text-white hover:underline"
>
  support@bloxhop.site
</a>
          </p>
        </section>

            </>
          )}

          {openPolicy === "refund" && (
            <>
		 <p className="text-sm text-slate-400">Effective Date: April 24, 2026</p><p>
          All purchases on Bloxhop are for digital products and online services.
        </p>

        <p>
          Because fulfillment begins immediately after payment confirmation,
          refunds are only issued in the following cases:
        </p>

        <ul className="list-disc ml-6 space-y-2">
          <li>Service or product was not fulfilled within the stated delivery window (up to 3 hours)</li>
          <li>Incorrect service fulfillment occurred due to our mistake</li>
          <li>Duplicate payment was successfully confirmed</li>
        </ul>

        <p>Refunds are NOT issued for:</p>

        <ul className="list-disc ml-6 space-y-2">
          <li>Incorrect account details or contact information provided by the customer</li>
          <li>Change of mind after purchase</li>
          <li>Completed and successfully fulfilled digital services</li>
          <li>Violation of our Terms of Service</li>
        </ul>

        <p>
          All refund requests are reviewed manually by our support team.
        </p>

        <p>Refund Request Process:</p>

        <ul className="list-disc ml-6 space-y-2">
          <li>Contact <a
  href="mailto:support@bloxhop.site"
  className="text-sky-300 hover:text-white hover:underline"
>
  support@bloxhop.site
</a> with your Order ID and reason for the refund request</li>
          <li>Our team will review your order status, payment confirmation, and fulfillment details</li>
          <li>If your request qualifies under our refund policy, the refund will be approved and processed</li>
        </ul>

        <p>Refund Processing Time:</p>

        <ul className="list-disc ml-6 space-y-2">
          <li>Review time usually takes 5 to 24 hours depending on order complexity</li>
          <li>Approved refunds are typically returned within 3 to 7 business days depending on your payment provider or bank</li>
          <li>Some banks or card providers may require additional processing time before the amount appears</li>
        </ul>

        <p>
          For assistance, contact <a
  href="mailto:support@bloxhop.site"
  className="text-sky-300 hover:text-white hover:underline"
>
  support@bloxhop.site
</a>
        </p>
            </>
          )}

          {openPolicy === "contact" && (
            <>
		 <p className="text-sm text-slate-400">Effective Date: April 24, 2026</p>
              <p>
          Need help? Our support team is here to assist you with order tracking,
          payment concerns, delivery issues, refund requests, and general support inquiries.
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">Support Email</h2>
          <p> <a
  href="mailto:support@bloxhop.site"
  className="text-sky-300 hover:text-white hover:underline"
>
  support@bloxhop.site
</a></p>
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
            </>
          )}
  {openPolicy === "delivery" && (
            <>
		 <p className="text-sm text-slate-400">Effective Date: April 24, 2026</p>
             <p>
          All products and services sold on Bloxhop are digital only.
        </p>

        <p>
          No physical shipment is required.
        </p>

        <p>
          Delivery is completed through digital access, online coordination,
          account fulfillment, or service fulfillment after payment confirmation.
        </p>

        <p>
          Estimated delivery time is typically between <strong>5 to 30 minutes</strong>.
        </p>

        <p>
          During high-demand periods, payment verification checks, or customer information review,
          fulfillment may take up to <strong>3 hours</strong>.
        </p>

        <p>
          Delivery Process:
        </p>

        <ul className="list-disc ml-6 space-y-2">
          <li>Customer completes checkout and submits accurate account and contact information</li>
          <li>Payment is reviewed and confirmed by our payment provider</li>
          <li>Our team begins digital fulfillment, service coordination, or account delivery</li>
          <li>Customer receives fulfillment confirmation by email, direct coordination, or completed service access</li>
        </ul>

        <p>
          If your order is not completed within the stated delivery period,
          please check your email first, including spam or promotions folders.
        </p>

        <p>
          If delivery is still delayed, contact <a
  href="mailto:support@bloxhop.site"
  className="text-sky-300 hover:text-white hover:underline"
>
  support@bloxhop.site
</a> with your Order ID for immediate assistance.
          Eligible delayed orders may qualify for support review or refund consideration based on our Refund Policy.
        </p>

        <p>
          For delivery assistance, contact: <a
  href="mailto:support@bloxhop.site"
  className="text-sky-300 hover:text-white hover:underline"
>
  support@bloxhop.site
</a>
        </p>

            </>
          )}
          {openPolicy === "faq" && (
            <>
		 <p className="text-sm text-slate-400">Effective Date: April 24, 2026</p>
              <p className="font-semibold text-white">How do I receive my order?</p>
              <p>Orders are fulfilled through digital delivery, online coordination, or service access after payment confirmation.</p>

              <p className="font-semibold text-white">How long does fulfillment take?</p>
              <p>Most orders are completed within 5–30 minutes. In some cases, fulfillment may take up to 3 hours.</p>

              <p className="font-semibold text-white">Where can I find my Order ID?</p>
              <p>Your Order ID is shown after checkout and may also be included in your receipt or tracking email.</p>

              <p className="font-semibold text-white">What if I entered the wrong information?</p>
              <p>Contact <a
  href="mailto:support@bloxhop.site"
  className="text-sky-300 hover:text-white hover:underline"
>
  support@bloxhop.site
</a> as soon as possible. Incorrect customer information may cause fulfillment delays.</p>

              <p className="font-semibold text-white">What if I do not receive my order?</p>
              <p>If your order is not completed within the stated delivery window, please check your email first, including spam or promotions folders. If you still have not received your order, contact<a
  href="mailto:support@bloxhop.site"
  className="text-sky-300 hover:text-white hover:underline"
>
  support@bloxhop.site
</a> with your Order ID for immediate assistance.</p>

              <p className="font-semibold text-white">Do you ship physical products?</p>
              <p>No. All products and services are digital only. No physical shipment is required.</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
