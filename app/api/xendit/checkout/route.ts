import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
};

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
      totalPrice: number;
    } = await req.json();

    if (!robloxUsername || !contactInfo || !items?.length) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const referenceId = `ORD-${Date.now()}`;
    const auth = Buffer.from(`${process.env.XENDIT_SECRET_KEY}:`).toString("base64");

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
        amount: Number(totalPrice),
        country: "PH",
        capture_method: "AUTOMATIC",
        success_return_url: `${process.env.NEXT_PUBLIC_APP_URL}/track-order?reference=${referenceId}`,
        cancel_return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
        
        customer: {
  type: "INDIVIDUAL",
  reference_id: robloxUsername.replace(/[^a-zA-Z0-9]/g, "").slice(0, 255) || "Customer",
  email: contactInfo,
  individual_detail: {
    given_names: robloxUsername.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 50) || "Customer",
  },
},
        items: items.map((item) => ({
          reference_id: String(item.id),
          type: "DIGITAL_PRODUCT",
          name: item.name,
          net_unit_amount: Number(item.price),
          quantity: Number(item.quantity),
          image_url: item.image_url || undefined,
          category: "Gaming",
        })),
        description: `Payment for order ${referenceId}`,
        locale: "en",
        metadata: {
          robloxUsername,
          notes: notes ?? "",
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
          total_price: Number(totalPrice),
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
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}