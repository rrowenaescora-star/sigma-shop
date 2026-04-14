<<<<<<< HEAD
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

=======
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
export async function sendDiscordOrderNotification(params: {
  orderId: number;
  robloxUsername: string;
  contactInfo: string;
  totalPrice: number;
  paymentStatus?: string | null;
  deliveryStatus?: string | null;
  paypalOrderId?: string | null;
}) {
<<<<<<< HEAD
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
=======
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
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
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
<<<<<<< HEAD
            value: totalPrice <= 0 ? "FREE" : `$${totalPrice.toFixed(2)}`,
=======
            value: `$${Number(totalPrice).toFixed(2)}`,
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
            inline: true,
          },
          {
            name: "Payment Status",
<<<<<<< HEAD
            value: paymentStatus,
=======
            value: paymentStatus || "Unknown",
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
            inline: true,
          },
          {
            name: "Delivery Status",
<<<<<<< HEAD
            value: deliveryStatus,
=======
            value: deliveryStatus || "Pending",
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
            inline: true,
          },
          {
            name: "PayPal Order ID",
<<<<<<< HEAD
            value: paypalOrderId,
=======
            value: paypalOrderId || "N/A",
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
            inline: false,
          },
        ],
        footer: {
<<<<<<< HEAD
          text: isFreeOrder
            ? "Bloxhop Free Order Alert"
            : "Bloxhop Paid Order Alert",
=======
          text: "REAL Shop Order Alert",
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

<<<<<<< HEAD
  await sendDiscordWebhook(payload);
=======
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
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
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
<<<<<<< HEAD
  const orderId = params.orderId;
  const robloxUsername = safeText(params.robloxUsername);
  const contactInfo = safeText(params.contactInfo);
  const totalPrice = Number(params.totalPrice || 0);
  const deliveryStatus = safeText(params.deliveryStatus, "Delivered");
  const deliveryNotes = safeText(params.deliveryNotes, "No delivery notes");
  const handledBy = safeText(params.handledBy, "N/A");

  const payload = {
    username: "Bloxhop",
=======
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
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
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
<<<<<<< HEAD
            value: totalPrice <= 0 ? "FREE" : `$${totalPrice.toFixed(2)}`,
=======
            value: `$${Number(totalPrice).toFixed(2)}`,
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
            inline: true,
          },
          {
            name: "Delivery Status",
<<<<<<< HEAD
            value: deliveryStatus,
=======
            value: deliveryStatus || "Delivered",
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
            inline: true,
          },
          {
            name: "Handled By",
<<<<<<< HEAD
            value: handledBy,
=======
            value: handledBy || "N/A",
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
            inline: true,
          },
          {
            name: "Delivery Notes",
<<<<<<< HEAD
            value: deliveryNotes,
=======
            value: deliveryNotes || "No delivery notes",
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
            inline: false,
          },
        ],
        footer: {
<<<<<<< HEAD
          text: "Bloxhop Delivery Alert",
=======
          text: "REAL Shop Delivery Alert",
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

<<<<<<< HEAD
  await sendDiscordWebhook(payload);
}
=======
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
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
