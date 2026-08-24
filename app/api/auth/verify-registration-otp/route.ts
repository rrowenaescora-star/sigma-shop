import crypto from "crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { normalizeCustomerEmail, registrationOtpHash } from "@/lib/customer-registration-otp";


export async function POST(request: Request) {
  try {
    const { email: rawEmail, code: rawCode } = await request.json();
    const email = normalizeCustomerEmail(rawEmail);
    const code = String(rawCode ?? "").trim();
    if (!email || !/^\d{6}$/.test(code)) return NextResponse.json({ error: "Enter the six-digit code from your email." }, { status: 400 });

    const { data: record, error: recordError } = await supabaseAdmin
      .from("customer_registration_otps")
      .select("code_hash, expires_at, attempts")
      .eq("email", email)
      .maybeSingle();
    if (recordError) throw recordError;
    if (!record || new Date(record.expires_at).getTime() <= Date.now() || Number(record.attempts) >= 5) {
      return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 });
    }

    const expected = Buffer.from(record.code_hash, "hex");
    const actual = Buffer.from(registrationOtpHash(code), "hex");
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
      await supabaseAdmin.from("customer_registration_otps").update({ attempts: Number(record.attempts) + 1 }).eq("email", email);
      return NextResponse.json({ error: "That code is not correct. Please try again." }, { status: 400 });
    }

    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) throw usersError;
    const user = usersData.users.find((item) => item.email?.trim().toLowerCase() === email);
    if (!user) return NextResponse.json({ error: "We could not find a pending account for this email." }, { status: 400 });

    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true });
    if (confirmError) throw confirmError;
    await supabaseAdmin.from("customer_registration_otps").delete().eq("email", email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Customer registration OTP verification failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "We could not verify that code. Please try again." }, { status: 500 });
  }
}