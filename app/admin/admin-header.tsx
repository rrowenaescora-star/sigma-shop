"use client";

import Link from "next/link";
import LogoutButton from "./logout-button";
import AdminSessionGuard from "./admin-session-guard";

type AdminPage = "dashboard" | "orders" | "history" | "products";

export default function AdminHeader({
  title,
  subtitle,
  active,
  onRefresh,
}: {
  title: string;
  subtitle: string;
  active?: AdminPage;
  onRefresh?: () => void;
}) {
  const navClass = (key: AdminPage) =>
    `rounded-2xl px-5 py-3 font-bold transition ${
      active === key
        ? "bg-cyan-400 text-slate-950"
        : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
    }`;

return (
  <>
    <AdminSessionGuard />

    <div className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
          BLOXHOP ADMIN
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/dashboard" className={navClass("dashboard")}>
          Dashboard
        </Link>
        <Link href="/admin/orders" className={navClass("orders")}>
          Active Orders
        </Link>
        <Link href="/admin/order-history" className={navClass("history")}>
          Order History
        </Link>
        <Link href="/admin/products" className={navClass("products")}>
          Products
        </Link>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white transition hover:bg-blue-400"
          >
            Refresh
          </button>
        )}

        <LogoutButton />
      </div>
        </div>
  </>
);
}
