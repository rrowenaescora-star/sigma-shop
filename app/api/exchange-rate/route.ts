import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.frankfurter.dev/v1/latest?base=USD&symbols=PHP",
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch exchange rate." },
        { status: 500 }
      );
    }

    const data = (await res.json()) as {
      date?: string;
      rates?: {
        PHP?: number;
      };
    };

    const rate = Number(data?.rates?.PHP);

    if (!rate || Number.isNaN(rate) || rate <= 0) {
      return NextResponse.json(
        { error: "Invalid exchange rate." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      rate,
      date: data.date ?? null,
    });
  } catch (error) {
    console.error("Exchange rate route error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}