"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

type PageTransitionLinkProps = {
  href: string;
  className?: string;
  children?: ReactNode;
  ariaLabel?: string;
};

export default function PageTransitionLink({ href, className, children, ariaLabel }: PageTransitionLinkProps) {
  const router = useRouter();

  useEffect(() => {
    document.documentElement.classList.remove("page-transition-out");
  }, []);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    document.documentElement.classList.add("page-transition-out");
    window.setTimeout(() => router.push(href), 180);
  }

  return <Link href={href} onClick={handleClick} className={className} aria-label={ariaLabel}>{children}</Link>;
}

