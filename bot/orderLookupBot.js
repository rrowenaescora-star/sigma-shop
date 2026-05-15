require("dotenv").config({ path: ".env.local" });

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

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

// ✅ Main support buttons
function supportButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("paid_yes")
      .setLabel("Yes, I Already Paid")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("payment_methods")
      .setLabel("Payment Methods")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("track_order")
      .setLabel("Track Order")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("human_support")
      .setLabel("Human Support")
      .setStyle(ButtonStyle.Danger)
  );
}

// ✅ QR buttons
function qrButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("gcash_qr")
      .setLabel("GCash QR")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("maya_qr")
      .setLabel("Maya QR")
      .setStyle(ButtonStyle.Primary)
  );
}

// ✅ Button interactions
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "paid_yes") {
    await interaction.reply({
      content:
        "📦 Please send your Order ID.\n\nExample:\n`order id: BH12345`",
      ephemeral: true,
    });
  }

  if (interaction.customId === "payment_methods") {
    await interaction.reply({
      content:
        "# 💳 Payment Methods\n\n" +
        "We currently accept:\n" +
        "• GCash\n" +
        "• Maya\n" +
        "• PayPal\n\n" +
        "Choose a QR option below if you need it.\n\n" +
        "⚠️ Only pay through official Bloxhop instructions.",
      components: [qrButtons()],
      ephemeral: true,
    });
  }

  if (interaction.customId === "track_order") {
    await interaction.reply({
      content:
        "📦 Please send your Order ID to track your order.\n\nExample:\n`order id: BH12345`",
      ephemeral: true,
    });
  }

  if (interaction.customId === "human_support") {
    await interaction.reply({
      content:
        "👤 A support staff member will assist you shortly.\n\nPlease describe your issue while waiting.",
      ephemeral: false,
    });
  }

  if (interaction.customId === "gcash_qr") {
    await interaction.reply({
      content:
        "# 💳 GCash Payment QR\n\nScan the QR code below to pay.",
      files: ["./assets/gcash-qr.png"],
      ephemeral: true,
    });
  }

  if (interaction.customId === "maya_qr") {
    await interaction.reply({
      content:
        "# 💳 Maya Payment QR\n\nScan the QR code below to pay.",
      files: ["./assets/maya-qr.png"],
      ephemeral: true,
    });
  }
});

client.on("messageCreate", async (message) => {
// ✅ ONLY RESPOND INSIDE TICKET CATEGORY
const allowedCategoryId = "1492008548148973598";

if (message.channel.parentId !== allowedCategoryId) {
  return;
}
  if (message.author.bot && message.author.username !== "Ticket Tool") return;

  const content = message.content.toLowerCase();

  // ✅ Auto support menu
  if (
    content.includes("support") ||
    content.includes("help") ||
    content.includes("paid") ||
    content.includes("payment") ||
    content.includes("order")
  ) {
    const hasOrderId = /order\s*id[:\s#-]*(.+)/i.test(message.content);

    if (!hasOrderId) {
      await message.reply({
        content:
          "# 👋 Welcome to Bloxhop Support\n\n" +
          "Please choose an option below.",
        components: [supportButtons()],
      });
      return;
    }
  }

  // ✅ Auto payment response
  if (
    content.includes("gcash") ||
    content.includes("maya") ||
    content.includes("paypal") ||
    content.includes("qr")
  ) {
    await message.reply({
      content:
        "# 💳 Payment Help\n\n" +
        "Choose your payment QR below.\n\n" +
        "⚠️ Please only pay using official Bloxhop payment details.",
      components: [qrButtons()],
    });
    return;
  }

  // ✅ Order ID checker
  const match = message.content.match(/order\s*id[:\s#-]*(.+)/i);
  if (!match) return;

  const orderId = match[1].trim();

  await message.reply(`🔎 Checking Order ID #${orderId}...`);

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
        `# ❌ ORDER NOT FOUND\n\n` +
        `Order ID #${orderId} was not found.\n\n` +
        `Reason: ${data.message || "Unknown error"}`
      );
      return;
    }

    const order = data.order;

    const items = Array.isArray(order.items)
      ? order.items.map((item) => `• ${item.name} x${item.quantity}`).join("\n")
      : "Items unavailable";

    const paymentStatus = String(order.paymentStatus || "").toLowerCase();
    const isPaid =
      Boolean(order.paid_at) ||
      paymentStatus === "paid" ||
      paymentStatus === "completed" ||
      paymentStatus === "success";

    // ✅ If customer claims paid but not verified
    if (!isPaid) {
      await message.reply(
        `# ⚠️ PAYMENT NOT VERIFIED\n\n` +
        `**Order ID:** #${order.id}\n` +
        `**Username:** ${order.username || "Unknown"}\n` +
        `**Payment Method:** ${order.paymentMethod || "Unknown"}\n` +
        `**Payment Status:** ${order.paymentStatus || "Pending"}\n\n` +
        `We could not confirm your payment yet.\n\n` +
        `Possible reasons:\n` +
        `• Payment is still processing\n` +
        `• Payment was not completed\n` +
        `• Wrong Order ID was sent\n\n` +
        `If you already paid, please wait a few minutes and send your Order ID again.`
      );
      return;
    }

    // ✅ Paid order response
    await message.reply(
      `# ✅ PAYMENT VERIFIED\n\n` +

      `## 📦 Order Information\n` +
      `**Order ID:** #${order.id}\n` +
      `**Username:** ${order.username || "Unknown"}\n` +
      `**Payment Status:** ${order.paymentStatus || "Paid"}\n` +
      `**Payment Method:** ${order.paymentMethod || "Unknown"}\n` +
      `**Paid At:** ${order.paid_at || "Verified"}\n\n` +

      `## 🛒 Items\n` +
      `${items}\n\n` +

      `## 💰 Payment Summary\n` +
      `**Original Total:** $${Number(order.originalTotal || order.totalPrice).toFixed(2)}\n` +
      `**Coupon:** ${order.couponCode || "None"}\n` +
      `**Discount:** -$${Number(order.couponDiscount || 0).toFixed(2)}\n` +
      "```yaml\n" +
      `FINAL TOTAL: $${Number(order.totalPrice).toFixed(2)}\n` +
      "```\n\n" +

      `📦 Your order is now queued for delivery.\n` +
      `⏱️ Estimated delivery: within 5-30 minutes.`
    );
  } catch (error) {
    console.error(error);
    await message.reply("Something went wrong while checking your order.");
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);