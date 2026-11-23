import { DEFAULT_MESSAGE_TEMPLATE } from "./whatsapp-message";
import { barMitzvahClips } from "./services";
import type { Faq, Photo, IncludeItem, StillPhoto, StripPhoto, Testimonial, Video } from "./types";

/** Homepage copy, in page order. Copy is verbatim from the approved canvas. */

export const hero = {
  title: ["הפקות סרטים", "וצילום אמנותי"],
  video: "video/hero.mp4",
  poster: { name: "hero-poster", alt: "" } as Photo,
};

/** Short intro right under the hero: one sentence and the contact button. */
export const intro = {
  text: "אני מרב ורנר, ואני יוצרת סרטים, קליפים וצילומים שנותנים לרגש מקום ראשון.",
  cta: "בואו נדבר על הסרט או האירוע שלכם",
};

/** About Merav, below the services. */
export const about: {
  caption: string;
  portrait: Photo;
  title: string[];
  /** One string per paragraph; **bold** marks the highlighted phrase. */
  body: string[];
} = {
  caption: "03 / נעים להכיר",
  portrait: {
    name: "about-portrait",
    alt: "מרב ורנר מחייכת עם מצלמה ביד, בשביל עצים",
    pos: "center 30%",
  },
  title: ["אני מרב ורנר,", "צלמת, עורכת וידאו ומפיקה."],
  body: [
    "גדלתי בפסגות שבהרי בנימין, בבית שבו אמנות וחשיבה מחוץ לקופסה היו חלק מהיומיום. כשהגיע הזמן לבחור מקצוע, היה לי ברור שאבחר תחום שישאיר מקום ליצירתיות, ונרשמתי ללימודי קולנוע. משם, לאט לאט, נולדה הפקת המרב.",
    "היום אני יוצרת **קליפים אישיים, סרטי תדמית ופרסומת, ומצלמת משפחות ורגעים מיוחדים**, ומלווה כל פרויקט מהרעיון ועד התוצאה המוגמרת. בכל צילום, בחוץ או בבית, הרגש מקבל מקום ראשון, כדי שתתרגשו בכל צפייה והרגעים שלכם יישארו איתכם לתמיד.",
  ],
};

export const works = {
  caption: "01 / עבודות נבחרות",
  title: "סרטים וקליפים שהפקתי",
  lead: "הצצה לכמה מהסיפורים שזכיתי לספר דרך המצלמה, מאירועים משפחתיים ועד סרטי תדמית ופרסומת.",
  /**
   * The homepage carousel shows the service-page videos marked `featured` (up to 6, see
   * featured.ts), in this order of YouTube ids; any not listed follow in service order.
   */
  order: barMitzvahClips.map((v) => v.youtubeId),
};

/** Every stills photo (the stills service page gallery). */
const stillPhotos: StillPhoto[] = [
  {
    name: "still-bat-mitzvah-sea",
    ratio: 3 / 2,
    label: "בת מצווה",
    alt: "ילדה בכובע קש ושמלה לבנה על שפת הים",
  },
  {
    name: "still-family-stairs",
    ratio: 2 / 3,
    label: "משפחה",
    alt: "משפחה מורחבת מצטלמת יחד על מדרגות הבית",
    pos: "center 40%",
  },
  {
    name: "still-lifestyle-bed",
    ratio: 3 / 2,
    label: "לייף סטייל",
    alt: "משפחה צוחקת יחד על המיטה בבית",
    pos: "center 30%",
  },
  {
    name: "still-kids-cotton",
    ratio: 16 / 9,
    label: "ילדים",
    alt: "פעוטה יושבת על כיסא עץ בשביל ליד שדה כותנה בשקיעה",
    pos: "55% center",
  },
  {
    name: "still-kids-tire",
    ratio: 3 / 2,
    label: "ילדים",
    alt: "ילד מחייך מבעד לנדנדת צמיג בין עלי שלכת",
    pos: "center 40%",
  },
  {
    name: "still-brit",
    ratio: 2 / 3,
    label: "ברית",
    alt: "הורים מחזיקים תינוק ביום הברית",
    pos: "center 45%",
  },
  {
    name: "still-newborn",
    ratio: 3 / 2,
    label: "ניו בורן",
    alt: "תינוק ישן בכובע ארנב עם גזר סרוג",
  },
  {
    name: "still-bar-mitzvah-stream",
    ratio: 3 / 2,
    label: "בר מצווה",
    alt: "נער משיט ספינה בנחל",
  },
  {
    name: "still-family-lake",
    ratio: 3 / 2,
    label: "משפחה",
    alt: "משפחה מורחבת מחובקת ליד אגם בין עצי אקליפטוס",
    pos: "center 60%",
  },
  {
    name: "still-family-sunset",
    ratio: 3 / 2,
    label: "משפחה",
    alt: "משפחה בשביל עפר בשקיעה",
    pos: "center 55%",
  },
];

