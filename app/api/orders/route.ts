import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      robloxUsername,
      robloxUserId,
      robloxDisplayName,
      contactInfo,
      notes,
      items,
      totalPrice,
      xenditSessionId,
      xenditReferenceId,
      paymentMethod,
      paymentStatus,
      payerEmail,
      couponCode,
      couponDiscount,
      originalTotal,
    } = body;

    if (!robloxUsername || !contactInfo || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Missing required order information." },
        { status: 400 }
      );
    }

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
  roblox_username: robloxUsername,
  contact_info: contactInfo,
  notes: notes || "",
  items,
  total_price: Number(totalPrice || 0),
  xendit_session_id: xenditSessionId || null,
  xendit_reference_id: xenditReferenceId || null,
  payment_method: paymentMethod || "Manual Order",
  payment_status: paymentStatus || "Pending",
  payer_email: payerEmail || null,
  status: "Pending",
  coupon_code: couponCode || null,
coupon_discount: couponDiscount || 0,
original_total: originalTotal || totalPrice,
})
      .select("*")
      .single();

    if (error) {
      console.error("Order insert error:", error);

      return NextResponse.json(
        { error: error.message || "Order save failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Order route error:", error);

    return NextResponse.json(
      { error: "Server error while saving order." },
      { status: 500 }
    );
  }
}