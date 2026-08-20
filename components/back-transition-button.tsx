"use client";

import { useRouter } from "next/navigation";
import { type ReactNode } from "react";

type BackTransitionButtonProps = {
  fallbackHref: string;
  className?: string;
  children: ReactNode;
};

export default function BackTransitionButton({ fallbackHref, className, children }: BackTransitionButtonProps) {
  const router = useRouter();

  function goBack() {
    document.documentElement.classList.add("page-transition-out");
    window.setTimeout(() => {
      if (window.history.length > 1) router.back();
      else router.push(fallbackHref);
    }, 180);
  }

  return <button type="button" onClick={goBack} className={className}>{children}</button>;
}
