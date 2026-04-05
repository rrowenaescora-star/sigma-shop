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

    if (!base) {
      return NextResponse.json(
        { error: "Missing PAYPAL_API_BASE." },
        { status: 500 }
      );
    }

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

    console.log("PayPal capture response status:", captureResponse.status);
    console.log("PayPal capture response body:", JSON.stringify(captureData));

    if (!captureResponse.ok) {
      return NextResponse.json(
        {
          error:
            captureData?.details?.[0]?.description ||
            captureData?.message ||
            "Failed to capture PayPal order.",
          paypal: captureData,
        },
        { status: 500 }
      );
    }

    const status = captureData?.status;

    if (status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Payment not completed.", paypal: captureData },
        { status: 400 }
      );
    }

    const purchaseUnit = captureData?.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];

    const paidAmount = Number(capture?.amount?.value || 0);
    const currency = capture?.amount?.currency_code || "USD";
    const payerEmail = captureData?.payer?.email_address || null;

    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid captured payment amount.", paypal: captureData },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderID: captureData?.id || orderID,
      status,
      payerEmail,
      paidAmount,
      currency,
    });
  } catch (error) {
    console.error("Capture order failed:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Capture failed.",
      },
      { status: 500 }
    );
  }
}
