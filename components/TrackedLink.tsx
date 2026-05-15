"use client";

import { useAnalytics } from "../lib/analytics";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type TrackedKind =
  | "resume_pdf"
  | "github"
  | "linkedin"
  | "external"
  | "contact"
  | "generic";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  kind?: TrackedKind;
  source?: string;
  children: ReactNode;
};

/**
 * TrackedLink wraps a plain anchor and fires a PostHog event on click.
 * Use it from server components to opt selected links into analytics
 * without converting the whole page to client side.
 */
export default function TrackedLink({
  href,
  kind = "generic",
  source,
  children,
  onClick,
  ...rest
}: Props) {
  const { capture, captureResumePdfClick, captureGithubLinkClicked, captureExternalLinkClicked } =
    useAnalytics();
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      switch (kind) {
        case "resume_pdf":
          captureResumePdfClick(source);
          break;
        case "github":
          captureGithubLinkClicked(href, source);
          break;
        case "linkedin":
          captureExternalLinkClicked(href, source || "linkedin");
          break;
        case "external":
          captureExternalLinkClicked(href, source);
          break;
        case "contact":
          capture("contact_link_clicked", { href, source });
          break;
        default:
          capture("link_clicked", { href, source });
      }
    } catch {
      // never block navigation
    }
    onClick?.(e);
  };
  return (
    <a href={href} {...rest} onClick={handleClick}>
      {children}
    </a>
  );
}
