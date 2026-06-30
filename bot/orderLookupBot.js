require("dotenv").config({ path: ".env.local" });

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const INVALID_COOLDOWN_MS = 30 * 1000;
const BUTTON_COOLDOWN_MS = 10 * 1000;
const BLOCK_DURATION_MS = 10 * 60 * 1000;
const ATTEMPT_RESET_MS = 15 * 60 * 1000;
const DUPLICATE_ORDER_LOCK_MS = 5 * 60 * 1000;
const CLEAN_REPLY_COOLDOWN_MS = 30 * 1000;
const AUTO_CLOSE_MS = 2 * 60 * 1000;
const MAX_INVALID_ATTEMPTS = 5;

const PAYPAL_EMAIL = "Johnmonescora456@gmail.com";

const invalidAttempts = new Map();
const blockedUsers = new Map();
const lastInvalidLookup = new Map();
const lastButtonClick = new Map();
const lastCleanReply = new Map();
const orderLocks = new Map();
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
  if (!orderQueue.includes(orderId)) orderQueue.push(orderId);
  return orderQueue.indexOf(orderId) + 1;
}

function removeFromQueue(orderId) {
  const index = orderQueue.indexOf(orderId);
  if (index !== -1) orderQueue.splice(index, 1);
}

function staffOrderButtons(orderId, stage = "unpaid") {
  if (stage === "unpaid") {
    return [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`staff_verify:${orderId}`)
          .setLabel("Verify Payment")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId(`staff_reject:${orderId}`)
          .setLabel("Reject Payment")
          .setStyle(ButtonStyle.Danger),
      ),
    ];
  }

  if (stage === "verified") {
    return [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`staff_claim:${orderId}`)
          .setLabel("Claim Order")
          .setStyle(ButtonStyle.Primary),
      ),
    ];
  }

  if (stage === "claimed") {
    return [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`staff_delivering:${orderId}`)
          .setLabel("Mark Delivering")
          .setStyle(ButtonStyle.Secondary),
      ),
    ];
  }

  if (stage === "delivering") {
    return [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`staff_delivered:${orderId}`)
          .setLabel("Mark Delivered")
          .setStyle(ButtonStyle.Success),
      ),
    ];
  }

  return [];
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
      .setStyle(ButtonStyle.Danger),
  );
}

function paypalButton() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("paypal_payment")
      .setLabel("PayPal Instructions")
      .setStyle(ButtonStyle.Primary),
  );
}

async function updateOrderStaff(orderId, action, staffName) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/orders/staff-update`,
    {
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
    },
  );

  return res.json();
}

async function sendDeliveredEmail(orderId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/orders/send-delivered-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
      }),
    },
  );

  return res.json();
}

async function lookupOrder(orderId) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/orders/lookup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ticket-secret": process.env.TICKET_LOOKUP_SECRET,
    },
    body: JSON.stringify({ orderId }),
  });

  return res.json();
}

function formatItems(order) {
  return Array.isArray(order.items)
    ? order.items.map((item) => `• ${item.name} x${item.quantity}`).join("\n")
    : "Items unavailable";
}

function isOrderPaid(order) {
  const paymentStatus = String(order.paymentStatus || "").toLowerCase();

  return (
    Boolean(order.paid_at) ||
    Boolean(order.paidAt) ||
    paymentStatus === "paid" ||
    paymentStatus === "completed" ||
    paymentStatus === "success"
  );
}

function orderStatusMessage(order) {
  const items = formatItems(order);
  const paymentStatus = String(order.paymentStatus || "Pending");
  const deliveryStatus = String(order.deliveryStatus || order.status || "Pending");

  return (
    `# 📦 ORDER STATUS\n\n` +
    `**Order ID:** #${order.id}\n` +
    `**Username:** ${order.username || "Unknown"}\n` +
    `**Payment Method:** ${order.paymentMethod || "Unknown"}\n` +
    `**Payment Status:** ${paymentStatus}\n` +
    `**Delivery Status:** ${deliveryStatus}\n\n` +
    `## 🛒 Items\n` +
    `${items}\n\n` +
    `## 💰 Total\n` +
    `**$${Number(order.totalPrice || 0).toFixed(2)}**`
  );
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
        `**Time:** <t:${Math.floor(Date.now() / 1000)}:F>`,
    );
  } catch (err) {
    console.error("Log error:", err);
  }
}

