import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { isExternalHref, serviceHref } from "@/content/services";

/**
 * A link to a service, wherever the site shows one (homepage card, footer, "more services"):
 * its regular page, or the page its `link` names instead (a landing page on this site, or
 * another site, which opens in a new tab).
 */
export function ServiceLink({
  service,
  className,
  children,
}: {
  service: { slug: string; link?: string | undefined };
  className?: string;
  children: ReactNode;
}) {
  const href = serviceHref(service);
  if (isExternalHref(href)) {
    return (
      <a href={href} target="_blank" rel="noopener" className={className}>
        {children}
        <span className="sr-only"> (נפתח בכרטיסייה חדשה)</span>
      </a>
    );
  }
  if (!service.link?.trim()) {
    return (
      <Link to="/services/$slug" params={{ slug: service.slug }} className={className}>
        {children}
      </Link>
    );
  }
  // A page of this site that the admin named (its route is checked there, not by the types).
  return (
    <Link to={href as "/"} className={className}>
      {children}
    </Link>
  );
}
