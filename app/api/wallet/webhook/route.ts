import crypto from "crypto";
import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

type PayMongoPayment = {
  id?: string;
  attributes?: {
    amount?: number;
    currency?: string;
    status?: string;
  };
};

type PayMongoCheckoutSession = {
  id?: string;
  attributes?: {
    livemode?: boolean;
    metadata?: {
      topup_id?: string;
      wallet_id?: string;
      amount_centavos?: string;
    };
    payments?: PayMongoPayment[];
  };
};

type PayMongoWebhookPayload = {
  data?: {
    attributes?: {
      type?: string;
      livemode?: boolean;
      data?: PayMongoCheckoutSession;
    };
  };
};

function parseSignatureHeader(header: string) {
  return Object.fromEntries(
    header.split(",").map((part) => {
      const [key, ...valueParts] = part.trim().split("=");

      return [key, valueParts.join("=")];
    }),
  );
}

function safeCompare(first: string, second: string) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(firstBuffer, secondBuffer);
}

function verifySignature(params: {
  rawBody: string;
  signatureHeader: string;
  webhookSecret: string;
  livemode: boolean;
}) {
  const parts = parseSignatureHeader(params.signatureHeader);
  const timestamp = parts.t;
  const suppliedSignature = params.livemode ? parts.li : parts.te;

  if (!timestamp || !suppliedSignature) {
    return false;
  }

  const timestampNumber = Number(timestamp);

  if (
    !Number.isFinite(timestampNumber) ||
    Math.abs(Date.now() / 1000 - timestampNumber) > 300
  ) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", params.webhookSecret)
    .update(`${timestamp}.${params.rawBody}`)
    .digest("hex");

  return safeCompare(expectedSignature, suppliedSignature);
}

export async function POST(request: Request) {
  try {
    const webhookSecret =
      process.env.PAYMONGO_WALLET_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error(
        "Missing PAYMONGO_WALLET_WEBHOOK_SECRET",
      );
    }

    const signatureHeader =
      request.headers.get("paymongo-signature");

    if (!signatureHeader) {
      return NextResponse.json(
        { error: "Missing webhook signature." },
        { status: 401 },
      );
    }

    const rawBody = await request.text();

    let payload: PayMongoWebhookPayload;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook payload." },
        { status: 400 },
      );
    }

    const eventAttributes = payload.data?.attributes;
    const checkoutSession = eventAttributes?.data;
    const checkoutAttributes = checkoutSession?.attributes;

    const livemode =
      eventAttributes?.livemode === true ||
      checkoutAttributes?.livemode === true;

    if (
      !verifySignature({
        rawBody,
        signatureHeader,
        webhookSecret,
        livemode,
      })
    ) {
      console.error("Invalid PayMongo wallet webhook signature", {
        livemode,
        hasLiveSignature: signatureHeader.includes("li="),
        hasTestSignature: signatureHeader.includes("te="),
      });

      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 401 },
      );
    }

    if (
      eventAttributes?.type !==
      "checkout_session.payment.paid"
    ) {
      return NextResponse.json({
        received: true,
        ignored: true,
      });
    }

    const payment = checkoutAttributes?.payments?.find(
      (item) => item.attributes?.status === "paid",
    );

    const topUpId =
      checkoutAttributes?.metadata?.topup_id;
    const checkoutSessionId = checkoutSession?.id;
    const paymentId = payment?.id;
    const amountCentavos = Number(
      checkoutAttributes?.metadata?.amount_centavos,
    );

    if (
      !topUpId ||
      !checkoutSessionId ||
      !paymentId ||
      !Number.isInteger(amountCentavos) ||
      amountCentavos <= 0 ||
      payment?.attributes?.currency !== "PHP" ||
      payment.attributes.amount !== amountCentavos
    ) {
      console.error("Incomplete wallet webhook data", {
        topUpId,
        checkoutSessionId,
        paymentId,
        amountCentavos,
        paymentAmount: payment?.attributes?.amount,
        currency: payment?.attributes?.currency,
      });

      return NextResponse.json(
        { error: "Incomplete payment data." },
        { status: 400 },
      );
    }

    const { data: topUp, error: topUpError } =
      await supabaseAdmin
        .from("wallet_topups")
        .select(
          "id, wallet_id, checkout_session_id, amount_centavos, status",
        )
        .eq("id", topUpId)
        .maybeSingle();

    if (topUpError) {
      console.error("Wallet top-up lookup error:", topUpError);

      return NextResponse.json(
        { error: "Unable to verify the wallet top-up." },
        { status: 500 },
      );
    }

    if (!topUp) {
      return NextResponse.json(
        { error: "Wallet top-up was not found." },
        { status: 404 },
      );
    }

    if (
      topUp.checkout_session_id !== checkoutSessionId ||
      Number(topUp.amount_centavos) !== amountCentavos
    ) {
      console.error("Wallet top-up payment mismatch", {
        topUpId,
        storedCheckoutSessionId:
          topUp.checkout_session_id,
        receivedCheckoutSessionId: checkoutSessionId,
        storedAmount: topUp.amount_centavos,
        receivedAmount: amountCentavos,
      });

      return NextResponse.json(
        { error: "Payment details do not match." },
        { status: 409 },
      );
    }

    const { data: credited, error: creditError } =
      await supabaseAdmin.rpc("credit_wallet_topup", {
        p_topup_id: topUpId,
        p_payment_id: paymentId,
        p_amount_centavos: amountCentavos,
      });

    if (creditError) {
      console.error(
        "Wallet credit function error:",
        creditError,
      );

      return NextResponse.json(
        { error: "Unable to credit the wallet." },
        { status: 500 },
      );
    }

    if (credited !== true) {
      return NextResponse.json(
        { error: "Wallet top-up could not be completed." },
        { status: 409 },
      );
    }

    return NextResponse.json({
      received: true,
      credited: true,
    });
  } catch (error) {
    console.error(
      "PayMongo wallet webhook error:",
      error,
    );

    return NextResponse.json(
      { error: "Unable to process the webhook." },
      { status: 500 },
    );
  }
}