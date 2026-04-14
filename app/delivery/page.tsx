import LegalPageShell from "@/components/legal-page-shell";

export default function DeliveryPage() {
  return (
     <LegalPageShell title="Delivery Policy">

      <p className="mb-4">
        All products sold on Bloxhop are digital items.
      </p>

      <p className="mb-4">
        Delivery time is typically between <strong>5 to 30 minutes</strong>.
      </p>

      <p className="mb-4">
        In rare situations, delivery may take up to <strong>3 hours</strong>.
      </p>

      <p>
        If your order is not delivered within 3 hours, you may be eligible for a refund.
      </p>
    </LegalPageShell>
  );
}