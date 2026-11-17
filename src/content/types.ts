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
  /** Also shown in the homepage "selected works" carousel. */
  featured?: boolean;
};

export type SiteSettings = {
  name: string;
  tagline: string;
  /** Shown as text, e.g. "050-000-0000". A value in [brackets] is a placeholder. */
  phone: string;
  /** International digits only, e.g. "972500000000". Empty → WhatsApp opens without a number. */
  whatsapp: string;
  email: string;
  /** Shown in the footer under "אזורי שירות:" (a line break starts a new row); empty hides it. */
  serviceArea: string;
  /** Social links: empty (or a [placeholder]) hides the icon in the footer; filled in, it shows. */
  youtubeUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
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
  /** Card photo; without one the card shows its plain background under the veil. */
  image?: Photo;
  /** Service page */
  lead: string;
  videos: Video[];
  /**
   * The page shows the stills photos instead of videos. Fixed in code, never set from the
   * admin.
   */
  gallery?: "stills";
  /** Hidden from the site: no card, no links, and its page answers "not found". */
  hidden?: boolean;
};

export type Testimonial = { quote: string; name: string; role: string };
export type Faq = { q: string; a: string };
export type IncludeItem = { num: string; title: string; meta: string; desc: string };
/** `ratio` (width ÷ height) sizes the tile in the stills page masonry before the photo loads. */
export type StillPhoto = Photo & {
  label: string;
  ratio: number;
  /** Also shown in the homepage mosaic. */
  featured?: boolean;
};
export type StripPhoto = Photo & { ratio: number };
