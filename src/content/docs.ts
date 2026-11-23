import {
  about,
  contact,
  faq,
  hero,
  intro,
  process,
  servicesIntro,
  stills,
  strip,
  testimonials,
  works,
} from "./home";
import { servicePage, services } from "./services";
import { barMitzvahLanding } from "./landing";
import { seo, site } from "./site";
import { docSchemas, type DocKey } from "./schema";
import type { Service } from "./types";

// The admin saves the site as one record per section, keyed like this. The launch content
// in this folder is the fallback for any record that was never saved or fails its schema.

export const defaultContent = {
  site,
  seo,
  home: {
    hero,
    intro,
    works,
    stills,
    services: servicesIntro,
    about,
    process,
    testimonials,
    faq,
    strip,
    contact,
  },
  services,
  servicePage,
  barMitzvahLanding,
};

export type SiteContent = typeof defaultContent;
type HomeKey = keyof SiteContent["home"];

export const DOC_KEYS = Object.keys(docSchemas) as DocKey[];

export type StoredDocs = Partial<Record<DocKey, unknown>>;

const isHome = (key: DocKey): key is `home.${HomeKey}` => key.startsWith("home.");

/** Reads one record's value out of the assembled content. */
export function getDoc(content: SiteContent, key: DocKey): unknown {
  if (isHome(key)) return content.home[key.slice("home.".length) as HomeKey];
  return content[key as Exclude<DocKey, `home.${string}`>];
}

/** Returns a copy of the content with one record replaced. */
export function setDoc(content: SiteContent, key: DocKey, value: unknown): SiteContent {
  if (isHome(key)) {
    return { ...content, home: { ...content.home, [key.slice("home.".length)]: value } };
  }
  return { ...content, [key]: value };
}

/** Checks a record against its schema; the error lists what is wrong, for the admin. */
export function validateDoc(key: DocKey, value: unknown) {
  return docSchemas[key].safeParse(value);
}

/**
 * The saved order is the site's order (homepage cards, footer, "other services"). A launch
 * service is matched to the code by its address, which restores its linked gallery and marks
 * it as published (records saved before that field existed). A service Merav added has no
 * gallery, only videos.
 */
function pinServices(saved: Service[]): Service[] {
  return saved.map(({ gallery: _g, ...edited }) => {
    const fixed = services.find((s) => s.slug === edited.slug);
    const pinned: Service = { ...edited };
    if (fixed) pinned.published = true;
    if (fixed?.gallery) pinned.gallery = fixed.gallery;
    return pinned;
  });
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * A saved record with any field it lacks taken from the launch content, nested objects
 * included (lists are kept as saved). So a field added to the code after the record was
 * saved doesn't cost the record its edits.
 */
export function fillMissing(launch: unknown, saved: unknown): unknown {
  if (!isPlainObject(launch) || !isPlainObject(saved)) return saved;
  const out: Record<string, unknown> = { ...saved };
  for (const [key, value] of Object.entries(launch)) {
    out[key] = key in saved ? fillMissing(value, saved[key]) : value;
  }
  return out;
}

/**
 * Builds what the site shows: each saved record that passes its schema replaces the launch
 * content for that section. A record that fails only because the code has since gained a
 * field is completed from the launch content (a record that passes is used exactly as saved,
 * so something deliberately removed stays removed). A bad record costs one section its
 * edits, never the page.
 */
export function assembleContent(stored: StoredDocs): SiteContent {
  let content = defaultContent;
  for (const key of DOC_KEYS) {
    if (!(key in stored)) continue;
    let result = validateDoc(key, stored[key]);
    if (!result.success) {
      const filled = validateDoc(key, fillMissing(getDoc(defaultContent, key), stored[key]));
      if (filled.success) result = filled;
    }
    if (!result.success) {
      console.warn(`[content] saved "${key}" ignored:`, result.error.issues[0]?.message);
      continue;
    }
    const value = key === "services" ? pinServices(result.data as Service[]) : result.data;
    content = setDoc(content, key, value);
  }
  return content;
}
