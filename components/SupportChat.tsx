"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Message = {
  sender: "bot" | "user";
  text: string;
};

const faqs = [
  {
    question: "Track my order",
    answer:
      "You can track your order on the Track Order page. Use the same details you entered during checkout.",
  },
  {
    question: "How long does it take?",
    answer:
      "Most orders are fulfilled within 5–30 minutes after payment confirmation. In rare cases, it may take up to 3 hours.",
  },
  {
    question: "Wrong username?",
    answer:
      "Contact support immediately before fulfillment starts. Include your order details, correct username, and proof of payment if needed.",
  },
  {
    question: "Refund request",
    answer:
      "Refunds are reviewed for non-delivery, duplicate payment, or fulfillment issues. Please contact support with your order details.",
  },
  {
    question: "Payment issue",
    answer:
      "If you already paid, keep your payment proof and contact support with your order email, Roblox username, and product name.",
  },
];

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [showQuickHelp, setShowQuickHelp] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hi! I’m BloxBot. Ask me about your order, delivery time, payment, refund, or username issue.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function getBotReply(input: string) {
    const message = input.toLowerCase();

    if (message.includes("track") || message.includes("order")) {
      return "You can track your order on the Track Order page. Use the same details you entered during checkout.";
    }

    if (message.includes("refund")) {
      return "Refunds are reviewed for non-delivery, duplicate payment, or fulfillment issues. Please contact support with your order details.";
    }

    if (
      message.includes("how long") ||
      message.includes("time") ||
      message.includes("delivery") ||
      message.includes("fulfillment")
    ) {
      return "Most orders are fulfilled within 5–30 minutes after payment confirmation. In rare cases, it may take up to 3 hours.";
    }

    if (
      message.includes("username") ||
      message.includes("wrong name") ||
      message.includes("roblox name")
    ) {
      return "If you entered the wrong username, contact support immediately before fulfillment starts.";
    }

    if (
      message.includes("payment") ||
      message.includes("paid") ||
      message.includes("checkout")
    ) {
      return "After payment confirmation, our team checks your order and starts fulfillment. Keep your payment proof in case support needs it.";
    }

    if (message.includes("discord")) {
      return "You can join our Discord support using the Discord Support button below the chat.";
    }

    if (message.includes("email") || message.includes("support")) {
      return "For faster support, join our Discord or email support@bloxhop.site with your order details.";
    }

    return "I can help with tracking, delivery time, refunds, payment issues, wrong username, and support. For specific order issues, please contact our team.";
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
                 <div
  key={index}
  className={`flex ${
    message.sender === "user" ? "justify-end" : "justify-start"
  }`}
>
  {message.sender === "bot" && (
    <div className="mr-2 mt-1 text-xl">
      🤖
    </div>
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
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
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
              className="mx-auto flex h-5 w-[25%] items-center justify-center rounded-t-[2rem] bg-[#ffffff] text-sm font-black text-black  transition hover:bg-[#9b9b9b]"
            >
              {showQuickHelp ? "▲" : "▼"}
            </button>
<div className="border-t border-slate-700/60  gap-2">
            <div
  className={`mx-auto  overflow-hidden transition-all duration-300 ease-in-out ${
    showQuickHelp
      ? "max-h-[400px] opacity-100 mt-2"
      : "max-h-0 opacity-0 mt-0"
  }`}
>
    <div className="grid  gap-2">
      {faqs.map((faq) => (
        <button
          key={faq.question}
          onClick={() => {
            sendMessage(faq.question);
            setShowQuickHelp(false);
          }}
          className="bg-transparent px-2 py-2 text-left transition hover:bg-[#9b9b9b]"
        >
          <p className="text-sm hover:underline font-semibold text-slate-100">
            {faq.question}
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
  onClick={() => {
    setMessages([
      {
        sender: "bot",
        text: "Hi! I’m BloxBot. Ask me about your order, delivery time, payment, refund, or username issue.",
      },
    ]);
    setUserInput("");
    setIsTyping(false);
    setShowQuickHelp(false);
  }}
  className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-[#10213a]/70 px-3 py-3 text-sm font-bold text-slate-200 transition hover:bg-[#142846]"
>
  Restart Chat
</button>

            <p className="mt-3 text-center text-[11px] text-slate-500">
              Include order email + Roblox username for faster help.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="rounded-full px-4 py-3 text-sm bg-blue-500 font-bold text-white shadow-[0_0_28px_rgba(59,130,246,0.38)] transition hover:bg-blue-400"
      >
        {open ? "Close BloxBot" : "Ask BloxBot"}
      </button>
    </div>
  );
}