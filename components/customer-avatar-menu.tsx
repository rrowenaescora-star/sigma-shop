"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import CustomerAuthModal from "@/components/customer-auth-modal";

export default function CustomerAvatarMenu({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [loginOpen, setLoginOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { const supabase = createClient(); supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || null)); const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user.email || null)); return () => listener.subscription.unsubscribe(); }, []);
  function toggleMenu() { const rect = buttonRef.current?.getBoundingClientRect(); if (rect) setMenuPosition({ top: rect.bottom + 10, right: window.innerWidth - rect.right }); setOpen((value) => !value); }
  async function logout() { await createClient().auth.signOut(); window.location.href = "/"; }
  if (!email) return <><button type="button" onClick={() => setLoginOpen(true)} className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-sky-200/35 bg-[#2f7eea] px-4 text-sm font-black text-white shadow-[0_6px_0_#1d4ed8] transition hover:translate-y-0.5 hover:bg-[#60a5fa] hover:shadow-[0_4px_0_#1d4ed8] active:translate-y-1 active:shadow-[0_2px_0_#1d4ed8] ${className}`}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path strokeLinecap="round" strokeLinejoin="round" d="M10 17l5-5-5-5M15 12H3"/></svg>Log In</button><CustomerAuthModal open={loginOpen} onClose={() => setLoginOpen(false)} /></>;
  const menu = open && typeof document !== "undefined" ? createPortal(<><button aria-label="Close account menu" type="button" onClick={() => setOpen(false)} className="fixed inset-0 z-[999998] cursor-default" /><div style={{ top: menuPosition.top, right: menuPosition.right }} className="fixed z-[999999] w-36 rounded-xl border border-white/10 bg-[#0b1728] p-2 shadow-2xl"><Link href="/account" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/5">Profile</Link><button type="button" onClick={logout} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-200 hover:bg-white/5">Log Out</button></div></>, document.body) : null;
  return <div className={`relative z-[100002] ${className}`}><button ref={buttonRef} type="button" aria-label="Open account menu" onClick={toggleMenu} className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-300/35 bg-blue-500/20 text-sm font-black text-blue-100 transition hover:bg-blue-500/35">{email.charAt(0).toUpperCase()}</button>{menu}</div>;
}