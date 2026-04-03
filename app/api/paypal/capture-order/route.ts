import { NextResponse } from "next/server";
import { getPayPalAccessToken } from "@/lib/paypal";

export async function POST(request: Request) {
  try {
    const { orderID } = await request.json();

    if (!orderID) {
      return NextResponse.json({ error: "Missing orderID." }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();
    const base = process.env.PAYPAL_API_BASE;

    // 🔥 STEP 1: CAPTURE ORDER
    const captureResponse = await fetch(
      `${base}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const captureData = await captureResponse.json();

    if (!captureResponse.ok) {
      return NextResponse.json(
        { error: captureData.message || "Failed to capture PayPal order." },
        { status: 500 }
      );
    }

    // 🔥 STEP 2: VERIFY PAYMENT STATUS
    const status = captureData?.status;

    if (status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Payment not completed." },
        { status: 400 }
      );
    }

    // 🔥 STEP 3: EXTRACT REAL PAID AMOUNT
    const purchaseUnit = captureData?.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];

    const paidAmount = Number(capture?.amount?.value || 0);
    const currency = capture?.amount?.currency_code;

    if (!paidAmount || paidAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount." },
        { status: 400 }
      );
    }

    // 🔥 STEP 4: GET PAYER EMAIL
    const payerEmail = captureData?.payer?.email_address || null;

    // 🔥 RETURN VERIFIED DATA ONLY
    return NextResponse.json({
      success: true,
      orderID: captureData?.id || orderID,
      status,
      payerEmail,
      paidAmount,
      currency,
    });

  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Capture failed.",
      },
      { status: 500 }
    );
  }
}
