import type { ReactNode } from "react";
import type { DocKey } from "@/content/schema";
import type { Faq, Service, StillPhoto, StripPhoto, Testimonial, Video } from "@/content/types";
import { defaultContent } from "@/content/docs";
import {
  MAX_FEATURED_STILLS,
  MAX_FEATURED_VIDEOS,
  countFeaturedVideos,
  featuredStills,
  featuredVideos,
} from "@/content/featured";
import { photoFile } from "@/lib/asset";
import {
  AddPhotoButton,
  Card,
  FeatureToggle,
  Lines,
  List,
  OrderList,
  PhotoInput,
  TextList,
  Text,
  SubDoc,
  Toggle,
  useDraft,
  useField,
  VideoFileInput,
  YouTubeInput,
} from "./fields";

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

/** One video: the cover first (what the site shows), then its title and YouTube link. */
function VideoFields({ path }: { path: string }) {
  const { value: youtubeId } = useField<string>(`${path}.youtubeId`);
  return (
    <>
      <PhotoInput
        path={`${path}.thumb`}
        label="תמונת כריכה"
        hint="בלי תמונה, האתר מציג את תמונת הכריכה מיוטיוב"
        aspect="16 / 10"
        decorative
        removable="שימוש בכריכה מיוטיוב"
        {...(youtubeId ? { fallback: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` } : {})}
      />
      <Text path={`${path}.title`} label="שם הסרטון" />
      <YouTubeInput path={`${path}.youtubeId`} />
      <FeaturedVideoToggle path={path} />
    </>
  );
}

function FeaturedVideoToggle({ path }: { path: string }) {
  const draft = useDraft();
  const full = countFeaturedVideos(draft.services) >= MAX_FEATURED_VIDEOS;
  return (
    <FeatureToggle
      path={`${path}.featured`}
      label="הצגה בעבודות הנבחרות בדף הבית"
      full={
        full &&
        `כבר נבחרו ${MAX_FEATURED_VIDEOS} סרטונים. כדי להוסיף את זה, מורידים קודם סימון מסרטון אחר`
      }
    />
  );
}

/** Services can be reordered, so a page's linked gallery is found by its address. */
function StillsPageCheck({
  path,
  children,
}: {
  path: string;
  children: (stills: boolean) => ReactNode;
}) {
  const { value: slug } = useField<string>(`${path}.slug`);
  return (
    <>{children(defaultContent.services.find((s) => s.slug === slug)?.gallery === "stills")}</>
  );
}

const serviceTitle = (_: number, s: Service) => (s.hidden ? `${s.title} (מוסתר)` : s.title);

/**
 * A strip photo, cropped the way the homepage shows it on a typical computer screen (1440px):
 * the row keeps one height and the photos share its width in proportion to their shapes, so
 * each one is stretched by the same factor and cut at the top and bottom.
 */
function StripPhotoInput({ path, index }: { path: string; index: number }) {
  const { value: strip } = useField<StripPhoto[]>("");
  const screen = 1440;
  const height = Math.min(Math.max(200, screen * 0.19), 380);
  const gap = Math.min(Math.max(8, screen * 0.009), 14);
  const side = Math.min(Math.max(16, screen * 0.02), 28);
  const ratios = strip.map((photo) => photo.ratio);
  const total = ratios.reduce((sum, r) => sum + r, 0);
  const width = screen - 2 * side - gap * (strip.length - 1);
  const shape = ((ratios[index] ?? 1) * width) / (total * height);
  return <PhotoInput path={path} label="תמונה" withRatio aspect={`${shape.toFixed(3)} / 1`} />;
}

const ytCover = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/** וידאו קליפים: the order of the featured videos in the homepage carousel. */
function WorksOrder() {
  const draft = useDraft();
  const { value: order, set } = useField<string[]>("order");
  const videos = featuredVideos(draft.services, order ?? []);
  const source = (id: string) =>
    draft.services.find((s) => s.videos.some((v) => v.youtubeId === id))?.title;
  return (
    <OrderList
      aspect="16 / 10"
      empty="עדיין לא נבחרו סרטונים. בוחרים אותם בלשונית 'עמודי שירות'."
      onReorder={set}
      items={videos.map((v) => {
        const note = source(v.youtubeId);
        return {
          id: v.youtubeId,
          src: v.thumb ? photoFile(v.thumb.name, 480) : ytCover(v.youtubeId),
          title: v.title || "סרטון",
          ...(note ? { note } : {}),
        };
      })}
    />
  );
}

/** סטילס: the order of the featured photos in the homepage mosaic. */
function StillsOrder() {
  const { value: photos } = useField<StillPhoto[]>("photos");
  const { value: order, set } = useField<string[]>("order");
  const chosen = featuredStills(photos ?? [], order ?? []);
  return (
    <OrderList
      aspect="1 / 1"
      empty="עדיין לא נבחרו תמונות. בוחרים אותן בלשונית 'עמודי שירות', בגלריית הסטילס."
      onReorder={set}
      items={chosen.map((p, i) => ({
        id: p.name,
        src: photoFile(p.name, 480),
        title: p.label || "תמונה",
        // Places 2 and 6 are narrow and tall on phones.
        ...(i === 1 || i === 5 ? { note: "בטלפון המקום הזה גבוה וצר: מתאים לתמונה לאורך" } : {}),
      }))}
    />
  );
}

/** The stills gallery (the stills service page), with the homepage pick on each photo. */
function StillsGallery() {
  const { value: photos } = useField<StillPhoto[]>("photos");
  const full = (photos ?? []).filter((p) => p.featured).length >= MAX_FEATURED_STILLS;
  return (
    <>
      <List<StillPhoto>
        path="photos"
        itemTitle={(i, p) => `${i + 1}. ${p.label || "תמונה"}`}
        grid
        editable={{ min: 1, max: 60 }}
      >
        {(p) => (
          <>
            <PhotoInput path={p} label="תמונה" withRatio />
            <Text path={`${p}.label`} label="סוג הצילום" hint="מוצג בתצוגה המוגדלת" />
            <FeatureToggle
              path={`${p}.featured`}
              label="הצגה בדף הבית"
              full={
                full &&
                `בדף הבית יש מקום ל־${MAX_FEATURED_STILLS} תמונות. כדי להוסיף את זו, מורידים קודם סימון מתמונה אחרת`
              }
            />
          </>
        )}
      </List>
      <AddPhotoButton<StillPhoto>
        path="photos"
        max={60}
        make={({ name, ratio }) => ({ name, ratio, alt: "", label: "" })}
      />
    </>
  );
}

const newVideo = (): Video => ({ title: "", youtubeId: "" });
const videoTitle = (i: number) => `סרטון ${i + 1}`;

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
            hint="הסרטון שמתנגן ברקע, הכותרת שעליו והתמונה שמוצגת עד שהוא נטען"
          >
            <Lines path="title" label="כותרת" />
            <VideoFileInput
              path="video"
              posterPath="poster"
              label="סרטון רקע"
              hint="לולאה קצרה בלי קול (הסרטון מושתק), MP4 עד 30MB ועד דקה וחצי. כמה שניות של 5-10MB נטענות מהר גם בטלפון. העלאה מחליפה גם את תמונת הפתיחה בתמונה מהסרטון"
            />
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
    label: "וידאו קליפים",
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
              title="סדר הסרטונים בדף הבית"
              hint={`עד ${MAX_FEATURED_VIDEOS} סרטונים בקרוסלה. בוחרים אותם בלשונית 'עמודי שירות', בסימון 'הצגה בעבודות הנבחרות' שליד כל סרטון. כאן קובעים רק את הסדר`}
            >
              <WorksOrder />
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
              title="סדר התמונות בדף הבית"
              hint={`עד ${MAX_FEATURED_STILLS} תמונות, 3 שורות של 3. בוחרים אותן בלשונית 'עמודי שירות', בגלריית הסטילס. כאן קובעים רק את הסדר`}
            >
              <StillsOrder />
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
            hint="שבעת השירותים בסדר שבו הם מופיעים באתר: החיצים משנים את הסדר. שירות חדש מוסיפים דרך הקוד"
          >
            <List<Service>
              path=""
              itemTitle={serviceTitle}
              grid
              editable={{ min: 7, max: 7 }}
              extra={
                <SubDoc docKey="home.services">
                  <div className="rounded-lg border border-dashed border-ink/25 p-3">
                    <h3 className="mb-3 text-[15px] font-medium text-ink">הכרטיס האחרון</h3>
                    <div className="flex flex-col gap-3">
                      <p className="admin-note">
                        תמיד אחרון, בלי תמונה. לחיצה עליו פותחת את טופס יצירת הקשר.
                      </p>
                      <Text path="otherCard.title" label="הטקסט על הכרטיס" />
                      <Toggle
                        path="otherCard.hidden"
                        label="הסתרת הכרטיס"
                        hint="הכרטיס לא יוצג בכלל, לא במחשב ולא בטלפון"
                      />
                      <Toggle
                        path="otherCard.hideOnMobile"
                        label="הסתרת הכרטיס בטלפון"
                        hint="במחשב הכרטיס מוצג, בטלפון לא (כפתור יצירת הקשר מופיע מיד אחרי הכרטיסים)"
                      />
                    </div>
                  </div>
                </SubDoc>
              }
            >
              {(p) => (
                <>
                  {/* Same shape as the card on the homepage (16:9). */}
                  <PhotoInput
                    path={`${p}.image`}
                    label="תמונת הכרטיס"
                    aspect="16 / 9"
                    decorative
                    removable="הסרת התמונה"
                  />
                  <Text path={`${p}.title`} label="שם השירות" />
                  <Text path={`${p}.meta`} label="שורה קטנה מתחת לשם" />
                  <Toggle
                    path={`${p}.hidden`}
                    label="הסתרת השירות מהאתר"
                    hint="הכרטיס, הקישורים בתחתית האתר ועמוד השירות עצמו לא יוצגו. אפשר להחזיר בכל רגע"
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
              <Lines
                path="body"
                label="טקסט"
                max={6}
                rows={10}
                hint={`Enter מתחיל פסקה חדשה (עד 6 פסקאות). ${BOLD_HINT}`}
              />
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
                itemTitle={(i) => `המלצה ${i + 1}`}
                grid
                editable={{
                  min: 1,
                  max: 20,
                  create: () => ({ quote: "", name: "", role: "" }),
                  addLabel: "הוספת המלצה",
                }}
              >
                {(p) => (
                  <>
                    <Text path={`${p}.quote`} label="ההמלצה" multiline rows={6} />
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
              {(p, i) => <StripPhotoInput path={p} index={i} />}
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
              <TextList
                path="interests"
                label="מה מעניין אתכם"
                hint="האפשרויות ברשימה הנפתחת בטופס, בסדר שבו הן מופיעות"
                min={1}
                max={12}
                addLabel="הוספת אפשרות"
              />
              <Text path="note" label="הערה מתחת לשדות" />
              <Text path="submit" label="טקסט כפתור השליחה" />
              <Text
                path="message"
                label="הודעת הוואטסאפ שנפתחת"
                hint="מה שמרב מקבלת. במקום כל סימון נכנס מה שהגולש מילא: {שם}, {טלפון}, {נושא} (הבחירה ברשימה), {הודעה}. שורה שהסימון שלה נשאר ריק לא תופיע. חובה לכלול את {שם} ואת {טלפון}"
                multiline
                rows={7}
              />
              <Text path="after" label="שורה מתחת לכפתור השליחה" />
              <Text
                path="sent"
                label="הודעה אחרי השליחה"
                hint="מופיעה מעל הכפתור אחרי הלחיצה עליו, כשההודעה נפתחת בוואטסאפ"
              />
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
            hint="הפסקה בראש העמוד והסרטונים שבו. עמוד שאין בו סרטונים מציג 'עבודות לדוגמה יעלו לכאן בקרוב'. את שם השירות משנים בלשונית 'שירותים'"
          >
            <List<Service> path="" itemTitle={serviceTitle} collapsible>
              {(p) => {
                return (
                  <>
                    <Text path={`${p}.lead`} label="פסקה בראש העמוד" multiline />
                    <StillsPageCheck path={p}>
                      {(stills) =>
                        stills ? (
                          <p className="admin-note">
                            התמונות בעמוד הזה נמצאות בכרטיס 'גלריית צילומי סטילס' שמתחת לרשימת
                            העמודים.
                          </p>
                        ) : (
                          <List<Video>
                            path={`${p}.videos`}
                            itemTitle={videoTitle}
                            grid
                            editable={{
                              min: 0,
                              max: 30,
                              create: newVideo,
                              addLabel: "הוספת סרטון",
                            }}
                          >
                            {(v) => <VideoFields path={v} />}
                          </List>
                        )
                      }
                    </StillsPageCheck>
                  </>
                );
              }}
            </List>
          </Card>
        ),
      },
      {
        key: "home.stills",
        render: () => (
          <Card
            title="גלריית צילומי סטילס"
            hint="כל התמונות בעמוד 'צילומי סטילס'. מה שמסומן ב'הצגה בדף הבית' מופיע גם בדף הבית, והסדר שם נקבע בלשונית 'סטילס'"
          >
            <StillsGallery />
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
              <Text
                path="whatsappGreeting"
                label="הודעת וואטסאפ ישירה"
                hint="נפתחת מכפתור הוואטסאפ העגול שבפינת כל עמוד, שפותח צ'אט בלי למלא את הטופס. את ההודעה של הטופס עורכים בלשונית 'צור קשר'"
                multiline
                rows={2}
              />
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
              <Text path="instagramUrl" label="אינסטגרם" ltr inputMode="url" />
              <Text path="tiktokUrl" label="טיקטוק" ltr inputMode="url" />
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
