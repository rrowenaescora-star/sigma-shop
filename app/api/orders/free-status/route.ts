import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { FREE_ORDER_COOKIE, matchesFreeOrder } from "@/lib/free-order-confirmation";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("orderId") || "";
  if (!/^[1-9]\d*$/.test(id) || !matchesFreeOrder(id, request.cookies.get(FREE_ORDER_COOKIE)?.value)) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data, error } = await supabase.from("orders").select("id,payment_status,total_price,items,original_total,coupon_discount,coupon_code,created_at,roblox_username,payment_method").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ receipt: data, orderId: data.id, paid: data.payment_status === "Free" && Number(data.total_price) === 0 }, { headers: { "Cache-Control": "no-store" } });
}
