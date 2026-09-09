import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createPaypalOrder } from "@/lib/paypal";
export const runtime="nodejs";
const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
const money=(v:number)=>Math.round((v+Number.EPSILON)*100)/100;
export async function POST(request:Request) {
 try {
  const {user}=await getAuthenticatedUser(); if(!user)return NextResponse.json({error:"Please sign in to pay with PayPal."},{status:401});
  const b=await request.json(); const items=Array.isArray(b.items)?b.items:[]; const username=String(b.robloxUsername||"").trim(); const contact=String(b.contactInfo||"").trim();
  if(!items.length||!username||!Number.isFinite(Number(b.robloxUserId))||!contact)return NextResponse.json({error:"Please complete your delivery details first."},{status:400});
  const quantities=new Map<number,number>(); for(const item of items){const id=Number(item.id),q=Number(item.quantity);if(!Number.isInteger(id)||!Number.isInteger(q)||q<1||q>20)return NextResponse.json({error:"Your cart contains an invalid item."},{status:400});quantities.set(id,(quantities.get(id)||0)+q);}
  const {data:products,error:productError}=await supabase.from("products").select("id,name,price,cost_value,stock,stock_quantity,image_url,game,is_active").in("id",[...quantities.keys()]);
  if(productError||!products||products.length!==quantities.size)return NextResponse.json({error:"One or more products are no longer available."},{status:400});
  let subtotal=0,capital=0; const serverItems:any[]=[];
  for(const p of products){const q=quantities.get(Number(p.id))||0;if(p.is_active===false||p.stock==="Out of Stock"||Number(p.stock_quantity??0)<q)return NextResponse.json({error:`${p.name} is currently unavailable.`},{status:400});const price=money(Number(p.price));if(!Number.isFinite(price)||price<0)return NextResponse.json({error:"A product price is invalid."},{status:400});subtotal+=price*q;capital+=money(Number(p.cost_value||0))*q;serverItems.push({id:p.id,name:p.name,price,quantity:q,image_url:p.image_url,game:p.game});}
  const {data:settings}=await supabase.from("shop_settings").select("global_capital").single();if(!settings||Number(settings.global_capital||0)<capital)return NextResponse.json({error:"One or more products are currently unavailable."},{status:400});
  const couponCode=String(b.couponCode||"").trim().toUpperCase();let discount=0;
  if(couponCode){const {data:coupon,error}=await supabase.from("coupons").select("discount_type,discount_value,is_active,expires_at,usage_limit,used_count").eq("code",couponCode).single();if(error||!coupon||!coupon.is_active||(coupon.expires_at&&new Date(coupon.expires_at)<new Date())||(coupon.usage_limit&&Number(coupon.used_count||0)>=Number(coupon.usage_limit)))return NextResponse.json({error:"That coupon is no longer available."},{status:400});discount=coupon.discount_type==="percent"?money(subtotal*Number(coupon.discount_value||0)/100):money(Number(coupon.discount_value||0));discount=Math.min(discount,subtotal);}
  const total=money(subtotal-discount);if(total<=0)return NextResponse.json({error:"Use the free checkout option for this order."},{status:400});
  const {data:order,error:insertError}=await supabase.from("orders").insert({roblox_username:username,contact_info:contact,notes:String(b.notes||"").slice(0,2000),items:serverItems,total_price:total,original_total:money(subtotal),coupon_code:couponCode||null,coupon_discount:discount,payment_method:"PayPal",payment_provider:"paypal",payment_status:"Creating",status:"Pending",payer_email:user.email||contact,user_id:user.id}).select("id").single();
  if(insertError||!order)return NextResponse.json({error:"We could not create your secure order."},{status:500});
  try {const pp=await createPaypalOrder({intent:"CAPTURE",purchase_units:[{reference_id:String(order.id),custom_id:String(order.id),invoice_id:`bloxhop-${order.id}`,description:`Bloxhop order #${order.id}`,amount:{currency_code:"USD",value:total.toFixed(2),breakdown:{item_total:{currency_code:"USD",value:subtotal.toFixed(2)},discount:{currency_code:"USD",value:discount.toFixed(2)}}},items:serverItems.map(i=>({name:String(i.name).slice(0,127),quantity:String(i.quantity),unit_amount:{currency_code:"USD",value:Number(i.price).toFixed(2)}}))}]},`create-bloxhop-${order.id}`);if(!pp.id)throw new Error();const {error:updateError}=await supabase.from("orders").update({paypal_order_id:pp.id,payment_status:"Pending"}).eq("id",order.id).eq("user_id",user.id);if(updateError)throw new Error();return NextResponse.json({orderID:pp.id});}
  catch {await supabase.from("orders").update({payment_status:"Failed"}).eq("id",order.id).eq("user_id",user.id);return NextResponse.json({error:"Creating secure payment failed. Please try again."},{status:502});}
 } catch {return NextResponse.json({error:"Creating secure payment failed. Please try again."},{status:500});}
}