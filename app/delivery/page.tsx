import LegalPageShell from "@/components/legal-page-shell";

export default function DeliveryPage() {
  return (
    <LegalPageShell title="Delivery Policy">
      <div className="space-y-4 text-white/90 leading-7">
	<p className="text-sm text-white/70">
          Effective Date: April 24, 2026
        </p>
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
          If delivery is still delayed, contact support@bloxhop.site with your Order ID for immediate assistance.
          Eligible delayed orders may qualify for support review or refund consideration based on our Refund Policy.
        </p>

        <p>
          For delivery assistance, contact: support@bloxhop.site
        </p>
      </div>
    </LegalPageShell>
  );
}
