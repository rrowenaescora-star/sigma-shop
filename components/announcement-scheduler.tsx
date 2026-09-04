"use client";

import { useEffect, useMemo, useState } from "react";

type Announcement = { subject:string; productName:string; title:string; imageUrl:string; message:string; secondaryText:string; ctaText:string; ctaUrl:string };
const email = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function AnnouncementScheduler({ announcement }: { announcement: Announcement }) {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [manualRecipients, setManualRecipients] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notice, setNotice] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [pendingAction, setPendingAction] = useState<"add" | "send" | "schedule" | null>(null);
  const manual = useMemo(() => [...new Set(manualRecipients.split(/[\s,;]+/).map((item) => item.trim().toLowerCase()).filter(email))], [manualRecipients]);
  const chosen = [...new Set([...selected, ...manual])];
  const isBusy = pendingAction !== null;

  async function load() {
    const data = await fetch("/api/admin/announcement-schedule", { cache: "no-store" }).then((response) => response.json());
    setRecipients(data.recipients || []);
    setJobs(data.jobs || []);
  }

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(timer);
  }, []);

  function toggle(value: string) {
    if (!isBusy) setSelected((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function addManualRecipients() {
    if (!manual.length) { setNotice("Enter a valid email address first."); return; }
    if (isBusy) return;
    setPendingAction("add");
    setRecipients((current) => [...new Set([...current, ...manual])].sort());
    setSelected((current) => [...new Set([...current, ...manual])]);
    setManualRecipients("");
    setNotice(manual.length + " recipient" + (manual.length === 1 ? " added." : "s added."));
    window.setTimeout(() => setPendingAction(null), 350);
  }

  async function schedule(sendNow = false) {
    if (isBusy) return;
    setPendingAction(sendNow ? "send" : "schedule");
    setNotice("");
    try {
      const response = await fetch("/api/admin/announcement-schedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ announcement, recipients: chosen, scheduledAt, sendNow }) });
      const data = await response.json();
      setNotice(response.ok ? (sendNow ? "Sent successfully." : "Scheduled successfully. It will only send at the selected time.") : (data.error || "Could not schedule announcement."));
      if (response.ok) { setSelected([]); setManualRecipients(""); setScheduledAt(""); await load(); }
    } catch {
      setNotice(sendNow ? "Could not send announcement." : "Could not schedule announcement.");
    } finally {
      setPendingAction(null);
    }
  }

  return <div className="mt-7 border-t border-white/10 pt-6">
    <h3 className="text-lg font-black">Schedule announcement</h3>
    <p className="mt-1 text-sm text-slate-400">Optional — no email is sent until you schedule it.</p>
    <label className="mt-4 block text-sm font-bold text-slate-200">Send date and time<input disabled={isBusy} type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="mt-2 w-full rounded-xl border border-blue-300/20 bg-[#07111f] px-4 py-3 text-white outline-none focus:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-50" /></label>
    <label className="mt-4 block text-sm font-bold text-slate-200">Manual recipients<textarea disabled={isBusy} value={manualRecipients} onChange={(event) => setManualRecipients(event.target.value)} rows={3} placeholder="Paste emails separated by commas or new lines" className="mt-2 w-full rounded-xl border border-blue-300/20 bg-[#07111f] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-50" /></label>
    <button type="button" onClick={addManualRecipients} disabled={!manual.length || isBusy} className="mt-2 rounded-xl border border-cyan-300/30 bg-cyan-500/10 px-4 py-2 text-sm font-black text-cyan-100 disabled:opacity-40">{pendingAction === "add" ? "Adding..." : "Add recipient" + (manual.length === 1 ? "" : "s")}</button>
    <div className="mt-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-bold">Saved customer emails</p><button type="button" disabled={isBusy} onClick={() => setSelected(selected.length === recipients.length ? [] : recipients)} className="text-xs font-bold text-cyan-300 disabled:opacity-40">{selected.length === recipients.length ? "Clear all" : "Select all"}</button></div>
      <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-[#07111f]">{recipients.map((address) => <label key={address} className="flex cursor-pointer items-center gap-3 border-b border-white/5 px-3 py-2 text-xs last:border-0"><input disabled={isBusy} type="checkbox" checked={selected.includes(address)} onChange={() => toggle(address)} className="h-4 w-4 accent-cyan-400 disabled:cursor-not-allowed" />{address}</label>)}{!recipients.length && <p className="p-3 text-sm text-slate-500">No saved customer emails found.</p>}</div>
    </div>
    <div className="mt-4 grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => schedule(true)} disabled={!chosen.length || isBusy} className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 px-5 py-3 font-black text-cyan-100 disabled:opacity-40">{pendingAction === "send" ? "Sending..." : "Send now to " + (chosen.length || 0)}</button><button type="button" onClick={() => schedule(false)} disabled={!scheduledAt || !chosen.length || isBusy} className="rounded-xl bg-cyan-400 px-5 py-3 font-black text-slate-950 disabled:opacity-40">{pendingAction === "schedule" ? "Scheduling..." : "Schedule for " + (chosen.length || 0)}</button></div>
    {notice && <p className="mt-3 text-sm text-cyan-100">{notice}</p>}
    <div className="mt-5 border-t border-white/10 pt-4"><p className="text-sm font-black">Announcement status</p><div className="mt-2 max-h-60 space-y-2 overflow-y-auto pr-2">{!jobs.length && <p className="text-xs text-slate-500">No sent or scheduled announcements yet.</p>}{jobs.map((job) => <div key={job.id} className="rounded-lg bg-white/5 px-3 py-2 text-xs"><div className="flex justify-between gap-3"><span className="truncate font-bold">{job.announcement?.title || "Announcement"}</span><span className={job.status === "completed" ? "text-emerald-300" : job.status === "failed" ? "text-red-300" : "text-amber-300"}>{job.status}</span></div><p className="mt-1 text-slate-400">{job.status === "completed" ? "Sent " + new Date(job.completed_at).toLocaleString() : job.status === "failed" ? (job.error || "Failed") : "Scheduled " + new Date(job.scheduled_at).toLocaleString()} · {(job.recipients || []).length} recipient(s)</p></div>)}</div></div>
  </div>;
}