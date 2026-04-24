import LegalPageShell from "@/components/legal-page-shell";

export default function RefundPage() {
  return (
    <LegalPageShell title="Refund Policy">
      <div className="space-y-4 text-white/90 leading-7">
	<p className="text-sm text-white/70">
          Effective Date: April 24, 2026
        </p>
        <p>
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
          <li>Contact support@bloxhop.site with your Order ID and reason for the refund request</li>
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
          For assistance, contact support@bloxhop.site
        </p>
      </div>
    </LegalPageShell>
  );
}
