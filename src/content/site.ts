import type { NavItem, SiteSettings } from "./types";

/**
 * Contact details and links: the launch defaults. Merav edits them in the admin
 * ("פרטים והגדרות"); empty social links are hidden.
 */
export const site: SiteSettings = {
  name: "הפקת המרב",
  tagline: "הכי טבעי שלכם",
  phone: "058-770-2937",
  whatsapp: "972587702937",
  email: "Meravi2340@gmail.com",
  serviceArea: "יד בנימין, גדרה והסביבה,\nקריית מלאכי, חבל לכיש ואשדוד",
  youtubeUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  whatsappGreeting: "היי מרב, הגעתי מהאתר ואשמח לשמוע פרטים",
};

export const nav: NavItem[] = [
  { label: "עבודות", hash: "clips" },
  { label: "שירותים", hash: "services" },
  { label: "אודות", hash: "about" },
  { label: "מה כולל השירות", hash: "process" },
  { label: "המלצות", hash: "testimonials" },
  { label: "שאלות נפוצות", hash: "faq" },
  { label: "צור קשר", hash: "contact" },
];

export const seo = {
  home: {
    title: "הפקת המרב - הפקות סרטים וצילום אמנותי | מרב ורנר",
    description:
      "מרב ורנר - צלמת, עורכת וידאו ומפיקה. קליפים לבר ובת מצווה, סרטי תדמית ופרסומת, קליפ סיכום אירוע וצילומי משפחה באור טבעי.",
  },
};
