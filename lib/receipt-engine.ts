type AnalyzeReceiptInput = {
  orderId: string;
  expectedAmount: number;
};

function toMoney(value: unknown) {
  const amount = Number(value || 0);
  return Math.round(amount * 100) / 100;
}

export function buildReceiptResult({
  orderId,
  expectedAmount,
  amountReceived,
  emailFound,
  matchedEmail,
  currency,
  paymentStatus,
  transactionId,
  confidence,
  raw,
}: AnalyzeReceiptInput & {
  amountReceived: number;
  emailFound: boolean;
  matchedEmail: string | null;
  currency: string | null;
  paymentStatus: string;
  transactionId: string | null;
  confidence: number;
  raw?: unknown;
}) {
  const expected = toMoney(expectedAmount);
  const received = toMoney(amountReceived);
  const missing = toMoney(Math.max(expected - received, 0));
  const overpaid = toMoney(Math.max(received - expected, 0));

  return {
    success: true,
    orderId,
    expectedAmount: expected,
    emailFound,
    matchedEmail,
    amountReceived: received,
    currency,
    paymentStatus,
    transactionId,
    confidence,
    missingAmount: missing,
    overpaidAmount: overpaid,
    isExactAmount: Math.abs(received - expected) < 0.01,
    raw,
  };
}