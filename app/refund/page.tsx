import LegalPageShell from "@/components/legal-page-shell";
export default function RefundPage() {
  return (
     <LegalPageShell  className="max-w-3xl mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Refund Policy</h1>

      <p className="mb-4">
        All purchases on Bloxhop are for digital goods and are delivered manually.
      </p>

      <p className="mb-4">
        Refunds are only issued in the following cases:
      </p>

      <ul className="list-disc ml-6 mb-4 space-y-2">
        <li>Item was not delivered within 3 hours</li>
        <li>Wrong item was delivered due to our mistake</li>
      </ul>

      <p className="mb-4">
        Refunds are NOT issued for:
      </p>

      <ul className="list-disc ml-6 space-y-2">
        <li>Incorrect username provided by the customer</li>
        <li>Change of mind after purchase</li>
        <li>Used or consumed digital items</li>
      </ul>
    </LegalPageShell>
  );
}