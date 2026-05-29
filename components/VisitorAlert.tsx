'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const VISIT_SESSION_KEY = 'kerry-hub-visit-alert-sent';

export default function VisitorAlert() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.sessionStorage.getItem(VISIT_SESSION_KEY)) return;

    window.sessionStorage.setItem(VISIT_SESSION_KEY, 'true');

    const payload = {
      path: pathname,
      referrer: document.referrer || undefined,
      screen: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      title: document.title,
    };

    const sendVisit = () => {
      const body = JSON.stringify(payload);

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/visit', new Blob([body], { type: 'application/json' }));
        return;
      }

      fetch('/api/visit', {
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        method: 'POST',
      }).catch(() => undefined);
    };

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(sendVisit, { timeout: 2500 });
      return;
    }

    setTimeout(sendVisit, 800);
  }, [pathname]);

  return null;
}
