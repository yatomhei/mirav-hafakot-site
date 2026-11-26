import { siteConfig } from "@/config/site";
import type { SiteContent } from "@/content/docs";
import { isPlaceholder, waNumber } from "@/lib/contact";

// Search and sharing tags that depend on the site's public address (siteConfig.url). Until the
// domain is connected the address is empty and these return nothing, so no page claims a
// wrong canonical; setting `url` at launch turns them all on.

/** The full public address of a path ("/services/stills"), or null before launch. */
export function absUrl(path: string): string | null {
  if (!siteConfig.url) return null;
  const clean = path === "/" ? "/" : path.replace(/\/+$/, "");
  return new URL(clean, siteConfig.url).toString();
}

/** canonical + og:url for one page (both left out until the domain is set). */
export function pageAddress(path: string) {
  const url = absUrl(path);
  return url
    ? { meta: [{ property: "og:url", content: url }], links: [{ rel: "canonical", href: url }] }
    : { meta: [], links: [] };
}

/** An image path made absolute when possible (link previews need a full address). */
export const absImage = (path: string) => absUrl(path) ?? path;

/** A <script type="application/ld+json">, escaped so saved text can't close the tag. */
export function jsonLd(data: unknown) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

/** A phone number in international form for structured data: 050-1234567 -> +972-50-1234567. */
export const internationalPhone = (phone: string) => {
  const p = phone.trim();
  if (p.startsWith("+")) return p;
  if (p.startsWith("972")) return `+${p}`;
  if (p.startsWith("0")) return `+972-${p.slice(1).replace(/^-/, "")}`;
  return p;
};

const BUSINESS_ID = "#business";
/** Where Merav is based. City level only: never a street address. */
const BASE_TOWN = "יד בנימין";
const id = (hash: string) => `${absUrl("/") ?? "/"}${hash}`;

/**
 * The places in the footer's service area text, one per item: split at commas and line breaks,
 * without "והסביבה". A list's last item joined with "ו" ("חבל לכיש ואשדוד") is two places, so
 * it's split at its last " ו" when the line has a comma (a single name like "גבעת ורדים" on its
 * own line stays whole).
 */
export function serviceAreas(text: string) {
  return text.split("\n").flatMap((line) => {
    const items = line
      .split(",")
      .map((a) => a.replace(/והסביבה/, "").trim())
      .filter(Boolean);
    const last = items.at(-1);
    const joined = items.length > 1 && last ? last.match(/^(.+) ו(\S.*)$/) : null;
    return joined ? [...items.slice(0, -1), joined[1]!, joined[2]!] : items;
  });
}

/** The business itself: who Merav is, what she does and where she works. */
export function businessGraph(content: SiteContent) {
  const { site } = content;
  const areas = serviceAreas(site.serviceArea);
  const sameAs = [site.youtubeUrl, site.facebookUrl, site.instagramUrl, site.tiktokUrl].filter(
    (u) => u && !isPlaceholder(u),
  );
  const phone = isPlaceholder(site.phone) ? waNumber(site.whatsapp) : site.phone;
  return {
    "@type": "ProfessionalService",
    "@id": id(BUSINESS_ID),
    name: site.name,
    slogan: site.tagline,
    description: content.seo.home.description,
    ...(absUrl("/") ? { url: absUrl("/") } : {}),
    logo: absImage("/images/logo-color.webp"),
    image: absImage("/images/hero-poster-1600.webp"),
    ...(phone ? { telephone: internationalPhone(phone) } : {}),
    ...(isPlaceholder(site.email) ? {} : { email: site.email }),
    // Her town only (city level): the street address stays private, so no street here.
    address: { "@type": "PostalAddress", addressLocality: BASE_TOWN, addressCountry: "IL" },
    areaServed: areas.map((name) => ({ "@type": "Place", name })),
    founder: { "@type": "Person", name: "מרב ורנר", jobTitle: "צלמת, עורכת וידאו ומפיקה" },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** The homepage: the business and the website. */
export function homeJsonLd(content: SiteContent) {
  return jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      businessGraph(content),
      {
        "@type": "WebSite",
        "@id": id("#website"),
        name: content.site.name,
        alternateName: "מרב ורנר",
        inLanguage: "he",
        ...(absUrl("/") ? { url: absUrl("/") } : {}),
        publisher: { "@id": id(BUSINESS_ID) },
      },
    ],
  });
}

/**
 * A service's page: the service, offered by the business, and its place in the site. `path`
 * is the page that presents it: its service page, or a landing page that replaces it.
 */
export function serviceJsonLd(
  content: SiteContent,
  service: { slug: string; title: string; lead: string },
  path = `/services/${service.slug}`,
) {
  const crumb = (position: number, name: string, p: string) => ({
    "@type": "ListItem",
    position,
    name,
    ...(absUrl(p) ? { item: absUrl(p) } : {}),
  });
  return jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: service.title,
        description: service.lead,
        ...(absUrl(path) ? { url: absUrl(path) } : {}),
        provider: businessGraph(content),
        areaServed: businessGraph(content).areaServed,
        inLanguage: "he",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [crumb(1, content.site.name, "/"), crumb(2, service.title, path)],
      },
    ],
  });
}
