import type { Service, Video } from "./types";

/** The bar/bat mitzvah clips; at launch they are also the homepage "selected works". */
export const barMitzvahClips: Video[] = (
  [
    {
      title: "קליפ בת מצווה של גפן - בכרם עם המשפחה",
      youtubeId: "QWX2MCzFjdk",
      thumb: { name: "clip-gefen", alt: "" },
    },
    {
      title: "קליפ בר מצווה בירושלים",
      youtubeId: "0tKX4jDtYpc",
      thumb: { name: "clip-home", alt: "" },
    },
    {
      title: "קליפ בר מצווה - הנחת תפילין ראשונה",
      youtubeId: "WSmlCo4dfOM",
      thumb: { name: "clip-tefillin", alt: "" },
    },
    {
      title: "קליפ בת מצווה - אופות עם סבתא",
      youtubeId: "iiymbAVd0WM",
      thumb: { name: "clip-baking", alt: "" },
    },
    {
      title: "סרט בר מצווה - ברכות מהמשפחה",
      youtubeId: "qHyDDsU9k34",
      thumb: { name: "clip-blessings", alt: "" },
    },
  ] as Video[]
).map((v) => ({ ...v, featured: true }));

/**
 * The launch services: homepage cards (title, meta, optional image) and their pages
 * (/services/<slug>). Order is the homepage order. A service with no videos yet shows a short
 * "coming soon" note. Merav can add, delete and reorder services in the admin.
 */
