import type { ReactNode } from "react";
import type { DocKey } from "@/content/schema";
import type { Faq, Service, StillPhoto, StripPhoto, Testimonial, Video } from "@/content/types";
import { defaultContent } from "@/content/docs";
import { AddPhotoButton, Card, Lines, List, PhotoInput, Text, YouTubeInput } from "./fields";

// One tab per homepage section in page order, then the service pages and the settings.
// Each tab lists the records it edits and renders their fields; field paths are relative to
// the record named by the <Doc> they sit in (see AdminApp). Only content is editable here:
// colours, fonts and layout stay in the code.

export type TabDef = {
  key: string;
  label: string;
  group: "home" | "pages" | "settings";
  /** Records this tab edits, each rendered as its own <Doc>. */
  docs: { key: DocKey; render: () => ReactNode }[];
};

const LINE_HINT = "אנטר מתחיל שורה חדשה גם באתר";
const BOLD_HINT = "מילים בין **כוכביות כפולות** יוצגו מודגשות";

function Caption() {
  return <Text path="caption" label="תווית קטנה מעל הכותרת" hint='למשל "01 / עבודות נבחרות"' />;
}

/** One video: its title, the YouTube link and an optional cover photo. */
function VideoFields({ path }: { path: string }) {
  return (
    <>
      <Text path={`${path}.title`} label="שם הסרטון" />
      <YouTubeInput path={`${path}.youtubeId`} />
      <PhotoInput
        path={`${path}.thumb`}
        label="תמונת כריכה"
        hint="בלי תמונה, האתר מציג את תמונת הכריכה מיוטיוב"
        aspect="16 / 10"
        decorative
        removable="שימוש בכריכה מיוטיוב"
      />
    </>
  );
}

const newVideo = (): Video => ({ title: "", youtubeId: "" });
const videoTitle = (i: number, v: Video) => v.title || `סרטון ${i + 1}`;

