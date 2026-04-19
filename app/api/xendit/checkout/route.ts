import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
};

async function getUsdToPhpRate() {
  const res = await fetch(
    "https://api.frankfurter.dev/v1/latest?base=USD&symbols=PHP",
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch exchange rate: ${res.status}`);
  }

  const data = (await res.json()) as {
    amount?: number;
    base?: string;
    date?: string;
    rates?: {
      PHP?: number;
    };
  };

  const rate = Number(data?.rates?.PHP);

  if (!rate || Number.isNaN(rate) || rate <= 0) {
    throw new Error("Invalid USD to PHP exchange rate received.");
  }

  return {
    rate,
    date: data.date ?? null,
  };
}

export async function POST(req: Request) {
  try {
    const {
      robloxUsername,
      contactInfo,
      notes,
      items,
      totalPrice,
    }: {
      robloxUsername: string;
      contactInfo: string;
      notes?: string;
      items: CartItem[];
      totalPrice: number; // USD
    } = await req.json();

    if (!robloxUsername || !contactInfo || !items?.length) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const { rate: usdToPhpRate, date: rateDate } = await getUsdToPhpRate();

    // Optional buffer to protect against small rate movement / fees
    const BUFFER_MULTIPLIER = 1.01;

    const phpAmount =
      Math.round(Number(totalPrice) * usdToPhpRate * BUFFER_MULTIPLIER * 100) /
      100;

    const referenceId = `ORD-${Date.now()}`;
    const auth = Buffer.from(
      `${process.env.XENDIT_SECRET_KEY}:`
    ).toString("base64");

    const xenditRes = await fetch("https://api.xendit.co/sessions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reference_id: referenceId,
        session_type: "PAY",
        mode: "PAYMENT_LINK",
        currency: "PHP",
        amount: phpAmount,
        country: "PH",
        capture_method: "AUTOMATIC",
        success_return_url: `${process.env.NEXT_PUBLIC_APP_URL}/track-order?reference=${referenceId}`,
        cancel_return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
        customer: {
          type: "INDIVIDUAL",
          reference_id: `CUST-${Date.now()}`,
          email: contactInfo,
          individual_detail: {
            given_names:
              robloxUsername.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 50) ||
              "Customer",
          },
        },
        items: items.map((item) => ({
          reference_id: String(item.id),
          type: "DIGITAL_PRODUCT",
          name: item.name,
          net_unit_amount:
            Math.round(
              Number(item.price) * usdToPhpRate * BUFFER_MULTIPLIER * 100
            ) / 100,
          quantity: Number(item.quantity),
          image_url: item.image_url || undefined,
          category: "Gaming",
        })),
        description: `Payment for order ${referenceId}`,
        locale: "en",
        metadata: {
          robloxUsername: String(robloxUsername),
          notes: String(notes ?? ""),
          usd_total: Number(totalPrice).toFixed(2),
          php_total: Number(phpAmount).toFixed(2),
          usd_to_php_rate: usdToPhpRate.toFixed(6),
          rate_date: String(rateDate ?? ""),
          buffer_multiplier: BUFFER_MULTIPLIER.toFixed(2),
        },
      }),
    });

    const xenditData = await xenditRes.json();

    if (!xenditRes.ok) {
      console.error("Xendit error:", xenditData);
      return NextResponse.json(
        { error: xenditData.message || "Failed to create payment session." },
        { status: 400 }
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          roblox_username: robloxUsername,
          contact_info: contactInfo,
          notes: notes ?? "",
          items,
          total_price: Number(totalPrice), // still store storefront USD value
          status: "Pending",
          payment_status: "Pending",
          payer_email: contactInfo,
          xendit_session_id: xenditData.id ?? null,
          xendit_reference_id: referenceId,
          payment_method: "Xendit",
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error(orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: xenditData.payment_link_url,
      order,
      exchangeRate: usdToPhpRate,
      phpAmount,
      rateDate,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}