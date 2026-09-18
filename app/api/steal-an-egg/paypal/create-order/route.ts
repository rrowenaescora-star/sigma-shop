import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createGuestCheckoutSession, PAYPAL_GUEST_COOKIE } from "@/lib/paypal-guest-session";
import { createPaypalOrder } from "@/lib/paypal";

export const runtime = "nodejs";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export async function POST(request: Request) {
  try {
    const { user } = await getAuthenticatedUser();
    const guestSession = createGuestCheckoutSession();
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length || body.fulfillmentFlow !== "steal-an-egg") {
      return NextResponse.json({ error: "This checkout accepts Steal an Egg items only." }, { status: 400 });
    }

    const quantities = new Map<number, number>();
    for (const item of items) {
      const id = Number(item.id);
      const quantity = Number(item.quantity);
      if (!Number.isInteger(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        return NextResponse.json({ error: "Your cart contains an invalid item." }, { status: 400 });
      }
      quantities.set(id, (quantities.get(id) || 0) + quantity);
    }

    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id,name,price,cost_value,stock,stock_quantity,image_url,game,is_active")
      .in("id", [...quantities.keys()]);
    if (productError || !products || products.length !== quantities.size || products.some((product) => product.game !== "steal-an-egg")) {
      return NextResponse.json({ error: "One or more items do not belong to this checkout." }, { status: 400 });
    }

    let subtotal = 0;
    let requiredCapital = 0;
    const serverItems: Array<{id:number;name:string;price:number;quantity:number;image_url:string|null;game:string|null}> = [];
    for (const product of products) {
      const quantity = quantities.get(Number(product.id)) || 0;
      if (product.is_active === false || product.stock === "Out of Stock" || Number(product.stock_quantity ?? 0) < quantity) {
        return NextResponse.json({ error: `${product.name} is currently unavailable.` }, { status: 400 });
      }
      const price = money(Number(product.price));
      if (!Number.isFinite(price) || price <= 0) return NextResponse.json({ error: "A product price is invalid." }, { status: 400 });
      subtotal += price * quantity;
      requiredCapital += money(Number(product.cost_value || 0)) * quantity;
      serverItems.push({ id: Number(product.id), name: product.name, price, quantity, image_url: product.image_url, game: product.game });
    }

    subtotal = money(subtotal);
    const { data: settings } = await supabase.from("shop_settings").select("global_capital").single();
    if (!settings || Number(settings.global_capital || 0) < requiredCapital) {
      return NextResponse.json({ error: "One or more products are currently unavailable." }, { status: 400 });
    }

    const { data: order, error: insertError } = await supabase.from("orders").insert({
      roblox_username: "Pending after payment",
      contact_info: "Pending PayPal confirmation",
      notes: "STEAL_AN_EGG_POST_PAYMENT",
      items: serverItems,
      total_price: subtotal,
      original_total: subtotal,
      coupon_discount: 0,
      payment_method: "PayPal",
      payment_provider: "paypal",
      payment_status: "Creating",
      status: "Pending",
      delivery_status: "Awaiting payment",
      payer_email: user?.email || null,
      user_id: user?.id || null,
      checkout_session_hash: guestSession.hash,
    }).select("id").single();
    if (insertError || !order) return NextResponse.json({ error: "We could not create your secure order." }, { status: 500 });

    try {
      const paypalOrder = await createPaypalOrder({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: String(order.id), custom_id: String(order.id), invoice_id: `bloxhop-${order.id}`,
          description: `Steal an Egg order #${order.id}`,
          amount: { currency_code: "USD", value: subtotal.toFixed(2), breakdown: { item_total: { currency_code: "USD", value: subtotal.toFixed(2) } } },
          items: serverItems.map((item) => ({ name: item.name.slice(0, 127), quantity: String(item.quantity), unit_amount: { currency_code: "USD", value: item.price.toFixed(2) } })),
        }],
      }, `create-steal-an-egg-${order.id}`);
      if (!paypalOrder.id) throw new Error("Missing PayPal order ID");
      const { error: updateError } = await supabase.from("orders").update({ paypal_order_id: paypalOrder.id, payment_status: "Pending" }).eq("id", order.id).eq("checkout_session_hash", guestSession.hash);
      if (updateError) throw updateError;

      const response = NextResponse.json({ orderID: paypalOrder.id });
      response.cookies.set(PAYPAL_GUEST_COOKIE, guestSession.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 14 });
      return response;
    } catch {
      await supabase.from("orders").update({ payment_status: "Failed" }).eq("id", order.id).eq("checkout_session_hash", guestSession.hash);
      return NextResponse.json({ error: "Creating secure payment failed. Please try again." }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Creating secure payment failed. Please try again." }, { status: 500 });
  }
}