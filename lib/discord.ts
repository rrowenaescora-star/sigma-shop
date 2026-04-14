async function sendDiscordWebhook(payload: unknown) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("Missing DISCORD_WEBHOOK_URL");
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Discord webhook failed: ${response.status} ${text}`);
  }
}

function safeText(value: unknown, fallback = "N/A") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text.length > 0 ? text : fallback;
}

export async function sendDiscordOrderNotification(params: {
  orderId: number;
  robloxUsername: string;
  contactInfo: string;
  totalPrice: number;
  paymentStatus?: string | null;
  deliveryStatus?: string | null;
  paypalOrderId?: string | null;
}) {
  const orderId = params.orderId;
  const robloxUsername = safeText(params.robloxUsername);
  const contactInfo = safeText(params.contactInfo);
  const totalPrice = Number(params.totalPrice || 0);
  const paymentStatus = safeText(params.paymentStatus, "Unknown");
  const deliveryStatus = safeText(params.deliveryStatus, "Pending");
  const paypalOrderId = safeText(params.paypalOrderId, "N/A");

  const isFreeOrder =
    paymentStatus.toLowerCase() === "free" || totalPrice <= 0;

  const payload = {
    username: "Bloxhop",
    content: isFreeOrder
      ? `🎁 New free order received: #${orderId}`
      : `🛒 New paid order received: #${orderId}`,
    embeds: [
      {
        title: isFreeOrder ? "New Free Order" : "New Paid Order",
        color: isFreeOrder ? 5763719 : 3447003,
        fields: [
          {
            name: "Order ID",
            value: String(orderId),
            inline: true,
          },
          {
            name: "Roblox Username",
            value: robloxUsername,
            inline: true,
          },
          {
            name: "Contact",
            value: contactInfo,
            inline: false,
          },
          {
            name: "Total",
            value: totalPrice <= 0 ? "FREE" : `$${totalPrice.toFixed(2)}`,
            inline: true,
          },
          {
            name: "Payment Status",
            value: paymentStatus,
            inline: true,
          },
          {
            name: "Delivery Status",
            value: deliveryStatus,
            inline: true,
          },
          {
            name: "PayPal Order ID",
            value: paypalOrderId,
            inline: false,
          },
        ],
        footer: {
          text: isFreeOrder
            ? "Bloxhop Free Order Alert"
            : "Bloxhop Paid Order Alert",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  await sendDiscordWebhook(payload);
}

export async function sendDiscordDeliveredNotification(params: {
  orderId: number;
  robloxUsername: string;
  contactInfo: string;
  totalPrice: number;
  deliveryStatus?: string | null;
  deliveryNotes?: string | null;
  handledBy?: string | null;
}) {
  const orderId = params.orderId;
  const robloxUsername = safeText(params.robloxUsername);
  const contactInfo = safeText(params.contactInfo);
  const totalPrice = Number(params.totalPrice || 0);
  const deliveryStatus = safeText(params.deliveryStatus, "Delivered");
  const deliveryNotes = safeText(params.deliveryNotes, "No delivery notes");
  const handledBy = safeText(params.handledBy, "N/A");

  const payload = {
    username: "Bloxhop",
    content: `📦 Order delivered: #${orderId}`,
    embeds: [
      {
        title: "Order Marked Delivered",
        color: 5763719,
        fields: [
          {
            name: "Order ID",
            value: String(orderId),
            inline: true,
          },
          {
            name: "Roblox Username",
            value: robloxUsername,
            inline: true,
          },
          {
            name: "Contact",
            value: contactInfo,
            inline: false,
          },
          {
            name: "Total",
            value: totalPrice <= 0 ? "FREE" : `$${totalPrice.toFixed(2)}`,
            inline: true,
          },
          {
            name: "Delivery Status",
            value: deliveryStatus,
            inline: true,
          },
          {
            name: "Handled By",
            value: handledBy,
            inline: true,
          },
          {
            name: "Delivery Notes",
            value: deliveryNotes,
            inline: false,
          },
        ],
        footer: {
          text: "Bloxhop Delivery Alert",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  await sendDiscordWebhook(payload);
}