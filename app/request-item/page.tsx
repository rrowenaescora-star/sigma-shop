"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Headphones,
  Search,
  ClipboardList,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Send,
} from "lucide-react";

export default function RequestItemPage() {
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const form = e.currentTarget;
  const formData = new FormData(form);

  const payload = {
    robloxUsername: formData.get("robloxUsername"),
    game: formData.get("game"),
    itemWanted: formData.get("itemWanted"),
    budget: formData.get("budget"),
    contactInfo: formData.get("contactInfo"),
    extraNotes: formData.get("extraNotes"),
    website: formData.get("website"),
  };

  const response = await fetch("/api/request-item", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    alert("Failed to submit request. Please try again.");
    return;
  }

  setSubmitted(true);
}

  return (
    <main className="min-h-screen overflow-hidden bg-[#06101d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(37,99,235,0.18),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(14,165,233,0.10),transparent_35%)]" />

      <section className="relative z-10 mx-auto max-w-[1200px] px-6 py-16">
        <div className="rounded-[2rem] border border-white/10 bg-[#0a1527]/90 p-8 text-center shadow-[0_25px_80px_rgba(0,0,0,0.35)] md:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15">
            <Search className="h-9 w-9 text-blue-400" />
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-blue-400">
            Request Item
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            Can’t find the item you want?
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
            Write the item you want below and our team will help you personally.
          </p>
        </div>

        <section className="mt-10 rounded-3xl border border-white/10 bg-[#0a1527] p-6 md:p-8">
          <h2 className="text-2xl font-black">Item Request Form</h2>
          <p className="mt-2 text-sm text-slate-400">
            Fill this out so we can check the item and help you faster.
          </p>

          {submitted ? (
            <div className="mt-6 rounded-2xl border border-blue-400/30 bg-blue-500/10 p-5">
              <p className="font-black text-blue-300">Request received!</p>
              <p className="mt-2 text-sm text-slate-300">
                For now, please also join our Discord so our team can reply to
                your request faster.
              </p>

              <a
                href="https://discord.gg/evM2G5c9Vr"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 font-black text-white transition hover:bg-blue-400"
              >
                <Headphones className="h-5 w-5" />
                Join Discord
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
		
		 <input
	          name="website"
  		  type="text"
  		  tabIndex={-1}
  		  autoComplete="off"
 		   className="hidden"
 		 />	

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-bold text-slate-300">
                    Roblox Username
                  </label>
                  <input
		    name="robloxUsername"
                    required
                    type="text"
                    placeholder="Example: Real_Bacon"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#06101d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-300">
                    Game
                  </label>
                  <input
	    	    name="game"
                    required
                    type="text"
                    placeholder="Example: Blox Fruits"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#06101d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-300">
                  What item do you want?
                </label>
                <input
		  name="itemWanted"
                  required
                  type="text"
                  placeholder="Example: Permanent Dragon, Kitsune, Yeti..."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#06101d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-bold text-slate-300">
                    Budget
                  </label>
                  <input
		    name="budget"
                    type="text"
                    placeholder="Example: $20-$50"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#06101d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-300">
                    Discord or Contact Info
                  </label>
                  <input
		    name="contactInfo" 
                    required
                    type="text"
                    placeholder="Example: yourdiscord#0000"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#06101d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-300">
                  Extra Notes
                </label>
                <textarea
		  name="extraNotes"
                  rows={5}
                  placeholder="Tell us more details about your request..."
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-[#06101d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400"
                />
              </div>

              <button
                type="submit"
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-500 px-8 font-black text-white shadow-[0_0_40px_rgba(59,130,246,0.35)] transition hover:-translate-y-1 hover:bg-blue-400"
              >
                <Send className="h-5 w-5" />
                Submit Request
              </button>
            </form>	
          )}
	<section className="mt-10 grid gap-5 lg:grid-cols-2">

  <div className="rounded-3xl border border-white/10 bg-[#0a1527] p-6">
    <h2 className="text-2xl font-black">
      What Can You Request?
    </h2>

    <div className="mt-5 grid gap-3 text-sm text-slate-300">
      <p>• Permanent Fruits</p>
      <p>• Gamepasses</p>
      <p>• Limited Time Items</p>
      <p>• Hard To Find Items</p>
      <p>• Custom Orders</p>
      <p>• Bulk Orders</p>
      <p>• Upcoming Products</p>
      <p>• Other Game Items</p>
    </div>
  </div>

  <div className="rounded-3xl border border-white/10 bg-[#0a1527] p-6">
    <h2 className="text-2xl font-black">
      How Does It Work?
    </h2>

    <div className="mt-5 grid gap-4 text-sm text-slate-300">
      <p>
        1. Fill out the request form with the item you want.
      </p>

      <p>
        2. Our team reviews your request and availability.
      </p>

      <p>
        3. We may contact you through Discord or your provided contact info.
      </p>

      <p>
        4. Once confirmed, we help guide you through the order process.
      </p>
    </div>
  </div>

</section>
        </section>
      </section>
    </main>
  );
}