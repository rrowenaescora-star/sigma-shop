import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");

  if (aBuf.length !== bBuf.length) return false;

  return crypto.timingSafeEqual(aBuf, bBuf);
}

function verifyShopifyWebhook(rawBody: string, hmacHeader: string | null) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("Missing SHOPIFY_WEBHOOK_SECRET.");
  }

  if (!hmacHeader) {
    return false;
  }

  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  return timingSafeEqual(digest, hmacHeader);
}

function extractOrderId(payload: any) {
  const attributes = Array.isArray(payload?.note_attributes)
    ? payload.note_attributes
    : [];

  const noteIdAttr = attributes.find((attr: any) => {
    const key = String(attr?.name || attr?.key || "").toLowerCase();
    return key === "bloxhop_order_id" || key === "order_id";
  });

  const note = String(payload?.note || "");
  const noteMatch = note.match(/order-(\d+)/i);

  return (
    noteIdAttr?.value ||
    noteIdAttr?.val ||
    noteMatch?.[1] ||
    null
  );
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get("x-shopify-hmac-sha256");

    if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
      return NextResponse.json(
        { error: "Invalid Shopify webhook signature." },
        { status: 401 },
      );
    }

    const topic = request.headers.get("x-shopify-topic") || "";

    if (!topic.toLowerCase().includes("paid")) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const payload = JSON.parse(rawBody);
    const orderId = extractOrderId(payload);

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing Bloxhop order ID in Shopify order notes." },
        { status: 400 },
      );
    }

    const paidAt = payload?.processed_at || payload?.created_at || new Date().toISOString();
    const totalPrice = Number(payload?.current_total_price || payload?.total_price || 0);
    const email = payload?.email || null;
    const financialStatus = String(payload?.financial_status || "").toLowerCase();

    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "Paid",
        payment_method: "Shopify",
        paid_at: paidAt,
        payer_email: email,
        status: financialStatus === "paid" ? "Paid" : "Pending",
        total_price: Number.isFinite(totalPrice) ? totalPrice : undefined,
      })
      .eq("id", Number(orderId));

    if (error) {
      console.error("Failed to update Shopify order:", error);
      return NextResponse.json(
        { error: "Failed to update matching order." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Shopify webhook error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to process Shopify webhook.",
      },
      { status: 500 },
    );
  }
}
