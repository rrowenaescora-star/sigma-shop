import OpenAI from "openai";
import { NextResponse } from "next/server";

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
    const { orderId, expectedAmount, imageUrl } = body;

    if (!orderId || !expectedAmount || !imageUrl) {
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
  image_url: imageUrl,
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

    return NextResponse.json({
      success: true,
      orderId,
      expectedAmount: expected,
      emailFound: Boolean(ai.email_found),
      matchedEmail: ai.matched_email || null,
      amountReceived: received,
      currency: ai.currency || null,
      paymentStatus: ai.payment_status || "unknown",
      transactionId: ai.transaction_id || null,
      confidence: Number(ai.confidence || 0),
      missingAmount: missing,
      overpaidAmount: overpaid,
      isExactAmount: Math.abs(received - expected) < 0.01,
      raw: ai,
    });
  } catch (error) {
    console.error("Receipt AI error:", error);

    return NextResponse.json(
      { error: "Failed to analyze receipt" },
      { status: 500 },
    );
  }
}