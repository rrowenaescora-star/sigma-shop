"use client";

import { useEffect, useState } from "react";

export default function PayPalTestPage() {
  const [result, setResult] = useState("Checking LIVE PayPal eligibility...");

  useEffect(() => {
    const script = document.createElement("script");

    // LIVE PayPal SDK v6
    script.src = "https://www.paypal.com/web-sdk/v6/core";
    script.async = true;

    script.onload = async () => {
      try {
        const paypal = (window as any).paypal;

        if (!paypal) {
          throw new Error("PayPal SDK loaded but window.paypal was not found.");
        }

        // Initialize LIVE PayPal SDK
        const sdkInstance = await paypal.createInstance({
          clientId: "BAAG8BMEVqqoMEoZeq8o_gilPRVtsrU2z2P-5yvyLm7hP_S2h3f-qta4c9Z9jIs5J_EftgFv-XXD_stbuw",

          components: [
            "paypal-payments",
            "googlepay-payments",
          ],

          pageType: "checkout",
        });

        // Ask PayPal which payment methods this LIVE
        // merchant/session is eligible to use.
        const methods = await sdkInstance.findEligibleMethods({
          currencyCode: "USD",
        });

        const eligibility = {
          paypal: methods.isEligible("paypal"),
          googlePay: methods.isEligible("googlepay"),
          card: methods.isEligible("card"),
        };

        setResult(
          "LIVE PAYPAL ELIGIBILITY\n\n" +
            JSON.stringify(eligibility, null, 2)
        );

        console.log("LIVE PayPal eligibility:", eligibility);
        console.log("Full PayPal eligibility response:", methods);
      } catch (error: any) {
        console.error("PayPal eligibility error:", error);

        setResult(
          "ERROR:\n\n" +
            (error?.message || String(error))
        );
      }
    };

    script.onerror = () => {
      setResult(
        "ERROR:\n\nPayPal LIVE JavaScript SDK failed to load."
      );
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <main
      style={{
        padding: "40px",
        minHeight: "500px",
      }}
    >
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        PayPal LIVE SDK v6 Eligibility Test
      </h1>

      <pre
        style={{
          padding: "20px",
          background: "#ffffff",
          color: "#000000",
          borderRadius: "8px",
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
        }}
      >
        {result}
      </pre>

      <p
        style={{
          marginTop: "20px",
          fontSize: "14px",
        }}
      >
        Eligibility check only. No payment will be created or charged.
      </p>
    </main>
  );
}