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
  const res = await fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=PHP", {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch exchange rate.");

  const data = await res.json();
  const rate = Number(data?.rates?.PHP);

  if (!rate || Number.isNaN(rate) || rate <= 0) {
    throw new Error("Invalid USD to PHP exchange rate.");
  }

  return { rate, date: data.date ?? null };
}

export async function POST(req: Request) {
  try {
    const { robloxUsername, contactInfo, notes, items, totalPrice } = await req.json();

    if (!robloxUsername || !contactInfo || !items?.length) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const { rate: usdToPhpRate, date: rateDate } = await getUsdToPhpRate();

    const BUFFER_MULTIPLIER = 1.01;
    const referenceId = `ORD-${Date.now()}`;

    const phpAmount =
      Math.round(Number(totalPrice) * usdToPhpRate * BUFFER_MULTIPLIER * 100);

    const auth = Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString("base64");

    const paymongoRes = await fetch("https://api.paymongo.com/v2/checkout_sessions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            line_items: items.map((item: CartItem) => ({
              name: item.name,
              amount: Math.round(Number(item.price) * usdToPhpRate * BUFFER_MULTIPLIER * 100),
              currency: "PHP",
              quantity: Number(item.quantity),
              images: item.image_url ? [item.image_url] : [],
            })),
          payment_method_types: ["card", "gcash", "paymaya"],
billing: {
  name: robloxUsername,
  email: contactInfo,
},
success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?reference=${referenceId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
            reference_number: referenceId,
            description: `Payment for order ${referenceId}`,
            send_email_receipt: true,
            metadata: {
              robloxUsername: String(robloxUsername),
              notes: String(notes ?? ""),
              usd_total: Number(totalPrice).toFixed(2),
              php_total: (phpAmount / 100).toFixed(2),
              usd_to_php_rate: usdToPhpRate.toFixed(6),
              rate_date: String(rateDate ?? ""),
            },
          },
        },
      }),
    });

    const paymongoData = await paymongoRes.json();

    if (!paymongoRes.ok) {
      console.error("PayMongo error:", paymongoData);
      return NextResponse.json(
        { error: paymongoData?.errors?.[0]?.detail || "Failed to create PayMongo checkout." },
        { status: 400 }
      );
    }

    const checkoutSessionId = paymongoData?.data?.id;
    const checkoutUrl = paymongoData?.data?.attributes?.checkout_url;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          roblox_username: robloxUsername,
          contact_info: contactInfo,
          notes: notes ?? "",
          items,
          total_price: Number(totalPrice),
          status: "Pending",
          payment_status: "Pending",
          payer_email: contactInfo,

          xendit_session_id: checkoutSessionId,
          xendit_reference_id: referenceId,

          payment_method: "PayMongo",
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
      checkoutUrl,
      order,
      exchangeRate: usdToPhpRate,
      phpAmount: phpAmount / 100,
      rateDate,
    });
  } catch (error) {
    console.error("PayMongo checkout error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}