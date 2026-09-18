import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createGuestCheckoutSession, PAYPAL_GUEST_COOKIE } from "@/lib/paypal-guest-session";

export const runtime = "nodejs";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

async function phpRate() {
  const response = await fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=PHP", { cache: "no-store" });
  if (!response.ok) throw new Error("Exchange rate unavailable");
  const rate = Number((await response.json())?.rates?.PHP);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error("Invalid exchange rate");
  return rate;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length || body.fulfillmentFlow !== "steal-an-egg") return NextResponse.json({ error: "This checkout accepts Steal an Egg items only." }, { status: 400 });
    const quantities = new Map<number, number>();
    for (const item of items) {
      const id = Number(item.id), quantity = Number(item.quantity);
      if (!Number.isInteger(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) return NextResponse.json({ error: "Your cart contains an invalid item." }, { status: 400 });
      quantities.set(id, (quantities.get(id) || 0) + quantity);
    }
    const { data: products, error: productError } = await supabase.from("products").select("id,name,price,cost_value,stock,stock_quantity,image_url,game,is_active").in("id", [...quantities.keys()]);
    if (productError || !products || products.length !== quantities.size || products.some((product) => product.game !== "steal-an-egg")) return NextResponse.json({ error: "One or more items do not belong to this checkout." }, { status: 400 });
    let usdTotal = 0, requiredCapital = 0;
    const serverItems: any[] = [];
    for (const product of products) {
      const quantity = quantities.get(Number(product.id)) || 0;
      if (product.is_active === false || product.stock === "Out of Stock" || Number(product.stock_quantity ?? 0) < quantity) return NextResponse.json({ error: `${product.name} is currently unavailable.` }, { status: 400 });
      const price = money(Number(product.price));
      if (!Number.isFinite(price) || price <= 0) return NextResponse.json({ error: "A product price is invalid." }, { status: 400 });
      usdTotal += price * quantity; requiredCapital += money(Number(product.cost_value || 0)) * quantity;
      serverItems.push({ id: Number(product.id), name: product.name, price, quantity, image_url: product.image_url, game: product.game });
    }
    usdTotal = money(usdTotal);
    const { data: settings } = await supabase.from("shop_settings").select("global_capital").single();
    if (!settings || Number(settings.global_capital || 0) < requiredCapital) return NextResponse.json({ error: "One or more products are currently unavailable." }, { status: 400 });

    const rate = await phpRate();
    const phpItems = serverItems.map((item) => ({ ...item, centavos: Math.max(100, Math.round(item.price * rate * 100)) }));
    const phpCentavos = phpItems.reduce((sum, item) => sum + item.centavos * item.quantity, 0);
    const session = createGuestCheckoutSession();
    const reference = `SAE-${Date.now()}`;
    const { data: order, error: insertError } = await supabase.from("orders").insert({ roblox_username: "Pending after payment", contact_info: "Pending PayMongo confirmation", notes: "STEAL_AN_EGG_POST_PAYMENT", items: serverItems, total_price: usdTotal, original_total: usdTotal, coupon_discount: 0, payment_method: "PayMongo", payment_provider: "paymongo", payment_status: "Creating", status: "Pending", delivery_status: "Awaiting payment", checkout_session_hash: session.hash, xendit_reference_id: reference }).select("id").single();
    if (insertError || !order) return NextResponse.json({ error: "We could not create your secure order." }, { status: 500 });

    const baseUrl = "https://bloxhop.com";
    const auth = Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString("base64");
    const paymongoResponse = await fetch("https://api.paymongo.com/v2/checkout_sessions", { method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" }, body: JSON.stringify({ data: { attributes: { line_items: phpItems.map((item) => ({ name: item.name.slice(0, 100), amount: item.centavos, currency: "PHP", quantity: item.quantity, images: item.image_url ? [item.image_url] : [] })), payment_method_types: ["card", "gcash", "paymaya", "qrph", "dob"], success_url: `${baseUrl}/steal-an-egg/order?orderId=${order.id}&provider=paymongo`, cancel_url: `${baseUrl}/steal-an-egg/checkout`, reference_number: reference, description: `Steal an Egg order #${order.id}`, send_email_receipt: true, show_line_items: true, metadata: { order_id: String(order.id), fulfillment_flow: "steal-an-egg", php_amount_centavos: String(phpCentavos), usd_total: usdTotal.toFixed(2) } } } }) });
    const paymongo = await paymongoResponse.json();
    if (!paymongoResponse.ok || !paymongo?.data?.id || !paymongo?.data?.attributes?.checkout_url) { await supabase.from("orders").update({ payment_status: "Failed" }).eq("id", order.id); return NextResponse.json({ error: paymongo?.errors?.[0]?.detail || "PayMongo checkout could not be created." }, { status: 502 }); }
    await supabase.from("orders").update({ xendit_session_id: paymongo.data.id, payment_status: "Pending" }).eq("id", order.id).eq("checkout_session_hash", session.hash);
    const response = NextResponse.json({ checkoutUrl: paymongo.data.attributes.checkout_url, orderId: order.id, phpTotal: phpCentavos / 100 });
    response.cookies.set(PAYPAL_GUEST_COOKIE, session.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14 });
    return response;
  } catch (error) {
    console.error("Steal an Egg PayMongo checkout error:", error);
    return NextResponse.json({ error: "PayMongo checkout could not be created." }, { status: 500 });
  }
}