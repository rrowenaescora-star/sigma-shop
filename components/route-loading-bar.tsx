"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MINIMUM_VISIBLE_MS = 450;

export default function RouteLoadingBar() {
  const pathname = usePathname();
  const firstRender = useRef(true);
  const startedAt = useRef(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function start() {
      startedAt.current = Date.now();
      setVisible(true);
    }

    function handleClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;

      start();
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", start);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", start);
    };
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (!startedAt.current) {
      startedAt.current = Date.now();
      setVisible(true);
    }

    const elapsed = Date.now() - startedAt.current;
    const timeout = window.setTimeout(() => {
      setVisible(false);
      startedAt.current = 0;
    }, Math.max(0, MINIMUM_VISIBLE_MS - elapsed));

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200000] h-[2px] bg-transparent"
      role="progressbar"
      aria-label="Loading page"
    >
      <div className="route-loading-bar absolute left-1/2 h-full w-full rounded-full bg-gradient-to-r from-blue-400 via-cyan-200 to-blue-400 brightness-150 shadow-[0_0_8px_2px_rgba(103,232,249,1),0_0_22px_5px_rgba(59,130,246,0.8),0_0_40px_8px_rgba(37,99,235,0.4)]" />
    </div>
  );
}