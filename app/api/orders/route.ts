import { sendDiscordOrderNotification } from "@/lib/discord";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json({ ok: true, message: "orders route works" });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      robloxUsername,
      contactInfo,
      notes,
      items,
      totalPrice,
      paypalOrderId,
      paymentStatus,
      payerEmail,
    } = body;

    if (
      !robloxUsername ||
      !contactInfo ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required order fields." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          roblox_username: robloxUsername,
          contact_info: contactInfo,
          notes: notes ?? "",
          items,
          total_price: totalPrice,
          status: "Pending",
          paypal_order_id: paypalOrderId ?? null,
          payment_status: paymentStatus ?? "Unpaid",
          payer_email: payerEmail ?? null,
          paid_at: paymentStatus === "Paid" ? new Date().toISOString() : null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create order.",
      },
      { status: 500 }
    );
  }
}
