"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "../admin-header";
import AnnouncementScheduler from "@/components/announcement-scheduler";

type Announcement = {
  subject: string;
  productName: string;
  title: string;
  imageUrl: string;
  message: string;
  secondaryText: string;
  ctaText: string;
  ctaUrl: string;
};

type Stats = {
  totalEligibleOrders: number;
  uniqueValidEmails: number;
  duplicatesRemoved: number;
  invalidOrEmptySkipped: number;
};

type Campaign = {
  id: string;
  subject: string;
  title: string;
  product_name: string;
  image_url: string;
  message: string;
  secondary_text: string | null;
  cta_text: string;
  cta_url: string;
  recipient_count: number;
  processed_count: number;
  current_batch: number;
  total_batches: number;
  retry_attempts: number;
  successful_count: number;
  failed_count: number;
  status: "preparing" | "queued" | "sending" | "completed" | "completed_with_errors" | "failed";
  created_at: string;
  sent_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
};

type Activity = {
  id: number; event_type: string; message: string; detail: string | null;
  masked_email: string | null; created_at: string;
};

const defaults: Announcement = {
  subject: "{FRUIT_NAME} Is Now Available at Bloxhop!",
  productName: "Magnet Fruit",
  title: "The New {FRUIT_NAME} Is Here!",
  imageUrl: "https://bloxhop.site/logo.png",
  message:
    "Humans, it’s finally here!\n\nThe new {FRUIT_NAME} has arrived at Bloxhop.\n\nReady to try it out? Grab yours, jump into the game, and start playing with the newest fruit today.\n\nLet’s go shop and play!",
  secondaryText: "Available now while supplies last.",
  ctaText: "Get It Now",
  ctaUrl: "https://bloxhop.site/home",
};

