import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPaypalOrder,verifyPaypalWebhook } from "@/lib/paypal";
import { finalizeVerifiedPaypalPayment } from "@/lib/paypal-payment";
export const runtime="nodejs";
const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function POST(request:Request){
 try{const event=await request.json();if(!await verifyPaypalWebhook(request.headers,event))return NextResponse.json({error:"Invalid webhook."},{status:400});
 const eventId=String(event.id||"");if(!eventId)return NextResponse.json({error:"Invalid webhook."},{status:400});
 const {error:claimed}=await supabase.from("payment_webhook_events").insert({provider:"paypal",event_id:eventId,event_type:event.event_type,payload:event});
 if(claimed?.code==="23505")return NextResponse.json({received:true,duplicate:true});if(claimed)return NextResponse.json({error:"Webhook storage failed."},{status:500});
 if(event.event_type!=="PAYMENT.CAPTURE.COMPLETED")return NextResponse.json({received:true});
 const paypalOrderId=String(event.resource?.supplementary_data?.related_ids?.order_id||"");if(!paypalOrderId)return NextResponse.json({received:true});
 const pp=await getPaypalOrder(paypalOrderId),unit=pp.purchase_units?.[0],capture=unit?.payments?.captures?.[0],orderId=Number(unit?.reference_id||unit?.custom_id);
 if(pp.status!=="COMPLETED"||capture?.status!=="COMPLETED"||!capture.id||!capture.amount?.value||capture.amount.currency_code!=="USD"||!Number.isInteger(orderId))return NextResponse.json({received:true});
 const {data:local}=await supabase.from("orders").select("id,total_price").eq("id",orderId).eq("paypal_order_id",paypalOrderId).eq("payment_provider","paypal").single();
 if(!local||Number(local.total_price).toFixed(2)!==capture.amount.value)return NextResponse.json({received:true});
 await finalizeVerifiedPaypalPayment({orderId,paypalOrderId,captureId:capture.id,amount:capture.amount.value,currency:capture.amount.currency_code,payerEmail:pp.payer?.email_address,paidAt:capture.create_time});return NextResponse.json({received:true});
 }catch{return NextResponse.json({error:"Webhook processing failed."},{status:500});}
}