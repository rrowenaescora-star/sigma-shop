"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CookiePreferences = {
  necessary: true;
  functionality: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

const STORAGE_KEY = "bloxhop-cookie-preferences";

const preferenceGroups = [
  {
    id: "necessary",
    title: "Essential Cookies",
    description: "Required for core store functions such as the cart, checkout flow, security, and access to protected areas.",
  },
  {
    id: "functionality",
    title: "Performance and Functionality",
    description: "Helps the store remember preferences and improve the shopping experience. Some features may be limited if this is turned off.",
  },
  {
    id: "analytics",
    title: "Analytics and Customization",
    description: "Helps us understand how visitors use the store so we can improve pages, products, and checkout experience.",
  },
  {
    id: "marketing",
    title: "Marketing Cookies",
    description: "Allows marketing-related cookies if they are used on the site in the future.",
  },
] as const;

export default function CookieConsent() {
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [functionality, setFunctionality] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [openDetail, setOpenDetail] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const preferences = JSON.parse(saved) as CookiePreferences;
        setFunctionality(Boolean(preferences.functionality));
        setAnalytics(Boolean(preferences.analytics));
        setMarketing(Boolean(preferences.marketing));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }

    setReady(true);
  }, []);

  function savePreferences(nextFunctionality: boolean, nextAnalytics: boolean, nextMarketing: boolean) {
    const preferences: CookiePreferences = {
      necessary: true,
      functionality: nextFunctionality,
      analytics: nextAnalytics,
      marketing: nextMarketing,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setFunctionality(nextFunctionality);
    setAnalytics(nextAnalytics);
    setMarketing(nextMarketing);
    setShowBanner(false);
    setIsOpen(false);
  }

  function getChecked(id: (typeof preferenceGroups)[number]["id"]) {
    if (id === "necessary") return true;
    if (id === "functionality") return functionality;
    if (id === "analytics") return analytics;
    return marketing;
  }

  function setChecked(id: (typeof preferenceGroups)[number]["id"], checked: boolean) {
    if (id === "functionality") setFunctionality(checked);
    if (id === "analytics") setAnalytics(checked);
    if (id === "marketing") setMarketing(checked);
  }

  if (!ready) return null;

  return (
    <>
      {!isOpen && !showBanner && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Cookie preferences"
          title="Cookie preferences"
          className="fixed bottom-4 left-4 z-[100001] flex h-11 w-11 items-center justify-center rounded-full border border-blue-300/30 bg-[#0b1b32] text-blue-100 transition hover:bg-[#102743]"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 1 0 9 9c0-1.5-.37-2.92-1.03-4.17A3.5 3.5 0 0 1 15.5 11a3.5 3.5 0 0 1-3.5-3.5A3.5 3.5 0 0 1 14.52 4.2 8.95 8.95 0 0 0 12 3Z" />
            <path strokeLinecap="round" d="M7.5 12h.01M10.5 16h.01M16 15h.01" />
          </svg>
        </button>
      )}

      {showBanner && (
        <section
          role="dialog"
          aria-label="Cookie notice"
          className="fixed bottom-4 left-4 right-4 z-[100002] mx-auto flex max-w-[1280px] flex-col gap-4 rounded-2xl border border-blue-200/70 bg-[#f5f8ff] p-4 text-slate-900 shadow-[0_18px_60px_rgba(0,0,0,0.35)] sm:flex-row sm:items-center sm:px-5"
        >
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-1 h-7 w-7 shrink-0 text-slate-900">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 1 0 9 9c0-1.5-.37-2.92-1.03-4.17A3.5 3.5 0 0 1 15.5 11a3.5 3.5 0 0 1-3.5-3.5A3.5 3.5 0 0 1 14.52 4.2 8.95 8.95 0 0 0 12 3Z" />
              <path strokeLinecap="round" d="M7.5 12h.01M10.5 16h.01M16 15h.01" />
            </svg>
            <p className="text-sm leading-5 text-slate-900 sm:text-base">
              We use cookies to keep Bloxhop working and improve your experience. If you accept, we’ll also allow optional analytics and marketing cookies.{' '}
              <button type="button" onClick={() => { setShowBanner(false); setIsOpen(true); }} className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900">
                Manage your cookie preferences
              </button>
              .
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => savePreferences(true, true, true)}
              className="rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              Yes, I accept
            </button>
            <button type="button" onClick={() => savePreferences(false, false, false)} className="flex h-10 w-10 items-center justify-center rounded-full text-2xl font-light text-slate-500 transition hover:bg-slate-200 hover:text-slate-900" aria-label="Decline optional cookies and close">
              ×
            </button>
          </div>
        </section>
      )}
      {isOpen && (
        <div className="fixed inset-0 z-[100002] flex items-center justify-center bg-[#020617]/70 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-preferences-title"
            className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111d2b] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <p className="text-sm font-black text-white">Preferences</p>
              <button
                type="button"
                onClick={() => savePreferences(functionality, analytics, marketing)}
                className="-mr-2 flex h-8 w-8 items-center justify-center rounded-lg text-xl font-black text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label="Save and close cookie preferences"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <h2 id="cookie-preferences-title" className="sr-only">Cookie Preferences</h2>
              <p className="text-sm leading-6 text-slate-200">
                We use different types of cookies and local storage to keep Bloxhop working and improve your shopping experience. Choose which optional categories you allow. Essential cookies are always active because they are needed for core site functions.
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                You can change your choice at any time. Learn more in our{" "}
                <Link href="/privacy-policy" className="font-semibold text-blue-300 underline underline-offset-2 hover:text-blue-200">
                  Privacy Policy
                </Link>.
              </p>

              <div className="mt-7 divide-y divide-white/12 border-y border-white/12">
                {preferenceGroups.map((group) => {
                  const isEssential = group.id === "necessary";
                  const detailsOpen = openDetail === group.id;

                  return (
                    <div key={group.id} className="py-4">
                      <div className="flex items-start gap-3">
                        <input
                          id={`cookie-${group.id}`}
                          type="checkbox"
                          checked={getChecked(group.id)}
                          disabled={isEssential}
                          onChange={(event) => setChecked(group.id, event.target.checked)}
                          className="mt-1 h-5 w-5 shrink-0 accent-blue-400 disabled:cursor-not-allowed disabled:opacity-80"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <label htmlFor={`cookie-${group.id}`} className="cursor-pointer text-sm font-black text-white">
                              {group.title}
                            </label>
                            {isEssential && <span className="text-xs font-semibold text-slate-400">(Always on)</span>}
                            <button
                              type="button"
                              onClick={() => setOpenDetail(detailsOpen ? null : group.id)}
                              className="text-xs font-bold text-blue-300 underline underline-offset-2 hover:text-blue-200"
                              aria-expanded={detailsOpen}
                            >
                              Details
                            </button>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-300">{group.description}</p>
                          {detailsOpen && (
                            <p className="mt-3 rounded-xl border border-blue-300/15 bg-blue-400/5 px-3 py-2 text-xs leading-5 text-slate-400">
                              Your selection is stored locally on this device and can be changed anytime from the Cookie Preferences button.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 border-t border-white/10 bg-[#0d1724] px-6 py-4 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => savePreferences(false, false, false)}
                className="rounded-lg bg-[#18314f] px-4 py-3 text-sm font-black text-white hover:bg-[#24466d]"
              >
                Decline All
              </button>
              <button
                type="button"
                onClick={() => savePreferences(functionality, analytics, marketing)}
                className="rounded-lg bg-[#1e5fa9] px-4 py-3 text-sm font-black text-white hover:bg-[#2875c9]"
              >
                Save Preferences
              </button>
              <button
                type="button"
                onClick={() => savePreferences(true, true, true)}
                className="rounded-lg bg-[#3b82f6] px-4 py-3 text-sm font-black text-white hover:bg-[#60a5fa]"
              >
                Allow All
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
