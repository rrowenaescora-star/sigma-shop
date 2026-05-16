require("dotenv").config({ path: ".env.local" });

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// =====================
// CONFIG
// =====================
const INVALID_COOLDOWN_MS = 30 * 1000;
const BUTTON_COOLDOWN_MS = 10 * 1000;
const BLOCK_DURATION_MS = 10 * 60 * 1000;
const ATTEMPT_RESET_MS = 15 * 60 * 1000;
const DUPLICATE_ORDER_LOCK_MS = 5 * 60 * 1000;
const CLEAN_REPLY_COOLDOWN_MS = 30 * 1000;
const AUTO_CLOSE_MS = 2 * 60 * 1000;

const MAX_INVALID_ATTEMPTS = 5;

const invalidAttempts = new Map();
const blockedUsers = new Map();
const lastInvalidLookup = new Map();
const lastButtonClick = new Map();
const lastCleanReply = new Map();
const orderLocks = new Map();
const claimedOrders = new Map();
const orderQueue = [];

function now() {
  return Date.now();
}

function formatTime(ms) {
  const seconds = Math.ceil(ms / 1000);
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}m ${sec}s`;
}

function isStaff(member) {
  if (!member) return false;

  if (
    member.permissions?.has(PermissionsBitField.Flags.Administrator) ||
    member.permissions?.has(PermissionsBitField.Flags.ManageGuild)
  ) {
    return true;
  }

  const staffRoles = (process.env.STAFF_ROLE_IDS || "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  return member.roles.cache.some((role) => staffRoles.includes(role.id));
}

function getQueuePosition(orderId) {
  if (!orderQueue.includes(orderId)) {
    orderQueue.push(orderId);
  }

  return orderQueue.indexOf(orderId) + 1;
}

function removeFromQueue(orderId) {
  const index = orderQueue.indexOf(orderId);
  if (index !== -1) orderQueue.splice(index, 1);
}

function staffOrderButtons(orderId, paid = false) {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`staff_verify:${orderId}`)
      .setLabel("Verify Payment")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`staff_reject:${orderId}`)
      .setLabel("Reject Payment")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId(`staff_claim:${orderId}`)
      .setLabel("Claim Order")
      .setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`staff_delivering:${orderId}`)
      .setLabel("Mark Delivering")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId(`staff_delivered:${orderId}`)
      .setLabel("Mark Delivered")
      .setStyle(ButtonStyle.Success)
  );

  return paid ? [row2] : [row1, row2];
}

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

async function updateOrderStaff(orderId, action, staffName) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/orders/staff-update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-staff-secret": process.env.STAFF_UPDATE_SECRET,
    },
    body: JSON.stringify({
      orderId,
      action,
      staffName,
    }),
  });

  return res.json();
}

async function logSuspicious(message, reason) {
  try {
    const logChannelId = process.env.ADMIN_LOG_CHANNEL_ID;
    if (!logChannelId) return;

    const channel = await client.channels.fetch(logChannelId);
    if (!channel) return;

    await channel.send(
      `# ⚠️ Suspicious Bot Activity\n\n` +
        `**User:** ${message.author.tag}\n` +
        `**User ID:** ${message.author.id}\n` +
        `**Reason:** ${reason}\n` +
        `**Channel:** <#${message.channel.id}>\n` +
        `**Time:** <t:${Math.floor(Date.now() / 1000)}:F>`
    );
  } catch (err) {
    console.error("Log error:", err);
  }
}

function getUserAttemptData(userId) {
  const data = invalidAttempts.get(userId);

  if (!data) {
    return {
      count: 0,
      lastAttemptAt: 0,
      lastOrderId: null,
    };
  }

  if (now() - data.lastAttemptAt > ATTEMPT_RESET_MS) {
    invalidAttempts.delete(userId);
    return {
      count: 0,
      lastAttemptAt: 0,
      lastOrderId: null,
    };
  }

  return data;
}

function addInvalidAttempt(userId, orderId) {
  const data = getUserAttemptData(userId);
  let addCount = data.lastOrderId === orderId ? 2 : 1;

  const updated = {
    count: data.count + addCount,
    lastAttemptAt: now(),
    lastOrderId: orderId,
  };

  invalidAttempts.set(userId, updated);
  lastInvalidLookup.set(userId, now());

  return updated;
}

