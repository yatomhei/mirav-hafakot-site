import type { SiteContent } from "@/content/docs";

/**
 * Pages built into the site's code that no service leads to: a landing page the site only
 * hosts, reached from outside links (ads, WhatsApp, Instagram). Nothing else lists them, so add
 * one here by hand if Google should find it. Leave it out if it's only for ads or shared links
 * and shouldn't show up in search (and give that page `noindex`).
 *
 * A landing page that a service leads to (the admin's "דף אחר") needs no entry: it's listed
 * automatically, in place of the service page.
 */
export const STANDALONE_PAGES: string[] = [];

/** Where each visible service leads, when that's a page of this site. */
function servicePaths(content: SiteContent) {
  return content.services
    .filter((s) => !s.hidden)
    .map((s) => s.link?.trim() || `/services/${s.slug}`)
    .filter((path) => path.startsWith("/"));
}

/**
 * Every public page, at the same address as its canonical tag: the homepage, each visible
 * service's page (or the page of this site it leads to instead; an outside site is left out),
 * the hand-listed standalone pages, and the privacy and accessibility pages.
 */
export function sitemapPaths(content: SiteContent, standalone = STANDALONE_PAGES) {
  const paths = ["/", ...servicePaths(content), ...standalone, "/privacy", "/accessibility"];
  return [...new Set(paths)];
}
