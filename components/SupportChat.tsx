"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Message = {
  sender: "bot" | "user";
  text: string;
};

const welcomeMessage =
  "Hi! I’m BloxBot. Ask me about orders, delivery time, payment, refund, invoice, username issues, coupons, or support.";

const faqs = [
  "Track my order",
  "How long does delivery take?",
  "I entered the wrong username",
  "I paid but my order is pending",
  "Refund request",
  "Invoice or receipt issue",
  "Coupon not working",
  "Talk to support",
];

function includesAny(message: string, words: string[]) {
  return words.some((word) => message.includes(word));
}

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [showQuickHelp, setShowQuickHelp] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: welcomeMessage },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function getBotReply(input: string) {
    const message = input.toLowerCase();

    if (includesAny(message, ["track", "tracking", "status", "where is my order", "order status"])) {
      return "You can track your order on the Track Order page. Use the same email, username, or order details you entered during checkout.";
    }
 if (
    includesAny(message, [
      "hi",
      "hello",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "yo",
      "sup",
    ])
  ) {
    return "Hello 👋 Welcome to Bloxhop! I’m here to help with your order, payment, delivery, refunds, tracking, and support questions. What can I help you with today?";
  }
if (
    includesAny(message, [
      "thanks",
      "thank you",
      "ty",
      "appreciate",
    ])
  ) {
    return "You’re very welcome 😊 If you need anything else about your order or support, just let me know!";
  }
 if (
    includesAny(message, [
      "bye",
      "goodbye",
      "see you",
      "cya",
    ])
  ) {
    return "Thank you for visiting Bloxhop 👋 Have a great day, and feel free to come back anytime if you need help!";
  }
if (
  includesAny(message, [
    "what is bloxhop",
    "about bloxhop",
    "bloxhop info",
    "who are you",
    "what do you sell",
    "about your shop",
    "is bloxhop legit",
  ])
) {
  return "Bloxhop is a digital gaming store that provides premium game services, digital products, fast fulfillment, secure checkout, and reliable customer support. We focus on safe transactions, order tracking, refund review for eligible issues, and smooth customer experience. Our support is available through email, Discord, and Track Order tools to help customers anytime.";
}
if (
  includesAny(message, [
    "how do i order",
    "place an order",
    "how to buy",
    "how to order",
    "buy product",
  ])
) {
  return "To place an order, choose your product, enter the correct details, complete secure checkout, and wait for payment confirmation. After that, fulfillment begins and you can track your order anytime.";
}

if (
  includesAny(message, [
    "payment methods",
    "how can i pay",
    "payment options",
    "visa",
    "mastercard",
  ])
) {
  return "Available payment methods may include GCash, Maya, cards, bank payments, and other supported checkout options depending on your region during checkout.";
}

if (
  includesAny(message, [
    "cancel my order",
    "can i cancel",
    "cancel order",
    "stop order",
  ])
) {
  return "Order cancellation depends on whether fulfillment has already started. Please contact support immediately with your order details so we can review your request.";
}

if (
  includesAny(message, [
    "special offer",
    "sale",
    "promo available",
    "offers available",
  ])
) {
  return "Discounts and limited offers may be available depending on current promotions. You can also check valid coupon codes during checkout.";
}

if (
  includesAny(message, [
    "real person",
    "human support",
    "talk to human",
    "live agent",
  ])
) {
  return "Yes 👋 For direct human support, please join our Discord support server or email support@bloxhop.site with your order details for faster assistance.";
}

if (
  includesAny(message, [
    "refund policy",
    "how refund works",
    "refund protection",
  ])
) {
  return "Refund protection applies to eligible issues such as non-delivery, duplicate payment, or fulfillment problems. Each refund request is reviewed based on our Refund Policy.";
}

if (
  includesAny(message, [
    "after payment",
    "what happens after payment",
    "how fulfillment works",
    "order fulfillment",
  ])
) {
  return "After payment confirmation, your order is reviewed, fulfillment begins, and most orders are completed within 5–30 minutes. You can track your order anytime using the Track Order page.";
}

    if (includesAny(message, ["how long", "delivery", "deliver", "fulfillment", "fulfilment", "time", "when will i receive", "pending"])) {
      return "Most orders are fulfilled within 5–30 minutes after payment confirmation. In rare cases, it may take up to 3 hours because of stock, verification, or high order volume.";
    }

    if (includesAny(message, ["wrong username", "wrong name", "username", "roblox name", "misspelled", "incorrect"])) {
      return "If you entered the wrong username, contact support immediately before fulfillment starts. Send your order email, correct username, and proof of payment if available.";
    }

    if (includesAny(message, ["paid", "payment", "checkout", "charged", "gcash", "maya", "card", "bank", "xendit", "failed payment"])) {
      return "If payment went through, please wait for confirmation and keep your payment proof. If the payment failed or stayed pending, do not pay again until you check your order status or contact support.";
    }

    if (includesAny(message, ["refund", "money back", "cancel", "cancel order", "duplicate payment"])) {
      return "Refunds are reviewed for non-delivery, duplicate payment, or eligible fulfillment issues. Please contact support with your order ID, payment proof, and reason for the request.";
    }

    if (includesAny(message, ["invoice", "receipt", "email confirmation", "confirmation email", "proof"])) {
      return "Invoice or payment confirmation is usually sent to the email used during checkout. Please check spam, promotions, or updates folder. If missing, contact support with your order details.";
    }

    if (includesAny(message, ["coupon", "code", "discount", "promo"])) {
      return "If a coupon is not working, check if it is typed correctly, still valid, and applies to your cart. Some coupons may expire or only work for selected products.";
    }

    if (includesAny(message, ["stock", "available", "out of stock", "restock", "limited"])) {
      return "Product availability depends on current stock. If an item is unavailable or limited, please wait for restock or contact support for availability updates.";
    }

    if (includesAny(message, ["safe", "legit", "scam", "trusted", "trust"])) {
      return "Bloxhop uses secure checkout, order tracking, clear delivery information, refund review, and customer support to help keep purchases safe.";
    }

    if (includesAny(message, ["online", "offline", "do i need to be online"])) {
      return "Some products can be fulfilled even if you are offline, depending on the product type and delivery method. Make sure your username and contact details are correct.";
    }

    if (includesAny(message, ["discord", "server", "live support", "human", "agent", "talk to support"])) {
      return "For faster help, join our Discord support or email support@bloxhop.site. Include your order email, username, product name, and payment proof if needed.";
    }

    if (includesAny(message, ["email", "contact", "support"])) {
      return "You can contact support at support@bloxhop.site. For faster help, include your order email, username, product name, and payment proof if needed.";
    }

    if (includesAny(message, ["privacy", "data", "information", "personal"])) {
      return "Your order details are used for checkout, fulfillment, support, and order tracking. Please avoid sending unnecessary sensitive information.";
    }

    if (includesAny(message, ["location", "address", "business"])) {
      return "Bloxhop is operated from Cebu City, Cebu, Philippines. Support is handled online through email, Discord, and order tracking.";
    }

    return "I can help with order tracking, delivery time, payment issues, refunds, invoices, wrong username, coupons, stock, and support. For a specific order issue, please include your order email, username, and payment proof.";
  }

  function sendMessage(text?: string) {
    const trimmed = (text ?? userInput).trim();
    if (!trimmed || isTyping) return;

    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setUserInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: getBotReply(trimmed) },
      ]);
      setIsTyping(false);
    }, 500);
  }

  function restartChat() {
    setMessages([{ sender: "bot", text: welcomeMessage }]);
    setUserInput("");
    setIsTyping(false);
    setShowQuickHelp(false);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open && (
        <div className="mb-4 flex h-[650px] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-[2rem] border border-sky-400/20 bg-[#07111f] text-white shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:h-[650px] sm:w-[390px] sm:min-w-[390px]">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/35 via-sky-500/25 to-cyan-400/20 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <h3 className="text-lg font-black">BloxBot Support</h3>
                </div>
                <p className="text-xs text-sky-100/80">
                  Online • instant order help
                </p>
              </div>

              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold text-emerald-200">
                Active
              </span>
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4 scroll-smooth"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "bot" && (
                    <div className="mr-2 mt-1 text-xl">🤖</div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                      message.sender === "user"
                        ? "rounded-tr-sm bg-blue-500 text-white"
                        : "rounded-tl-sm bg-[#10213a] text-slate-100"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="mr-2 mt-1 text-xl">🤖</div>
                  <div className="rounded-2xl rounded-tl-sm bg-[#10213a] px-4 py-3 text-sm text-slate-100">
                    BloxBot is typing...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <button
            onClick={() => setShowQuickHelp((prev) => !prev)}
            className="mx-auto flex h-5 w-[25%] items-center justify-center rounded-t-[2rem] bg-white text-sm font-black text-black transition hover:bg-slate-200"
            aria-label="Toggle quick help"
          >
            {showQuickHelp ? "▲" : "▼"}
          </button>

          <div className="border-t border-slate-700/60">
            <div
              className={`mx-auto overflow-hidden transition-all duration-300 ease-in-out ${
                showQuickHelp
                  ? "max-h-[420px] opacity-100 mt-2"
                  : "max-h-0 opacity-0 mt-0"
              }`}
            >
              <div className="grid gap-1 px-4 pb-3">
                {faqs.map((faq) => (
                  <button
                    key={faq}
                    onClick={() => {
                      sendMessage(faq);
                      setShowQuickHelp(false);
                    }}
                    className="bg-transparent px-2 py-2 text-left transition hover:bg-white/10"
                  >
                    <p className="text-sm font-semibold text-slate-100 hover:underline">
                      {faq}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/60 bg-[#08111f] p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder="Type your question..."
                className="min-w-0 flex-1 rounded-2xl border border-slate-700/70 bg-[#07111f] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/50"
              />

              <button
                onClick={() => sendMessage()}
                disabled={!userInput.trim() || isTyping}
                className="rounded-2xl bg-blue-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                Send
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href="/track-order"
                className="rounded-2xl bg-blue-500 px-3 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-400"
              >
                Track Order
              </Link>

              <a
                href="https://discord.gg/EEpftCnkgv"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-3 text-center text-sm font-bold text-indigo-100 transition hover:bg-indigo-500/20"
              >
                Discord
              </a>
            </div>

            <button
              onClick={restartChat}
              className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-[#10213a]/70 px-3 py-3 text-sm font-bold text-slate-200 transition hover:bg-[#142846]"
            >
              Restart Chat
            </button>

            <p className="mt-3 text-center text-[11px] text-slate-500">
              Include order email + username for faster help.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="rounded-full bg-blue-500 px-4 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(59,130,246,0.38)] transition hover:bg-blue-400"
      >
        {open ? "Close BloxBot" : "Ask BloxBot"}
      </button>
    </div>
  );
}