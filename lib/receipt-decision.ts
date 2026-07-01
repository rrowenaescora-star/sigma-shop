type ReceiptResult = {
  emailFound: boolean;
  amountReceived: number;
  expectedAmount: number;
  missingAmount: number;
  overpaidAmount: number;
  confidence: number;
};

export function getReceiptDecision(result: ReceiptResult) {
  if (!result.emailFound) {
    return {
      status: "invalid_email",
      title: "Receipt rejected",
      message:
        "We could not detect our official payment email on your receipt. Please upload a clear and valid receipt.",
    };
  }

  if (result.confidence < 60) {
    return {
      status: "low_confidence",
      title: "Needs review",
      message:
        "The receipt was detected, but the image is not clear enough. Staff should review it manually.",
    };
  }

  if (result.missingAmount > 0) {
    return {
      status: "underpaid",
      title: "Follow-up payment needed",
      message: `You are missing $${result.missingAmount.toFixed(
        2
      )}. Please send the remaining balance and upload another receipt.`,
    };
  }

  if (result.overpaidAmount > 0) {
    return {
      status: "overpaid",
      title: "Overpayment detected",
      message: `You overpaid by $${result.overpaidAmount.toFixed(
        2
      )}. Staff will help you refund it or convert it to store credit.`,
    };
  }

  return {
    status: "paid_complete",
    title: "Payment verified",
    message:
      "Your payment matches the required amount. Staff will now do the final verification.",
  };
}