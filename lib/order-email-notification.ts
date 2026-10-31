import { sendEmail } from "@/lib/email";

const recipients = ["hardgamer@gmail.com", "ramonescora12@gmail.com"];

type OrderItem = { name?: unknown; quantity?: unknown; price?: unknown };

type OrderAlert = {
  orderId: number | string;
  robloxUsername: string;
  contactInfo: string;
  totalPrice: number;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  items?: OrderItem[] | null;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendOrderEmailNotification(order: OrderAlert) {
  const itemRows = (order.items || []).map((item) => {
    const name = escapeHtml(item.name || "Digital item");
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const price = Number(item.price) || 0;
    return `<li>${name} × ${quantity} — $${(price * quantity).toFixed(2)}</li>`;
  }).join("");

  const html = `<div style="font-family:Arial,sans-serif;color:#172033"><h2>New Bloxhop order #${escapeHtml(order.orderId)}</h2><p><strong>Roblox username:</strong> ${escapeHtml(order.robloxUsername)}</p><p><strong>Customer contact:</strong> ${escapeHtml(order.contactInfo)}</p><p><strong>Total:</strong> $${Number(order.totalPrice || 0).toFixed(2)}</p><p><strong>Payment:</strong> ${escapeHtml(order.paymentMethod || "N/A")} · ${escapeHtml(order.paymentStatus || "Pending")}</p><h3>Items</h3><ul>${itemRows || "<li>Order items unavailable</li>"}</ul><p><a href="https://bloxhop.com/admin/orders">Open the admin orders page</a></p></div>`;
  const subject = `New Bloxhop order #${order.orderId}`;

  const results = await Promise.allSettled(
    recipients.map((to) => sendEmail({ to, subject, html }))
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`Order alert email failed for ${recipients[index]}:`, result.reason);
    }
  });
}
