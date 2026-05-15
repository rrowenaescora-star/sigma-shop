"use client";

import { useEffect, useState } from "react";

export default function VerifySecondKeyPage() {
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/";
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070b14] px-6 text-white">
      <div className="max-w-md rounded-[2rem] border border-white/10 bg-[#101729] p-8 text-center shadow-xl">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
          NFC Step 1 Complete
        </p>

        <h1 className="mt-3 text-3xl font-black">Scan Second NFC Tag</h1>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          Scan your second NFC tag before the timer expires.
        </p>

        <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
          <p className="text-sm font-bold text-slate-400">Time Remaining</p>
          <p className="mt-2 text-5xl font-black text-cyan-300">
            {secondsLeft}s
          </p>
        </div>
      </div>
    </main>
  );
}