import LegalPageShell from "@/components/legal-page-shell";

export const metadata = {
  title: "Privacy Policy | Bloxhop",
  description:
    "How Bloxhop collects, uses, shares, protects, and retains customer information.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <div className="space-y-5 text-slate-200 leading-7">
        <p className="text-sm text-sky-200/80">Last updated: August 16, 2026</p>

        <p>
          This Privacy Policy explains how Bloxhop Online Store collects, uses,
          discloses, and protects personal information when you visit our site,
          use our services, place an order, or contact us.
        </p>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-sky-200">1. Information We Collect</h2>
          <p>
            Depending on how you interact with Bloxhop, we may collect your
            name, email address, phone number, billing details, payment status,
            order information, Roblox username or account identifier, support
            messages, and technical information such as device type, browser,
            IP address, logs, and cookie or similar usage data.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-sky-200">
            2. Information We Collect Directly From You
          </h2>
          <p>
            When you place an order or contact support, you may provide contact
            details, order details, account or service information, and any
            information included in your messages or checkout notes.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-sky-200">
            3. Cookies and Similar Technologies
          </h2>
          <p>
            We may use cookies, pixels, and similar technologies to operate the
            site, remember preferences, improve checkout, understand site
            activity, and support analytics and security.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-sky-200">
            4. Information From Third Parties
          </h2>
          <p>
            We may receive information from third parties that help us operate
            the site and complete orders, including Shopify, payment providers,
            hosting providers, analytics services, and other service partners.
            Payment providers may process payment information under their own
            privacy policies and security controls.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-sky-200">5. How We Use Information</h2>
          <p>
            We may use personal information to process orders, confirm payment,
            provide customer support, manage checkout, send order updates,
            prevent fraud, verify transactions, maintain business records,
            improve our services, and comply with legal or regulatory
            obligations.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-sky-200">6. Payments and Shopify</h2>
          <p>
            Some payments may be processed through Shopify and related payment
            tools. When you are redirected to Shopify checkout, Shopify may
            collect and process payment and checkout information according to
            its own terms and privacy practices. Bloxhop receives the payment
            status and related order information needed to confirm and support
            your order.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-sky-200">
            7. Sharing of Information
          </h2>
          <p>
            We may share information with payment processors, Shopify, hosting
            providers, support tools, fraud-prevention services, professional
            advisers, and government or regulatory authorities where required by
            law or necessary to operate the business, process payments, or
            complete orders. We do not sell personal information.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-sky-200">8. Data Security</h2>
          <p>
            We use reasonable technical and organizational safeguards designed
            to protect personal information. No online system is completely
            secure, so we cannot guarantee perfect security.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-sky-200">9. Data Retention</h2>
          <p>
            We keep personal information for as long as needed for orders,
            support, accounting, legal compliance, fraud prevention, dispute
            resolution, and other legitimate business purposes.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-sky-200">
            10. Your Rights and Choices
          </h2>
          <p>
            Depending on where you live, you may have rights to access, correct,
            delete, or restrict certain personal information. You may also be
            able to opt out of marketing messages where applicable.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-sky-200">11. Children&apos;s Privacy</h2>
          <p>
            Our services are not intended for children, and we do not knowingly
            collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-sky-200">
            12. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we
            will revise the date at the top of this page.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-sky-200">13. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at{" "}
            <a
              className="text-sky-300 hover:underline"
              href="mailto:support@bloxhop.site"
            >
              support@bloxhop.site
            </a>
            .
            <br />
            Bloxhop Online Store
            <br />
            Cebu City, Cebu, Philippines
          </p>
        </section>
      </div>
    </LegalPageShell>
  );
}
