require("dotenv").config({ path: ".env.local" });

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`Bloxhop bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (
  message.author.bot &&
  message.author.username !== "Ticket Tool"
)
  return;

  const match = message.content.match(/order\s*id[:\s#-]*(.+)/i);
  if (!match) return;

  const orderId = match[1].trim();

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/orders/lookup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-ticket-secret": process.env.TICKET_LOOKUP_SECRET,
      },
      body: JSON.stringify({ orderId }),
    });

    const data = await res.json();

    if (!data.found) {
      await message.reply(
        `Order ID #${orderId} was not found.\nReason: ${data.message || "Unknown error"}`
      );
      return;
    }

    const order = data.order;

    const items = Array.isArray(order.items)
      ? order.items.map((item) => `• ${item.name} x${item.quantity}`).join("\n")
      : "Items unavailable";

  await message.reply(
  `# ✅ ORDER FOUND\n\n` +

  `## 📦 Order Information\n` +
  `**Order ID:** #${order.id}\n` +
  `**Username:** ${order.username}\n` +
  `**Payment Status:** ${order.paymentStatus}\n` +
  `**Payment Method:** ${order.paymentMethod}\n\n` +

  `## 🛒 Items\n` +
  `${items}\n\n` +

  `## 💰 Payment Summary\n` +
  `**Original Total:** $${Number(order.originalTotal || order.totalPrice).toFixed(2)}\n` +
  `**Coupon:** ${order.couponCode || "None"}\n` +
  `**Discount:** -$${Number(order.couponDiscount || 0).toFixed(2)}\n` +
  "```yaml\n" +
`FINAL TOTAL: $${Number(order.totalPrice).toFixed(2)}\n` +
"```\n\n" +

  `⚠️ Please wait for our delivery team to verify your payment.`
);
  } catch (error) {
    console.error(error);
    await message.reply("Something went wrong while checking your order.");
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);