function withProduct(value: string, productName: string) {
  return value.replace(/\{FRUIT_NAME\}/gi, productName);
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "url" | "email";
}) {
  return (
    <label className="block text-sm font-bold text-slate-200">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-blue-300/20 bg-[#07111f] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-300"
      />
    </label>
  );
}

export default function AnnouncementPage() {
  const router = useRouter();
  const [announcement, setAnnouncement] = useState<Announcement>(defaults);
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<Campaign[]>([]);
  const [historyAvailable, setHistoryAvailable] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const processingRef = useRef(false);

  useEffect(() => {
    const savedDraft = localStorage.getItem("bloxhop-announcement-draft");
    if (savedDraft) { try { setAnnouncement(JSON.parse(savedDraft)); } catch {} }
  }, []);

  useEffect(() => { localStorage.setItem("bloxhop-announcement-draft", JSON.stringify(announcement)); }, [announcement]);

  const preview = useMemo(
    () => ({
      subject: withProduct(announcement.subject, announcement.productName),
      title: withProduct(announcement.title, announcement.productName),
      message: withProduct(announcement.message, announcement.productName),
      secondaryText: withProduct(announcement.secondaryText, announcement.productName),
    }),
    [announcement],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/announcements", { cache: "no-store" });
    if (response.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const data = await response.json();
    if (!response.ok) setError(data.error || "Could not load announcement data.");
    else {
      setStats(data.stats);
      setHistory(data.history || []);
      setHistoryAvailable(data.historyAvailable !== false);
      setCurrentCampaign(data.currentCampaign || null);
      setActivity(data.activity || []);
      if (["preparing", "queued", "sending"].includes(data.currentCampaign?.status) && !processingRef.current) void processCampaign(data.currentCampaign.id);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadData]);

  function update<K extends keyof Announcement>(key: K, value: Announcement[K]) {
    setAnnouncement((current) => ({ ...current, [key]: value }));
  }

  async function sendTest() {
    setSendingTest(true);
    setNotice("");
    setError("");
    const response = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test", testEmail, announcement }),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error || "Test email could not be sent.");
    else setNotice("Test announcement sent successfully.");
    setSendingTest(false);
  }

  async function processCampaign(campaignId: string) {
    if (processingRef.current) return;
    processingRef.current = true;
    setSendingAll(true);
    try {
      for (;;) {
        const response = await fetch("/api/admin/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "process", campaignId }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Campaign processing paused.");
        setCurrentCampaign(data.campaign);
        setActivity(data.activity || []);
        if (!["preparing", "queued", "sending"].includes(data.campaign?.status)) {
          setNotice(data.campaign?.status === "completed" ? "Campaign completed." : "Campaign completed with some failed requests.");
          break;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 350));
      }
    } catch (campaignError) {
      setError(campaignError instanceof Error ? campaignError.message : "Refresh to resume this campaign.");
    } finally {
      processingRef.current = false;
      setSendingAll(false);
    }
  }
  async function sendAll() {
    setConfirmOpen(false);
    setSendingAll(true);
    setNotice("");
    setError("");
    const response = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "start",
        announcement,
        idempotencyKey: crypto.randomUUID(),
      }),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error || "Announcement could not be sent.");
    else {
      setNotice("Announcement campaign finished.");
      await loadData();
    }
    setSendingAll(false);
  }

  async function retryFailed() {
    if (!currentCampaign) return;
    setError("");
    const response = await fetch("/api/admin/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "retry", campaignId: currentCampaign.id }) });
    const data = await response.json();
    if (!response.ok) setError(data.error || "Retry could not start.");
    else { setCurrentCampaign(data.campaign); setActivity(data.activity || []); void processCampaign(currentCampaign.id); }
  }
  function reuse(campaign: Campaign) {
    setAnnouncement({
      subject: campaign.subject,
      productName: campaign.product_name,
      title: campaign.title,
      imageUrl: campaign.image_url,
      message: campaign.message,
      secondaryText: campaign.secondary_text || "",
      ctaText: campaign.cta_text,
      ctaUrl: campaign.cta_url,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    setNotice("Previous announcement loaded into the editor.");
  }

  return (
    <main className="min-h-screen bg-[#06101d] px-4 py-7 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <AdminHeader
          title="Send Announcement"
          subtitle="Create, preview, test, and send your announcement."
          active="announcements"
          onRefresh={loadData}
        />

        {error && <div className="mb-5 rounded-2xl border border-red-400/25 bg-red-500/10 px-5 py-4 text-sm text-red-200">{error}</div>}
        {notice && <div className="mb-5 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">{notice}</div>}

        <section className="hidden" aria-hidden="true">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Live campaign monitor</p><h2 className="mt-2 text-2xl font-black">{currentCampaign ? withProduct(currentCampaign.title, currentCampaign.product_name) : "Ready for your next announcement"}</h2><p className="mt-2 text-sm capitalize text-slate-400">Status: {currentCampaign?.status.replaceAll("_", " ") || "No campaign yet"}</p></div>{currentCampaign?.status === "completed_with_errors" && currentCampaign.failed_count > 0 && <button type="button" onClick={retryFailed} className="rounded-xl bg-amber-500 px-5 py-3 font-black text-slate-950">Retry failed only</button>}</div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-300 to-emerald-400 transition-all" style={{ width: `${currentCampaign?.recipient_count ? Math.min(100, Math.round(currentCampaign.processed_count / currentCampaign.recipient_count * 100)) : 0}%` }} /></div>
          <div className="mt-3 flex justify-between text-xs font-bold text-slate-400"><span>{currentCampaign?.processed_count || 0} processed</span><span>Batch {currentCampaign?.current_batch || 0} / {currentCampaign?.total_batches || 0}</span></div>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">{[["Recipients", currentCampaign?.recipient_count || 0], ["Processed", currentCampaign?.processed_count || 0], ["Accepted", currentCampaign?.successful_count || 0], ["Failed", currentCampaign?.failed_count || 0], ["Remaining", Math.max(0, (currentCampaign?.recipient_count || 0) - (currentCampaign?.processed_count || 0))]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-white/10 bg-[#07111f] p-4"><p className="text-xs font-black uppercase text-slate-500">{label}</p><p className="mt-2 text-2xl font-black text-cyan-100">{Number(value).toLocaleString()}</p></div>)}</div>
          <div className="mt-6 grid gap-5 lg:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-[#07111f] p-5"><p className="font-black">Recipient preparation</p><p className="mt-3 text-sm text-slate-400">{loading ? "Checking orders..." : `${stats?.uniqueValidEmails || 0} unique valid emails ready`}</p><p className="mt-2 text-xs text-slate-500">{stats?.duplicatesRemoved || 0} duplicates removed - {stats?.invalidOrEmptySkipped || 0} invalid or empty skipped</p></div><div className="rounded-2xl border border-white/10 bg-[#07111f] p-5"><p className="font-black">Recent activity</p><div className="mt-3 max-h-44 space-y-2 overflow-auto">{!activity.length && <p className="text-sm text-slate-500">Activity appears when a campaign starts.</p>}{activity.map((item) => <div key={item.id} className="border-b border-white/5 pb-2 text-xs"><p className={item.event_type === "failed" ? "text-red-300" : item.event_type === "accepted" ? "text-emerald-300" : "text-cyan-200"}>{item.message}{item.masked_email ? ` - ${item.masked_email}` : ""}</p>{item.detail && <p className="mt-1 text-slate-500">{item.detail}</p>}</div>)}</div></div></div>
        </section>
        {!historyAvailable && (
          <div className="mb-6 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4 text-sm text-amber-100">
            Campaign history is not installed yet. Run <b>supabase/announcement-campaigns.sql</b> before sending to all customers. Test emails remain available.
          </div>
        )}

        <div className="grid gap-7 xl:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-[2rem] border border-blue-300/15 bg-[#0b1728] p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Reusable editor</p><h2 className="mt-2 text-2xl font-black">Announcement Content</h2></div>
              <button type="button" onClick={() => setAnnouncement(defaults)} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold hover:bg-white/5">Reset defaults</button>
            </div>
            <div className="mt-6 space-y-5">
              <Field label="Email subject" value={announcement.subject} onChange={(value) => update("subject", value)} />
              <Field label="Fruit / Product name" value={announcement.productName} onChange={(value) => update("productName", value)} />
              <Field label="Main announcement title" value={announcement.title} onChange={(value) => update("title", value)} />
              <Field label="Hero image URL" type="url" value={announcement.imageUrl} onChange={(value) => update("imageUrl", value)} />
              <label className="block text-sm font-bold text-slate-200">Main description / message<textarea value={announcement.message} onChange={(event) => update("message", event.target.value)} rows={8} className="mt-2 w-full rounded-xl border border-blue-300/20 bg-[#07111f] px-4 py-3 leading-7 text-white outline-none focus:border-cyan-300" /></label>
              <label className="block text-sm font-bold text-slate-200">Optional short secondary text<textarea value={announcement.secondaryText} onChange={(event) => update("secondaryText", event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-blue-300/20 bg-[#07111f] px-4 py-3 text-white outline-none focus:border-cyan-300" /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="CTA button text" value={announcement.ctaText} onChange={(value) => update("ctaText", value)} />
                <Field label="CTA destination URL" type="url" value={announcement.ctaUrl} onChange={(value) => update("ctaUrl", value)} />
              </div>
            </div>
          </section>

          <section>
            <div className="rounded-[2rem] border border-blue-300/15 bg-[#0b1728] p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Live preview</p><p className="mt-1 truncate text-sm text-slate-400">Subject: {preview.subject}</p></div><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-200">Mobile responsive</span></div>
              <div className="mx-auto max-w-[720px] overflow-hidden bg-white text-slate-900 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/header-email.png" alt="Bloxhop email header" className="h-auto w-full" />
                <div className="p-6 sm:p-9">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-500">New at Bloxhop</p>
                  <h2 className="mt-3 text-3xl font-black leading-tight">{preview.title || "Announcement title"}</h2>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={announcement.imageUrl || "/logo.png"} alt={announcement.productName || "Announcement product"} className="mt-6 max-h-[420px] w-full rounded-2xl bg-[#07111f] object-contain" />
                  <div className="mt-6 rounded-2xl border border-slate-200 p-5"><p className="text-xs font-black uppercase tracking-widest text-slate-500">Featured release</p><p className="mt-2 text-2xl font-black text-amber-500">{announcement.productName || "Product name"}</p></div>
                  <div className="mt-6 whitespace-pre-line text-[15px] leading-7 text-slate-700">{preview.message}</div>
                  {preview.secondaryText && <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">{preview.secondaryText}</div>}
                  <div className="mt-7 text-center"><span className="inline-block rounded-[10px] bg-orange-400 px-6 py-4 text-[15px] font-black text-white">{announcement.ctaText || "Get It Now"}</span></div>
                </div>
                <div className="border-t-[5px] border-amber-500 bg-[#050b16] px-6 py-6 text-center text-xs text-slate-400">Thank you for being part of Bloxhop!<br /><span className="mt-2 inline-block text-[11px] text-slate-500">© {new Date().getFullYear()} Bloxhop. All rights reserved.</span></div>
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] border border-blue-300/15 bg-[#0b1728] p-6">
              <h3 className="text-xl font-black">Test and send</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">Preview your message, send yourself a test, then send it to your customer list.</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row"><input type="email" value={testEmail} onChange={(event) => setTestEmail(event.target.value)} placeholder="Your test email" className="min-w-0 flex-1 rounded-xl border border-blue-300/20 bg-[#07111f] px-4 py-3 outline-none focus:border-cyan-300" /><button type="button" onClick={sendTest} disabled={sendingTest || !testEmail.trim()} className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 px-5 py-3 font-black text-cyan-100 disabled:opacity-40">{sendingTest ? "Sending test…" : "Send Test Email"}</button></div>
              <button type="button" onClick={() => setConfirmOpen(true)} disabled={sendingAll || ["preparing", "queued", "sending"].includes(currentCampaign?.status || "") || !stats?.uniqueValidEmails || !historyAvailable} className="mt-4 w-full rounded-xl bg-blue-500 px-5 py-4 text-base font-black shadow-[0_5px_0_#1d4ed8] transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none">{sendingAll ? "Sending announcement…" : "Send Announcement to All Customers"}</button>
              {sendingAll && <p className="mt-3 text-center text-xs text-amber-200">Keep this page open while the SMTP campaign is processing.</p>}
                          </div>
          </section>
        </div>

        <section className="hidden" aria-hidden="true">
          <h2 className="text-2xl font-black">Recent Announcements</h2>
          <p className="mt-2 text-sm text-slate-400">Load a previous campaign back into the reusable editor.</p>
          <div className="mt-5 space-y-3">
            {!history.length && <div className="rounded-2xl border border-dashed border-blue-300/20 p-6 text-center text-sm text-slate-400">No announcement campaigns yet.</div>}
            {history.map((campaign) => <div key={campaign.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#07111f] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black">{withProduct(campaign.title, campaign.product_name)}</p><p className="mt-1 text-sm text-slate-400">{campaign.recipient_count.toLocaleString()} recipients · {new Date(campaign.sent_at || campaign.created_at).toLocaleString()}</p><p className="mt-1 text-xs"><span className={campaign.status === "completed" ? "text-emerald-300" : campaign.status === "completed_with_errors" ? "text-amber-300" : "text-red-300"}>{campaign.status.toUpperCase()}</span> · {campaign.successful_count} sent · {campaign.failed_count} failed</p></div><button type="button" onClick={() => reuse(campaign)} className="rounded-xl border border-blue-300/25 px-4 py-3 text-sm font-black text-blue-100 hover:bg-white/5">Reuse</button></div>)}
          </div>
        </section>
      </div>

      <AnnouncementScheduler announcement={announcement} />


      

      {confirmOpen && <div className="fixed inset-0 z-[210000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-[2rem] border border-blue-300/20 bg-[#0b1728] p-7 shadow-2xl"><p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">Final confirmation</p><h2 className="mt-3 text-2xl font-black">{preview.title}</h2><p className="mt-4 leading-7 text-slate-300">You are about to send this announcement to <b className="text-white">{Number(stats?.uniqueValidEmails || 0).toLocaleString()} unique customers</b>.</p><p className="mt-3 text-sm text-amber-200">This action sends real email and cannot be undone.</p><div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => setConfirmOpen(false)} className="rounded-xl border border-white/10 px-5 py-3 font-bold">Cancel</button><button type="button" onClick={sendAll} className="rounded-xl bg-orange-500 px-5 py-3 font-black text-white hover:bg-orange-400">Confirm &amp; Send</button></div></div></div>}
    </main>
  );
}