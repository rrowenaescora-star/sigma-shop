<<<<<<< HEAD

=======
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
import { NextResponse } from "next/server";
import { getPayPalAccessToken } from "@/lib/paypal";

export async function POST(request: Request) {
  try {
    const { totalPrice } = await request.json();

    const numericTotal = Number(totalPrice);

    if (!Number.isFinite(numericTotal) || numericTotal <= 0) {
      return NextResponse.json(
        { error: `Invalid total price: ${totalPrice}` },
        { status: 400 }
      );
    }

    const accessToken = await getPayPalAccessToken();
    const base = process.env.PAYPAL_API_BASE;

    if (!base) {
      return NextResponse.json(
        { error: "Missing PAYPAL_API_BASE." },
        { status: 500 }
      );
    }

    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: numericTotal.toFixed(2),
          },
        },
      ],
    };

    console.log("PayPal create-order payload:", JSON.stringify(payload));

    const response = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log("PayPal create-order response status:", response.status);
    console.log("PayPal create-order response body:", JSON.stringify(data));

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.details?.[0]?.description ||
            data?.message ||
            data?.error_description ||
            "Failed to create PayPal order.",
          paypal: data,
        },
        { status: 500 }
      );
    }

    if (!data?.id) {
      return NextResponse.json(
        {
          error: "PayPal did not return an order ID.",
          paypal: data,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error("Create order failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Create order failed.",
      },
      { status: 500 }
    );
  }
}
