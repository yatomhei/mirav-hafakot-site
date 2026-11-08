import { site } from "@/content/site";

/** True while a value is still a [bracketed] placeholder from the canvas. */
export const isPlaceholder = (v: string) => /^\[.*\]$/.test(v.trim()) || v.trim() === "";

/** wa.me link with optional pre-filled text. With no number yet, WhatsApp asks who to send to. */
export function whatsappHref(text = site.whatsappGreeting) {
  const num = site.whatsapp.replace(/\D/g, "");
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${num}${q}`;
}

/** tel: link, or the contact section while the number is still a placeholder. */
export function telHref() {
  const digits = site.phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "#contact";
}

export const mailHref = () => (isPlaceholder(site.email) ? "#contact" : `mailto:${site.email}`);

export const youtubeUrl = (id: string) => `https://youtu.be/${id}`;
