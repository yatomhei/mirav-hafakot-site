import { getService } from "./services";

// What each service page shows in Google, in the browser tab and in shared-link previews.
// It never appears on the page itself, where the service keeps its short name. Each one pairs
// the service with the phrases people search for and the towns Merav works in. Merav can
// replace them in the admin (עמודי שירות). A renamed service, or one with no entry here,
// falls back to its name + area (see autoServiceSeo).

/** The area wording used in titles: her town first, then the nearest large town. */
export const SEO_AREA = "יד בנימין, גדרה והסביבה";

export const serviceSeo: Record<string, { title: string; description: string }> = {
  "bar-bat-mitzvah": {
    title: "קליפ בר ובת מצווה - יד בנימין, גדרה ואשדוד",
    description:
      "קליפ אישי לבר או לבת המצווה, מהרעיון והלוקיישן ועד העריכה. צילום ביד בנימין, גדרה, אשדוד והסביבה.",
  },
  "brand-films": {
    title: "סרטון תדמית לעסק - צילום והפקה",
    description:
      "סרטון תדמית לעסק קטן או גדול, באור טבעי ואמיתי: האנשים, המקום והסיפור. צילום והפקה ביד בנימין, גדרה, אשדוד והסביבה.",
  },
  kululam: {
    title: "צילום שירת המונים (קולולם) לבתי ספר וקהילות",
    description:
      "צילום ועריכת קליפ שירת המונים (קולולם) לבית ספר, לאולפנה ולקהילה: כולם שרים יחד, ואני הופכת את זה לקליפ מרגש. יד בנימין, גדרה והסביבה.",
  },
  commercials: {
    title: "סרטון שיווקי ופרסומת לעסק",
    description:
      "סרטון שיווקי או פרסומת קצרה וממוקדת לעסק ולרשתות החברתיות, מהרעיון ועד הגרסה הסופית. צילום והפקה ביד בנימין, גדרה והסביבה.",
  },
  "event-summary": {
    title: "קליפ סיכום אירוע וקליפ סיום - בתי ספר וישיבות",
    description:
      "קליפ סיכום אירוע וקליפ סיום שנה לבתי ספר, ישיבות, אולפנות וקהילות: הרגעים, האנשים והאווירה. צילום ביד בנימין, גדרה, קריית מלאכי והסביבה.",
  },
  "digital-courses": {
    title: "צילום והפקת קורס דיגיטלי",
    description:
      "צילום ועריכה של קורסים דיגיטליים ושיעורים מוקלטים, ברורים ונעימים לצפייה ומוכנים לעלות לפלטפורמה.",
  },
  stills: {
    title: "צילומי משפחה, ברית ובת מצווה באור טבעי",
    description:
      "צילומי משפחה בטבע או בבית, וצילומי ברית ובת מצווה באור טבעי. צלמת ביד בנימין, גדרה, אשדוד והסביבה.",
  },
};

type ServiceForSeo = {
  slug: string;
  title: string;
  lead: string;
  seoTitle?: string | undefined;
  seoDescription?: string | undefined;
};

/**
 * The automatic wording (before the site name), used when the admin fields are empty. The
 * written wording above belongs to each service's launch name: once Merav renames a service,
 * it follows the new name (name + area) and her opening paragraph instead.
 */
export function autoServiceSeo(service: ServiceForSeo) {
  const own = serviceSeo[service.slug];
  const renamed = service.title.trim() !== getService(service.slug)?.title;
  if (own && !renamed) return own;
  return { title: `${service.title.trim()} - ${SEO_AREA}`, description: service.lead };
}

/**
 * A service page's title and description for search: what Merav typed in the admin, or the
 * automatic wording. The site name always follows the title.
 */
export function serviceSeoFor(service: ServiceForSeo, siteName: string) {
  const auto = autoServiceSeo(service);
  return {
    title: `${service.seoTitle?.trim() || auto.title} | ${siteName}`,
    description: service.seoDescription?.trim() || auto.description,
  };
}
