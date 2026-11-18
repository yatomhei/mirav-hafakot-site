import { useSite } from "@/content/context";
import type { SiteSettings } from "@/content/types";

/** True while a value is still a [bracketed] placeholder from the canvas. */
export const isPlaceholder = (v: string) => /^\[.*\]$/.test(v.trim()) || v.trim() === "";

/**
 * An Israeli number as wa.me wants it: 972 and no leading 0. Also repairs the usual slips,
 * "0501234567" and "9720501234567"; anything else is left as typed.
 */
export function waNumber(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (/^9720\d{8,9}$/.test(digits)) return `972${digits.slice(4)}`;
  if (/^0\d{8,9}$/.test(digits)) return `972${digits.slice(1)}`;
  return digits;
}

/** wa.me link with optional pre-filled text. With no number yet, WhatsApp asks who to send to. */
export function whatsappHref(site: SiteSettings, text = site.whatsappGreeting) {
  const num = waNumber(site.whatsapp);
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${num}${q}`;
}

/** tel: link, or the contact section while the number is still a placeholder. */
export function telHref(site: SiteSettings) {
  const digits = site.phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "#contact";
}

export const mailHref = (site: SiteSettings) =>
  isPlaceholder(site.email) ? "#contact" : `mailto:${site.email}`;

/** The contact links for the saved settings. */
export function useContactLinks() {
  const site = useSite();
  return {
    site,
    whatsapp: (text?: string) => whatsappHref(site, text),
    tel: telHref(site),
    mail: mailHref(site),
  };
}

export const youtubeUrl = (id: string) => `https://youtu.be/${id}`;
