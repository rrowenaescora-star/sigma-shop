import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

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

export async function POST(request: Request) {
  try {
    const paymongoSecretKey = process.env.PAYMONGO_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!paymongoSecretKey) {
      throw new Error("Missing PAYMONGO_SECRET_KEY");
    }

    if (!siteUrl) {
      throw new Error("Missing NEXT_PUBLIC_APP_URL");
    }

    const cookieStore = await cookies();
    const sessionToken =
      cookieStore.get("bloxhop_wallet_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Your wallet session has expired." },
        { status: 401 },
      );
    }

    const tokenHash = hashSessionToken(sessionToken);

    const { data: session, error: sessionError } =
      await supabaseAdmin
        .from("wallet_sessions")
        .select("wallet_id")
        .eq("token_hash", tokenHash)
        .is("revoked_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Your wallet session is invalid." },
        { status: 401 },
      );
    }

    const { data: wallet, error: walletError } =
      await supabaseAdmin
        .from("wallets")
        .select("id, email, status, activated")
        .eq("id", session.wallet_id)
        .maybeSingle();

    if (
      walletError ||
      !wallet ||
      wallet.status !== "active" ||
      !wallet.activated
    ) {
      return NextResponse.json(
        { error: "This wallet is unavailable." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const amountPesos = Number(body?.amountPesos);

    if (
      !Number.isInteger(amountPesos) ||
      amountPesos < 50 ||
      amountPesos > 50000
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a whole amount between ₱50 and ₱50,000.",
        },
        { status: 400 },
      );
    }

    const amountCentavos = amountPesos * 100;
const { data: topUp, error: topUpError } = await supabaseAdmin
  .from("wallet_topups")
  .insert({
    wallet_id: wallet.id,
    amount_centavos: amountCentavos,
    status: "pending",
  })
  .select("id")
  .single();

if (topUpError || !topUp) {
  console.error("Wallet top-up creation error:", topUpError);

  return NextResponse.json(
    { error: "Unable to create the wallet top-up." },
    { status: 500 },
  );
}

    const authorization = Buffer.from(
      `${paymongoSecretKey}:`,
    ).toString("base64");

    const paymongoResponse = await fetch(
      "https://api.paymongo.com/v2/checkout_sessions",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${authorization}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            attributes: {
              billing: {
                email: wallet.email,
              },
              cancel_url: `${siteUrl}/wallet/dashboard`,
              success_url: `${siteUrl}/wallet/payment-success`,
              description: "Bloxhop Wallet Credit",
              line_items: [
                {
                  amount: amountCentavos,
                  currency: "PHP",
                  description: "Credit added to Bloxhop Wallet",
                  name: "Bloxhop Wallet Credit",
                  quantity: 1,
                },
              ],
              payment_method_types: [
  "card",
  "qrph",
  "dob",
],
              reference_number: `wallet-topup-${topUp.id}`,
              send_email_receipt: true,
              show_description: true,
              show_line_items: true,
             metadata: {
  topup_id: topUp.id,
  wallet_id: wallet.id,
  wallet_email: wallet.email,
  amount_centavos: String(amountCentavos),
},
            },
          },
        }),
        cache: "no-store",
      },
    );

    const paymongoData = await paymongoResponse.json();

    if (!paymongoResponse.ok) {
      console.error(
        "PayMongo checkout error:",
        paymongoData,
      );

      return NextResponse.json(
        {
          error:
            paymongoData?.errors?.[0]?.detail ||
            "Unable to create the payment checkout.",
        },
        { status: 502 },
      );
    }

    const checkoutSessionId = paymongoData?.data?.id;
const checkoutUrl = paymongoData?.data?.attributes?.checkout_url;

if (!checkoutSessionId || !checkoutUrl) {
  await supabaseAdmin
    .from("wallet_topups")
    .update({
      status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", topUp.id);

  return NextResponse.json(
    { error: "PayMongo did not return a valid checkout session." },
    { status: 502 },
  );
}

const { error: updateTopUpError } = await supabaseAdmin
  .from("wallet_topups")
  .update({
    checkout_session_id: checkoutSessionId,
    updated_at: new Date().toISOString(),
  })
  .eq("id", topUp.id);

if (updateTopUpError) {
  console.error("Wallet top-up update error:", updateTopUpError);

  return NextResponse.json(
    { error: "Unable to save the payment session." },
    { status: 500 },
  );
}

return NextResponse.json({
  checkoutUrl,
});
  } catch (error) {
    console.error("Wallet top-up creation error:", error);

    return NextResponse.json(
      {
        error: "Unable to prepare the wallet payment.",
      },
      { status: 500 },
    );
  }
}