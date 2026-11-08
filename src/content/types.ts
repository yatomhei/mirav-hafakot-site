/**
 * Content shapes. Everything typed here is text, images or links — the parts the client
 * will edit from the admin in phase 3. Colours, fonts, sizes and layout never appear here:
 * they are fixed in src/styles.css and the components.
 */

/** A site image in public/images, generated in three widths by scripts/optimize-images.mjs. */
export type Photo = {
  /** Base name, e.g. "still-brit" → still-brit-{480,960,1600}.webp */
  name: string;
  alt: string;
  /** CSS object-position, e.g. "center 40%". */
  pos?: string;
};

/** A YouTube video. `youtubeId` may be empty for a placeholder slot. */
export type Video = {
  title: string;
  youtubeId: string;
  thumb?: Photo;
};

export type SiteSettings = {
  name: string;
  tagline: string;
  /** Shown as text, e.g. "050-000-0000". A value in [brackets] is a placeholder. */
  phone: string;
  /** International digits only, e.g. "972500000000". Empty → WhatsApp opens without a number. */
  whatsapp: string;
  email: string;
  youtubeUrl: string;
  facebookUrl: string;
  /** Text pre-filled in the WhatsApp chat from the floating button and menu. */
  whatsappGreeting: string;
};

export type NavItem = { label: string; hash: string };

export type Service = {
  slug: string;
  num: string;
  title: string;
  meta: string;
  desc: string;
  image: Photo;
  /** Service page */
  lead: string;
  videos: Video[];
  /** Stills page shows photos instead of videos. */
  photos?: Photo[];
};

export type Testimonial = { quote: string; name: string; role: string };
export type Faq = { q: string; a: string };
export type IncludeItem = { num: string; title: string; meta: string; desc: string };
export type StillPhoto = Photo & { label: string; tall?: boolean; last?: boolean };
export type StripPhoto = Photo & { ratio: number };
