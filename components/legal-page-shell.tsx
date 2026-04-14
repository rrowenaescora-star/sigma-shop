"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

type LegalPageShellProps = {
  title: string;
  children: ReactNode;
};

export default function LegalPageShell({
  title,
  children,
}: LegalPageShellProps) {
  const router = useRouter();

function handleClose() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}
  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="relative rounded-3xl border border-white/10 bg-[#101729] p-8 shadow-xl">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-lg text-white transition hover:bg-red-500"
            aria-label="Close page"
            type="button"
          >
            ✕
          </button>

          <h1 className="mb-6 text-3xl font-bold">{title}</h1>

          <div className="space-y-4 text-sm leading-7 text-slate-300">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}