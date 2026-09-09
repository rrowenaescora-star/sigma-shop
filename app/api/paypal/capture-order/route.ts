import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { capturePaypalOrder,getPaypalOrder,type PaypalOrder } from "@/lib/paypal";
import { finalizeVerifiedPaypalPayment } from "@/lib/paypal-payment";
export const runtime="nodejs";
const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function POST(request:Request) {
 try {const {user}=await getAuthenticatedUser();if(!user)return NextResponse.json({error:"Please sign in to complete payment."},{status:401});const {orderID}=await request.json();if(!orderID||typeof orderID!=="string")return NextResponse.json({error:"Payment could not be completed. Please try again."},{status:400});
 const {data:local}=await supabase.from("orders").select("id,total_price").eq("paypal_order_id",orderID).eq("user_id",user.id).eq("payment_provider","paypal").single();if(!local)return NextResponse.json({error:"This payment does not belong to your account."},{status:403});
 let pp:PaypalOrder;try{pp=await capturePaypalOrder(orderID)}catch{pp=await getPaypalOrder(orderID)}const unit=pp.purchase_units?.[0],capture=unit?.payments?.captures?.[0];
 if(pp.status!=="COMPLETED"||capture?.status!=="COMPLETED"||!capture.id||capture.amount?.value!==Number(local.total_price).toFixed(2)||capture.amount.currency_code!=="USD"||String(unit?.reference_id||unit?.custom_id)!==String(local.id))return NextResponse.json({error:"Payment could not be verified. Please try again."},{status:409});
 const result=await finalizeVerifiedPaypalPayment({orderId:Number(local.id),paypalOrderId:orderID,captureId:capture.id,amount:capture.amount.value,currency:capture.amount.currency_code,payerEmail:pp.payer?.email_address,paidAt:capture.create_time});if(!result.finalized&&!result.already_paid)return NextResponse.json({error:"Payment could not be finalized. Please contact support."},{status:409});return NextResponse.json({success:true,bloxhopOrderId:local.id});
 }catch{return NextResponse.json({error:"Payment could not be completed. Please try again."},{status:500});}
}