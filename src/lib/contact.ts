import { useSite } from "@/content/context";
import type { SiteSettings } from "@/content/types";

/** True while a value is still a [bracketed] placeholder from the canvas. */
export const isPlaceholder = (v: string) => /^\[.*\]$/.test(v.trim()) || v.trim() === "";

/** wa.me link with optional pre-filled text. With no number yet, WhatsApp asks who to send to. */
export function whatsappHref(site: SiteSettings, text = site.whatsappGreeting) {
  const num = site.whatsapp.replace(/\D/g, "");
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
