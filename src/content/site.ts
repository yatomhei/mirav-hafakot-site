import type { NavItem, SiteSettings } from "./types";

/**
 * Contact details and links. The bracketed values are placeholders until the client sends
 * the real ones; in phase 3 they move to the admin's settings screen.
 */
export const site: SiteSettings = {
  name: "הפקת המרב",
  tagline: "הכי טבעי שלכם",
  phone: "[טלפון]",
  whatsapp: "",
  email: "[אימייל]",
  youtubeUrl: "",
  facebookUrl: "",
  whatsappGreeting: "היי מרב, הגעתי מהאתר ואשמח לשמוע פרטים",
};

export const nav: NavItem[] = [
  { label: "אודות", hash: "about" },
  { label: "עבודות", hash: "clips" },
  { label: "שירותים", hash: "services" },
  { label: "מה כולל השירות", hash: "process" },
  { label: "המלצות", hash: "testimonials" },
  { label: "שאלות נפוצות", hash: "faq" },
  { label: "צור קשר", hash: "contact" },
];

export const seo = {
  home: {
    title: "הפקת המרב — הפקות סרטים וצילום אמנותי | מרב ורנר",
    description:
      "מרב ורנר — צלמת, עורכת וידאו ומפיקה. קליפים לבר ובת מצווה, סרטי תדמית ופרסומת, קליפ סיכום אירוע וצילומי משפחה באור טבעי.",
  },
};
