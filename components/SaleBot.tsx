"use client";

import { useEffect, useState } from "react";

type SaleBotProps = {
  enabled?: boolean;
  title?: string;
  discount?: string;
  message?: string;
  buttonText?: string;
  centerDuration?: number;
};

export default function SaleBot({
  enabled = true,
  title = "Limited Time Promo",
  discount = "10% OFF",
  message = "Use your promo before the sale ends!",
  buttonText = "Shop Now",
  centerDuration = 3000,
}: SaleBotProps) {
  const [showCenter, setShowCenter] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    setMounted(true);

    const timer = setTimeout(() => {
      setShowCenter(false);
      setExpanded(false);
    }, centerDuration);

    return () => clearTimeout(timer);
  }, [enabled, centerDuration]);

  if (!enabled || !mounted) return null;

  return (
    <>
      {showCenter && (
        <div className="fixed inset-0 z-40 backdrop-blur-md transition-all duration-1000" />
      )}

      <div
        onClick={() => {
          if (!showCenter) {
            setExpanded(true);
          }
        }}
        className={`fixed z-50 hidden md:block transition-all duration-1000 ease-in-out hover:scale-110 ${
          showCenter
            ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-100"
            : "bottom-0 left-0 scale-100 cursor-pointer"
        }`}
      >
        <div className="relative text-center">
          <img
            src="/bloxbot.png"
            alt="Bloxhop Promo"
            className={`relative z-20 mx-auto object-contain drop-shadow-2xl transition-all duration-1000 ease-in-out animate-[bloxbotLife_5s_ease-in-out_infinite] ${
              showCenter ? "w-[380px]" : "w-[170px]"
            }`}
          />

          {expanded && (
            <div
              className={`relative z-10 rounded-[2rem] border border-cyan-400/20 bg-[#0f1b2d]/95 shadow-2xl backdrop-blur-md transition-all duration-700 ${
                showCenter
                  ? "-mt-32 px-6 pb-6 pt-32 opacity-100"
                  : "-mt-14 px-5 pb-5 pt-16 opacity-100"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
                {title}
              </p>

              <h2
                className={`mt-2 font-black text-white ${
                  showCenter ? "text-4xl" : "text-3xl"
                }`}
              >
                {discount}
              </h2>

              <p className="mt-3 text-sm text-slate-300">{message}</p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCenter(false);
                  setExpanded(false);
                }}
                className="mt-5 w-full rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:opacity-90"
              >
                {buttonText}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}