import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("x-ticket-secret");

    if (auth !== process.env.TICKET_LOOKUP_SECRET) {
      return NextResponse.json(
        {
          found: false,
          message: "Unauthorized request.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const orderId = String(body.orderId || "")
      .replace("#", "")
      .trim();

    if (!orderId) {
      return NextResponse.json({
        found: false,
        message: "Order ID is required.",
      });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select(
  "id, roblox_username, items, total_price, payment_status, payment_method, created_at, paid_at, delivery_status, claimed_by, coupon_code, coupon_discount, original_total"
)
      .eq("id", orderId)
      .maybeSingle();

    if (error) {
      console.error(error);

      return NextResponse.json({
        found: false,
        message: error.message,
      });
    }

    if (!order) {
      return NextResponse.json({
        found: false,
        message: "Order not found.",
      });
    }

    return NextResponse.json({
      found: true,
      order: {
        id: order.id,
        username: order.roblox_username,
        items: order.items,
        totalPrice: order.total_price,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        createdAt: order.created_at,
	couponCode: order.coupon_code,
	couponDiscount: order.coupon_discount,
	originalTotal: order.original_total,
	paid_at: order.paid_at,
	deliveryStatus: order.delivery_status,
	claimedBy: order.claimed_by,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      found: false,
      message: "Server error.",
    });
  }
}