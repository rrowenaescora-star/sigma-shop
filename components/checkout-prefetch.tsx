"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPrefetch({ enabled }: { enabled: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (enabled) router.prefetch("/checkout");
  }, [enabled, router]);

  return null;
}