export const TABS: TabDef[] = [
  {
    key: "hero",
    label: "פתיח",
    group: "home",
    docs: [
      {
        key: "home.hero",
        render: () => (
          <Card
            title="החלק העליון של דף הבית"
            hint="הכותרת על הסרטון. את הסרטון עצמו מחליפים דרך הקוד"
          >
            <Lines path="title" label="כותרת" />
            <PhotoInput
              path="poster"
              label="תמונת פתיחה"
              hint="מוצגת עד שהסרטון נטען, ובמקומו כשהגולש ביקש פחות תנועה"
              aspect="16 / 9"
              decorative
            />
          </Card>
        ),
      },
      {
        key: "home.intro",
        render: () => (
          <Card title="משפט ההיכרות" hint="המשפט הקצר שמתחת לפתיח, עם כפתור ליצירת קשר">
            <Text path="text" label="משפט" multiline rows={2} />
            <Text path="cta" label="טקסט הכפתור" />
          </Card>
        ),
      },
    ],
  },
  {
    key: "works",
    label: "עבודות",
    group: "home",
    docs: [
      {
        key: "home.works",
        render: () => (
          <>
            <Card title="טקסט">
              <Caption />
              <Text path="title" label="כותרת" />
              <Text path="lead" label="פסקה" multiline />
            </Card>
            <Card
              title="סרטונים"
              hint="מוצגים בקרוסלה בדף הבית, וגם בעמוד השירות 'קליפים לבר ובת מצווה'"
            >
              <List<Video>
                path="clips"
                itemTitle={videoTitle}
                collapsible
                editable={{ min: 1, max: 30, create: newVideo, addLabel: "הוספת סרטון" }}
              >
                {(p) => <VideoFields path={p} />}
              </List>
            </Card>
          </>
        ),
      },
    ],
  },
  {
    key: "stills",
    label: "סטילס",
    group: "home",
    docs: [
      {
        key: "home.stills",
        render: () => (
          <>
            <Card title="טקסט">
              <Text path="title" label="כותרת" />
              <Text path="text" label="פסקה" multiline />
            </Card>
            <Card
              title="תמונות"
              hint="9 התמונות הראשונות מוצגות בדף הבית. בטלפון, התמונות במקום 2 ו־6 גבוהות וצרות, אז כדאי לשים שם תמונות לאורך. עמוד השירות 'צילומי סטילס' מציג את כולן"
            >
              <List<StillPhoto>
                path="photos"
                itemTitle={(i, p) => `${i + 1}. ${p.label || "תמונה"}`}
                collapsible
                editable={{ min: 1, max: 60 }}
              >
                {(p) => (
                  <>
                    <PhotoInput path={p} label="תמונה" withRatio />
                    <Text path={`${p}.label`} label="סוג הצילום" hint="מוצג בתצוגה המוגדלת" />
                  </>
                )}
              </List>
              <AddPhotoButton<StillPhoto>
                path="photos"
                max={60}
                make={({ name, ratio }) => ({ name, ratio, alt: "", label: "" })}
              />
            </Card>
          </>
        ),
      },
    ],
  },
  {
    key: "services",
    label: "שירותים",
    group: "home",
    docs: [
      {
        key: "home.services",
        render: () => (
          <Card title="טקסט">
            <Caption />
            <Text path="title" label="כותרת" />
            <Text path="lead" label="פסקה" multiline rows={2} />
            <Text
              path="otherCard.title"
              label="הכרטיס האחרון"
              hint="פותח את טופס יצירת הקשר (מוסתר בטלפון)"
            />
            <Lines path="ctaText" label="משפט מתחת לכרטיסים" />
            <Text path="cta" label="טקסט הכפתור" />
          </Card>
        ),
      },
      {
        key: "services",
        render: () => (
          <Card
            title="כרטיסי השירותים"
            hint="שבעת השירותים, בסדר שבו הם מופיעים. שירות חדש מוסיפים דרך הקוד"
          >
            <List<Service> path="" itemTitle={(_, s) => s.title} collapsible>
              {(p) => (
                <>
                  <Text path={`${p}.title`} label="שם השירות" />
                  <Text path={`${p}.meta`} label="שורה קטנה מתחת לשם" />
                  <PhotoInput
                    path={`${p}.image`}
                    label="תמונת הכרטיס"
                    aspect="4 / 5"
                    decorative
                    removable="הסרת התמונה"
                  />
                </>
              )}
            </List>
          </Card>
        ),
      },
    ],
  },
  {
    key: "about",
    label: "אודות",
    group: "home",
    docs: [
      {
        key: "home.about",
        render: () => (
          <>
            <Card title="טקסט">
              <Caption />
              <Lines path="title" label="כותרת" />
              <List<string>
                path="body"
                itemTitle={(i) => `פסקה ${i + 1}`}
                editable={{ min: 1, max: 6, create: () => "", addLabel: "הוספת פסקה" }}
              >
                {(p) => <Text path={p} label="טקסט" hint={BOLD_HINT} multiline rows={5} />}
              </List>
            </Card>
            <Card title="תמונה">
              <PhotoInput path="portrait" label="התמונה של מרב" aspect="4 / 5" />
            </Card>
          </>
        ),
      },
    ],
  },
  {
    key: "process",
    label: "תהליך",
    group: "home",
    docs: [
      {
        key: "home.process",
        render: () => (
          <>
            <Card title="טקסט">
              <Caption />
              <Lines path="title" label="כותרת" />
              <Lines path="lead" label="פסקה" />
            </Card>
            <Card title="השלבים" hint="ארבעה שלבים, בסדר הזה">
              <List<{ title: string }> path="items" itemTitle={(i, it) => `${i + 1}. ${it.title}`}>
                {(p) => (
                  <>
                    <Text path={`${p}.title`} label="שם השלב" />
                    <Text path={`${p}.meta`} label="שורה קטנה" />
                    <Text path={`${p}.desc`} label="תיאור" multiline />
                  </>
                )}
              </List>
            </Card>
          </>
        ),
      },
    ],
  },
  {
    key: "testimonials",
    label: "המלצות",
    group: "home",
    docs: [
      {
        key: "home.testimonials",
        render: () => (
          <>
            <Card title="טקסט">
              <Caption />
              <Text path="title" label="כותרת" />
            </Card>
            <Card title="ההמלצות">
              <List<Testimonial>
                path="items"
                itemTitle={(i, t) => t.name || `המלצה ${i + 1}`}
                collapsible
                editable={{
                  min: 1,
                  max: 20,
                  create: () => ({ quote: "", name: "", role: "" }),
                  addLabel: "הוספת המלצה",
                }}
              >
                {(p) => (
                  <>
                    <Text path={`${p}.quote`} label="ההמלצה" multiline rows={4} />
                    <Text path={`${p}.name`} label="שם" />
                    <Text path={`${p}.role`} label="תיאור קצר" hint='למשל "צילום ברית"' />
                  </>
                )}
              </List>
            </Card>
            <Card title="תמונת רקע">
              <PhotoInput path="background" label="רקע" aspect="16 / 9" decorative />
            </Card>
          </>
        ),
      },
    ],
  },
  {
    key: "faq",
    label: "שאלות",
    group: "home",
    docs: [
      {
        key: "home.faq",
        render: () => (
          <>
            <Card title="טקסט">
              <Caption />
              <Text path="title" label="כותרת" />
              <Text path="lead" label="פסקה" />
              <Text path="cta" label="טקסט הכפתור" />
            </Card>
            <Card title="השאלות">
              <List<Faq>
                path="items"
                itemTitle={(i, f) => f.q || `שאלה ${i + 1}`}
                collapsible
                editable={{
                  min: 1,
                  max: 30,
                  create: () => ({ q: "", a: "" }),
                  addLabel: "הוספת שאלה",
                }}
              >
                {(p) => (
                  <>
                    <Text path={`${p}.q`} label="שאלה" />
                    <Text path={`${p}.a`} label="תשובה" multiline rows={4} />
                  </>
                )}
              </List>
            </Card>
          </>
        ),
      },
    ],
  },
  {
    key: "strip",
    label: "פס תמונות",
    group: "home",
    docs: [
      {
        key: "home.strip",
        render: () => (
          <Card
            title="פס התמונות בתחתית דף הבית"
            hint="בין 3 ל־8 תמונות. רוחב כל תמונה נקבע לפי הצורה שלה"
          >
            <List<StripPhoto>
              path=""
              itemTitle={(i) => `תמונה ${i + 1}`}
              grid
              editable={{ min: 3, max: 8 }}
            >
              {(p) => <PhotoInput path={p} label="תמונה" withRatio />}
            </List>
            <AddPhotoButton<StripPhoto>
              path=""
              max={8}
              make={({ name, ratio }) => ({ name, ratio, alt: "" })}
            />
          </Card>
        ),
      },
    ],
  },
  {
    key: "contact",
    label: "צור קשר",
    group: "home",
    docs: [
      {
        key: "home.contact",
        render: () => (
          <>
            <Card title="טקסט">
              <Caption />
              <Text path="title" label="כותרת" />
              <Text path="text" label="פסקה" multiline />
              <Text path="call" label="לפני מספר הטלפון" />
            </Card>
            <Card title="הטופס" hint="הטופס פותח הודעת וואטסאפ מוכנה למרב">
              <List<string>
                path="interests"
                itemTitle={(i, v) => v || `אפשרות ${i + 1}`}
                editable={{ min: 1, max: 12, create: () => "", addLabel: "הוספת אפשרות" }}
              >
                {(p) => <Text path={p} label="אפשרות ברשימה 'מה מעניין אתכם'" />}
              </List>
              <Text path="note" label="הערה מתחת לשדות" />
              <Text path="submit" label="טקסט כפתור השליחה" />
              <Text path="after" label="אחרי השליחה" />
              <Text
                path="privacy"
                label="שורת הפרטיות"
                hint="הקישור 'מדיניות הפרטיות' מתווסף אחריה"
              />
            </Card>
          </>
        ),
      },
    ],
  },
  {
    key: "service-pages",
    label: "עמודי שירות",
    group: "pages",
    docs: [
      {
        key: "services",
        render: () => (
          <Card
            title="עמוד לכל שירות"
            hint="הפסקה בראש העמוד והסרטונים שבו. עמוד שאין בו סרטונים מציג 'עבודות לדוגמה יעלו לכאן בקרוב'"
          >
            <List<Service> path="" itemTitle={(_, s) => s.title} collapsible>
              {(p, i) => {
                const gallery = defaultContent.services[i]?.gallery;
                return (
                  <>
                    <Text path={`${p}.lead`} label="פסקה בראש העמוד" multiline />
                    {gallery === "works" ? (
                      <p className="admin-note">
                        הסרטונים בעמוד הזה הם הסרטונים של 'עבודות' בדף הבית. עורכים אותם בלשונית
                        'עבודות'.
                      </p>
                    ) : gallery === "stills" ? (
                      <p className="admin-note">
                        התמונות בעמוד הזה הן תמונות הסטילס. עורכים אותן בלשונית 'סטילס'.
                      </p>
                    ) : (
                      <List<Video>
                        path={`${p}.videos`}
                        itemTitle={videoTitle}
                        collapsible
                        editable={{ min: 0, max: 30, create: newVideo, addLabel: "הוספת סרטון" }}
                      >
                        {(v) => <VideoFields path={v} />}
                      </List>
                    )}
                  </>
                );
              }}
            </List>
          </Card>
        ),
      },
      {
        key: "servicePage",
        render: () => (
          <Card title="טקסטים שחוזרים בכל עמודי השירות">
            <Text path="cta" label="משפט לפני הכפתור (עמוד עם סרטונים)" />
            <Text path="ctaPhotos" label="משפט לפני הכפתור (עמוד הסטילס)" />
            <Text path="ctaEmpty" label="משפט לפני הכפתור (עמוד בלי עבודות)" />
            <Text path="empty" label="הודעה בעמוד בלי עבודות" />
            <Text path="ctaButton" label="טקסט הכפתור" />
            <Text path="moreCaption" label="תווית מעל 'שירותים נוספים'" />
            <Text path="moreTitle" label="כותרת 'שירותים נוספים'" />
          </Card>
        ),
      },
    ],
  },
  {
    key: "settings",
    label: "פרטים והגדרות",
    group: "settings",
    docs: [
      {
        key: "site",
        render: () => (
          <>
            <Card
              title="פרטי קשר"
              hint="ערך בסוגריים מרובעים, כמו [טלפון], הוא מקום שמור שעוד לא מולא"
            >
              <Text path="phone" label="טלפון להצגה" ltr inputMode="tel" hint="למשל 050-1234567" />
              <Text
                path="whatsapp"
                label="מספר וואטסאפ"
                ltr
                inputMode="numeric"
                hint="ספרות בלבד, עם 972 במקום ה־0: למשל 972501234567"
              />
              <Text path="whatsappGreeting" label="ההודעה שנפתחת בוואטסאפ" multiline rows={2} />
              <Text path="email" label="אימייל" ltr inputMode="email" />
              <Text
                path="serviceArea"
                label="אזורי שירות (בתחתית האתר)"
                hint={LINE_HINT}
                multiline
                rows={2}
              />
            </Card>
            <Card title="רשתות חברתיות" hint="קישור ריק מסתיר את הסמל בתחתית האתר">
              <Text path="youtubeUrl" label="ערוץ יוטיוב" ltr inputMode="url" />
              <Text path="facebookUrl" label="עמוד פייסבוק" ltr inputMode="url" />
            </Card>
            <Card title="שם העסק">
              <Text path="name" label="שם" />
              <Text path="tagline" label="סלוגן" />
            </Card>
          </>
        ),
      },
      {
        key: "seo",
        render: () => (
          <Card title="גוגל ושיתוף ברשתות" hint="מה שמופיע בתוצאות החיפוש ובתצוגה המקדימה של קישור">
            <Text path="home.title" label="כותרת" />
            <Text path="home.description" label="תיאור" multiline rows={3} />
          </Card>
        ),
      },
    ],
  },
];
