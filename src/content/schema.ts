import { z } from "zod";
import { DEFAULT_MESSAGE_TEMPLATE, REQUIRED_FIELDS } from "./whatsapp-message";
import { contact } from "./home";
import { MAX_FEATURED_STILLS, MAX_FEATURED_VIDEOS, countFeaturedVideos } from "./featured";

// The shape every saved record must have before the site uses it (see docs.ts). Counts the
// layout depends on are fixed here, so a saved record can never break the design: a record
// that fails falls back to the launch content for that section only.

const text = z.string().max(2000);
const longText = z.string().max(8000);
/** A heading typed as separate lines (Enter in the admin): 1 to `max` non-empty lines. */
const lines = (max = 3) => z.array(text.min(1)).min(1, "חסרה כותרת").max(max, `עד ${max} שורות`);

/** A site image: a name in public/images, or the address of an uploaded set. */
export const photoSchema = z.object({
  name: z.string().min(1).max(500),
  alt: text,
  pos: z.string().max(40).optional(),
});
const ratio = z.number().positive().max(10);

/** The most services the site holds (the homepage grid works with any number). */
export const MAX_SERVICES = 12;

/** A service page address after /services/: lowercase English letters, digits and dashes. */
export const SERVICE_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const MAX_SLUG = 40;

/** What is wrong with a service address, in Hebrew for the admin, or null when it's fine. */
export function slugProblem(slug: string): string | null {
  if (!slug) return "חסרה כתובת לעמוד";
  if (slug.length > MAX_SLUG) return `הכתובת ארוכה מדי (עד ${MAX_SLUG} תווים)`;
  if (!SERVICE_SLUG.test(slug)) {
    return "בכתובת יכולים להיות רק אותיות באנגלית, ספרות ומקפים בין מילים";
  }
  return null;
}

/**
 * Where a service's card and links lead instead of its regular page, e.g. a landing page.
 * Empty means the regular page (/services/<slug>). A page on this site starts with "/"
 * (/bar-mitzvah); another site starts with https://. Service pages are not allowed, so a
 * redirect can never loop.
 */
export function serviceLinkProblem(link: string): string | null {
  const l = link.trim();
  if (!l) return null;
  if (l.length > 500) return "הכתובת ארוכה מדי";
  if (l.startsWith("/")) {
    if (!/^(\/[a-z0-9]+(-[a-z0-9]+)*)+$/.test(l)) {
      return "בכתובת באתר יכולים להיות רק אותיות קטנות באנגלית, ספרות ומקפים, למשל /bar-mitzvah";
    }
    if (l === "/services" || l.startsWith("/services/")) {
      return "אי אפשר לקשר לעמוד שירות. כדי להפנות לשירות אחר, מסתירים את השירות הזה";
    }
    if (l === "/admin" || l.startsWith("/admin/")) return "אי אפשר לקשר לממשק הניהול";
    return null;
  }
  try {
    if (new URL(l).protocol === "https:" && /^https:\/\/[^/\s]+\.[^/\s]+/.test(l)) return null;
  } catch {
    // not an address
  }
  return "כתובת באתר מתחילה ב־/ (למשל /bar-mitzvah), ואתר אחר מתחיל ב־https://";
}

export const YOUTUBE_ID = /^[\w-]{11}$/;
const videoSchema = z.object({
  title: text,
  youtubeId: z.string().regex(YOUTUBE_ID),
  thumb: photoSchema.optional(),
  featured: z.boolean().optional(),
});

/** Empty, a [placeholder] or a secure web address (https only). */
const link = z.union([
  z.literal(""),
  z.string().regex(/^\[.*\]$/),
  z.url({ protocol: /^https$/ }).max(500),
]);

