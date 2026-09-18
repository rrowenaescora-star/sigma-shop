import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { deductCapitalForPaidOrder } from "@/lib/capital";

export const runtime = "nodejs";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function parseSignature(header: string) {
  return Object.fromEntries(header.split(",").map((part) => { const [key, ...rest] = part.trim().split("="); return [key, rest.join("=")]; }));
}

function validSignature(rawBody: string, header: string, secret: string, live: boolean) {
  const parts = parseSignature(header);
  const timestamp = parts.t;
  const supplied = live ? parts.li : parts.te;
  if (!timestamp || !supplied || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const first = Buffer.from(expected);
  const second = Buffer.from(supplied);
  return first.length === second.length && crypto.timingSafeEqual(first, second);
}

export async function POST(request: Request) {
  const secret = process.env.PAYMONGO_STEAL_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  const signature = request.headers.get("paymongo-signature");
  const rawBody = await request.text();
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 401 });

  let event: any;
  try { event = JSON.parse(rawBody); } catch { return NextResponse.json({ error: "Invalid payload." }, { status: 400 }); }
  const attributes = event?.data?.attributes;
  const session = attributes?.data;
  const sessionAttributes = session?.attributes;
  const live = attributes?.livemode === true || sessionAttributes?.livemode === true;
  if (!validSignature(rawBody, signature, secret, live)) return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  if (!live) return NextResponse.json({ received: true, ignored: "test event" });
  if (attributes?.type !== "checkout_session.payment.paid") return NextResponse.json({ received: true, ignored: attributes?.type || "unknown" });

  const eventId = String(event?.data?.id || "");
  if (!eventId) return NextResponse.json({ error: "Missing event id." }, { status: 400 });
  const { error: claimError } = await supabase.from("payment_webhook_events").insert({ provider: "paymongo-steal-an-egg", event_id: eventId, event_type: attributes.type, payload: event });
  if (claimError) return NextResponse.json({ received: true, duplicate: true });

  const orderId = Number(sessionAttributes?.metadata?.order_id);
  const expectedCentavos = Number(sessionAttributes?.metadata?.php_amount_centavos);
  const payment = Array.isArray(sessionAttributes?.payments) ? sessionAttributes.payments.find((entry: any) => entry?.attributes?.status === "paid") : null;
  const paidCentavos = Number(payment?.attributes?.amount);
  if (!Number.isInteger(orderId) || orderId < 1 || !Number.isInteger(expectedCentavos) || expectedCentavos < 100 || paidCentavos !== expectedCentavos || String(payment?.attributes?.currency || "").toUpperCase() !== "PHP") return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });

  const { data: order } = await supabase.from("orders").select("id,payment_status,notes,xendit_session_id").eq("id", orderId).eq("xendit_session_id", session.id).eq("payment_provider", "paymongo").single();
  if (!order || !String(order.notes || "").startsWith("STEAL_AN_EGG")) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.payment_status !== "Paid") {
    const { error } = await supabase.from("orders").update({ payment_status: "Paid", status: "Pending", paid_amount: paidCentavos / 100, paid_currency: "PHP", paid_at: new Date().toISOString(), payment_method: "PayMongo" }).eq("id", order.id).neq("payment_status", "Paid");
    if (error) return NextResponse.json({ error: "Could not finalize payment." }, { status: 500 });
    await deductCapitalForPaidOrder(Number(order.id));
  }
  return NextResponse.json({ received: true });
}