export const stills = {
  title: "רגעים שתפסתי בעדשה",
  text: "צילומי משפחה, בריתות ובר ובת מצווה, בטבע או בבית. אני אוהבת לצלם אנשים בסביבה שבה הם מרגישים בנוח ולתפוס את הרגעים שקורים באופן טבעי.",
  /**
   * The stills service page shows all of these. The homepage mosaic (3 rows of 3) shows the
   * ones marked `featured`, in `order` (photo names): slots 2 and 6 are narrow and tall on
   * phones, so portrait photos go there.
   */
  photos: stillPhotos.map((p, i) => ({ ...p, featured: i < 9 })),
  order: stillPhotos.slice(0, 9).map((p) => p.name),
};

export const servicesIntro = {
  caption: "02 / תחומי הצילום וההפקה",
  title: "ומה אפשר להפיק עבורכם?",
  lead: "לחצו על אחד התחומים כדי לגלות עוד על השירות, איך הוא עובד ומה הוא כולל.",
  ctaText: ["יש לכם רעיון לסרטון לעסק", "או רוצים לתעד אירוע משפחתי?"],
  cta: "דברו איתי ונתחיל לתכנן יחד",
  /**
   * Last card in the services grid; opens the contact form. It can be hidden everywhere, or
   * only on phones (one column, where it fills no gap; the contact button follows anyway).
   */
  otherCard: {
    title: "משהו אחר בראש? דברו איתי",
    hidden: false as boolean,
    hideOnMobile: true as boolean,
  },
};

export const process = {
  caption: "04 / הרבה מעבר לצילום",
  title: ["מרעיון ועד", "לתוצאה המוגמרת"],
  lead: [
    "אני מלווה אתכם משלב התכנון ועד לסרט או לאלבום המוגמר,",
    "עם תשומת לב לכל פרט לאורך הדרך.",
  ],
  items: [
    {
      num: "01",
      title: "פיתוח רעיון וקונספט",
      meta: "רעיון, סגנון ותכנון",
      desc: "יש לכם רעיון לסרט, לקליפ או לצילומי קונספט? אני עוזרת לגבש את הרעיון, לבחור את הסגנון ולתכנן איך להוציא אותו לפועל.",
    },
    {
      num: "02",
      title: "צילום והפקה",
      meta: "קליפים, תדמית, משפחה ואירועים",
      desc: "צילום והפקת קליפים, סרטי תדמית ופרסומות, לצד צילומי משפחה ואירועים. לכל פרויקט אני מתאימה את הלוקיישן והסגנון, עם אהבה מיוחדת לצילום בטבע ובאור טבעי.",
    },
    {
      num: "03",
      title: "עריכת וידאו",
      meta: "עריכה, מוזיקה ועיבוד תמונה",
      desc: "עריכת חומרי הצילום, שילוב מוזיקה ועיבוד התמונה ליצירת סרט שמעביר את הסיפור והאווירה שרציתם.",
    },
    {
      num: "04",
      title: "בוקים ואלבומי תמונות",
      meta: "בחירת תמונות ועיצוב",
      desc: "בחירת התמונות ועיצוב בוקים ואלבומים, כדי להפוך את רגעי הצילום למזכרת שאפשר לחזור אליה שוב ושוב.",
    },
  ] satisfies IncludeItem[],
};

export const testimonials = {
  hidden: false as boolean,
  caption: "05 / המלצות של לקוחות",
  title: "לקוחות משתפים בחוויה",
  background: { name: "testimonials-bg", alt: "", pos: "center 60%" } as Photo,
  items: [
    {
      quote:
        "״מרב הצליחה לתרגם את השיר שלי לתמונות בדיוק כמו שדמיינתי, ואפילו יותר. הקליפ יצא עדין, אמיתי ומרגש.״",
      name: "נועה ל.",
      role: "זמרת־יוצרת · קליפ",
    },
    {
      quote:
        "״בברית של הבן שלנו כמעט לא הרגשנו שהיא שם, ובסוף קיבלנו סרט שכל המשפחה רואה שוב ושוב.״",
      name: "דנה ויואב ש.",
      role: "צילום ברית",
    },
    {
      quote: "״צילום מקצועי עם כמה זוויות ועריכה זורמת. סוף סוף יש לנו תיעוד שראוי להצגה.״",
      name: "[שם התיאטרון]",
      role: "הופעות והצגות",
    },
    {
      quote: "״סרט התדמית שינה את הדרך שבה לקוחות פוגשים אותנו. רגוע, חם - ובדיוק אנחנו.״",
      name: "אורית מ.",
      role: "[שם העסק] · סרט תדמית",
    },
  ] satisfies Testimonial[],
};

