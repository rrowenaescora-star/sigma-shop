<<<<<<< HEAD
"use client";

import Link from "next/link";
import { useState } from "react";

export default function SiteFooter() {
  const [showNotice, setShowNotice] = useState(true);

  return (
    <footer className="mt-16 border-t border-white/10 bg-[#0a1020]">
      <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-slate-400">
        <div className="grid gap-8 md:grid-cols-3">
          
          {/* LEFT */}
          <div>
            <h3 className="mb-2 font-bold text-white">Bloxhop</h3>
            <p>Fast and trusted Blox Fruits item store.</p>
            <p className="mt-2 text-slate-500">
              Digital goods store for Blox Fruits items.
            </p>

            <p className="mt-3 text-xs text-slate-500">
              Operated in the Philippines
            </p>
          </div>

          {/* MIDDLE */}
          <div>
            <h3 className="mb-2 font-bold text-white">Support</h3>
            <p>
              <a
                href="mailto:support@bloxhop.site"
                className="hover:text-white hover:underline"
              >
                support@bloxhop.site
              </a>
            </p>
           

            <p className="mt-2 text-slate-500">
              Delivery: 5–30 minutes (up to 3 hours max)
            </p>
          </div>

          {/* RIGHT */}
          <div>
            <h3 className="mb-2 font-bold text-white">Legal</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/privacy" className="hover:text-white hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-white hover:underline">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-white hover:underline">
                  Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white hover:underline">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 🔥 DISCLAIMER WITH CLOSE BUTTON */}
        {showNotice && (
          <div className="mt-6 border-t border-white/10 pt-6 space-y-2 relative">
            
            

            <p className="text-xs text-slate-400 pr-6">
              Bloxhop is an independent digital goods store and is not affiliated with Roblox Corporation.
            </p>

            <p className="text-xs text-slate-500 pr-6">
              All items are virtual and delivered manually. Refunds are only issued for non-delivery cases.
            </p>

            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Bloxhop. All rights reserved.
            </p>
          </div>
        )}
      </div>
    </footer>
  );
=======
"use client";

import Link from "next/link";
import { useState } from "react";

export default function SiteFooter() {
  const [showNotice, setShowNotice] = useState(true);

  return (
    <footer className="mt-16 border-t border-white/10 bg-[#0a1020]">
      <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-slate-400">
        <div className="grid gap-8 md:grid-cols-3">
          
          {/* LEFT */}
          <div>
            <h3 className="mb-2 font-bold text-white">Bloxhop</h3>
            <p>Fast and trusted Blox Fruits item store.</p>
            <p className="mt-2 text-slate-500">
              Digital goods store for Blox Fruits items.
            </p>

            <p className="mt-3 text-xs text-slate-500">
              Operated in the Philippines
            </p>
          </div>

          {/* MIDDLE */}
          <div>
            <h3 className="mb-2 font-bold text-white">Support</h3>
            <p>
              <a
                href="mailto:support@bloxhop.site"
                className="hover:text-white hover:underline"
              >
                support@bloxhop.site
              </a>
            </p>
           

            <p className="mt-2 text-slate-500">
              Delivery: 5–30 minutes (up to 3 hours max)
            </p>
          </div>

          {/* RIGHT */}
          <div>
            <h3 className="mb-2 font-bold text-white">Legal</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/privacy" className="hover:text-white hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-white hover:underline">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-white hover:underline">
                  Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white hover:underline">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 🔥 DISCLAIMER WITH CLOSE BUTTON */}
        {showNotice && (
          <div className="mt-6 border-t border-white/10 pt-6 space-y-2 relative">
            
            

            <p className="text-xs text-slate-400 pr-6">
              Bloxhop is an independent digital goods store and is not affiliated with Roblox Corporation.
            </p>

            <p className="text-xs text-slate-500 pr-6">
              All items are virtual and delivered manually. Refunds are only issued for non-delivery cases.
            </p>

            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Bloxhop. All rights reserved.
            </p>
          </div>
        )}
      </div>
    </footer>
  );
>>>>>>> 0d9908d25852ce108b61128f297f3e2a452932cf
}