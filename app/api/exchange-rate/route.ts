import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.frankfurter.dev/v1/latest?base=USD&symbols=PHP,INR",
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch exchange rates." },
        { status: 500 }
      );
    }

    const data = (await res.json()) as {
      date?: string;
      rates?: {
        PHP?: number;
        INR?: number;
      };
    };

    const phpRate = Number(data?.rates?.PHP);
    const inrRate = Number(data?.rates?.INR);

    if (
      !phpRate ||
      Number.isNaN(phpRate) ||
      phpRate <= 0 ||
      !inrRate ||
      Number.isNaN(inrRate) ||
      inrRate <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid exchange rates." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      phpRate,
      inrRate,
      date: data.date ?? null,
    });
  } catch (error) {
    console.error("Exchange rate route error:", error);

    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}