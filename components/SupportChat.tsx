"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    question: "Help me choose",
    answer:
      "Sure! If you want faster progress, check Progress Boost or Reward Boost. If you want premium access, check Premium or VIP packages.",
  },
  {
    question: "How does fulfillment work?",
    answer:
      "After checkout, our team reviews your order details and processes your digital fulfillment safely. No physical shipping is required.",
  },
  {
    question: "How long does it take?",
    answer:
      "Most orders are processed quickly after payment confirmation. Some orders may take longer depending on availability and verification.",
  },
  {
    question: "Do I need to be online?",
    answer:
      "No. Some items can still be fulfilled even if you are offline, depending on the service method.",
  },
  {
    question: "Wrong username?",
    answer:
      "Contact support as soon as possible so we can check your order before fulfillment is processed.",
  },
];

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState(
    "Hi, I’m BloxBot, your personal Bloxhop assistant. I can help you choose, track orders, or contact support."
  );
  const [isTyping, setIsTyping] = useState(false);

  function handleFaqClick(question: string, answer: string) {
    setSelectedQuestion(question);
    setSelectedAnswer("");
    setIsTyping(true);

    setTimeout(() => {
      setSelectedAnswer(answer);
      setIsTyping(false);
    }, 700);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-4 w-[340px] overflow-hidden rounded-[1.75rem] border border-sky-400/20 bg-[#08111f] text-white shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600/30 via-sky-500/20 to-cyan-400/20 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-300/30 bg-sky-400/15 text-2xl shadow-[0_0_25px_rgba(56,189,248,0.25)]">
                🤖
              </div>

              <div>
                <h3 className="text-lg font-black">BloxBot Assistant</h3>
                <p className="text-xs text-sky-100/80">
                  Personal shopper & order helper
                </p>
              </div>
            </div>

            <div className="mt-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              Online support guide
            </div>
          </div>

          <div className="space-y-3 p-4">
            {!selectedQuestion && (
              <div className="flex gap-2">
                <div className="mt-1 h-7 w-7 shrink-0 rounded-full bg-sky-400/20 text-center text-sm leading-7">
                  🤖
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-[#10213a] p-3 text-sm leading-6 text-slate-100">
                  {selectedAnswer}
                </div>
              </div>
            )}

            {selectedQuestion && (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-blue-500 px-3 py-2 text-sm font-medium text-white">
                  {selectedQuestion}
                </div>
              </div>
            )}

            {isTyping && (
              <div className="flex gap-2">
                <div className="mt-1 h-7 w-7 shrink-0 rounded-full bg-sky-400/20 text-center text-sm leading-7">
                  🤖
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-[#10213a] px-4 py-3 text-sm text-slate-100">
                  BloxBot is typing...
                </div>
              </div>
            )}

            {selectedQuestion && selectedAnswer && !isTyping && (
              <div className="flex gap-2">
                <div className="mt-1 h-7 w-7 shrink-0 rounded-full bg-sky-400/20 text-center text-sm leading-7">
                  🤖
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-[#10213a] p-3 text-sm leading-6 text-slate-100">
                  {selectedAnswer}
                </div>
              </div>
            )}

            <div className="grid gap-2">
              {faqs.map((faq) => (
                <button
                  key={faq.question}
                  onClick={() => handleFaqClick(faq.question, faq.answer)}
                  className="rounded-2xl border border-slate-700/70 bg-[#0f1b2d] px-3 py-2 text-left text-sm text-slate-100 transition hover:border-sky-400/40 hover:bg-[#142846]"
                >
                  {faq.question}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/track-order"
                className="rounded-2xl bg-blue-500 px-3 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-400"
              >
                Track Order
              </Link>

              <a
                href="mailto:support@bloxhop.site"
                className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-3 py-3 text-center text-sm font-bold text-sky-100 transition hover:bg-sky-400/20"
              >
                Email Support
              </a>
            </div>

            <p className="text-center text-[11px] text-slate-500">
              BloxBot gives quick guidance. Final support is handled by our team.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="rounded-full bg-blue-500 px-5 py-3 font-bold text-white shadow-[0_0_25px_rgba(59,130,246,0.35)] transition hover:bg-blue-400"
      >
        {open ? "Close BloxBot" : "Ask BloxBot 🤖"}
      </button>
    </div>
  );
}