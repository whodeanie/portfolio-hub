"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

/**
 * Client side analytics helpers around posthog-js.
 *
 * The PostHog client is initialised lazily inside AnalyticsProvider once,
 * then the rest of the app fires events through the small wrappers below.
 *
 * Graceful degradation: if NEXT_PUBLIC_POSTHOG_KEY is not set the init is
 * a no op, every capture call becomes a noop, and the site keeps working
 * exactly as it did before. Nothing throws.
 */

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let initialised = false;

export function initPosthog(): void {
  if (typeof window === "undefined") return;
  if (initialised) return;
  if (!POSTHOG_KEY) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false, // we send pageviews manually on route change
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "[data-private]"
    },
    autocapture: false,
    loaded: () => {
      initialised = true;
    }
  });
  initialised = true;
}

export function capture(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (!POSTHOG_KEY) return;
  try {
    posthog.capture(event, props);
  } catch {
    // swallow. analytics should never break the page.
  }
}

export function capturePageview(path: string): void {
  capture("$pageview", { $current_url: typeof window !== "undefined" ? window.location.href : path, path });
}

/**
 * useAnalytics is a small hook callers can use to grab the capture helpers.
 * Kept as a hook so that the consuming component is forced into a client boundary,
 * which is the only place posthog-js can run safely.
 */
export function useAnalytics() {
  useEffect(() => {
    initPosthog();
  }, []);
  return {
    capture,
    capturePageview,
    captureResumePdfClick: (source?: string) => capture("resume_pdf_clicked", { source }),
    captureProjectCardClick: (project: { title: string; href: string; cats?: string[] }) =>
      capture("project_card_clicked", {
        project_title: project.title,
        project_href: project.href,
        project_categories: project.cats
      }),
    captureContactFormSubmitted: (topic: string) =>
      capture("contact_form_submitted", { topic }),
    captureGithubLinkClicked: (href: string, label?: string) =>
      capture("github_link_clicked", { href, label }),
    captureExternalLinkClicked: (href: string, label?: string) =>
      capture("external_link_clicked", { href, label })
  };
}
