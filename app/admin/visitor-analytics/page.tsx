"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "../admin-header";

type Summary = { visits:number; uniqueVisitors:number; visitsToday:number; visitorsToday:number; signedIn:number };
type Row = { label:string; value:number };
type Event = { id:number; visitor_id:string; path:string; customer_email:string | null; device:string | null; country:string | null; created_at:string };

export default function VisitorAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<{summary:Summary;pages:Row[];countries:Row[];devices:Row[];recent:Event[]} | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/visitor-analytics", { cache: "no-store" });
      if (response.status === 401) { router.replace("/admin/login"); return; }
      const next = await response.json();
      if (!response.ok) setError(next.error || "Could not load visitor analytics."); else setData(next);
    } catch { setError("Could not load visitor analytics."); } finally { setLoading(false); }
  }, [router]);
  useEffect(() => { void load(); }, [load]);
  return <main className="min-h-screen bg-[#06101d] p-5 text-white sm:p-8 lg:p-10"><AdminHeader title="Visitor Analytics" subtitle="Understand which pages shoppers visit and how they browse." active="analytics" onRefresh={load} />
    {error && <div className="mb-6 rounded-2xl border border-amber-300/25 bg-amber-500/10 p-4 text-amber-100">{error}</div>}
    {loading && <p className="text-slate-400">Loading visitor data...</p>}
    {data && <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Card label="Visits recorded" value={data.summary.visits} /><Card label="Unique visitors" value={data.summary.uniqueVisitors} /><Card label="Visits in 24 hours" value={data.summary.visitsToday} /><Card label="Visitors in 24 hours" value={data.summary.visitorsToday} /><Card label="Signed-in customers" value={data.summary.signedIn} /></div>
      <div className="mt-7 grid gap-6 xl:grid-cols-3"><List title="Most visited pages" rows={data.pages} /><List title="Visitor countries" rows={data.countries} /><List title="Devices" rows={data.devices} /></div>
      <section className="mt-7 rounded-3xl border border-white/10 bg-[#0b1728] p-5"><h2 className="text-xl font-black">Recent visits</h2><p className="mt-1 text-sm text-slate-400">Customer email is shown only when that visitor was signed in.</p><div className="mt-5 max-h-[520px] overflow-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="sticky top-0 bg-[#0b1728] text-slate-400"><tr><th className="p-3">When</th><th className="p-3">Customer</th><th className="p-3">Page</th><th className="p-3">Country</th><th className="p-3">Device</th></tr></thead><tbody>{data.recent.map((event) => <tr key={event.id} className="border-t border-white/5"><td className="p-3 text-slate-400">{new Date(event.created_at).toLocaleString()}</td><td className="p-3 font-semibold">{event.customer_email || "Anonymous visitor"}</td><td className="p-3 text-cyan-200">{event.path}</td><td className="p-3">{event.country || "Unknown"}</td><td className="p-3">{event.device || "Unknown"}</td></tr>)}{!data.recent.length && <tr><td colSpan={5} className="p-6 text-center text-slate-500">No visits have been recorded yet.</td></tr>}</tbody></table></div></section></>}
  </main>;
}
function Card({label,value}:{label:string;value:number}) { return <div className="rounded-3xl border border-cyan-300/15 bg-[#0b1728] p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-3xl font-black text-cyan-200">{value.toLocaleString()}</p></div>; }
function List({title,rows}:{title:string;rows:Row[]}) { const max=Math.max(...rows.map((row)=>row.value),1); return <section className="rounded-3xl border border-white/10 bg-[#0b1728] p-5"><h2 className="font-black">{title}</h2><div className="mt-4 space-y-3">{rows.map((row)=><div key={row.label}><div className="flex justify-between gap-3 text-sm"><span className="truncate">{row.label}</span><b>{row.value}</b></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-400" style={{width:`${row.value/max*100}%`}} /></div></div>)}{!rows.length&&<p className="text-sm text-slate-500">No data yet.</p>}</div></section>; }