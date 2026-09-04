"use client";

import { useEffect, useState } from "react";

type Announcement = { subject:string; productName:string; title:string; imageUrl:string; message:string; secondaryText:string; ctaText:string; ctaUrl:string };

export default function AnnouncementScheduler({ announcement }: { announcement: Announcement }) {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/admin/announcement-schedule", { cache: "no-store" }).then((response) => response.json()).then((data) => setRecipients(data.recipients || [])).catch(() => setNotice("Could not load customer emails."));
  }, []);

  function toggle(value: string) {
    setSelected((current) => current.includes(value) ? current.filter((email) => email !== value) : [...current, value]);
  }

  async function schedule() {
    setNotice("");
    const response = await fetch("/api/admin/announcement-schedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ announcement, recipients: selected, scheduledAt }) });
    const data = await response.json();
    setNotice(response.ok ? "Scheduled successfully. It will only send at the selected time." : (data.error || "Could not schedule announcement."));
    if (response.ok) { setSelected([]); setScheduledAt(""); }
  }

  return <section className="mt-6 rounded-[2rem] border border-blue-300/15 bg-[#0b1728] p-6">
    <h3 className="text-xl font-black">Schedule announcement</h3>
    <p className="mt-2 text-sm text-slate-400">Optional. It will not send unless you select recipients, set a date and time, then schedule it.</p>
    <label className="mt-5 block text-sm font-bold text-slate-200">Send date and time<input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="mt-2 w-full rounded-xl border border-blue-300/20 bg-[#07111f] px-4 py-3 text-white outline-none focus:border-cyan-300" /></label>
    <div className="mt-5"><div className="flex items-center justify-between gap-3"><p className="text-sm font-bold">Choose recipients</p><button type="button" onClick={() => setSelected(selected.length === recipients.length ? [] : recipients)} className="text-xs font-bold text-cyan-300">{selected.length === recipients.length ? "Clear all" : "Select all"}</button></div>
      <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#07111f]">{recipients.map((address) => <label key={address} className="flex cursor-pointer items-center gap-3 border-b border-white/5 px-4 py-3 text-sm last:border-0"><input type="checkbox" checked={selected.includes(address)} onChange={() => toggle(address)} className="h-4 w-4 accent-cyan-400" />{address}</label>)}{!recipients.length && <p className="p-4 text-sm text-slate-500">No eligible customer emails found.</p>}</div>
    </div>
    <button type="button" onClick={schedule} disabled={!scheduledAt || !selected.length} className="mt-5 w-full rounded-xl bg-cyan-400 px-5 py-3 font-black text-slate-950 disabled:opacity-40">Schedule for {selected.length} selected customer{selected.length === 1 ? "" : "s"}</button>
    {notice && <p className="mt-3 text-sm text-cyan-100">{notice}</p>}
  </section>;
}