"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPosthog, capturePageview } from "../lib/analytics";

/**
 * AnalyticsProvider is mounted once at the root layout. It initialises PostHog
 * on first render and emits a $pageview event on every client side route change.
 *
 * If no PostHog key is set the init is a no op and pageview captures become noops,
 * so the provider is safe to mount unconditionally.
 */
export default function AnalyticsProvider(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    initPosthog();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    const qs = searchParams?.toString();
    const fullPath = qs ? `${pathname}?${qs}` : pathname;
    if (lastPathRef.current === fullPath) return;
    lastPathRef.current = fullPath;
    capturePageview(fullPath);
  }, [pathname, searchParams]);

  return null;
}
