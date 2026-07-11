import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { supabaseAdmin } from "@/lib/supabase-admin";

import TopUpForm from "./top-up-form";

function hashSessionToken(token: string) {
  const secret = process.env.WALLET_ACCESS_SECRET;

  if (!secret) {
    throw new Error("Missing WALLET_ACCESS_SECRET");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(token)
    .digest("hex");
}

function formatPeso(centavos: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(centavos / 100);
}

export default async function WalletDashboardPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("bloxhop_wallet_session")?.value;

  if (!sessionToken) {
    redirect("/wallet");
  }

  const tokenHash = hashSessionToken(sessionToken);

  const { data: session, error: sessionError } = await supabaseAdmin
    .from("wallet_sessions")
    .select("wallet_id, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (sessionError || !session) {
    redirect("/wallet");
  }

  const { data: wallet, error: walletError } = await supabaseAdmin
    .from("wallets")
    .select("id, email, balance_centavos, status, activated")
    .eq("id", session.wallet_id)
    .maybeSingle();

  if (
    walletError ||
    !wallet ||
    !wallet.activated ||
    wallet.status !== "active"
  ) {
    redirect("/wallet");
  }

  const { data: topUps, error: topUpsError } = await supabaseAdmin
    .from("wallet_topups")
    .select("id, amount_centavos, status, credited_at, created_at")
    .eq("wallet_id", wallet.id)
    .eq("status", "paid")
    .order("credited_at", { ascending: false })
    .limit(10);

  if (topUpsError) {
    console.error("Wallet activity load error:", topUpsError);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Bloxhop Wallet
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Your wallet
          </h1>

          <p className="mt-2 break-all text-sm text-slate-500">
            {wallet.email}
          </p>
        </div>

        <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-[0_20px_70px_rgba(15,23,42,0.18)] sm:p-8">
          <p className="text-sm font-medium text-slate-400">
            Available balance
          </p>

          <p className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            {formatPeso(wallet.balance_centavos || 0)}
          </p>

          <TopUpForm />
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Recent activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your latest wallet top-ups will appear here.
            </p>
          </div>

          {topUps && topUps.length > 0 ? (
            <div className="mt-6 divide-y divide-slate-200">
              {topUps.map((topUp) => (
                <div
                  key={topUp.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Wallet top-up
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(
                        topUp.credited_at || topUp.created_at,
                      ).toLocaleString("en-PH")}
                    </p>
                  </div>

                  <p className="text-sm font-bold text-emerald-600">
                    +{formatPeso(Number(topUp.amount_centavos))}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No activity yet
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Add credit to start using your Bloxhop Wallet.
              </p>
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Contact Bloxhop support when you are ready to use your balance.
        </p>
      </div>
    </main>
  );
}