import { NextResponse } from "next/server";
import { getPayPalAccessToken } from "@/lib/paypal";

export async function POST(request: Request) {
  try {
    const { totalPrice } = await request.json();

    if (!totalPrice) {
      return NextResponse.json({ error: "Missing total price." }, { status: 500 });
    }

    const accessToken = await getPayPalAccessToken();
    const base = process.env.PAYPAL_API_BASE;

    const response = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: Number(totalPrice).toFixed(2),
            },
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to create PayPal order." },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Create order failed.",
      },
      { status: 500 }
    );
  }
}
