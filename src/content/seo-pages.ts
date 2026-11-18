// What each service page shows in Google, in the browser tab and in shared-link previews.
// It never appears on the page itself, where the service keeps its short name. Built in
// code (not an admin field): each one pairs the service with the phrases people search for
// and the towns Merav works in. A service with no entry here falls back to its name + area.

/** The area wording used in titles: her town first, then the nearest large town. */
export const SEO_AREA = "יד בנימין, גדרה והסביבה";

export const serviceSeo: Record<string, { title: string; description: string }> = {
  "bar-bat-mitzvah": {
    title: "קליפ בר ובת מצווה - יד בנימין, גדרה ואשדוד",
    description:
      "קליפ אישי לבר או לבת המצווה, מהרעיון והלוקיישן ועד העריכה. צילום ביד בנימין, גדרה, אשדוד והסביבה.",
  },
  "brand-films": {
    title: "סרט תדמית לעסק - צילום והפקה",
    description:
      "סרט תדמית לעסק באור טבעי ואמיתי: האנשים, המקום והסיפור. צילום והפקה ביד בנימין, גדרה, אשדוד והסביבה.",
  },
  kululam: {
    title: "צילום קולולם לבית ספר ולקהילה",
    description:
      "צילום ועריכת קולולם לבית ספר, לאולפנה ולקהילה: כולם שרים יחד, ואני הופכת את זה לקליפ מרגש. יד בנימין, גדרה והסביבה.",
  },
  commercials: {
    title: "סרטון פרסומת לעסק ולרשתות החברתיות",
    description:
      "סרטון פרסומת קצר וממוקד לעסק ולרשתות החברתיות, מהרעיון ועד הגרסה הסופית. צילום והפקה ביד בנימין, גדרה והסביבה.",
  },
  "event-summary": {
    title: "קליפ סיכום אירוע - בתי ספר, ישיבות וקהילות",
    description:
      "קליפ סיכום אירוע לבתי ספר, ישיבות, אולפנות וקהילות: הרגעים, האנשים והאווירה. צילום ביד בנימין, גדרה, קריית מלאכי והסביבה.",
  },
  "digital-courses": {
    title: "צילום ועריכת קורסים דיגיטליים",
    description:
      "צילום ועריכה של קורסים דיגיטליים ושיעורים מוקלטים, ברורים ונעימים לצפייה ומוכנים לעלות לפלטפורמה.",
  },
  stills: {
    title: "צילומי משפחה, ברית ובת מצווה באור טבעי",
    description:
      "צילומי משפחה, ברית ובת מצווה באור טבעי, בטבע או בבית. צלמת ביד בנימין, גדרה, אשדוד והסביבה.",
  },
};

/** A service page's title and description for search, with the site name after the title. */
export function serviceSeoFor(
  service: { slug: string; title: string; lead: string },
  siteName: string,
) {
  const own = serviceSeo[service.slug];
  return {
    title: `${own?.title ?? `${service.title} - ${SEO_AREA}`} | ${siteName}`,
    description: own?.description ?? service.lead,
  };
}
