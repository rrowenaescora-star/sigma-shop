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

    const response = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to capture PayPal order." },
        { status: 500 }
      );
    }

    const payerEmail =
      data?.payer?.email_address ||
      null;

    return NextResponse.json({
      success: true,
      orderID: data?.id || orderID,
      status: data?.status || "COMPLETED",
      payerEmail,
      data,
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
