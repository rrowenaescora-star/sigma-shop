"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type WalletStep = "email" | "otp";

type ApiResponse = {
  success?: boolean;
  message?: string;
  redirectTo?: string;
  status?: "otp" | "dashboard";
  error?: string;
};

export default function WalletPage() {
  const router = useRouter();

  const [step, setStep] = useState<WalletStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function normalizeEmail(value: string) {
    return value.trim().toLowerCase();
  }

  function resetMessages() {
    setError("");
    setMessage("");
  }

  async function sendOtp(normalizedEmail: string) {
    const response = await fetch("/api/wallet/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: normalizedEmail,
      }),
    });

    const data = (await response.json()) as ApiResponse;

    if (!response.ok) {
      setError(data.error || "Unable to send the verification code.");
      return false;
    }

    setMessage(
      data.message || "A verification code was sent to your email.",
    );

    return true;
  }

  async function handleEmailSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    resetMessages();

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/wallet/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        setError(data.error || "Unable to check this email.");
        return;
      }

      setEmail(normalizedEmail);

      if (data.status === "dashboard") {
        router.push(data.redirectTo || "/wallet/dashboard");
        router.refresh();
        return;
      }

      if (data.status === "otp") {
        const sent = await sendOtp(normalizedEmail);

        if (sent) {
          setStep("otp");
        }

        return;
      }

      setError("The wallet returned an unknown status.");
    } catch (checkError) {
      console.error("Wallet email check error:", checkError);
      setError("Unable to connect to the wallet service.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    resetMessages();

    const normalizedOtp = otp.trim();

    if (!/^\d{6}$/.test(normalizedOtp)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/wallet/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizeEmail(email),
          otp: normalizedOtp,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        setError(data.error || "Unable to verify the code.");
        return;
      }

      router.push(data.redirectTo || "/wallet/dashboard");
      router.refresh();
    } catch (verifyError) {
      console.error("Wallet OTP verification error:", verifyError);
      setError("Unable to connect to the wallet service.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    resetMessages();
    setResending(true);

    try {
      await sendOtp(normalizeEmail(email));
    } catch (resendError) {
      console.error("Wallet OTP resend error:", resendError);
      setError("Unable to resend the verification code.");
    } finally {
      setResending(false);
    }
  }

  function useDifferentEmail() {
    resetMessages();
    setOtp("");
    setEmail("");
    setStep("email");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-950">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <span className="text-lg font-black tracking-tight">
              B
            </span>
          </div>

          <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
            Bloxhop Wallet
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-8">
          {step === "email" && (
            <>
              <h1 className="text-2xl font-bold tracking-tight">
                Access your wallet
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter the email connected to your Bloxhop Wallet.
              </p>

              <form onSubmit={handleEmailSubmit} className="mt-7">
                <label
                  htmlFor="wallet-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="wallet-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />

                {error && <ErrorMessage message={error} />}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loading ? "Checking..." : "Continue"}
                </button>
              </form>

              <p className="mt-5 text-center text-xs leading-5 text-slate-400">
                Registered emails open their wallet immediately. New emails
                require one-time verification.
              </p>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                6
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Email Verification
              </p>

              <h1 className="mt-3 text-2xl font-bold tracking-tight">
                Enter your code
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                We sent a 6-digit verification code to:
              </p>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="break-all text-sm font-semibold text-slate-800">
                  {email}
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="mt-6">
                <label
                  htmlFor="wallet-otp"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Verification code
                </label>

                <input
                  id="wallet-otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6),
                    )
                  }
                  placeholder="000000"
                  autoComplete="one-time-code"
                  disabled={loading}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-center text-2xl font-bold tracking-[0.35em] outline-none transition placeholder:tracking-[0.35em] placeholder:text-slate-300 focus:border-slate-950 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />

                {message && <SuccessMessage message={message} />}
                {error && <ErrorMessage message={error} />}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loading
                    ? "Verifying..."
                    : "Verify and Continue"}
                </button>
              </form>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || resending}
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {resending ? "Resending..." : "Resend code"}
              </button>

              <button
                type="button"
                onClick={useDifferentEmail}
                disabled={loading || resending}
                className="mt-3 w-full px-5 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950 disabled:cursor-not-allowed"
              >
                Use a different email
              </button>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Verification codes expire after 5 minutes.
        </p>
      </section>
    </main>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">
      {message}
    </div>
  );
}

function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium leading-6 text-emerald-700">
      {message}
    </div>
  );
}