function resetUserAttempts(userId) {
  invalidAttempts.delete(userId);
  blockedUsers.delete(userId);
  lastInvalidLookup.delete(userId);
}

function isBlocked(userId) {
  const blockedUntil = blockedUsers.get(userId);

  if (!blockedUntil) return false;

  if (now() >= blockedUntil) {
    blockedUsers.delete(userId);
    return false;
  }

  return blockedUntil;
}

function canSendCleanReply(userId, type) {
  const key = `${userId}:${type}`;
  const last = lastCleanReply.get(key) || 0;

  if (now() - last < CLEAN_REPLY_COOLDOWN_MS) return false;

  lastCleanReply.set(key, now());
  return true;
}

client.on("ready", () => {
  console.log(`Bloxhop bot logged in as ${client.user.tag}`);
});

// =====================
// BUTTON INTERACTIONS
// =====================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const staff = isStaff(interaction.member);
  const userId = interaction.user.id;

  if (!staff) {
    const lastClick = lastButtonClick.get(userId) || 0;

    if (now() - lastClick < BUTTON_COOLDOWN_MS) {
      return interaction.reply({
        content: `⚠️ Please wait ${formatTime(
          BUTTON_COOLDOWN_MS - (now() - lastClick)
        )} before clicking again.`,
        ephemeral: true,
      });
    }

    lastButtonClick.set(userId, now());
  }

  const [action, orderId] = interaction.customId.split(":");

  // =====================
  // STAFF BUTTONS
  // =====================
  if (action && action.startsWith("staff_")) {
    if (!staff) {
      return interaction.reply({
        content: "⛔ Only staff can use this button.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      let apiAction = "";
      let customerMessage = "";

      if (action === "staff_verify") {
        apiAction = "verify_payment";
        const queuePosition = getQueuePosition(orderId);

        customerMessage =
          `# ✅ PAYMENT VERIFIED BY STAFF\n\n` +
          `**Order ID:** #${orderId}\n` +
          `**Queue Position:** #${queuePosition}\n\n` +
          `📦 Your order is now queued for delivery.\n` +
          `⏱️ Estimated delivery: within 5-30 minutes.\n\n` +
          `${process.env.DELIVERY_ROLE_ID ? `<@&${process.env.DELIVERY_ROLE_ID}> New verified order is ready for delivery.` : ""}`;
      }

      if (action === "staff_reject") {
        apiAction = "reject_payment";
        customerMessage =
          `# ❌ PAYMENT REJECTED\n\n` +
          `**Order ID:** #${orderId}\n\n` +
          `Staff could not verify this payment.\n` +
          `Please double-check your payment proof or wait for human support.`;
      }

      if (action === "staff_claim") {
        apiAction = "claim_order";
        claimedOrders.set(orderId, interaction.user.tag);

        customerMessage =
          `# 📦 ORDER CLAIMED\n\n` +
          `**Order ID:** #${orderId}\n` +
          `**Claimed By:** ${interaction.user.tag}\n\n` +
          `A deliverer is now handling your order.`;
      }

      if (action === "staff_delivering") {
        apiAction = "mark_delivering";
        customerMessage =
          `# 🚚 DELIVERY STARTED\n\n` +
          `**Order ID:** #${orderId}\n\n` +
          `Your order is now being delivered. Please stay ready in Roblox.`;
      }

      if (action === "staff_delivered") {
        apiAction = "mark_delivered";
        removeFromQueue(orderId);

        customerMessage =
          `# ✅ ORDER DELIVERED\n\n` +
          `**Order ID:** #${orderId}\n\n` +
          `Thank you for shopping at Bloxhop!\n\n` +
          `${process.env.VOUCH_CHANNEL_ID ? `⭐ Please leave a vouch here: <#${process.env.VOUCH_CHANNEL_ID}>` : "⭐ Please leave a vouch in our review channel."}\n\n` +
          `This ticket may close automatically in 2 minutes.`;
      }

      const result = await updateOrderStaff(orderId, apiAction, interaction.user.tag);

      if (!result.success) {
        return interaction.editReply(
          `❌ Failed to update order.\n\nReason: ${result.message || "Unknown error"}`
        );
      }

      await interaction.editReply(customerMessage);

      if (action === "staff_delivered") {
        setTimeout(async () => {
          try {
            if (interaction.channel && interaction.channel.deletable) {
              await interaction.channel.delete("Order delivered. Auto closing ticket.");
            }
          } catch (err) {
            console.error("Auto close failed:", err);
          }
        }, AUTO_CLOSE_MS);
      }

      return;
    } catch (error) {
      console.error(error);
      return interaction.editReply("❌ Something went wrong while updating the order.");
    }
  }

  // =====================
  // NORMAL CUSTOMER BUTTONS
  // =====================
  if (interaction.customId === "paid_yes") {
    return interaction.reply({
      content: "📦 Please send your Order ID.\n\nExample:\n`order id: BH12345`",
      ephemeral: true,
    });
  }

  if (interaction.customId === "payment_methods") {
    return interaction.reply({
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
    return interaction.reply({
      content: "📦 Please send your Order ID to track your order.\n\nExample:\n`order id: BH12345`",
      ephemeral: true,
    });
  }

  if (interaction.customId === "human_support") {
    return interaction.reply({
      content: "👤 A support staff member will assist you shortly.\n\nPlease describe your issue while waiting.",
      ephemeral: false,
    });
  }

  if (interaction.customId === "gcash_qr") {
    return interaction.reply({
      content: "# 💳 GCash Payment QR\n\nScan the QR code below to pay.",
      files: ["./assets/gcash-qr.png"],
      ephemeral: true,
    });
  }

  if (interaction.customId === "maya_qr") {
    return interaction.reply({
      content: "# 💳 Maya Payment QR\n\nScan the QR code below to pay.",
      files: ["./assets/maya-qr.png"],
      ephemeral: true,
    });
  }
});

// =====================
// MESSAGE HANDLER
// =====================
client.on("messageCreate", async (message) => {
  if (message.author.bot && message.author.username !== "Ticket Tool") return;

  const content = message.content.toLowerCase();
  const userId = message.author.id;
  const staff = isStaff(message.member);

  if (content.includes("@everyone") || content.includes("@here")) return;

  // Screenshot / payment proof detection
  if (!message.author.bot && message.attachments.size > 0) {
    const hasImage = message.attachments.some((file) => {
      const name = file.name?.toLowerCase() || "";
      const type = file.contentType?.toLowerCase() || "";
      return type.startsWith("image/") || /\.(png|jpg|jpeg|webp)$/i.test(name);
    });

    if (hasImage) {
      await message.reply({
        content:
          `# 📸 PAYMENT PROOF RECEIVED\n\n` +
          `Staff will review your screenshot shortly.\n\n` +
          `${process.env.DELIVERY_ROLE_ID ? `<@&${process.env.DELIVERY_ROLE_ID}> Payment proof needs review.` : ""}\n\n` +
          `Staff: ask for the customer's Order ID if it is not included.`,
      });
    }
  }

  // Support menu
  if (
    content.includes("support") ||
    content.includes("help") ||
    content.includes("paid") ||
    content.includes("payment") ||
    content.includes("order")
  ) {
    const hasOrderId = /order\s*id[:\s#-]*(.+)/i.test(message.content);

    if (!hasOrderId && canSendCleanReply(userId, "support_menu")) {
      await message.reply({
        content:
          "# 👋 Welcome to Bloxhop Support\n\n" +
          "Please choose an option below.",
        components: [supportButtons()],
      });
      return;
    }
  }

  // Payment menu
  if (
    content.includes("gcash") ||
    content.includes("maya") ||
    content.includes("paypal") ||
    content.includes("qr")
  ) {
    if (canSendCleanReply(userId, "payment_menu")) {
      await message.reply({
        content:
          "# 💳 Payment Help\n\n" +
          "Choose your payment QR below.\n\n" +
          "⚠️ Please only pay using official Bloxhop payment details.",
        components: [qrButtons()],
      });
    }
    return;
  }

  // Order ID checker
  const match = message.content.match(/order\s*id[:\s#-]*(.+)/i);
  if (!match) return;

  const orderId = match[1].trim();

  if (!staff) {
    const blockedUntil = isBlocked(userId);

    if (blockedUntil) {
      return message.reply(
        `# ⛔ TEMPORARILY BLOCKED\n\n` +
          `Too many invalid order attempts.\n\n` +
          `Please try again in **${formatTime(blockedUntil - now())}**.`
      );
    }

    const lastInvalid = lastInvalidLookup.get(userId) || 0;

    if (now() - lastInvalid < INVALID_COOLDOWN_MS) {
      return;
    }
  }

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
      if (!staff) {
        const attemptData = addInvalidAttempt(userId, orderId);

        if (attemptData.count >= MAX_INVALID_ATTEMPTS) {
          blockedUsers.set(userId, now() + BLOCK_DURATION_MS);

          await logSuspicious(
            message,
            `Blocked for invalid order spam. Order ID: ${orderId}`
          );

          return message.reply(
            `# ⛔ TEMPORARILY BLOCKED\n\n` +
              `Too many invalid order attempts.\n\n` +
              `You can try again in **10 minutes**.`
          );
        }

        if (attemptData.count >= 4) {
          await logSuspicious(
            message,
            `Final warning for invalid order attempts. Order ID: ${orderId}`
          );

          return message.reply(
            `# ⚠️ FINAL WARNING\n\n` +
              `Order ID #${orderId} was not found.\n\n` +
              `Invalid attempts: **${attemptData.count}/${MAX_INVALID_ATTEMPTS}**\n\n` +
              `One more fake/wrong attempt may temporarily block order lookup.`
          );
        }
      }

      return message.reply(
        `# ❌ ORDER NOT FOUND\n\n` +
          `Order ID #${orderId} was not found.\n\n` +
          `Reason: ${data.message || "Unknown error"}`
      );
    }

    const order = data.order;
    const orderLock = orderLocks.get(order.id);

    if (
      !staff &&
      orderLock &&
      orderLock.userId !== userId &&
      now() < orderLock.expiresAt
    ) {
      await logSuspicious(
        message,
        `Different user tried checking locked order. Order ID: ${order.id}`
      );

      return message.reply(
        `# ⚠️ ORDER ALREADY BEING CHECKED\n\n` +
          `This order was recently checked by another user.\n\n` +
          `Please contact human support if this is your order.`
      );
    }

    orderLocks.set(order.id, {
      userId,
      expiresAt: now() + DUPLICATE_ORDER_LOCK_MS,
    });

    const items = Array.isArray(order.items)
      ? order.items.map((item) => `• ${item.name} x${item.quantity}`).join("\n")
      : "Items unavailable";

    const paymentStatus = String(order.paymentStatus || "").toLowerCase();

    const isPaid =
      Boolean(order.paid_at) ||
      paymentStatus === "paid" ||
      paymentStatus === "completed" ||
      paymentStatus === "success";

    if (!isPaid) {
      return message.reply({
        content:
          `# ⚠️ PAYMENT NOT VERIFIED\n\n` +
          `**Order ID:** #${order.id}\n` +
          `**Username:** ${order.username || "Unknown"}\n` +
          `**Payment Method:** ${order.paymentMethod || "Unknown"}\n` +
          `**Payment Status:** ${order.paymentStatus || "Pending"}\n\n` +
          `We could not confirm your payment yet.\n\n` +
          `If you already paid, upload your payment screenshot and wait for staff review.`,
        components: staffOrderButtons(order.id, false),
      });
    }

    resetUserAttempts(userId);

    const queuePosition = getQueuePosition(order.id);

    await message.reply({
      content:
        `# ✅ PAYMENT VERIFIED\n\n` +
        `## 📦 Order Information\n` +
        `**Order ID:** #${order.id}\n` +
        `**Username:** ${order.username || "Unknown"}\n` +
        `**Payment Status:** ${order.paymentStatus || "Paid"}\n` +
        `**Payment Method:** ${order.paymentMethod || "Unknown"}\n` +
        `**Queue Position:** #${queuePosition}\n\n` +
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
        `⏱️ Estimated delivery: within 5-30 minutes.\n\n` +
        `${process.env.DELIVERY_ROLE_ID ? `<@&${process.env.DELIVERY_ROLE_ID}> New paid order ready for delivery.` : ""}`,
      components: staffOrderButtons(order.id, true),
    });
  } catch (error) {
    console.error(error);
    await message.reply("Something went wrong while checking your order.");
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);