import { createClient } from "@supabase/supabase-js";
import { deductCapitalForPaidOrder } from "@/lib/capital";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
type Payment = { orderId:number; paypalOrderId:string; captureId:string; amount:string; currency:string; payerEmail?:string|null; paidAt?:string|null };
export async function finalizeVerifiedPaypalPayment(p: Payment) {
 const {data,error}=await supabase.rpc("finalize_paypal_payment",{p_order_id:p.orderId,p_paypal_order_id:p.paypalOrderId,p_paypal_capture_id:p.captureId,p_paid_amount:p.amount,p_paid_currency:p.currency,p_payer_email:p.payerEmail||null,p_paid_at:p.paidAt||new Date().toISOString()});
 if(error) throw new Error("Payment could not be finalized.");
 const result=data as {finalized?:boolean;already_paid?:boolean}; if(result.finalized) await deductCapitalForPaidOrder(p.orderId); return result;
}
export async function getPaypalOrderForUser(orderId:number,userId:string) {
 const {data,error}=await supabase.from("orders").select("id,payment_status,status").eq("id",orderId).eq("user_id",userId).eq("payment_provider","paypal").single(); return error?null:data;
}