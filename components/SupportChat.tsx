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
];

function includesAny(message: string, words: string[]) {
  return words.some((word) => message.includes(word));
}

export default function SupportChat() {
  const [open, setOpen] = useState(false);
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

    if (includesAny(message, ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "yo", "sup"])) {
      return "Hello 👋 Welcome to Bloxhop! I’m here to help with your order, payment, delivery, refunds, tracking, and support questions. What can I help you with today?";
    }

    if (includesAny(message, ["thanks", "thank you", "ty", "appreciate"])) {
      return "You’re very welcome 😊 If you need anything else about your order or support, just let me know!";
    }

    if (includesAny(message, ["bye", "goodbye", "see you", "cya"])) {
      return "Thank you for visiting Bloxhop 👋 Have a great day, and feel free to come back anytime if you need help!";
    }

    if (includesAny(message, ["what is bloxhop", "about bloxhop", "bloxhop info", "who are you", "what do you sell", "about your shop", "is bloxhop legit"])) {
      return "Bloxhop is a digital gaming store that provides game services, digital products, fast fulfillment, secure checkout, and reliable customer support.";
    }

    if (includesAny(message, ["how do i order", "place an order", "how to buy", "how to order", "buy product"])) {
      return "To place an order, choose your product, enter the correct details, complete secure checkout, and wait for payment confirmation. After that, fulfillment begins and you can track your order anytime.";
    }

    if (includesAny(message, ["payment methods", "how can i pay", "payment options", "visa", "mastercard"])) {
      return "Available payment methods may include GCash, Maya, cards, bank payments, and other supported checkout options depending on your region during checkout.";
    }

    if (includesAny(message, ["cancel my order", "can i cancel", "cancel order", "stop order"])) {
      return "Order cancellation depends on whether fulfillment has already started. Please contact support immediately with your order details so we can review your request.";
    }

    if (includesAny(message, ["real person", "human support", "talk to human", "live agent"])) {
      return "For direct human support, please email support@bloxhop.site with your order details for faster assistance.";
    }

    if (includesAny(message, ["refund policy", "how refund works", "refund protection"])) {
      return "Refund protection applies to eligible issues such as non-delivery, duplicate payment, or fulfillment problems. Each refund request is reviewed based on our Refund Policy.";
    }

    if (includesAny(message, ["after payment", "what happens after payment", "how fulfillment works", "order fulfillment"])) {
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

    if (includesAny(message, ["refund", "money back", "cancel", "duplicate payment"])) {
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

    if (includesAny(message, ["email", "contact", "support", "discord", "server", "live support", "human", "agent", "talk to support"])) {
      return "You can contact support at support@bloxhop.site. For faster help, include your order email, username, product name, and payment proof if needed.";
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
      setMessages((prev) => [...prev, { sender: "bot", text: getBotReply(trimmed) }]);
      setIsTyping(false);
    }, 500);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open && (
        <div className="mb-3 flex h-[620px] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-3xl border border-slate-700/70 bg-[#08111f] text-white shadow-[0_20px_70px_rgba(0,0,0,0.45)] sm:w-[390px]">
          <div className="border-b border-slate-700/70 bg-[#0b1628] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-xl">
                  🤖
                </div>

                <div>
                  <h3 className="text-base font-black text-white">
                    BloxBot Support
                  </h3>
                  <p className="text-xs font-medium text-slate-400">
                    Order and checkout assistant
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs font-bold text-slate-300 transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>

          <div className="border-b border-slate-700/60 px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              {faqs.map((faq) => (
                <button
                  key={faq}
                  onClick={() => sendMessage(faq)}
                  className="rounded-2xl border border-slate-700/70 bg-[#0c1a2d] px-3 py-2 text-left text-xs font-semibold text-slate-200 transition hover:border-blue-400/40 hover:bg-[#10213a]"
                >
                  {faq}
                </button>
              ))}
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                      message.sender === "user"
                        ? "rounded-tr-md bg-blue-500 text-white"
                        : "rounded-tl-md border border-slate-700/60 bg-[#101d31] text-slate-100"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-md border border-slate-700/60 bg-[#101d31] px-4 py-2.5 text-sm text-slate-300">
                    BloxBot is typing...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-slate-700/70 bg-[#0b1628] p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder="Type your question..."
                className="min-w-0 flex-1 rounded-2xl border border-slate-700 bg-[#07111f] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
              />

              <button
                onClick={() => sendMessage()}
                disabled={!userInput.trim() || isTyping}
                className="rounded-2xl bg-blue-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                Send
              </button>
            </div>

            <Link
              href="/track-order"
              className="mt-3 block rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-center text-sm font-bold text-blue-100 transition hover:bg-blue-500/20"
            >
              Track Order
            </Link>

            <p className="mt-3 text-center text-[11px] text-slate-500">
              For faster help, include your order email and Roblox username.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="rounded-full bg-blue-500 px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(59,130,246,0.38)] transition hover:bg-blue-400"
      >
        {open ? "Close Support" : "Chat Support"}
      </button>
    </div>
  );
}