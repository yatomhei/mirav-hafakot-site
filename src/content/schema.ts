import { z } from "zod";

// The shape every saved record must have before the site uses it (see docs.ts). Counts the
// layout depends on are fixed here, so a saved record can never break the design: a record
// that fails falls back to the launch content for that section only.

const text = z.string().max(2000);
const longText = z.string().max(8000);
/** Exactly `n` lines of a heading the design breaks in a fixed place. */
const lines = (n: number) => z.array(text).length(n);

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
});

/** Empty, a [placeholder] or a web address. */
const link = z.union([z.literal(""), z.string().regex(/^\[.*\]$/), z.url().max(500)]);

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
    whatsappGreeting: text,
  }),
  seo: z.object({ home: z.object({ title: text, description: text }) }),
  "home.hero": z.object({ title: lines(2), video: z.string().min(1), poster: photoSchema }),
  "home.intro": z.object({ text: longText, cta: text }),
  "home.works": z.object({
    caption: text,
    title: text,
    lead: longText,
    clips: z.array(videoSchema).min(1).max(30),
  }),
  "home.stills": z.object({
    title: text,
    text: longText,
    photos: z
      .array(photoSchema.extend({ label: text, ratio }))
      .min(1)
      .max(60),
  }),
  "home.services": z.object({
    caption: text,
    title: text,
    lead: longText,
    ctaText: lines(2),
    cta: text,
    otherCard: z.object({ title: text }),
  }),
  "home.about": z.object({
    caption: text,
    portrait: photoSchema,
    title: lines(2),
    body: z.array(longText).min(1).max(6),
  }),
  "home.process": z.object({
    caption: text,
    title: lines(2),
    lead: lines(2),
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
    after: text,
    privacy: text,
  }),
  // The seven services, in order. Their addresses (slug) and linked galleries are fixed in
  // code: docs.ts puts them back from the launch content whatever was saved.
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
        gallery: z.enum(["works", "stills"]).optional(),
      }),
    )
    .length(7),
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