const launchServices: Service[] = [
  {
    slug: "bar-bat-mitzvah",
    num: "01",
    title: "קליפים לבר ובת מצווה",
    meta: "קונספט · לוקיישן · צילום · עריכה",
    desc: "קליפ אישי לבר או לבת המצווה - מהרעיון והלוקיישן ועד העריכה, סיפור שתחזרו אליו שוב ושוב.",
    image: { name: "svc-bar-mitzvah", alt: "" },
    lead: "קליפ אישי לבר או לבת המצווה - מהרעיון והלוקיישן ועד העריכה, סיפור שתחזרו אליו שוב ושוב.",
    videos: barMitzvahClips,
  },
  {
    slug: "brand-films",
    num: "02",
    title: "סרטי תדמית",
    meta: "אנשים · מקום · סיפור",
    desc: "העסק שלכם באור טבעי ואמיתי - האנשים, המקום והסיפור.",
    image: { name: "svc-promo", alt: "" },
    lead: "העסק שלכם באור טבעי ואמיתי - האנשים, המקום והסיפור.",
    videos: [],
  },
  {
    slug: "commercials",
    num: "03",
    title: "סרטי פרסומת",
    meta: "קונספט · צילום · עריכה",
    desc: "סרטון קצר וממוקד שמציג את המוצר או השירות שלכם - מהרעיון ועד הגרסה לרשתות.",
    image: { name: "svc-ads", alt: "", pos: "center 40%" },
    lead: "סרטון קצר וממוקד שמציג את המוצר או השירות שלכם - מהרעיון ועד הגרסה לרשתות.",
    videos: [],
  },
  {
    slug: "event-summary",
    num: "04",
    title: "קליפ סיכום אירוע",
    meta: "האירוע שלכם בכמה דקות",
    desc: "הרגעים הכי טובים של האירוע בקליפ קצב אחד - לשמור, לשתף ולחזור אליו.",
    image: { name: "svc-event", alt: "" },
    lead: "קליפ קצר וקצבי שמסכם את האירוע שלכם - הרגעים, האנשים והאווירה - כדי לשמור, לשתף ולחזור אליו שוב ושוב.",
    videos: [
      {
        title: "קליפ סיכום אירוע - חידון ישיבתי",
        youtubeId: "1qnKbyUuUtU",
        thumb: { name: "svc-event", alt: "" },
      },
      {
        title: "תפילה בשבילי - אולפנת ישי, סרטון לאירוע קבלת סידור",
        youtubeId: "PGH948FnBtQ",
        thumb: { name: "event-tfila", alt: "" },
      },
      {
        title: "סרטון ליום הזיכרון - נחל שורק",
        youtubeId: "wNnJQAHjGnM",
        thumb: { name: "event-memorial", alt: "" },
      },
      {
        title: "סרטון מתנדב מצטיין - נחל שורק",
        youtubeId: "XUrGZhW5PzA",
        thumb: { name: "event-volunteer", alt: "" },
      },
      {
        title: "קליפ אירוע יום העצמאות - גני חבל יבנה",
        youtubeId: "FXQcYH_lsms",
        thumb: { name: "event-independence", alt: "" },
      },
    ],
  },
  {
    slug: "kululam",
    num: "05",
    title: "קולולם",
    meta: "שיר אחד · הרבה קולות · קליפ אחד",
    desc: "כולם שרים יחד - ואני מצלמת ועורכת את הקולולם שלכם לקליפ מרגש שנשאר למזכרת.",
    image: { name: "svc-kululam", alt: "" },
    lead: "קליפ קולולם לבית ספר, לאולפנה, לקהילה או לאירוע - כולם שרים יחד, ואני מצלמת ועורכת את הרגע לקליפ מרגש שנשאר למזכרת.",
    videos: [
      {
        title: "קולולם - מדרשת כיסופים",
        youtubeId: "Oz6Cf72R9S8",
        thumb: { name: "event-kululam-kisufim", alt: "" },
      },
      {
        title: "קולולם - אולפנת קומי אורי",
        youtubeId: "kHYYCcQDJEQ",
        thumb: { name: "event-kululam-komi-ori", alt: "" },
      },
      {
        title: "קולולם - מגמת אנגלית, אולפנת חפץ חיים",
        youtubeId: "eEqXKGU30Qk",
        thumb: { name: "event-kululam-english", alt: "" },
      },
    ],
  },
  {
    slug: "digital-courses",
    num: "06",
    title: "צילום קורסים דיגיטליים",
    meta: "שיעורים מצולמים · עריכה",
    desc: "צילום ועריכה של קורסים דיגיטליים - שיעורים ברורים ונעימים לצפייה, מוכנים לעלות לפלטפורמה.",
    image: { name: "svc-courses", alt: "" },
    lead: "צילום ועריכה של קורסים דיגיטליים - שיעורים ברורים ונעימים לצפייה, מוכנים לעלות לפלטפורמה.",
    videos: [],
  },
  {
    slug: "stills",
    num: "07",
    title: "צילומי סטילס",
    meta: "צילומי משפחה ואירועים, בטבע או בבית",
    desc: "תיעוד רגיש ולא פולשני של רגע משפחתי - תמונות טבעיות ואמיתיות שתשמרו לשנים.",
    image: { name: "svc-stills", alt: "", pos: "center 62%" },
    lead: "תיעוד רגיש ולא פולשני של רגע משפחתי - תמונות טבעיות ואמיתיות שתשמרו לשנים.",
    videos: [],
    gallery: "stills",
  },
];

/** All of them are live from launch, so their addresses are locked (see Service.published). */
export const services: Service[] = launchServices.map((s) => ({ ...s, published: true }));

/** A launch service by its address (new services exist only in the saved content). */
export const getService = (slug: string) => services.find((s) => s.slug === slug);

/** The services the site shows and links to (the admin can hide any of them). */
export const visibleServices = <T extends { hidden?: boolean | undefined }>(list: T[]) =>
  list.filter((s) => !s.hidden);

export const servicePage = {
  /** The line above the button, the same on every page (videos, photos or no work yet). */
  cta: "רוצים שהסיפור הבא יהיה שלכם?",
  ctaButton: "דברו איתי ונתחיל לתכנן יחד",
  /** Shown instead of the gallery while a service has no videos or photos yet. */
  empty: "עבודות לדוגמה יעלו לכאן בקרוב.",
  moreCaption: "שירותים נוספים",
  moreTitle: "אולי יעניין אתכם גם…",
};
