"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type RobloxUser={id:number;username:string;displayName:string;avatarUrl:string|null};
type Fulfillment={paid:boolean;username:string|null;deliveryStatus:string;invitationUrl?:string|null};

export default function StealAnEggOrderClient(){
  const search=useSearchParams();
  const orderId=Number(search.get("orderId"));
  const paymentProvider=search.get("provider");
  const [paymentChecking,setPaymentChecking]=useState(true);
  const [paid,setPaid]=useState(false);
  const [query,setQuery]=useState("");
  const [results,setResults]=useState<RobloxUser[]>([]);
  const [selected,setSelected]=useState<RobloxUser|null>(null);
  const [searching,setSearching]=useState(false);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [fulfillment,setFulfillment]=useState<Fulfillment>({paid:false,username:null,deliveryStatus:"Pending",invitationUrl:null});

  const refreshStatus=useCallback(async()=>{
    if(!Number.isInteger(orderId)||orderId<1)return;
    const response=await fetch(`/api/steal-an-egg/fulfillment?orderId=${orderId}`,{cache:"no-store"});
    if(response.ok){const data=await response.json();setFulfillment(data);setPaid(data.paid===true);}
  },[orderId]);

  useEffect(()=>{
    if(!Number.isInteger(orderId)||orderId<1){setPaymentChecking(false);return;}
    let stopped=false;let timer:number|undefined;
    const clearPurchasedCart=()=>{try{const cart=JSON.parse(localStorage.getItem("real-cart")||"[]");localStorage.setItem("real-cart",JSON.stringify(Array.isArray(cart)?cart.filter((item:any)=>item.game!=="steal-an-egg"):[]));window.dispatchEvent(new Event("bloxhop-cart-updated"));}catch{}};
    if(paymentProvider==="paymongo"){
      let attempts=0;
      const check=async()=>{try{const response=await fetch(`/api/steal-an-egg/fulfillment?orderId=${orderId}`,{cache:"no-store"});const data=await response.json();if(stopped)return;if(response.ok&&data.paid===true){setFulfillment(data);setPaid(true);setPaymentChecking(false);clearPurchasedCart();return;}}catch{}attempts+=1;if(attempts>=30){setPaymentChecking(false);return;}timer=window.setTimeout(check,2000);};
      check();return()=>{stopped=true;if(timer)window.clearTimeout(timer);};
    }
    fetch(`/api/paypal/order-status?orderId=${orderId}`,{cache:"no-store"}).then(async response=>({ok:response.ok,data:await response.json()})).then(({ok,data})=>{if(stopped)return;const confirmed=ok&&data.paid===true;setPaid(confirmed);setPaymentChecking(false);if(confirmed){clearPurchasedCart();refreshStatus();}}).catch(()=>setPaymentChecking(false));
    return()=>{stopped=true;};
  },[orderId,paymentProvider,refreshStatus]);

  useEffect(()=>{if(!paid)return;const timer=window.setInterval(refreshStatus,5000);return()=>window.clearInterval(timer);},[paid,refreshStatus]);

  async function searchUsers(){
    setSearching(true);setMessage("");setResults([]);setSelected(null);
    try{const response=await fetch("/api/steal-an-egg/roblox-search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query})});const data=await response.json();if(!response.ok){setMessage(data.error||"Search failed.");return;}setResults(data.users||[]);if(!(data.users||[]).length)setMessage("No matching Roblox accounts found.");}catch{setMessage("Roblox search is temporarily unavailable.");}finally{setSearching(false);}
  }

  async function saveAccount(){
    if(!selected)return;setSaving(true);setMessage("");
    try{const response=await fetch("/api/steal-an-egg/fulfillment",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId,action:"select-account",userId:selected.id})});const data=await response.json();if(!response.ok){setMessage(data.error||"Could not save the account.");return;}await refreshStatus();}finally{setSaving(false);}
  }

  async function markFriendRequestSent(){
    setSaving(true);setMessage("");
    try{const response=await fetch("/api/steal-an-egg/fulfillment",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId,action:"friend-request-sent"})});const data=await response.json();if(!response.ok){setMessage(data.error||"Could not update your status.");return;}await refreshStatus();}finally{setSaving(false);}
  }

  if(paymentChecking)return <main className="flex min-h-screen items-center justify-center bg-[#07111f] text-white"><p className="font-bold">Confirming your payment securely…</p></main>;
  if(!paid)return <main className="flex min-h-screen items-center justify-center bg-[#07111f] px-5 text-white"><div className="max-w-lg rounded-3xl border border-red-400/20 bg-[#0b1628] p-8 text-center"><h1 className="text-3xl font-black">Instructions locked</h1><p className="mt-4 text-slate-300">We could not confirm a completed payment for this checkout session.</p><Link href="/steal-an-egg/checkout" className="mt-6 inline-flex rounded-xl bg-cyan-500 px-5 py-3 font-bold">Return to checkout</Link></div></main>;

  const accountSelected=Boolean(fulfillment.username);
  const waiting=fulfillment.deliveryStatus==="Friend request awaiting verification";
  const verified=["Friend request verified","Delivering","Delivered"].includes(fulfillment.deliveryStatus);
  const delivered=fulfillment.deliveryStatus==="Delivered";

  if(delivered)return <main className="flex min-h-screen items-center justify-center bg-[#031827] px-4 py-10 text-white"><div className="pointer-events-none fixed inset-0 bg-[linear-gradient(135deg,rgba(0,181,216,.24),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(126,235,0,.2),transparent_35%)]"/><section className="relative w-full max-w-3xl overflow-hidden rounded-2xl border-[4px] border-black bg-gradient-to-b from-[#08bad0] via-[#087aa2] to-[#07345f] p-1 shadow-[10px_10px_0_#000]"><div className="rounded-xl border-2 border-black bg-[#061b2f]/90 p-7 text-center sm:p-12"><img src="/steal-an-egg-logo.png" alt="Steal an Egg" className="mx-auto h-24 w-auto max-w-full object-contain drop-shadow-[0_5px_0_rgba(0,0,0,.8)] sm:h-32"/><div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-black bg-[#7eeb00] text-4xl font-black text-black shadow-[4px_4px_0_#000]">✓</div><p className="mt-6 inline-flex rounded-md border-2 border-black bg-[#7eeb00] px-4 py-1 text-xs font-black uppercase tracking-[.25em] text-black">Order completed</p><h1 className="mt-5 text-4xl font-black text-white [text-shadow:3px_3px_0_#000] sm:text-5xl">THANK YOU!</h1><p className="mx-auto mt-4 max-w-lg text-base font-semibold leading-7 text-cyan-50">Your Steal an Egg item has been delivered successfully. Thank you for choosing Bloxhop Online Store!</p><div className="mx-auto mt-6 max-w-sm rounded-xl border-[3px] border-black bg-[#f4fbff] px-5 py-4 text-[#07111f] shadow-[5px_5px_0_#000]"><p className="text-sm font-bold text-slate-600">ORDER #{orderId}</p><p className="mt-2 text-xl font-black text-[#087397]">✓ DELIVERY COMPLETE</p></div><Link href="/steal-an-egg" className="mt-8 inline-flex min-h-14 w-full max-w-sm items-center justify-center rounded-lg border-[3px] border-black bg-[#7eeb00] px-6 py-3 text-lg font-black text-black shadow-[5px_5px_0_#000] transition hover:-translate-y-0.5 hover:bg-[#92ff14]">BACK TO MERCHANT</Link></div></section></main>;  return <main className="min-h-screen bg-[#031827] px-4 py-8 text-white sm:px-6"><div className="pointer-events-none fixed inset-0 bg-[linear-gradient(135deg,rgba(0,181,216,.2),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(126,235,0,.12),transparent_35%)]"/><div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border-[4px] border-black bg-[#061b2f] shadow-[9px_9px_0_#000]">
    <header className="border-b-[4px] border-black bg-gradient-to-r from-[#087397] via-[#09bcd4] to-[#1955b9] p-6 text-center sm:p-8"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-black bg-[#7eeb00] text-3xl font-black text-black shadow-[4px_4px_0_#000]">✓</div><p className="mt-4 inline-flex rounded-md border-2 border-black bg-[#7eeb00] px-3 py-1 text-xs font-black uppercase tracking-[.2em] text-black">Payment received</p><h1 className="mt-4 text-3xl font-black text-white [text-shadow:3px_3px_0_#000] sm:text-4xl">Complete your delivery setup</h1><p className="mt-3 text-sm text-slate-300">Order #{orderId}. Follow each step below. Never share your Roblox password.</p></header>

    <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_.85fr]">
      <section className="space-y-6">
        <div className={`rounded-xl border-[3px] border-black p-5 shadow-[4px_4px_0_#000] ${accountSelected?"border-emerald-400/30 bg-emerald-400/5":"border-cyan-300/20 bg-white/[.03]"}`}><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-black bg-[#7eeb00] font-black text-black">1</span><h2 className="text-xl font-black">Choose your Roblox account</h2></div>{accountSelected?<div className="mt-4 rounded-xl bg-black/20 p-4"><p className="text-sm text-slate-400">Selected account</p><p className="mt-1 text-lg font-black text-emerald-300">@{fulfillment.username}</p></div>:<><div className="mt-4 flex gap-2"><input value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{if(event.key==="Enter")searchUsers();}} placeholder="Enter Roblox username" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 outline-none focus:border-cyan-300"/><button onClick={searchUsers} disabled={searching||query.trim().length<3} className="rounded-xl bg-cyan-500 px-5 py-3 font-bold disabled:opacity-50">{searching?"Searching…":"Search"}</button></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{results.map(user=><button key={user.id} onClick={()=>setSelected(user)} className={`flex items-center gap-3 rounded-xl border p-3 text-left ${selected?.id===user.id?"border-cyan-300 bg-cyan-400/10":"border-white/10 bg-white/[.03]"}`}><img src={user.avatarUrl||"/logo.webp"} alt="" className="h-12 w-12 rounded-lg object-cover"/><span className="min-w-0"><strong className="block truncate">{user.displayName||user.username}</strong><span className="block truncate text-xs text-slate-400">@{user.username}</span></span></button>)}</div>{selected&&<button onClick={saveAccount} disabled={saving} className="mt-4 w-full rounded-lg border-[3px] border-black bg-[#7eeb00] px-5 py-3 font-black text-black shadow-[4px_4px_0_#000]">{saving?"Saving…":`Yes, @${selected.username} is my account`}</button>}</>}</div>

        <div className={`rounded-2xl border-[4px] border-black p-5 shadow-[7px_7px_0_#000] ${accountSelected?"bg-gradient-to-br from-[#7eeb00] via-[#45d51a] to-[#08a66c] text-[#061b2f]":"bg-[#173044] opacity-50"}`}><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-black bg-[#7eeb00] font-black text-black">2</span><h2 className="text-xl font-black">Add BloxhopOnlineStore</h2></div><p className="mt-3 text-sm font-bold leading-6 text-[#061b2f]">Open the official <strong>BloxhopOnlineStore</strong> profile, click <strong>Add Friend</strong>, then return here and confirm.</p><a href="https://www.roblox.com/users/10816784151/profile?friendshipSourceType=PlayerSearch" target="_blank" rel="noreferrer" className={`mt-4 flex min-h-14 w-full items-center justify-center rounded-xl border-[3px] border-black bg-white px-5 py-3 text-center text-base font-black text-[#061b2f] shadow-[5px_5px_0_#000] transition hover:-translate-y-0.5 hover:bg-cyan-50 ${!accountSelected?"pointer-events-none":""}`}>Open Profile &amp; Send Friend Request ↗</a>{accountSelected&&!waiting&&!verified&&<button onClick={markFriendRequestSent} disabled={saving} className="mt-3 w-full rounded-lg border-[3px] border-black bg-[#09bcd4] px-5 py-3 font-black text-black shadow-[4px_4px_0_#000]">I sent the friend request</button>}{(waiting||verified)&&<p className="mt-4 rounded-xl border-2 border-black bg-white p-3 text-sm font-black text-[#087397] shadow-[3px_3px_0_#000]">✓ Friend request submitted</p>}</div>

        <div className={`rounded-xl border-[3px] border-black p-5 shadow-[4px_4px_0_#000] ${verified?"border-emerald-400/30 bg-emerald-400/5":"border-white/10 bg-white/[.03]"}`}><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-black bg-[#7eeb00] font-black text-black">3</span><h2 className="text-xl font-black">Wait for the server invitation</h2></div><p className="mt-3 text-sm leading-6 text-slate-300">{delivered?"Your item delivery is complete.":fulfillment.deliveryStatus==="Delivering"?"Your server invitation has been sent. Open Roblox and join BloxhopOnlineStore in the invited server to receive your item.":verified?"Your friend request was verified. Keep Roblox open and wait for BloxhopOnlineStore to invite you to the delivery server. You must join the same server to receive your item.":"Bloxhop staff will verify and accept your friend request first. This page updates automatically."}</p>{fulfillment.deliveryStatus==="Delivering"&&fulfillment.invitationUrl&&<a href={fulfillment.invitationUrl} target="_blank" rel="noreferrer" className="mt-4 flex w-full items-center justify-center rounded-lg border-[3px] border-black bg-[#7eeb00] px-5 py-3 font-black text-black shadow-[4px_4px_0_#000] hover:bg-[#92ff14]">Join Delivery Server ↗</a>}{delivered&&<p className="mt-4 font-black text-emerald-300">✓ Delivery completed</p>}</div>
        {message&&<p className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{message}</p>}
      </section>

      <aside><h2 className="text-lg font-black">Live status</h2><div className="mt-4 space-y-3">{[[true,"Payment confirmed"],[accountSelected,"Roblox account selected"],[waiting||verified,"Friend request awaiting verification"],[verified,"Friend request verified"],[fulfillment.deliveryStatus==="Delivering"||delivered,"Server invitation sent"]].map(([done,label],index)=><div key={String(label)} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.03] p-3"><span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-black ${done?"bg-emerald-500 text-white":"bg-slate-700 text-slate-400"}`}>{done?"✓":index+1}</span><span className={done?"font-bold text-white":"text-sm text-slate-400"}>{String(label)}</span></div>)}</div><p className="mt-5 text-xs leading-5 text-slate-500">Status refreshes automatically every five seconds. You can safely keep or revisit this page in the same browser.</p></aside>
    </div>
  </div></main>;
}