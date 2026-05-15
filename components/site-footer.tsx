"use client";

import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

export default function SiteFooter() {
  const [openPolicy, setOpenPolicy] = useState<
    null | "privacy" | "terms" | "refund" | "delivery" | "contact" | "faq"
  >(null);

  return (
    <>
      <footer className="bg-[#111121] text-slate-400">
        <div className="mx-auto max-w-[1500px] px-6 py-14">
          <div className="grid gap-12 lg:grid-cols-[1.6fr_0.7fr_0.7fr_0.7fr]">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Bloxhop"
                  className="h-14 w-14 rounded-2xl object-cover"
                />

                <span className="text-3xl font-black tracking-tight text-white">
                  bloxhop
                </span>
              </div>

              <p className="mt-6 max-w-md text-sm leading-7 text-slate-400">
                Bloxhop Online Store operates independently and is not affiliated,
                associated, authorized, endorsed, or sponsored by Roblox Corporation
                or any game developers. All trademarks, game names, logos, and
                related assets belong to their respective owners.
              </p>

              <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
                © {new Date().getFullYear()} Bloxhop Online Store. Independent
                digital gaming marketplace.
              </p>

            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm font-medium text-blue-400">

  <a
    href="mailto:support@bloxhop.site"
    className="flex items-center gap-2 transition hover:text-blue-300"
  >
    <Mail className="h-4 w-4" />
    <span>support@bloxhop.site</span>
  </a>

  <div className="flex items-center gap-2">
    <Phone className="h-4 w-4" />
    <span>+63 9453392304</span>
  </div>

  <div className="flex items-center gap-2">
    <MapPin className="h-4 w-4" />
    <span>Cebu City, Cebu, Philippines</span>
  </div>



</div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="https://x.com/bloxhop_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-16 items-center justify-center rounded-xl bg-white/5 text-lg text-white transition hover:bg-white/10"
                >
                  𝕏
                </a>

                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-16 items-center justify-center rounded-xl bg-white/5 text-lg text-white transition hover:bg-white/10"
                >
                  ▶
                </a>

                <a
                  href="https://www.tiktok.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-16 items-center justify-center rounded-xl bg-white/5 text-lg text-white transition hover:bg-white/10"
                >
                  ♪
                </a>

                <a
                  href="https://discord.gg/evM2G5c9Vr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-16 items-center justify-center rounded-xl bg-white/5 text-lg text-white transition hover:bg-white/10"
                >
                  💬
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-black text-white">Social Media</h3>

              <ul className="mt-5 space-y-4 text-sm">
                <li>
                  <a
                    href="https://x.com/bloxhop_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-white"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-white"
                  >
                    YouTube
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.tiktok.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-white"
                  >
                    TikTok
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.gg/evM2G5c9Vr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-white"
                  >
                    Discord
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-black text-white">Support</h3>

              <ul className="mt-5 space-y-4 text-sm">
                <li>
                  <button
                    onClick={() => setOpenPolicy("contact")}
                    className="transition hover:text-white"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setOpenPolicy("faq")}
                    className="transition hover:text-white"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <a href="/track-order" className="transition hover:text-white">
                    Track Order
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@bloxhop.site"
                    className="transition hover:text-white"
                  >
                    Email Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-black text-white">Legal</h3>

              <ul className="mt-5 space-y-4 text-sm">
                <li>
                  <button
                    onClick={() => setOpenPolicy("terms")}
                    className="transition hover:text-white"
                  >
                    Terms Of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setOpenPolicy("privacy")}
                    className="transition hover:text-white"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setOpenPolicy("refund")}
                    className="transition hover:text-white"
                  >
                    Refund Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setOpenPolicy("delivery")}
                    className="transition hover:text-white"
                  >
                    Delivery Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <button className="flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300">
                🇺🇸 English
                <span className="text-slate-500">⌄</span>
              </button>

              <div className="flex flex-wrap gap-2">
                {["QR Ph Supported", "GCash", "Maya"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-900"
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
            </div>
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
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-2xl border-l border-white/10 bg-[#0d1324]/95 p-6 backdrop-blur-xl transition-transform duration-300 ease-in-out ${
          openPolicy ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-white">
            {openPolicy === "privacy" && "Privacy Policy"}
            {openPolicy === "terms" && "Terms of Service"}
            {openPolicy === "refund" && "Refund Policy"}
            {openPolicy === "delivery" && "Delivery Policy"}
            {openPolicy === "contact" && "Contact"}
            {openPolicy === "faq" && "FAQ"}
          </h2>

          <button
            onClick={() => setOpenPolicy(null)}
            className="rounded-xl bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/15"
          >
            Close
          </button>
        </div>

        <div className="mt-5 max-h-[80vh] overflow-y-auto space-y-5 text-sm leading-7 text-slate-300">
          {openPolicy === "privacy" && (
            <>
              <p className="text-slate-400">Effective Date: April 24, 2026</p>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">1. Overview</h3>
                <p>
                  Bloxhop Online Store respects customer privacy and is committed to
                  protecting information provided during browsing, checkout, order
                  tracking, customer support, and digital fulfillment. This Privacy
                  Policy explains what information may be collected, how it is used,
                  how it may be shared, and how customers can contact us about privacy
                  concerns.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">2. Information We May Collect</h3>
                <p>Depending on how you use the website, we may collect:</p>
                <ul className="ml-6 mt-2 list-disc space-y-1">
                  <li>Name, username, Roblox username, or game account details needed for fulfillment</li>
                  <li>Email address, phone number, Discord username, or other contact details</li>
                  <li>Order details, product selections, quantities, notes, and delivery instructions</li>
                  <li>Payment status, transaction reference, payment provider confirmation, and fraud review signals</li>
                  <li>Support conversations, refund requests, tracking requests, and delivery coordination messages</li>
                  <li>Device, browser, IP address, approximate location, cookies, logs, and analytics data</li>
                  <li>Website usage data such as pages visited, cart activity, checkout steps, and error logs</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">3. How We Use Information</h3>
                <p>Your information may be used to:</p>
                <ul className="ml-6 mt-2 list-disc space-y-1">
                  <li>Process, confirm, review, and fulfill digital orders</li>
                  <li>Send order confirmations, receipts, updates, and tracking information</li>
                  <li>Coordinate digital delivery and customer service assistance</li>
                  <li>Verify payment status and reduce fraud, abuse, chargebacks, and suspicious activity</li>
                  <li>Respond to support, refund, delivery, and account-related concerns</li>
                  <li>Improve website performance, checkout experience, product display, and customer support</li>
                  <li>Comply with legal, tax, accounting, payment provider, and business record requirements</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">4. Payment Security</h3>
                <p>
                  Payments are processed through third-party payment providers. Bloxhop
                  does not store full card numbers, CVV codes, full banking passwords,
                  or sensitive payment credentials directly on the website. Payment
                  providers may process customer payment information according to their
                  own privacy and security policies.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">5. Cookies and Analytics</h3>
                <p>
                  The website may use cookies, local storage, analytics tools, and similar
                  technologies to remember cart data, improve website performance, detect
                  errors, understand traffic, and protect the checkout process. Customers
                  may disable cookies in their browser, but some website features may not
                  work properly.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">6. Sharing of Information</h3>
                <p>
                  Bloxhop does not sell customer personal information. Information may be
                  shared only when needed with payment processors, hosting providers,
                  email or support tools, fraud prevention services, delivery/support team
                  members, legal authorities, or business service providers who help operate
                  the store.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">7. Data Retention</h3>
                <p>
                  Customer information may be retained for order history, customer support,
                  fraud prevention, refund review, dispute handling, accounting, tax records,
                  legal compliance, and payment provider requirements. We keep information
                  only as long as reasonably necessary for these purposes.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">8. Customer Rights and Requests</h3>
                <p>
                  Customers may contact Bloxhop to request support regarding their personal
                  information, including correction, access, or deletion requests where
                  allowed by applicable law. Some information may need to be retained for
                  legal, fraud prevention, dispute, or accounting reasons.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">9. Customer Responsibility</h3>
                <p>
                  Customers are responsible for providing accurate contact details, account
                  information, usernames, and delivery instructions. Incorrect or incomplete
                  information may delay or prevent fulfillment.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">10. Contact for Privacy Concerns</h3>
                <div className="mt-5 flex flex-wrap items-center gap-6 border-t border-white/10 pt-5 text-sky">

  <a
    href="mailto:support@bloxhop.site"
    className="flex items-center gap-2 text-sky-300 transition hover:text-sky"
  >
    <Mail className="h-4 w-4 text-blue-400" />
    <span>support@bloxhop.site</span>
  </a>

  <div className="flex items-center gap-2">
    <Phone className="h-4 w-4 text-blue-400" />
    <span>+63 453392304</span>
  </div>

  <div className="flex items-center gap-2">
    <MapPin className="h-4 w-4 text-blue-400" />
    <span>Cebu City, Cebu, Philippines</span>
  </div>

</div>
              </section>
            </>
          )}

          {openPolicy === "terms" && (
            <>
              <p className="text-slate-400">Effective Date: April 24, 2026</p>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">1. Acceptance of Terms</h3>
                <p>
                  By accessing, browsing, using, or placing an order through Bloxhop
                  Online Store, customers agree to these Terms of Service and all related
                  policies, including the Privacy Policy, Refund Policy, and Delivery Policy.
                  If you do not agree, please do not use the website or place an order.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">2. Digital Products and Services</h3>
                <p>
                  Bloxhop provides digital gaming-related products and online services.
                  No physical products are shipped. Fulfillment may be completed through
                  online delivery, service coordination, account-related fulfillment, or
                  customer support assistance after payment confirmation.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">3. Independent Marketplace Notice</h3>
                <p>
                  Bloxhop is an independent digital gaming marketplace and is not affiliated,
                  associated, authorized, endorsed, or sponsored by Roblox Corporation or
                  any game developers. All trademarks, game names, logos, images, and related
                  assets belong to their respective owners.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">4. Customer Information Responsibility</h3>
                <p>
                  Customers must provide accurate usernames, account details, email addresses,
                  contact details, and order instructions. Bloxhop is not responsible for
                  delays, failed delivery, incorrect fulfillment, or losses caused by incorrect,
                  incomplete, or outdated information provided by the customer.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">5. Orders and Payment</h3>
                <p>
                  Orders are processed only after payment confirmation and internal review.
                  Bloxhop may hold, delay, cancel, or request additional verification for
                  orders involving suspicious activity, payment review, stock issues, pricing
                  errors, duplicate transactions, customer information problems, or fraud risk.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">6. Pricing and Product Information</h3>
                <p>
                  Prices, product details, availability, categories, images, descriptions,
                  and promotions may change without prior notice. Bloxhop may correct errors,
                  cancel incorrect listings, or refuse orders affected by technical, pricing,
                  inventory, or display mistakes.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">7. Delivery and Fulfillment</h3>
                <p>
                  Standard fulfillment may vary depending on order volume, product type,
                  payment confirmation, customer response, and support availability. Customers
                  should monitor order updates and contact support if delivery appears delayed.
                  Digital fulfillment is considered complete once the ordered product or service
                  is successfully delivered, coordinated, or made available according to the order.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">8. Refunds and Cancellations</h3>
                <p>
                  Refunds are reviewed under the Refund Policy. Completed and successfully
                  fulfilled digital products or services are generally non-refundable. Refunds
                  may be reviewed for non-delivery, duplicate payment, incorrect fulfillment
                  caused by our side, or eligible service issues.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">9. Prohibited Activity</h3>
                <p>Customers may not use Bloxhop for:</p>
                <ul className="ml-6 mt-2 list-disc space-y-1">
                  <li>Fraud, chargeback abuse, payment manipulation, or suspicious activity</li>
                  <li>False customer information or impersonation</li>
                  <li>Harassment, threats, abuse, or spam toward support staff</li>
                  <li>Attempts to exploit website bugs, checkout errors, coupons, or pricing mistakes</li>
                  <li>Violation of applicable laws, payment provider rules, or platform rules</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">10. Account and Platform Risks</h3>
                <p>
                  Customers are responsible for understanding the rules of the platforms or
                  games they use. Bloxhop is not responsible for actions taken by third-party
                  platforms, game operators, payment providers, banks, or account systems.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">11. Limitation of Liability</h3>
                <p>
                  To the maximum extent allowed by law, Bloxhop is not liable for indirect,
                  incidental, special, consequential, or unexpected losses, including delays
                  caused by third-party providers, payment reviews, platform outages, customer
                  mistakes, internet issues, stock changes, or circumstances outside our control.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">12. Policy Updates</h3>
                <p>
                  Bloxhop may update these Terms of Service and related policies when needed.
                  Continued use of the website after updates means acceptance of the revised terms.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">13. Contact Information</h3>
                <div className="mt-5 flex flex-wrap items-center gap-6 border-t border-white/10 pt-5 text-sky-400">

  <a
    href="mailto:support@bloxhop.site"
    className="flex items-center gap-2 text-sky-300 transition hover:text-blue-300"
  >
    <Mail className="h-4 w-4 text-blue-400" />
    <span>support@bloxhop.site</span>
  </a>

  <div className="flex items-center gap-2">
    <Phone className="h-4 w-4 text-blue-400" />
    <span>+63 9453392304</span>
  </div>

  <div className="flex items-center gap-2">
    <MapPin className="h-4 w-4 text-blue-400" />
    <span>Cebu City, Cebu, Philippines</span>
  </div>

</div>
             
 </section>
            </>
          )}

          {openPolicy === "refund" && (
            <>
              <p className="text-slate-400">Effective Date: April 24, 2026</p>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">1. Digital Product Refund Notice</h3>
                <p>
                  All products and services sold on Bloxhop are digital. Because fulfillment
                  may begin after payment confirmation, refunds are reviewed carefully and are
                  not automatically guaranteed.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">2. Eligible Refund Cases</h3>
                <p>Refunds may be reviewed for:</p>
                <ul className="ml-6 mt-2 list-disc space-y-1">
                  <li>Confirmed non-delivery within the stated support window</li>
                  <li>Duplicate payment successfully confirmed</li>
                  <li>Incorrect fulfillment caused by our side</li>
                  <li>Order cancellation before fulfillment begins, if approved by support</li>
                  <li>Payment or service issues confirmed by Bloxhop after review</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">3. Non-Refundable Cases</h3>
                <p>Refunds are generally not issued for:</p>
                <ul className="ml-6 mt-2 list-disc space-y-1">
                  <li>Completed and successfully fulfilled digital products or services</li>
                  <li>Wrong username, wrong contact details, or incorrect order information from the customer</li>
                  <li>Change of mind after purchase</li>
                  <li>Customer failure to respond to support or delivery coordination</li>
                  <li>Violations of Terms of Service</li>
                  <li>Third-party platform restrictions, outages, or account issues outside our control</li>
                  <li>Chargeback abuse, fraud risk, or suspicious activity</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">4. Refund Request Process</h3>
                <p>
                  To request a refund, contact support with your Order ID, payment reference,
                  contact information, and clear reason for the request. Bloxhop will review
                  order status, payment confirmation, support messages, and fulfillment records.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">5. Processing Time</h3>
                <p>
                  Review time may vary depending on the order details. Approved refunds are
                  returned through the original payment method when possible. Banks and payment
                  providers may require additional processing time before funds appear.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">6. Contact</h3>
                 <div className="mt-5 flex flex-wrap items-center gap-6 border-t border-white/10 pt-5 text-sky-400">

  <a
    href="mailto:support@bloxhop.site"
    className="flex items-center gap-2 text-sky-300 transition hover:text-blue-300"
  >
    <Mail className="h-4 w-4 text-blue-400" />
    <span>support@bloxhop.site</span>
  </a>

  <div className="flex items-center gap-2">
    <Phone className="h-4 w-4 text-blue-400" />
    <span>+63 9453392304</span>
  </div>

  <div className="flex items-center gap-2">
    <MapPin className="h-4 w-4 text-blue-400" />
    <span>Cebu City, Cebu, Philippines</span>
  </div>

</div>

              </section>
            </>
          )}

          {openPolicy === "delivery" && (
            <>
              <p className="text-slate-400">Effective Date: April 24, 2026</p>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">1. Digital Delivery Only</h3>
                <p>
                  Bloxhop sells digital products and online services only. No physical items
                  are shipped. Delivery may be completed through online fulfillment, in-game
                  coordination, service access, or customer support assistance.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">2. Delivery Requirements</h3>
                <p>
                  Customers must provide accurate account details, Roblox username or game
                  username, email address, and contact details. Incorrect information may cause
                  delays, failed delivery, or additional verification.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">3. Delivery Timing</h3>
                <p>
                  Delivery timing may depend on product type, payment confirmation, order volume,
                  customer response, stock status, and support availability. Some orders may require
                  manual review before fulfillment begins.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">4. Delays</h3>
                <p>
                  Delays may happen due to payment review, incorrect customer details, high demand,
                  stock changes, platform issues, customer unavailability, security checks, or events
                  outside Bloxhop control. Customers should contact support with their Order ID if
                  help is needed.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">5. Delivery Confirmation</h3>
                <p>
                  An order may be considered fulfilled when the digital product or service is delivered,
                  coordinated, granted, accessed, or otherwise completed according to the order details
                  and available fulfillment method.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">6. Contact for Delivery Help</h3>
                 <div className="mt-5 flex flex-wrap items-center gap-6 border-t border-white/10 pt-5 text-sky-400">

  <a
    href="mailto:support@bloxhop.site"
    className="flex items-center gap-2 text-sky-300 transition hover:text-blue-300"
  >
    <Mail className="h-4 w-4 text-blue-400" />
    <span>support@bloxhop.site</span>
  </a>

  <div className="flex items-center gap-2">
    <Phone className="h-4 w-4 text-blue-400" />
    <span>+63 9453392304</span>
  </div>

  <div className="flex items-center gap-2">
    <MapPin className="h-4 w-4 text-blue-400" />
    <span>Cebu City, Cebu, Philippines</span>
  </div>

</div>

              </section>
            </>
          )}

          {openPolicy === "contact" && (
            <>
              <p className="text-slate-400">Effective Date: April 24, 2026</p>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">Contack Us</h3>


           
                   <a
    href="mailto:support@bloxhop.site"
    className="flex items-center gap-2 text-blue-400 transition hover:text-sky-300"
  >
    <Mail className="h-4 w-4 text-blue-400" />
    <span>support@bloxhop.site</span>
  </a>

  <div className="flex items-center gap-2 text-blue-400">
    <Phone className="h-4 w-4 text-blue-400" />
    <span>+63 9453392304</span>
  </div>

  <div className="flex items-center gap-2 text-blue-400">
    <MapPin className="h-4 w-4 text-blue-400" />
    <span >Cebu City, Cebu, Philippines</span>
  </div>


               

                <p className="text-blue-400 ">
                  Discord: {" "}
                  <a
                    href="https://discord.gg/evM2G5c9Vr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-sky-300 "
                  >
                    Join Discord
                  </a>
                </p>
              
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">Support Reminder</h3>
                <p>
                  Please include your Order ID, payment reference, username, and clear concern
                  when contacting support so we can assist faster.
                </p>
              </section>
            </>
          )}

          {openPolicy === "faq" && (
            <>
              <section>
                <h3 className="mb-2 text-lg font-bold text-white">How do I receive my order?</h3>
                <p>
                  Orders are fulfilled digitally through online delivery, service coordination,
                  or customer support assistance after payment confirmation.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">Do you ship physical products?</h3>
                <p>No. All products and services are digital only.</p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">What if I entered the wrong information?</h3>
                <p>
                  Contact support immediately. Incorrect information may delay or prevent fulfillment.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-lg font-bold text-white">How can I contact Bloxhop?</h3>
                <p>
                  Email support@bloxhop.site, call +63 9453392304, or join Discord for support.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}
