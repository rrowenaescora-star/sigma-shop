import OpenAI from "openai";
import { NextResponse } from "next/server";
import { buildReceiptResult } from "@/lib/receipt-engine";
import { getReceiptDecision } from "@/lib/receipt-decision";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PAYPAL_EMAIL = "johnmonescora456@gmail.com";

function toMoney(value: unknown) {
  const amount = Number(value || 0);
  return Math.round(amount * 100) / 100;
}

export async function POST(request: Request) {
  try {
    const secret = request.headers.get("x-receipt-ai-secret");

    if (secret !== process.env.RECEIPT_AI_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, expectedAmount, imageUrl, imageBase64 } = body;
    const receiptImage = imageBase64 || imageUrl;

    if (!orderId || !expectedAmount || !receiptImage) {
      return NextResponse.json(
        { error: "Missing orderId, expectedAmount, or imageUrl" },
        { status: 400 },
      );
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "You are checking a PayPal payment receipt screenshot for BloxHop.\n\n" +
                `Official PayPal email: ${PAYPAL_EMAIL}\n` +
                `Expected amount: $${Number(expectedAmount).toFixed(2)} USD\n\n` +
                "Extract only what is clearly visible in the screenshot.\n" +
                "Return ONLY valid JSON. No markdown.\n\n" +
                `{
  "email_found": true,
  "matched_email": "string or null",
  "amount_received": 0,
  "currency": "USD or null",
  "payment_status": "completed|sent|pending|failed|unknown",
  "transaction_id": "string or null",
  "confidence": 0,
  "notes": "short reason"
}`,
            },
            {
  type: "input_image",
  image_url: receiptImage,
  detail: "auto",
},
          ],
        },
      ],
    });

    const rawText = response.output_text || "{}";
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const ai = JSON.parse(cleaned);

    const expected = toMoney(expectedAmount);
    const received = toMoney(ai.amount_received);
    const missing = toMoney(Math.max(expected - received, 0));
    const overpaid = toMoney(Math.max(received - expected, 0));

    const result = buildReceiptResult({
  orderId,
  expectedAmount,
  amountReceived: received,
  emailFound: Boolean(ai.email_found),
  matchedEmail: ai.matched_email || null,
  currency: ai.currency || null,
  paymentStatus: ai.payment_status || "unknown",
  transactionId: ai.transaction_id || null,
  confidence: Number(ai.confidence || 0),
  raw: ai,
});

const decision = getReceiptDecision(result);

return NextResponse.json({
  ...result,
  decision,
});
  } catch (error) {
    console.error("Receipt AI error:", error);

    return NextResponse.json(
      { error: "Failed to analyze receipt" },
      { status: 500 },
    );
  }
}