function getUserAttemptData(userId) {
  const data = invalidAttempts.get(userId);

  if (!data) return { count: 0, lastAttemptAt: 0, lastOrderId: null };

  if (now() - data.lastAttemptAt > ATTEMPT_RESET_MS) {
    invalidAttempts.delete(userId);
    return { count: 0, lastAttemptAt: 0, lastOrderId: null };
  }

  return data;
}

function addInvalidAttempt(userId, orderId) {
  const data = getUserAttemptData(userId);
  const addCount = data.lastOrderId === orderId ? 2 : 1;

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

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton() && !interaction.isModalSubmit()) return;

  const staff = isStaff(interaction.member);
  const userId = interaction.user.id;

  if (interaction.isModalSubmit()) {
    if (interaction.customId === "track_order_modal") {
      const orderId = interaction.fields.getTextInputValue("order_id_input").trim();

      await interaction.deferReply({ ephemeral: true });

      try {
        const data = await lookupOrder(orderId);

        if (!data.found) {
          return interaction.editReply(
            `# ❌ ORDER NOT FOUND\n\n` +
              `Order ID #${orderId} was not found.\n\n` +
              `Please check your Order ID and try again.`,
          );
        }

        const order = data.order;

        return interaction.editReply({
          content:
            orderStatusMessage(order) +
            `\n\n${
              isOrderPaid(order)
                ? "✅ Your payment is already verified."
                : "⚠️ If you have not paid yet, click PayPal Instructions below."
            }`,
          components: isOrderPaid(order) ? [] : [paypalButton()],
        });
      } catch (error) {
        console.error(error);
        return interaction.editReply("❌ Something went wrong while tracking your order.");
      }
    }
  }

  if (!staff) {
    const lastClick = lastButtonClick.get(userId) || 0;

    if (now() - lastClick < BUTTON_COOLDOWN_MS) {
      return interaction.reply({
        content: `⚠️ Please wait ${formatTime(
          BUTTON_COOLDOWN_MS - (now() - lastClick),
        )} before clicking again.`,
        ephemeral: true,
      });
    }

    lastButtonClick.set(userId, now());
  }

  const [action, orderId] = interaction.customId.split(":");

  if (action && action.startsWith("staff_")) {
    if (!staff) {
      return interaction.reply({
        content: "⛔ Only staff can use this button.",
        ephemeral: true,
      });
    }

    await interaction.deferUpdate();

    try {
      let apiAction = "";
      let customerMessage = "";
      let nextStage = "done";

      if (action === "staff_verify") {
        apiAction = "verify_payment";
        nextStage = "verified";

        const queuePosition = getQueuePosition(orderId);

        customerMessage =
          `# ✅ PAYMENT VERIFIED BY STAFF\n\n` +
          `**Order ID:** #${orderId}\n` +
          `**Queue Position:** #${queuePosition}\n\n` +
          `📦 Your order is now queued for delivery.\n` +
          `⏱️ Estimated delivery: within 5-30 minutes.\n\n` +
          `${
            process.env.DELIVERY_ROLE_ID
              ? `<@&${process.env.DELIVERY_ROLE_ID}> New verified order is ready for delivery.`
              : ""
          }`;
      }

      if (action === "staff_reject") {
        apiAction = "reject_payment";
        nextStage = "done";

        customerMessage =
          `# ❌ PAYMENT REJECTED\n\n` +
          `**Order ID:** #${orderId}\n\n` +
          `Staff could not verify this payment.\n` +
          `Please double-check your payment proof or wait for human support.`;
      }

      if (action === "staff_claim") {
        apiAction = "claim_order";
        nextStage = "claimed";

        customerMessage =
          `# 📦 ORDER CLAIMED\n\n` +
          `**Order ID:** #${orderId}\n` +
          `**Claimed By:** ${interaction.user.tag}\n\n` +
          `A deliverer is now handling your order.`;
      }

      if (action === "staff_delivering") {
        apiAction = "mark_delivering";
        nextStage = "delivering";

        customerMessage =
          `# 🚚 DELIVERY STARTED\n\n` +
          `**Order ID:** #${orderId}\n\n` +
          `Your order is now being delivered. Please stay ready in Roblox.`;
      }

      if (action === "staff_delivered") {
        apiAction = "mark_delivered";
        nextStage = "done";
        removeFromQueue(orderId);

        try {
          const emailResult = await sendDeliveredEmail(orderId);

          if (!emailResult.success) {
            console.error("Delivered email failed:", emailResult);
          }
        } catch (emailError) {
          console.error("Delivered email error:", emailError);
        }

        customerMessage =
          `# ✅ ORDER DELIVERED\n\n` +
          `**Order ID:** #${orderId}\n\n` +
          `Thank you for shopping at Bloxhop!\n\n` +
          `${
            process.env.VOUCH_CHANNEL_ID
              ? `⭐ Please leave a vouch here: <#${process.env.VOUCH_CHANNEL_ID}>`
              : "⭐ Please leave a vouch in our review channel."
          }\n\n` +
          `This ticket may close automatically in 2 minutes.`;
      }

      const result = await updateOrderStaff(orderId, apiAction, interaction.user.tag);

      if (!result.success) {
        return interaction.followUp({
          content: `❌ Failed to update order.\n\nReason: ${
            result.message || "Unknown error"
          }`,
          ephemeral: true,
        });
      }

      await interaction.editReply({
        content: customerMessage,
        components: staffOrderButtons(orderId, nextStage),
      });

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

      return interaction.followUp({
        content: "❌ Something went wrong while updating the order.",
        ephemeral: true,
      });
    }
  }

  if (interaction.customId === "paid_yes") {
    return interaction.reply({
      content:
        "# 👋 BloxHop Manual Payment\n\n" +
        "Please paste the Order ID you copied from the website.\n\n" +
        "**Example:**\n" +
        "`Order ID: BH-26G7K9`\n\n" +
        "After that, our bot will check your order and staff will guide you.",
      ephemeral: true,
    });
  }

  if (interaction.customId === "payment_methods") {
    return interaction.reply({
      content:
        "# 💳 Payment Method\n\n" +
        "We currently accept manual international payment through **PayPal** only.\n\n" +
        "**PayPal Address:**\n" +
        `\`${PAYPAL_EMAIL}\`\n\n` +
        "Click the button below to view the PayPal payment instructions.",
      components: [paypalButton()],
      ephemeral: true,
    });
  }

  if (interaction.customId === "paypal_payment") {
    return interaction.reply({
      content:
        "# 💳 PayPal Manual Payment\n\n" +
        "**Send payment to:**\n" +
        `\`${PAYPAL_EMAIL}\`\n\n` +
        "**Instructions:**\n" +
        "1. Open PayPal and click **Send** or **Send & Request**.\n" +
        "2. Enter our PayPal email address.\n" +
        "3. Send the exact amount shown in your order.\n" +
        "4. Screenshot your receipt and upload it here in the ticket.\n\n" +
        "⚠️ Do not send payment without checking your Order ID first.",
      files: ["./assets/paypal-instructions.png"],
      ephemeral: true,
    });
  }

  if (interaction.customId === "track_order") {
    const modal = new ModalBuilder()
      .setCustomId("track_order_modal")
      .setTitle("Track Your Order");

    const orderIdInput = new TextInputBuilder()
      .setCustomId("order_id_input")
      .setLabel("Enter your Order ID")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Example: 123")
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(orderIdInput);
    modal.addComponents(row);

    return interaction.showModal(modal);
  }

  if (interaction.customId === "human_support") {
    return interaction.reply({
      content:
        "👤 A support staff member will assist you shortly.\n\nPlease describe your issue while waiting.",
      ephemeral: false,
    });
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot && message.author.username !== "Ticket Tool") return;

  const content = message.content.toLowerCase();
  const userId = message.author.id;
  const staff = isStaff(message.member);

  if (content.includes("@everyone") || content.includes("@here")) return;

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
          `${
            process.env.DELIVERY_ROLE_ID
              ? `<@&${process.env.DELIVERY_ROLE_ID}> Payment proof needs review.`
              : ""
          }\n\n` +
          `Staff: ask for the customer's Order ID if it is not included.`,
      });
    }
  }

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
        content: "# 👋 Welcome to Bloxhop Support\n\nPlease choose an option below.",
        components: [supportButtons()],
      });
      return;
    }
  }

  if (content.includes("paypal")) {
    if (canSendCleanReply(userId, "payment_menu")) {
      await message.reply({
        content:
          "# 💳 PayPal Payment Help\n\n" +
          "Click the button below to view our PayPal payment instructions.\n\n" +
          "⚠️ Please only pay using official Bloxhop payment details.",
        components: [paypalButton()],
      });
    }
    return;
  }

  const match = message.content.match(/order\s*id[:\s#-]*(.+)/i);
  if (!match) return;

  const orderId = match[1].trim();

  if (!staff) {
    const blockedUntil = isBlocked(userId);

    if (blockedUntil) {
      return message.reply(
        `# ⛔ TEMPORARILY BLOCKED\n\n` +
          `Too many invalid order attempts.\n\n` +
          `Please try again in **${formatTime(blockedUntil - now())}**.`,
      );
    }

    const lastInvalid = lastInvalidLookup.get(userId) || 0;

    if (now() - lastInvalid < INVALID_COOLDOWN_MS) return;
  }

  await message.reply(`🔎 Checking Order ID #${orderId}...`);

  try {
    const data = await lookupOrder(orderId);

    if (!data.found) {
      if (!staff) {
        const attemptData = addInvalidAttempt(userId, orderId);

        if (attemptData.count >= MAX_INVALID_ATTEMPTS) {
          blockedUsers.set(userId, now() + BLOCK_DURATION_MS);

          await logSuspicious(
            message,
            `Blocked for invalid order spam. Order ID: ${orderId}`,
          );

          return message.reply(
            `# ⛔ TEMPORARILY BLOCKED\n\n` +
              `Too many invalid order attempts.\n\n` +
              `You can try again in **10 minutes**.`,
          );
        }

        if (attemptData.count >= 4) {
          await logSuspicious(
            message,
            `Final warning for invalid order attempts. Order ID: ${orderId}`,
          );

          return message.reply(
            `# ⚠️ FINAL WARNING\n\n` +
              `Order ID #${orderId} was not found.\n\n` +
              `Invalid attempts: **${attemptData.count}/${MAX_INVALID_ATTEMPTS}**\n\n` +
              `One more fake/wrong attempt may temporarily block order lookup.`,
          );
        }
      }

      return message.reply(
        `# ❌ ORDER NOT FOUND\n\n` +
          `Order ID #${orderId} was not found.\n\n` +
          `Reason: ${data.message || "Unknown error"}`,
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
        `Different user tried checking locked order. Order ID: ${order.id}`,
      );

      return message.reply(
        `# ⚠️ ORDER ALREADY BEING CHECKED\n\n` +
          `This order was recently checked by another user.\n\n` +
          `Please contact human support if this is your order.`,
      );
    }

    orderLocks.set(order.id, {
      userId,
      expiresAt: now() + DUPLICATE_ORDER_LOCK_MS,
    });

    const items = formatItems(order);

    if (!isOrderPaid(order)) {
      return message.reply({
        content:
          `# ⚠️ PAYMENT NOT VERIFIED\n\n` +
          `**Order ID:** #${order.id}\n` +
          `**Username:** ${order.username || "Unknown"}\n` +
          `**Payment Method:** ${order.paymentMethod || "Unknown"}\n` +
          `**Payment Status:** ${order.paymentStatus || "Pending"}\n\n` +
          `## 🛒 Items\n` +
          `${items}\n\n` +
          `## 💰 Amount to Pay\n` +
          `**$${Number(order.totalPrice || 0).toFixed(2)}**\n\n` +
          `Please send the exact amount through PayPal, then upload your payment screenshot here.\n\n` +
          `**PayPal Address:**\n` +
          `\`${PAYPAL_EMAIL}\``,
        components: [paypalButton(), ...staffOrderButtons(order.id, "unpaid")],
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
        `**Original Total:** $${Number(
          order.originalTotal || order.totalPrice,
        ).toFixed(2)}\n` +
        `**Coupon:** ${order.couponCode || "None"}\n` +
        `**Discount:** -$${Number(order.couponDiscount || 0).toFixed(2)}\n` +
        "```yaml\n" +
        `FINAL TOTAL: $${Number(order.totalPrice).toFixed(2)}\n` +
        "```\n\n" +
        `📦 Your order is now queued for delivery.\n` +
        `⏱️ Estimated delivery: within 5-30 minutes.\n\n` +
        `${
          process.env.DELIVERY_ROLE_ID
            ? `<@&${process.env.DELIVERY_ROLE_ID}> New paid order ready for delivery.`
            : ""
        }`,
      components: staffOrderButtons(order.id, "verified"),
    });
  } catch (error) {
    console.error(error);
    await message.reply("Something went wrong while checking your order.");
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);