import { clips, stills } from "./home";
import type { Service, Video } from "./types";

const placeholder = (n: number): Video[] =>
  Array.from({ length: n }, () => ({ title: "[שם הסרטון]", youtubeId: "" }));

/**
 * The six services: homepage cards (title, meta, image) and their pages (/services/<slug>).
 * Order is the homepage order. Services without real videos yet show placeholder slots.
 */
export const services: Service[] = [
  {
    slug: "bar-bat-mitzvah",
    num: "01",
    title: "קליפים לבר ובת מצווה",
    meta: "קונספט · לוקיישן · צילום · עריכה",
    desc: "קליפ אישי לבר או לבת המצווה — מהרעיון והלוקיישן ועד העריכה, סיפור שתחזרו אליו שוב ושוב.",
    image: { name: "clip-beach", alt: "" },
    lead: "קליפ אישי לבר או לבת המצווה — מהרעיון והלוקיישן ועד העריכה, סיפור שתחזרו אליו שוב ושוב.",
    videos: clips,
  },
  {
    slug: "brand-films",
    num: "02",
    title: "סרטי תדמית",
    meta: "אנשים · מקום · סיפור",
    desc: "העסק שלכם באור טבעי ואמיתי — האנשים, המקום והסיפור.",
    image: { name: "svc-promo", alt: "" },
    lead: "העסק שלכם באור טבעי ואמיתי — האנשים, המקום והסיפור.",
    videos: placeholder(4),
  },
  {
    slug: "commercials",
    num: "03",
    title: "סרטי פרסומת",
    meta: "קונספט · צילום · עריכה",
    desc: "סרטון קצר וממוקד שמציג את המוצר או השירות שלכם — מהרעיון ועד הגרסה לרשתות.",
    image: { name: "svc-ads", alt: "", pos: "center 40%" },
    lead: "סרטון קצר וממוקד שמציג את המוצר או השירות שלכם — מהרעיון ועד הגרסה לרשתות.",
    videos: placeholder(4),
  },
  {
    slug: "event-summary",
    num: "04",
    title: "קליפ סיכום אירוע",
    meta: "האירוע שלכם בכמה דקות",
    desc: "הרגעים הכי טובים של האירוע בקליפ קצב אחד — לשמור, לשתף ולחזור אליו.",
    image: { name: "svc-event", alt: "" },
    lead: "קליפ קצר וקצבי שמסכם את האירוע שלכם — הרגעים, האנשים והאווירה — כדי לשמור, לשתף ולחזור אליו שוב ושוב.",
    videos: [
      {
        title: "קליפ סיכום אירוע – חידון ישיבתי",
        youtubeId: "1qnKbyUuUtU",
        thumb: { name: "svc-event", alt: "" },
      },
      {
        title: "קולולם – מדרשת כיסופים",
        youtubeId: "Oz6Cf72R9S8",
        thumb: { name: "event-kululam-kisufim", alt: "" },
      },
      {
        title: "קולולם – אולפנת קומי אורי",
        youtubeId: "kHYYCcQDJEQ",
        thumb: { name: "event-kululam-komi-ori", alt: "" },
      },
      {
        title: "קולולם – מגמת אנגלית, אולפנת חפץ חיים",
        youtubeId: "eEqXKGU30Qk",
        thumb: { name: "event-kululam-english", alt: "" },
      },
      {
        title: "תפילה בשבילי – אולפנת ישי, סרטון לאירוע קבלת סידור",
        youtubeId: "PGH948FnBtQ",
        thumb: { name: "event-tfila", alt: "" },
      },
      {
        title: "סרטון ליום הזיכרון – נחל שורק",
        youtubeId: "wNnJQAHjGnM",
        thumb: { name: "event-memorial", alt: "" },
      },
      {
        title: "סרטון מתנדב מצטיין – נחל שורק",
        youtubeId: "XUrGZhW5PzA",
        thumb: { name: "event-volunteer", alt: "" },
      },
      {
        title: "קליפ אירוע יום העצמאות – גני חבל יבנה",
        youtubeId: "FXQcYH_lsms",
        thumb: { name: "event-independence", alt: "" },
      },
      ...placeholder(2),
    ],
  },
  {
    slug: "digital-courses",
    num: "05",
    title: "צילום קורסים דיגיטליים",
    meta: "שיעורים מצולמים · עריכה",
    desc: "צילום ועריכה של קורסים דיגיטליים — שיעורים ברורים ונעימים לצפייה, מוכנים לעלות לפלטפורמה.",
    image: { name: "svc-courses", alt: "" },
    lead: "צילום ועריכה של קורסים דיגיטליים — שיעורים ברורים ונעימים לצפייה, מוכנים לעלות לפלטפורמה.",
    videos: placeholder(4),
  },
  {
    slug: "stills",
    num: "06",
    title: "צילומי סטילס",
    meta: "צילומי משפחה ואירועים, בטבע, בבית או בסטודיו",
    desc: "תיעוד רגיש ולא פולשני של רגע משפחתי — תמונות טבעיות ואמיתיות שתשמרו לשנים.",
    image: { name: "svc-stills", alt: "", pos: "center 62%" },
    lead: "תיעוד רגיש ולא פולשני של רגע משפחתי — תמונות טבעיות ואמיתיות שתשמרו לשנים.",
    videos: [],
    photos: stills.photos,
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);

export const servicePage = {
  cta: "אהבתם? הסרט הבא יכול להיות שלכם.",
  ctaPhotos: "אהבתם? הצילומים הבאים יכולים להיות שלכם.",
  ctaButton: "דברו איתי ונתחיל לתכנן יחד",
  moreCaption: "שירותים נוספים",
  moreTitle: "אולי יעניין אתכם גם…",
};
