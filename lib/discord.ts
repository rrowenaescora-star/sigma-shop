export async function sendDiscordOrderNotification(params: {
  orderId: number;
  robloxUsername: string;
  contactInfo: string;
  totalPrice: number;
  paymentStatus?: string | null;
  deliveryStatus?: string | null;
  paypalOrderId?: string | null;
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("Missing DISCORD_WEBHOOK_URL");
  }

  const {
    orderId,
    robloxUsername,
    contactInfo,
    totalPrice,
    paymentStatus,
    deliveryStatus,
    paypalOrderId,
  } = params;

  const payload = {
    username: "REAL Shop",
    content: `🛒 New order received: #${orderId}`,
    embeds: [
      {
        title: "New Paid Order",
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
            value: `$${Number(totalPrice).toFixed(2)}`,
            inline: true,
          },
          {
            name: "Payment Status",
            value: paymentStatus || "Unknown",
            inline: true,
          },
          {
            name: "Delivery Status",
            value: deliveryStatus || "Pending",
            inline: true,
          },
          {
            name: "PayPal Order ID",
            value: paypalOrderId || "N/A",
            inline: false,
          },
        ],
        footer: {
          text: "REAL Shop Order Alert",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Discord webhook failed: ${text}`);
  }
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
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("Missing DISCORD_WEBHOOK_URL");
  }

  const {
    orderId,
    robloxUsername,
    contactInfo,
    totalPrice,
    deliveryStatus,
    deliveryNotes,
    handledBy,
  } = params;

  const payload = {
    username: "REAL Shop",
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
            value: `$${Number(totalPrice).toFixed(2)}`,
            inline: true,
          },
          {
            name: "Delivery Status",
            value: deliveryStatus || "Delivered",
            inline: true,
          },
          {
            name: "Handled By",
            value: handledBy || "N/A",
            inline: true,
          },
          {
            name: "Delivery Notes",
            value: deliveryNotes || "No delivery notes",
            inline: false,
          },
        ],
        footer: {
          text: "REAL Shop Delivery Alert",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Discord webhook failed: ${text}`);
  }
}
