import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID." }, { status: 400 });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const customerEmail = order.payer_email || order.contact_info;

    if (!customerEmail || !isValidEmail(customerEmail)) {
      return NextResponse.json(
        { error: "No valid customer email found for this order." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const headerUrl = `${appUrl}/header-email.png`;
    const fallbackImage = `${appUrl}/logo.png`;
    const finishOrderLink = `${appUrl}/checkout?orderId=${order.id}`;

    const orderDate = order.created_at
      ? new Date(order.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Today";

    const itemsHtml = (order.items || [])
      .map((item: any) => {
        const itemImage =
          item.image_url || item.imageUrl || item.image || fallbackImage;

        const itemName = item.name || item.title || "Purchased Item";
        const itemQty = item.quantity || item.qty || 1;
        const itemPrice = Number(item.price || item.total || 0).toFixed(2);

        return `
          <div style="border:1px solid #e5e7eb; border-radius:14px; padding:14px; margin-bottom:12px; background:#ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="62" valign="middle">
                  <img
                    src="${itemImage}"
                    alt="${itemName}"
                    width="52"
                    height="52"
                    style="display:block; border-radius:10px; object-fit:cover; background:#0f172a; border:0;"
                  />
                </td>

                <td valign="middle" style="padding-left:12px;">
                  <p style="margin:0; font-size:14px; font-weight:800; color:#111827;">
                    ${itemName}
                  </p>

                  <p style="margin:6px 0 0 0; font-size:12px; color:#64748b;">
                    Quantity: ${itemQty}
                  </p>
                </td>

                <td align="right" valign="middle" style="font-size:16px; font-weight:900; color:#f59e0b;">
                  $${itemPrice}
                </td>
              </tr>
            </table>
          </div>
        `;
      })
      .join("");

    try {
  await transporter.sendMail({
      from: `"Bloxhop" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Your Bloxhop Order #${order.id} Was Received`,
      html: `
        <div style="margin:0; padding:0; background:#eaf0ff; font-family:Arial, Helvetica, sans-serif; color:#111827;">
          <div style="max-width:720px; margin:0 auto; padding:0; background:#ffffff; overflow:hidden;">

            <!-- HEADER IMAGE -->
            <img
              src="${headerUrl}"
              alt="Bloxhop"
              width="720"
              style="display:block; width:100%; max-width:720px; border:0; outline:none; text-decoration:none;"
            />

            <!-- BODY -->
            <div style="padding:34px 38px 28px 38px;">

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td valign="top">
                    <h1 style="margin:0 0 14px 0; font-size:28px; line-height:1.2; color:#111827;">
                      Your order was received!
                    </h1>

                    <p style="margin:0 0 12px 0; font-size:14px;">
                      Hello <b style="color:#f59e0b;">${order.roblox_username}</b>,
                    </p>

                    <p style="margin:0; font-size:14px; color:#374151;">
                      We received your Bloxhop order successfully.
                    </p>
                  </td>

                  <td align="right" valign="top" width="190">
                    <a
                      href="${finishOrderLink}"
                      style="display:inline-block; background:#fb923c; color:#ffffff; padding:15px 22px; border-radius:10px; text-decoration:none; font-weight:900; font-size:15px;"
                    >
                      Finish My Order
                    </a>
                  </td>
                </tr>
              </table>

              <div style="border:1px solid #e5e7eb; border-radius:14px; padding:18px 20px; margin-bottom:26px; background:#ffffff;">
                <p style="margin:0 0 18px 0; font-size:15px; font-weight:900; color:#111827;">
                  ORDER DETAILS
                </p>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:12px; color:#64748b;">Order ID</td>
                    <td style="font-size:12px; color:#64748b;">Order Date</td>
                    <td style="font-size:12px; color:#64748b;">Status</td>
                    <td align="right" style="font-size:12px; color:#64748b;">Total</td>
                  </tr>

                  <tr>
                    <td style="padding-top:8px; font-size:18px; font-weight:900; color:#f59e0b;">
                      #${order.id}
                    </td>

                    <td style="padding-top:8px; font-size:14px; font-weight:700; color:#111827;">
                      ${orderDate}
                    </td>

                    <td style="padding-top:8px;">
                      <span style="display:inline-block; background:#fff7ed; color:#f59e0b; border:1px solid #fed7aa; padding:6px 10px; border-radius:999px; font-size:11px; font-weight:900;">
                        PENDING CONFIRMATION
                      </span>
                    </td>

                    <td align="right" style="padding-top:8px; font-size:22px; font-weight:900; color:#f59e0b;">
                      $${Number(order.total_price || 0).toFixed(2)}
                    </td>
                  </tr>
                </table>
              </div>

              <div style="margin-bottom:22px;">
                <p style="margin:0 0 14px 0; font-size:16px; font-weight:900; color:#111827;">
                  PURCHASED ITEMS
                </p>

                ${
                  itemsHtml ||
                  `<p style="font-size:14px; color:#64748b;">No item details found.</p>`
                }
              </div>

              <div style="border:1px solid #fed7aa; background:#fff7ed; border-radius:12px; padding:16px; margin-bottom:16px;">
                <p style="margin:0; font-size:13px; line-height:1.6; color:#111827;">
                  <b style="color:#f59e0b;">Important:</b>
                  To finish your order and confirm that you are ready to receive your item, please click the button above.
                </p>
              </div>

              <div style="border:1px solid #e5e7eb; background:#f8fafc; border-radius:12px; padding:16px; margin-bottom:26px;">
                <p style="margin:0; font-size:13px; line-height:1.6; color:#111827;">
                  This confirmation helps us avoid fake or spam orders. Once confirmed, our support team will process your delivery.
                </p>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb; padding-top:20px; margin-bottom:10px;">
                <tr>
                  <td width="33%" valign="top" style="padding-right:14px;">
                    <p style="margin:0 0 6px 0; font-size:13px; font-weight:900;">
                      FAST DELIVERY
                    </p>
                    <p style="margin:0; font-size:12px; color:#64748b; line-height:1.5;">
                      We deliver your items as fast as possible.
                    </p>
                  </td>

                  <td width="33%" valign="top" style="padding:0 14px; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;">
                    <p style="margin:0 0 6px 0; font-size:13px; font-weight:900;">
                      SECURE ORDERS
                    </p>
                    <p style="margin:0; font-size:12px; color:#64748b; line-height:1.5;">
                      Your orders are safe and protected.
                    </p>
                  </td>

                  <td width="33%" valign="top" style="padding-left:14px;">
                    <p style="margin:0 0 6px 0; font-size:13px; font-weight:900;">
                      24/7 SUPPORT
                    </p>
                    <p style="margin:0; font-size:12px; color:#64748b; line-height:1.5;">
                      Our support team is always here to help.
                    </p>
                  </td>
                </tr>
              </table>
            </div>

            <div style="background:#050b16; border-top:5px solid #f59e0b; padding:22px 24px; text-align:center; color:#cbd5e1;">
              <p style="margin:0 0 10px 0; font-size:13px;">
                Thank you for ordering from Bloxhop!
              </p>

              <p style="margin:0; font-size:11px; color:#94a3b8;">
                © ${new Date().getFullYear()} Bloxhop. All rights reserved.
              </p>
            </div>

          </div>
        </div>
      `,
  });
} catch (mailError: any) {
  console.error("Email send failed:", mailError?.message);

  return NextResponse.json(
    {
      error: "Customer email address is invalid or unavailable.",
    },
    { status: 400 }
  );
}

    await supabase
      .from("orders")
      .update({
        delivery_notes: "Order received email sent.",
      })
      .eq("id", order.id);

    return NextResponse.json({
      success: true,
      message: "Order received email sent.",
    });
  } catch (error) {
    console.error("Send received email error:", error);

    return NextResponse.json(
      { error: "Server error while sending email." },
      { status: 500 }
    );
  }
}