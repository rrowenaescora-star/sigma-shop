import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { PAYPAL_GUEST_COOKIE, guestSessionsMatch } from "@/lib/paypal-guest-session";
const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET(request:Request){
 const orderId=Number(new URL(request.url).searchParams.get("orderId"));
 if(!Number.isInteger(orderId)||orderId<1)return NextResponse.json({error:"Order not found."},{status:400});
 const session=(await cookies()).get(PAYPAL_GUEST_COOKIE)?.value;
 const {data,error}=await supabase.from("orders").select("id,payment_status,status,paid_amount,paid_currency,paid_at,checkout_session_hash").eq("id",orderId).eq("payment_provider","paypal").single();
 if(error||!data||!guestSessionsMatch(session,data.checkout_session_hash))return NextResponse.json({error:"Order not found."},{status:404});
 return NextResponse.json({orderId:data.id,paid:data.payment_status==="Paid",status:data.payment_status,amount:data.paid_amount,currency:data.paid_currency,paidAt:data.paid_at});
}