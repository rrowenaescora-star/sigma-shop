import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
  try {
    await sendEmail({
      to: "rrowenaescora@gmail.com",
      subject: "Test Email from Bloxhop",
      html: "<h1>It works 🔥</h1>",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("TEST EMAIL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
