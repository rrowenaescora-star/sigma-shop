"use client";

import { useState } from "react";

type TopUpResponse = {
  checkoutUrl?: string;
  error?: string;
};

const presetAmounts = [100, 250, 500, 1000];

export default function TopUpForm() {
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function selectAmount(value: number) {
    setAmount(value);
    setCustomAmount("");
    setError("");
  }

  function updateCustomAmount(value: string) {
    setCustomAmount(value);
    setAmount(Number(value) || 0);
    setError("");
  }

  async function continueToPayment() {
    setError("");

    if (!Number.isFinite(amount) || amount < 50) {
      setError("The minimum top-up amount is ₱50.");
      return;
    }

    if (amount > 50000) {
      setError("The maximum top-up amount is ₱50,000.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/wallet/topup/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountPesos: amount,
        }),
      });

      const data = (await response.json()) as TopUpResponse;

      if (!response.ok) {
        setError(data.error || "Unable to start the payment.");
        return;
      }

      if (!data.checkoutUrl) {
        setError("The payment link was not returned.");
        return;
      }

      window.location.assign(data.checkoutUrl);
    } catch (paymentError) {
      console.error("Wallet payment error:", paymentError);
      setError("Unable to connect to the payment service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 border-t border-slate-700 pt-6">
      <p className="text-sm font-medium text-slate-300">
        Add wallet credit
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {presetAmounts.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => selectAmount(preset)}
            disabled={loading}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              amount === preset && !customAmount
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-950 hover:bg-slate-100"
            }`}
          >
            ₱{preset.toLocaleString("en-PH")}
          </button>
        ))}
      </div>

      <div className="relative mt-3">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">
          ₱
        </span>

        <input
          type="number"
          min="50"
          max="50000"
          step="1"
          value={customAmount}
          onChange={(event) => updateCustomAmount(event.target.value)}
          disabled={loading}
          placeholder="Other amount"
          className="w-full rounded-xl border border-slate-600 bg-slate-900 py-3.5 pl-9 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed"
        />
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3">
        <span className="text-sm text-slate-400">Top-up amount</span>

        <span className="text-sm font-bold text-white">
          ₱
          {(amount || 0).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-200">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={continueToPayment}
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-600"
      >
        {loading ? "Preparing Payment..." : "Continue to Payment"}
      </button>
    </div>
  );
}