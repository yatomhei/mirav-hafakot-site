import type { Photo, Video } from "./types";

/**
 * The bar/bat mitzvah landing page (/bar-mitzvah-clips): its launch content, taken word for
 * word from the approved design (canvas version 2). Merav edits all of it in the admin's
 * "דף נחיתה: בר/בת מצווה" tab; the layout, colours and motion stay in the code
 * (src/components/landing/BarMitzvahLanding.tsx).
 */

export type LandingQuestion = { q: string; a: string };
export type LandingStep = { title: string; text: string };

const video = (title: string, youtubeId: string, thumb: string): Video => ({
  title,
  youtubeId,
  thumb: { name: thumb, alt: "" },
});

export const barMitzvahLanding = {
  /** Google and social sharing. */
  seo: {
    title: "קליפ לבר ובת מצווה - קליפ אישי ומרגש שנשאר לשנים | הפקת המרב",
    description:
      "קליפ בר מצווה או בת מצווה שמספר את הסיפור של הילד או הילדה שלכם: מהרעיון ועד הקליפ המוכן, עם ליווי אישי ובאור טבעי. מרב ורנר, יד בנימין והסביבה.",
  },
  hero: {
    /** The page's main heading. */
    title: ["קליפ בר.בת מצווה מרגש ומפתיע שישאר כמזכרת לשנים הבאות"],
    lead: "חוגגים בר או בת מצווה? מזל טוב! בואו ניצור יחד קליפ אישי שמספר את הסיפור של הילד או הילדה שלכם, ומביא לידי ביטוי את האופי, התחביבים, המשפחה וכל מה שמיוחד בהם.",
    /** The lead's closing sentence, in the olive accent colour. */
    leadAccent: "מהרעיון ועד לקליפ המוכן, עם ליווי אישי ובדרך שמתאימה לכם.",
    cta: "בואו נדבר על הקליפ שלכם",
    clipsLink: "צפו בקליפים שהפקתי",
    /** The large clip under the opening. */
    video: video("קליפ בת מצווה של גפן - בכרם עם המשפחה", "QWX2MCzFjdk", "clip-gefen"),
  },
  idea: {
    title: "לא עוד קליפ. הסיפור שלהם.",
    question: "מה הם הכי אוהבים לעשות? מה מצחיק אותם? מה חשוב להם ולמשפחה?",
    /** One paragraph; Enter starts a new line. */
    text: [
      "כל אלה יכולים להפוך לקליפ אישי עם משמעות.",
      "יחד נחשוב על רעיון שמתחבר לעולם של הילד או הילדה, נבחר את המקומות המתאימים וניצור סיפור שהוא באמת שלהם.",
    ],
  },
  clips: {
    title: "אז איך נראה קליפ כזה?",
    lead: "כל ילד וילדה מביאים איתם סיפור אחר. הנה כמה מהקליפים שהפקתי.",
    items: [
      video("קליפ בת מצווה של גפן - בכרם עם המשפחה", "QWX2MCzFjdk", "clip-gefen"),
      video("קליפ בר מצווה בירושלים", "0tKX4jDtYpc", "clip-jerusalem"),
      video("קליפ בר מצווה - הנחת תפילין ראשונה", "WSmlCo4dfOM", "clip-tefillin"),
      video("קליפ בת מצווה - אופות עם סבתא", "iiymbAVd0WM", "clip-baking"),
      video("סרט בר מצווה - ברכות מהמשפחה", "qHyDDsU9k34", "clip-blessings"),
      video("[שם הקליפ]", "8hbDH_Tolys", "clip-planting"),
    ] as Video[],
    cta: "בואו ניצור גם את הקליפ שלכם",
  },
  worries: {
    title: ["מצלמה? משחק?", "רגע, יש לי כמה שאלות..."],
    /** Each one a short chat: the question, then Merav's answer. */
    items: [
      { q: '"אבל אני לא יודע לשחק..."', a: "מעולה, כי ממש לא צריך!" },
      {
        q: '"ומה אם אני ארגיש פדיחה מול המצלמה?"',
        a: "לא כולם אוהבים להצטלם, וזה בסדר. נבחר רעיון שמתאים לכם ונצלם בסביבה שבה תרגישו בנוח, בלי משחק מאולץ ובלי צורך להעמיד פנים.",
      },
      {
        q: '"אנחנו בכלל לא יודעים איזה קליפ לעשות..."',
        a: "בשביל זה אני כאן! נכיר את הילד או הילדה, נחשוב יחד על רעיונות ונבנה קליפ סביב מה שמיוחד בהם.",
      },
      {
        q: '"ואם לא כל המשפחה רוצה להצטלם?"',
        a: "גם לזה נמצא פתרון. נתאים את הצילומים למי שרוצה להשתתף, בלי להכריח אף אחד לעמוד מול המצלמה.",
      },
    ] as LandingQuestion[],
  },
  story: {
    caption: "הסיפור של גפן",
    title: "קליפ שכל המשפחה חלק ממנו",
    /** Paragraphs. */
    body: [
      "המשפחה של גפן רצתה קליפ בת מצווה שישלב את כולם. אבל הילדים הגדולים לא ממש התלהבו מהרעיון של לשחק מול המצלמה.",
      "אז חיפשנו דרך שתתאים לכולם. בחרנו בקונספט טבעי, בלי סצנות מאולצות, וחשבנו על כל הפרטים, מהרעיונות ועד למילים שגפן תאמר. בחרנו לצלם בכרם, באור טבעי, ויצאנו לכמה שעות של צילומים באווירה נעימה וזורמת.",
      "התוצאה הייתה קליפ משפחתי עם משמעות, שמספר סיפור על משפחה, שורשים, הקשר לארץ והערכים שעוברים מדור לדור. ואפילו הילדים שבהתחלה הסתייגו מההשתתפות אהבו את התוצאה, בעיקר כי היא הרגישה להם טבעית ואמיתית.",
    ],
    /** The strip of five frames across the page. */
    photos: [
      { name: "gefen-dance", alt: "גפן רוקדת בשמלה לבנה בין שורות הכרם" },
      { name: "gefen-swing", alt: "גפן ובת משפחה צוחקות על נדנדה מעל הנחל" },
      { name: "gefen-basket", alt: "גפן מחייכת בכרם עם סלסלת ענבים" },
      { name: "gefen-stone", alt: "אבן עם המילה שמחה על אדמת הכרם, בין רגלי המשפחה" },
      { name: "gefen-family", alt: "המשפחה של גפן צוחקת ומוחאת כפיים מתחת לעץ" },
    ] as Photo[],
    cta: "צפו בקליפ המלא של גפן ומשפחתה",
    video: { title: "קליפ בת מצווה של גפן - בכרם עם המשפחה", youtubeId: "QWX2MCzFjdk" } as Video,
  },
  experience: {
    kicker: "אזהרת ספוילר!",
    title: "גם הדרך היא חלק מהחוויה!",
    lead: "אתם מגיעים בשביל הקליפ, אבל בדרך מחכה לכם גם חוויה משותפת.",
    text: "מהחשיבה על הרעיון, דרך בחירת הלוקיישנים ועד לצילומים עצמם, יש מקום לצחוקים, לרגעים משפחתיים ולדברים שקורים באופן טבעי.",
    closing: "ובסוף? נשאר לכם לא רק קליפ, אלא גם הזיכרונות מהדרך שבה יצרתם אותו.",
    cta: "בואו נדבר על הקליפ שלכם",
  },
  testimonials: {
    /** Merav hides the section until she has testimonials she may publish. */
    hidden: false as boolean,
    title: "אל תיקחו רק את המילה שלי...",
    /** Shown between quote marks, which the page adds. */
    quote: "פשוט קליפ מושלם. אפילו אנחנו מתרגשים עדיין כל פעם מחדש...",
    author: "[שם המשפחה]",
    /** Screenshots of testimonials (for example WhatsApp messages), up to 15. */
    shots: [] as (Photo & { ratio?: number })[],
  },
  process: {
    title: "3, 2, 1... אקשן!",
    lead: "אז איך הופכים את הרעיון שלכם לקליפ?",
    steps: [
      {
        title: "יוצרים קשר ומכירים",
        text: "משאירים פרטים ונקבע שיחת היכרות. נכיר את הילד או הילדה ונשמע מה הייתם רוצים ליצור.",
      },
      {
        title: "מגבשים רעיון ומתכננים",
        text: "נחשוב יחד על הסיפור, נבחר לוקיישנים ונתכנן את הצילומים.",
      },
      {
        title: "יוצאים לצילומים",
        text: "זה הזמן ליהנות! נצלם באווירה נעימה ובקצב שמתאים לכם, עם מקום גם לרגעים לא מתוכננים.",
      },
      {
        title: "אני עורכת את הקליפ",
        text: "אבחר את הקטעים, אערוך ואחבר הכול.",
      },
    ] as LandingStep[],
    /** The last card, at the end of the line: no number, in its own colour. */
    finale: {
      title: "הקליפ שלכם מוכן!",
      text: "קליפ אישי שמספר את הסיפור שלכם.",
    },
  },
  about: {
    photo: {
      name: "about-portrait",
      alt: "מרב ורנר מחייכת עם מצלמה ביד, בשביל עצים",
      pos: "center 30%",
    } as Photo,
    title: "נעים להכיר, אני מרב ורנר",
    subtitle: "צלמת, עורכת וידאו ומפיקה.",
    body: [
      "בהפקת המרב אני יוצרת קליפים אישיים, סרטי תדמית ופרסומת, ומצלמת משפחות ורגעים מיוחדים.",
      "אני מלווה פרויקטים משלב הרעיון ועד לתוצאה המוגמרת, ואוהבת במיוחד לצלם אנשים בסביבה שבה הם מרגישים בנוח, בטבע, בבית או בסטודיו. עם אהבה לאור טבעי ולאווירה נינוחה.",
    ],
    /** The link to the rest of Merav's site. */
    link: "עוד עליי ועל העבודות שלי",
  },
  contact: {
    title: "מוכנים ליצור להם קליפ משלהם?",
    text: [
      "ספרו לי קצת על הילד או הילדה שלכם, ונחשוב יחד על קליפ שיביא את הסיפור שלהם למסך.",
      "מלאו את הטופס ואחזור אליכם לשיחת היכרות.",
    ],
    submit: "בואו נדבר על הקליפ שלכם",
    /** Goes into the WhatsApp message as the subject ({נושא} in the contact tab's message). */
    interest: "קליפ לבר/בת מצווה",
  },
  /** The page's footer: a last invitation, then the logo and contact details. */
  footer: {
    title: "יש לכם שאלות או רעיון לקליפ? בואו נדבר!",
    button: "שלחו לי הודעה בוואטסאפ",
    /** Before the phone number. */
    call: "מעדיפים לדבר? חייגו:",
  },
};

export type BarMitzvahLanding = typeof barMitzvahLanding;
