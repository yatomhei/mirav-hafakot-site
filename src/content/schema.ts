import { z } from "zod";
import { DEFAULT_MESSAGE_TEMPLATE, REQUIRED_FIELDS } from "./whatsapp-message";
import { contact } from "./home";
import { SERVICE_SLUGS } from "./services";
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
    // Digits only, international format without "+": 9725XXXXXXXX. Empty is allowed.
    whatsapp: z.string().regex(/^(\d{8,15})?$/),
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
  // The seven services, in the order the site shows them. Their addresses (slug) are fixed
  // in code, and docs.ts restores each one's linked gallery from the launch content.
  services: z
    .array(
      z.object({
        slug: z.string(),
        num: text,
        title: text,
        meta: text,
        desc: longText,
        image: photoSchema.optional(),
        lead: longText,
        videos: z.array(videoSchema).max(30),
        gallery: z.enum(["stills"]).optional(),
        hidden: z.boolean().optional(),
      }),
    )
    .length(7)
    .superRefine((services, ctx) => {
      // The same seven addresses, in any order (a new service is added in code).
      const slugs = new Set(services.map((s) => s.slug));
      if (slugs.size !== SERVICE_SLUGS.length || SERVICE_SLUGS.some((s) => !slugs.has(s))) {
        ctx.addIssue({ code: "custom", message: "רשימת השירותים לא תואמת לאתר" });
      }
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
    ctaPhotos: text,
    ctaButton: text,
    empty: text,
    ctaEmpty: text,
    moreCaption: text,
    moreTitle: text,
  }),
};

export type DocKey = keyof typeof docSchemas;
