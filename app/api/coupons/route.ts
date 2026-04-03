import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { code, cartTotal } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Missing code." }, { status: 400 });
    }

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: "Invalid coupon." }, { status: 400 });
    }

    if (!coupon.is_active) {
      return NextResponse.json({ error: "Coupon inactive." }, { status: 400 });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: "Coupon expired." }, { status: 400 });
    }

    if (
      coupon.usage_limit &&
      coupon.used_count >= coupon.usage_limit
    ) {
      return NextResponse.json({ error: "Coupon limit reached." }, { status: 400 });
    }

    let discount = 0;

    if (coupon.discount_type === "percent") {
      discount = (cartTotal * coupon.discount_value) / 100;
    } else {
      discount = coupon.discount_value;
    }

    return NextResponse.json({
      success: true,
      discount,
      couponId: coupon.id,
    });

  } catch (error) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