export const faq = {
  caption: "06 / שאלות ותשובות",
  title: "שאלות שאתם שואלים אותי",
  lead: "כל מה שרציתם לדעת לפני שמתחילים.",
  cta: "לא מצאתם תשובה? דברו איתי",
  items: [
    {
      q: "באילו אזורים את נותנת שירות?",
      a: "אני מגיעה לצילומים ביד בנימין, גדרה והסביבה, קריית מלאכי, חבל לכיש ואשדוד. אם אתם מתכננים צילומים במקום אחר, מוזמנים לפנות אליי ונבדוק יחד את האפשרויות.",
    },
    {
      q: "איפה מתקיימים הצילומים?",
      a: "זה תלוי בסוג הצילום. צילומי משפחה מתקיימים לרוב בטבע או אצלכם בבית, באור טבעי. צילומי תדמית והפקות וידאו מתקיימים בלוקיישן שמתאים לפרויקט.",
    },
    {
      q: "יש לנו רעיון לצילומים או לסרטון, אבל לא יודעים איך להוציא אותו לפועל. תוכלי לעזור?",
      a: "בשמחה! לא חייבים להגיע עם רעיון מגובש. נדבר על מה שאתם מחפשים ונחשוב יחד על הכיוון המתאים.",
    },
    {
      q: "אפשר להזמין גם בוק או אלבום תמונות?",
      a: "כן, אני מכינה גם בוקים ואלבומי תמונות. אפשר לדבר על האפשרויות ולבחור את מה שמתאים לכם.",
    },
    {
      q: "כמה זמן מראש כדאי לפנות אלייך?",
      a: "כדאי ליצור קשר מוקדם ככל האפשר, במיוחד אם מדובר באירוע עם תאריך קבוע, כדי שנוכל לבדוק זמינות ולהיערך בהתאם.",
    },
    {
      q: "מתי מקבלים את התמונות או הסרטון המוכנים?",
      a: "זה תלוי בסוג הצילום ובהיקף העבודה. אחרי שאבין מה אתם צריכים, אוכל לתת לכם הערכת זמן.",
    },
    {
      q: "איך מקבלים הצעת מחיר?",
      a: "פשוט יוצרים איתי קשר ומספרים קצת על מה שאתם מתכננים. בהתאם לסוג הצילום ולצרכים שלכם, אוכל להכין הצעת מחיר.",
    },
  ] satisfies Faq[],
};

export const strip: StripPhoto[] = [
  {
    name: "strip-beetle",
    ratio: 1.34,
    pos: "center 55%",
    alt: "נערה נשענת מחלון חיפושית צהובה בפרדס",
  },
  { name: "strip-scooter", ratio: 0.75, pos: "center 30%", alt: "נער עם קורקינט ליד קיר גרפיטי" },
  { name: "strip-horse", ratio: 0.75, pos: "62% center", alt: "נערה בכובע בוקרים ליד סוס" },
  {
    name: "strip-pinecones",
    ratio: 1.6,
    pos: "center 60%",
    alt: "ארבע ילדות משחקות באצטרובלים מתחת לעץ באור שקיעה",
  },
  {
    name: "strip-path",
    ratio: 0.75,
    pos: "58% center",
    alt: "ילדה בשמלה לבנה הולכת בשביל עפר לעבר השקיעה",
  },
];

export const contact = {
  caption: "יצירת קשר",
  title: "אז מה תרצו שניצור יחד?",
  text: "קליפ, סרט תדמית או אירוע שתרצו לתעד? מלאו את הטופס, ספרו לי קצת מה אתם מתכננים ונחשוב יחד איך להפוך את הרעיון שלכם למציאות.",
  call: "מעדיפים לדבר? חייגו:",
  interests: [
    "קליפים",
    "סרטי תדמית",
    "סרטי פרסומת",
    "קליפ סיכום אירוע",
    "קולולם",
    "צילומי סטילס",
    "צילום קורסים דיגיטליים",
  ],
  note: "* שדות חובה · ההודעה תיפתח בוואטסאפ",
  submit: "שליחה בוואטסאפ",
  /** The WhatsApp message the form prepares; see whatsapp-message.ts for the placeholders. */
  message: DEFAULT_MESSAGE_TEMPLATE,
  /** The line under the send button. */
  after: "ואחזור אליכם בהקדם האפשרי.",
  /** Shown once the form is sent and WhatsApp opens with the message. */
  sent: "תודה! ההודעה מחכה לכם בוואטסאפ, נשאר רק ללחוץ על שליחה.",
  privacy: "מסירת הפרטים מרצון, לצורך חזרה אליכם בלבד. עוד ב",
};
