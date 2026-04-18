import { sendDiscordOrderNotification } from "@/lib/discord";
import { sendEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isValidEmail(value: string | null | undefined) {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      robloxUsername,
      contactInfo,
      notes,
      items,
      totalPrice,
      paypalOrderId,
      paymentStatus,
      payerEmail,
      paidAmount,
      couponCode,
    } = body;

    if (!robloxUsername || !contactInfo || !items?.length) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    if (paypalOrderId) {
      const { data: existing } = await supabase
        .from("orders")
        .select("id")
        .eq("paypal_order_id", paypalOrderId)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: "Duplicate payment detected." },
          { status: 400 }
        );
      }
    }

    let computedTotal = 0;

    for (const item of items) {
      const { data: product, error } = await supabase
        .from("products")
        .select("id, name, price, stock_quantity")
        .eq("id", item.id)
        .single();

      if (error || !product) {
        return NextResponse.json(
          { error: "Invalid product detected." },
          { status: 400 }
        );
      }

      const qty = Number(item.quantity || 1);
      const stock = Number(product.stock_quantity || 0);

      if (qty <= 0 || qty > stock) {
        return NextResponse.json(
          { error: `${product.name} has insufficient stock.` },
          { status: 400 }
        );
      }

      computedTotal += Number(product.price) * qty;
    }

    let finalTotal = computedTotal;
    let appliedDiscount = 0;
    let couponRow: {
      id: string;
      code: string;
      discount_type: "percent" | "fixed";
      discount_value: number;
      is_active: boolean;
      expires_at: string | null;
      usage_limit: number | null;
      used_count: number | null;
    } | null = null;

    if (couponCode) {
      const { data: coupon, error: couponError } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", String(couponCode).toUpperCase())
        .single();

      if (couponError || !coupon) {
        return NextResponse.json({ error: "Invalid coupon." }, { status: 400 });
      }

      if (!coupon.is_active) {
        return NextResponse.json({ error: "Coupon inactive." }, { status: 400 });
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return NextResponse.json({ error: "Coupon expired." }, { status: 400 });
      }

      if (
        coupon.usage_limit !== null &&
        coupon.usage_limit !== undefined &&
        Number(coupon.used_count || 0) >= Number(coupon.usage_limit)
      ) {
        return NextResponse.json(
          { error: "Coupon usage limit reached." },
          { status: 400 }
        );
      }

      if (coupon.discount_type === "percent") {
        appliedDiscount =
          (computedTotal * Number(coupon.discount_value || 0)) / 100;
      } else {
        appliedDiscount = Number(coupon.discount_value || 0);
      }

      finalTotal = Math.max(computedTotal - appliedDiscount, 0);
      couponRow = coupon;
    }

    if (Math.abs(finalTotal - Number(totalPrice)) > 0.01) {
      return NextResponse.json(
        { error: "Price mismatch detected." },
        { status: 400 }
      );
    }

    const isFreeOrder = finalTotal <= 0;
    const isPaidOrder =
      paymentStatus === "Paid" || paymentStatus === "COMPLETED";

    if (!isFreeOrder && (paypalOrderId || isPaidOrder)) {
      if (paidAmount === undefined || paidAmount === null) {
        return NextResponse.json(
          { error: "Missing verified PayPal payment amount." },
          { status: 400 }
        );
      }

      if (Math.abs(finalTotal - Number(paidAmount)) > 0.01) {
        return NextResponse.json(
          { error: "Verified PayPal payment amount does not match order total." },
          { status: 400 }
        );
      }
    }

    const finalPaymentStatus = isPaidOrder
      ? "Paid"
      : isFreeOrder
      ? "Free"
      : paymentStatus ?? "Unpaid";

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          roblox_username: robloxUsername,
          contact_info: contactInfo,
          notes: notes ?? "",
          items,
          total_price: finalTotal,
          status: "Pending",
          paypal_order_id: isFreeOrder ? null : paypalOrderId ?? null,
          payment_status: finalPaymentStatus,
          payer_email: payerEmail ?? null,
          paid_at: isPaidOrder ? new Date().toISOString() : null,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (isPaidOrder || isFreeOrder) {
      for (const item of items) {
        const { data: product } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", item.id)
          .single();

        if (!product) continue;

        const qty = Number(item.quantity || 1);
        const newStock = Math.max(Number(product.stock_quantity || 0) - qty, 0);

        let stockLabel = "In Stock";
        if (newStock === 0) stockLabel = "Out of Stock";
        else if (newStock <= 3) stockLabel = "Limited";

        await supabase
          .from("products")
          .update({
            stock_quantity: newStock,
            stock: stockLabel,
          })
          .eq("id", item.id);
      }

      if (couponRow) {
        await supabase
          .from("coupons")
          .update({
            used_count: Number(couponRow.used_count || 0) + 1,
          })
          .eq("id", couponRow.id);
      }
    }

    const shouldSendEmail =
      data.payment_status === "Paid" || data.payment_status === "Free";

    if (shouldSendEmail) {
      const emailSubject =
        data.payment_status === "Paid"
          ? "Your Bloxhop Payment Has Been Confirmed"
          : "Your Bloxhop Free Order Has Been Received";

      const introText =
        data.payment_status === "Paid"
          ? "Your payment has been confirmed and your order is now in our queue."
          : "Your free order has been received and is now in our queue.";

      const recipients = [payerEmail, contactInfo]
        .filter((value): value is string => isValidEmail(value))
        .map((value) => value.trim().toLowerCase());

      const uniqueRecipients = [...new Set(recipients)];

      if (uniqueRecipients.length > 0) {
        for (const email of uniqueRecipients) {
          try {
            await sendEmail({
              to: email,
              subject: emailSubject,
              html: `
                <div style="margin:0; padding:0; background-color:#f4f4f7; font-family:Arial, sans-serif; color:#111;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f7; padding:30px 0;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
                          <tr>
                            <td style="background:linear-gradient(135deg,#111827,#4f46e5); padding:32px 24px; text-align:center;">
                              <h1 style="margin:0; font-size:28px; color:#ffffff; font-weight:700;">Bloxhop</h1>
                              <p style="margin:10px 0 0; color:#dbeafe; font-size:14px;">
                                Fast & Trusted Blox Fruits Store
                              </p>
                            </td>
                          </tr>

                          <tr>
                            <td style="padding:32px 24px;">
                              <p style="margin:0 0 16px; font-size:16px;">Hi ${data.roblox_username},</p>

                              <p style="margin:0 0 20px; font-size:15px; line-height:1.7; color:#374151;">
                                ${introText}
                              </p>

                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:14px; margin-bottom:24px;">
                                <tr>
                                  <td style="padding:20px;">
                                    <p style="margin:0 0 10px; font-size:14px; color:#6b7280;">Order Details</p>
                                    <p style="margin:0 0 8px; font-size:15px;"><strong>Order ID:</strong> ${data.id}</p>
                                    <p style="margin:0 0 8px; font-size:15px;"><strong>Total:</strong> $${Number(data.total_price).toFixed(2)}</p>
                                    <p style="margin:0 0 8px; font-size:15px;"><strong>Payment Status:</strong> ${data.payment_status}</p>
                                    <p style="margin:0; font-size:15px;"><strong>Sent To:</strong> ${email}</p>
                                  </td>
                                </tr>
                              </table>

                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2ff; border:1px solid #c7d2fe; border-radius:14px; margin-bottom:18px;">
                                <tr>
                                  <td style="padding:18px 20px;">
                                    <p style="margin:0; font-size:15px; line-height:1.7; color:#312e81;">
                                      Please wait up to <strong>3 hours maximum</strong> for your item to be delivered.
                                    </p>
                                  </td>
                                </tr>
                              </table>

                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7ed; border:1px solid #fdba74; border-radius:14px; margin-bottom:24px;">
                                <tr>
                                  <td style="padding:18px 20px;">
                                    <p style="margin:0; font-size:15px; line-height:1.7; color:#9a3412;">
                                      If your item is not delivered after 3 hours, you will be eligible for a refund.
                                    </p>
                                  </td>
                                </tr>
                              </table>

                              <p style="margin:0; font-size:14px; line-height:1.7; color:#6b7280;">
                                Please make sure your contact information is correct so we can reach you if needed.
                              </p>
                            </td>
                          </tr>

                          <tr>
                            <td style="border-top:1px solid #e5e7eb; padding:20px 24px; text-align:center; background:#fafafa;">
                              <p style="margin:0 0 6px; font-size:13px; color:#6b7280;">Bloxhop</p>
                              <p style="margin:0; font-size:12px; color:#9ca3af;">
                                This is a transactional email about your order.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>
              `,
            });
          } catch (emailError) {
            console.error(`POST email failed for ${email}:`, emailError);
          }
        }
      } else {
        console.log("No valid email found for POST order.");
      }
    } else {
      console.log("Skipping order email because payment is not yet confirmed.");
    }

    console.log("Sending Discord webhook:", {
      orderId: data.id,
      paymentStatus: data.payment_status,
      total: data.total_price,
      paypalOrderId: data.paypal_order_id,
    });

    try {
      await sendDiscordOrderNotification({
        orderId: data.id,
        robloxUsername: data.roblox_username || "N/A",
        contactInfo: data.contact_info || "N/A",
        totalPrice: Number(data.total_price) || 0,
        paymentStatus: data.payment_status || "Unknown",
        deliveryStatus: data.delivery_status || "Pending",
        paypalOrderId: data.paypal_order_id || "N/A",
      });
    } catch (discordError) {
      console.error("Discord order notification failed:", discordError);
    }

    return NextResponse.json({
      success: true,
      order: data,
      discountApplied: appliedDiscount,
      finalTotal,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}