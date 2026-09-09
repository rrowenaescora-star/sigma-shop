import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { deductCapitalForPaidOrder } from "@/lib/capital";
import { sendEmail } from "@/lib/email";
import { buildInvoiceEmail, buildInvoicePdf } from "@/lib/bloxhop-invoice";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const logoPath = path.join(process.cwd(), "public", "logo.png");

type Payment = {
  orderId: number;
  paypalOrderId: string;
  captureId: string;
  amount: string;
  currency: string;
  payerEmail?: string | null;
  paidAt?: string | null;
};

async function sendReceipt(orderId: number) {
  const { data: order, error } = await supabase
    .from("orders")
    .select("id,contact_info,payer_email,roblox_username,items,paid_amount,paid_currency,paid_at,paypal_capture_id,receipt_email_sent_at")
    .eq("id", orderId)
    .single();

  if (error || !order || order.receipt_email_sent_at) return;
  const email = order.payer_email || order.contact_info;
  if (!email) return;

  const invoice = {
    id: Number(order.id),
    email,
    username: order.roblox_username || "",
    items: order.items,
    amount: Number(order.paid_amount),
    currency: order.paid_currency || "USD",
    paidAt: order.paid_at || new Date().toISOString(),
    captureId: order.paypal_capture_id,
  };

  const attachments: Array<{ filename: string; content: Buffer; contentType: string; cid?: string }> = [
    {
      filename: `Bloxhop-Invoice-${order.id}.pdf`,
      content: await buildInvoicePdf(invoice),
      contentType: "application/pdf",
    },
  ];

  if (fs.existsSync(logoPath)) {
    attachments.push({
      filename: "bloxhop-logo.png",
      content: fs.readFileSync(logoPath),
      contentType: "image/png",
      cid: "bloxhop-logo",
    });
  }

  await sendEmail({
    to: email,
    subject: `Your Bloxhop invoice - Order #${order.id}`,
    html: buildInvoiceEmail(invoice),
    attachments,
  });

  await supabase
    .from("orders")
    .update({ receipt_email_sent_at: new Date().toISOString() })
    .eq("id", orderId)
    .is("receipt_email_sent_at", null);
}

export async function finalizeVerifiedPaypalPayment(payment: Payment) {
  const { data, error } = await supabase.rpc("finalize_paypal_payment", {
    p_order_id: payment.orderId,
    p_paypal_order_id: payment.paypalOrderId,
    p_paypal_capture_id: payment.captureId,
    p_paid_amount: payment.amount,
    p_paid_currency: payment.currency,
    p_payer_email: payment.payerEmail || null,
    p_paid_at: payment.paidAt || new Date().toISOString(),
  });

  if (error) throw new Error("Payment could not be finalized.");
  const result = data as { finalized?: boolean; already_paid?: boolean };

  if (result.finalized) {
    await deductCapitalForPaidOrder(payment.orderId);
    try {
      await sendReceipt(payment.orderId);
    } catch (error) {
      console.error("Receipt email failed:", error instanceof Error ? error.message : error);
    }
  }

  return result;
}

export async function getPaypalOrderForUser(orderId: number, userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("id,payment_status,status")
    .eq("id", orderId)
    .eq("user_id", userId)
    .eq("payment_provider", "paypal")
    .single();
  return error ? null : data;
}