export const docSchemas = {
  site: z.object({
    name: text,
    tagline: text,
    phone: text,
    // An Israeli number in wa.me form: 972, then the number without its leading 0
    // (972501234567). Empty is allowed.
    whatsapp: z.string().regex(/^(972[1-9]\d{7,8})?$/),
    email: text,
    serviceArea: text,
    youtubeUrl: link,
    facebookUrl: link,
    // Added later: content saved before them loads with no link.
    instagramUrl: link.default(""),
    tiktokUrl: link.default(""),
    whatsappGreeting: text,
  }),
  seo: z.object({ home: z.object({ title: text, description: text }) }),
  "home.hero": z.object({ title: lines(), video: z.string().min(1), poster: photoSchema }),
  "home.intro": z.object({ text: longText, cta: text }),
  "home.works": z.object({
    caption: text,
    title: text,
    lead: longText,
    order: z.array(z.string().max(20)).max(250),
  }),
  "home.stills": z.object({
    title: text,
    text: longText,
    photos: z
      .array(photoSchema.extend({ label: text, ratio, featured: z.boolean().optional() }))
      .min(1)
      .max(60)
      .superRefine((photos, ctx) => {
        const n = photos.filter((p) => p.featured).length;
        if (n === 0)
          ctx.addIssue({ code: "custom", message: "צריך לסמן לפחות תמונה אחת לדף הבית" });
        if (n > MAX_FEATURED_STILLS) {
          ctx.addIssue({
            code: "custom",
            message: `בדף הבית יש מקום ל־${MAX_FEATURED_STILLS} תמונות. כרגע מסומנות ${n}`,
          });
        }
      }),
    order: z.array(z.string().max(500)).max(60),
  }),
  "home.services": z.object({
    caption: text,
    title: text,
    lead: longText,
    ctaText: lines(),
    cta: text,
    otherCard: z.object({
      title: text,
      hidden: z.boolean().optional(),
      hideOnMobile: z.boolean().optional(),
    }),
  }),
  "home.about": z.object({
    caption: text,
    portrait: photoSchema,
    title: lines(),
    body: z.array(longText.min(1)).min(1, "חסר טקסט").max(6, "עד 6 פסקאות"),
  }),
  "home.process": z.object({
    caption: text,
    title: lines(),
    lead: lines(),
    items: z.array(z.object({ num: text, title: text, meta: text, desc: longText })).length(4),
  }),
  "home.testimonials": z.object({
    caption: text,
    title: text,
    background: photoSchema,
    items: z
      .array(z.object({ quote: longText, name: text, role: text }))
      .min(1)
      .max(20),
  }),
  "home.faq": z.object({
    caption: text,
    title: text,
    lead: longText,
    cta: text,
    items: z
      .array(z.object({ q: text, a: longText }))
      .min(1)
      .max(30),
  }),
  "home.strip": z.array(photoSchema.extend({ ratio })).min(3).max(8),
  "home.contact": z.object({
    caption: text,
    title: text,
    text: longText,
    call: text,
    interests: z.array(text).min(1).max(12),
    note: text,
    submit: text,
    // Content saved before these existed loads with the launch text filled in.
    message: longText
      .refine((t) => REQUIRED_FIELDS.every((f) => t.includes(f)), {
        message: `ההודעה צריכה לכלול את ${REQUIRED_FIELDS.join(" ואת ")}`,
      })
      .default(DEFAULT_MESSAGE_TEMPLATE),
    after: text,
    sent: text.default(contact.sent),
    privacy: text,
  }),
  // The services, in the order the site shows them. Merav adds, deletes and reorders them;
  // each one's address (slug) is checked here, and docs.ts restores a launch service's linked
  // gallery by its address.
  services: z
    .array(
      z.object({
        slug: z.string().max(100),
        num: text,
        title: text,
        meta: text,
        desc: longText,
        image: photoSchema.optional(),
        lead: longText,
        videos: z.array(videoSchema).max(30),
        gallery: z.enum(["stills"]).optional(),
        photos: z
          .array(photoSchema.extend({ label: text, ratio, featured: z.boolean().optional() }))
          .max(60)
          .optional(),
        hidden: z.boolean().optional(),
        // Where the card and links lead instead of the regular page (see serviceLinkProblem).
        link: z.string().max(500).optional(),
        // Shown on the site at least once: its address can no longer change.
        published: z.boolean().optional(),
        // Optional search wording (see seo-pages.ts); empty means the automatic one.
        seoTitle: text.max(120).optional(),
        seoDescription: text.max(300).optional(),
      }),
    )
    .min(1)
    .max(MAX_SERVICES)
    .superRefine((services, ctx) => {
      const seen = new Set<string>();
      services.forEach((s, i) => {
        const name = s.title.trim() || `שירות ${i + 1}`;
        const problem = slugProblem(s.slug);
        if (problem) {
          ctx.addIssue({ code: "custom", path: [i, "slug"], message: `${name}: ${problem}` });
        } else if (seen.has(s.slug)) {
          ctx.addIssue({
            code: "custom",
            path: [i, "slug"],
            message: `${name}: הכתובת /services/${s.slug} כבר שייכת לשירות אחר`,
          });
        }
        seen.add(s.slug);
        const linkProblem = serviceLinkProblem(s.link ?? "");
        if (linkProblem) {
          ctx.addIssue({ code: "custom", path: [i, "link"], message: `${name}: ${linkProblem}` });
        }
        if (!s.hidden && !s.title.trim()) {
          ctx.addIssue({
            code: "custom",
            path: [i, "title"],
            message: "לשירות שמוצג באתר חייב להיות שם",
          });
        }
      });
      if (services.every((s) => s.hidden)) {
        ctx.addIssue({ code: "custom", message: "צריך להשאיר לפחות שירות אחד גלוי באתר" });
      }
      const n = countFeaturedVideos(services);
      if (n === 0) {
        ctx.addIssue({ code: "custom", message: "צריך לסמן לפחות סרטון אחד לעבודות הנבחרות" });
      }
      if (n > MAX_FEATURED_VIDEOS) {
        ctx.addIssue({
          code: "custom",
          message: `בעבודות הנבחרות יש מקום ל־${MAX_FEATURED_VIDEOS} סרטונים. כרגע מסומנים ${n}`,
        });
      }
    }),
  servicePage: z.object({
    cta: text,
    ctaButton: text,
    empty: text,
    moreCaption: text,
    moreTitle: text,
  }),
};

export type DocKey = keyof typeof docSchemas;
