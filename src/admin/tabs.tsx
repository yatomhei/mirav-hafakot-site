import { useId, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  MAX_SERVICES,
  MAX_SLUG,
  serviceLinkProblem,
  slugProblem,
  type DocKey,
} from "@/content/schema";
import type { Faq, Service, StillPhoto, StripPhoto, Testimonial, Video } from "@/content/types";
import { defaultContent } from "@/content/docs";
import { MAX_FEATURED_STILLS, MAX_FEATURED_VIDEOS } from "@/content/featured";
import { photoFile } from "@/lib/asset";
import { useContent } from "@/content/context";
import { SearchPreview, ServiceSearchFields } from "./SearchFields";
import { BarMitzvahLandingFields } from "./LandingTab";
import {
  AddPhotoButton,
  Card,
  Lines,
  List,
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

/** Shown wherever photos or videos of people are added (privacy law: their consent). */
const CONSENT = "מעלים רק עם הסכמה של המצולמים, ושל ההורים כשמצולמים ילדים";

// One tab per homepage section in page order, then the service pages and the settings.
// Each tab lists the records it edits and renders their fields; field paths are relative to
// the record named by the <Doc> they sit in (see AdminApp). Only content is editable here:
// colours, fonts and layout stay in the code.

/** פרטים והגדרות: how the homepage shows in Google, live as the title and description change. */
function HomeSearchPreview() {
  const { value: title } = useField<string>("home.title");
  const { value: description } = useField<string>("home.description");
  return <SearchPreview title={title ?? ""} description={description ?? ""} />;
}

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
    </>
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

const serviceTitle = (i: number, s: Service) => {
  const name = s.title.trim() || `שירות ${i + 1}`;
  return s.hidden ? `${name} (מוסתר)` : name;
};

/** A new service starts hidden, so nothing goes public half-finished. */
function newService(): Service {
  return {
    slug: "",
    num: "",
    title: "",
    meta: "",
    desc: "",
    lead: "",
    videos: [],
    hidden: true,
  };
}

/** Typed text made into an address: lowercase, spaces to dashes, nothing but a-z, 0-9 and -. */
const toSlug = (raw: string) =>
  raw
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, MAX_SLUG);

/**
 * The page address. Editable until the service is first shown on the site; from then on it
 * is locked, so links already shared and Google's results never break.
 */
function ServiceAddress({ path, index }: { path: string; index: number }) {
  const id = useId();
  const draft = useDraft();
  const { value: service } = useField<Service>(path);
  const { set } = useField<string>(`${path}.slug`);
  if (service.published) {
    return (
      <div>
        <span className="block text-[14px] font-medium text-ink">כתובת העמוד</span>
        <p dir="ltr" className="text-left text-[14px] text-ink/80">
          /services/{service.slug}
        </p>
        <p className="admin-note">
          נעולה, כי השירות כבר הוצג באתר: כך קישורים ששלחו ותוצאות בגוגל ממשיכים לעבוד.
        </p>
      </div>
    );
  }
  const taken = draft.services.some((s, i) => i !== index && s.slug && s.slug === service.slug);
  const problem = taken ? "הכתובת כבר שייכת לשירות אחר" : slugProblem(service.slug);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block">
        <span className="block text-[14px] font-medium text-ink">כתובת העמוד</span>
        <span className="block text-[13px] leading-snug text-ink/65">
          באנגלית, עם מקפים בין מילים, למשל wedding-clips. אפשר לשנות כל עוד השירות מוסתר; אחרי
          שמציגים אותו באתר בפעם הראשונה, הכתובת ננעלת
        </span>
      </label>
      <div dir="ltr" className="flex items-center gap-1">
        <span className="text-[14px] text-ink/60">/services/</span>
        <input
          id={id}
          type="text"
          dir="ltr"
          className="admin-input text-left"
          placeholder="wedding-clips"
          value={service.slug}
          aria-invalid={problem ? true : undefined}
          onChange={(event) => set(toSlug(event.target.value))}
          // A dash left at either end while typing is dropped on leaving the field.
          onBlur={() => set(service.slug.replace(/^-+|-+$/g, ""))}
        />
      </div>
      {problem && <p className="mt-1 text-[13px] text-red-700">{problem}</p>}
    </div>
  );
}

/**
 * Where the card leads, as one choice: the regular service page (with its address), or another
 * page such as a landing page (with that page's address). Only the chosen option's field shows,
 * so there is never more than one address to fill in. A page of this site is checked against
 * the site's pages, so a typo shows a warning before it reaches the site.
 */
function ServiceDestination({ path, index }: { path: string; index: number }) {
  const name = useId();
  const linkId = useId();
  const router = useRouter();
  const draft = useDraft();
  const { value: service, set } = useField<Service>(path);
  const link = service.link ?? "";
  // "Another page" stays chosen while its field is still empty (until something is typed).
  const [wantOther, setWantOther] = useState(false);
  const other = Boolean(link) || wantOther;

  const withLink = (next: string, base: Service = service) => {
    const { link: _l, ...rest } = base;
    return next ? { ...rest, link: next } : rest;
  };
  const choose = (toOther: boolean) => {
    setWantOther(toOther);
    if (!toOther) return set(withLink(""));
    // The regular page's address is hidden now but still required (the old address forwards
    // from it): a new service with none yet gets one quietly.
    const taken = (slug: string) => draft.services.some((s, i) => i !== index && s.slug === slug);
    if (slugProblem(service.slug) || taken(service.slug)) {
      let n = index + 1;
      while (taken(`service-${n}`)) n++;
      set({ ...service, slug: `service-${n}` });
    }
  };

  const problem = serviceLinkProblem(link);
  const l = link.trim();
  const missing =
    !problem &&
    l.startsWith("/") &&
    !(router.routesByPath as unknown as Record<string, unknown>)[l];
  const option = "flex cursor-pointer items-start gap-2 text-[14px] text-ink";
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-[14px] font-medium text-ink">לחיצה על הכרטיס מובילה ל־</legend>
      <label className={option}>
        <input
          type="radio"
          name={name}
          className="mt-1 size-4 accent-[var(--color-olive-deep)]"
          checked={!other}
          onChange={() => choose(false)}
        />
        <span>
          עמוד השירות
          <span className="block text-[12.5px] leading-snug text-ink/65">
            העמוד הרגיל, עם הפסקה והעבודות מלשונית 'עמודי שירות'
          </span>
        </span>
      </label>
      <label className={option}>
        <input
          type="radio"
          name={name}
          className="mt-1 size-4 accent-[var(--color-olive-deep)]"
          checked={other}
          onChange={() => choose(true)}
        />
        <span>
          דף אחר, למשל דף נחיתה
          <span className="block text-[12.5px] leading-snug text-ink/65">
            עמוד השירות הרגיל לא יוצג, ומי שמגיע לכתובת שלו יועבר לדף הזה
          </span>
        </span>
      </label>
      <div className="ms-6">
        {other ? (
          <div>
            <label htmlFor={linkId} className="mb-1.5 block">
              <span className="block text-[14px] font-medium text-ink">כתובת הדף</span>
              <span className="block text-[13px] leading-snug text-ink/65">
                דף באתר מתחיל ב־/ (למשל /bar-mitzvah). אתר אחר מתחיל ב־https:// ונפתח בכרטיסייה חדשה
              </span>
            </label>
            <input
              id={linkId}
              type="text"
              dir="ltr"
              className="admin-input text-left"
              placeholder="/bar-mitzvah"
              value={link}
              aria-invalid={problem || missing ? true : undefined}
              onChange={(event) => set(withLink(event.target.value.replace(/\s/g, "")))}
            />
            {!l && (
              <p className="mt-1 text-[13px] text-ink/65">
                כל עוד אין כתובת, הכרטיס ממשיך להוביל לעמוד השירות
              </p>
            )}
            {problem && <p className="mt-1 text-[13px] text-red-700">{problem}</p>}
            {missing && (
              <p className="mt-1 text-[13px] text-red-700">
                אין באתר עמוד בכתובת {l}. בדקו את האיות: אחרת הכרטיס יוביל לעמוד שלא קיים
              </p>
            )}
          </div>
        ) : (
          <ServiceAddress path={path} index={index} />
        )}
      </div>
    </fieldset>
  );
}

/** On the service-pages tab: the regular page isn't shown when the card leads elsewhere. */
function LinkedAwayNote({ path }: { path: string }) {
  const { value: service } = useField<Service>(path);
  const link = service.link?.trim();
  if (!link) return null;
  return (
    <p className="admin-note">
      הכרטיס של השירות הזה מוביל ל־<span dir="ltr">{link}</span> (בלשונית 'שירותים'), ולכן העמוד
      הרגיל לא מוצג באתר, וגם לא הסרטונים שכאן. את הסרטונים בדף הבית עורכים בלשונית 'וידאו קליפים'
    </p>
  );
}

/**
 * Hide or show a service. Showing it for the first time marks it as published, which locks its
 * address; hiding it again before saving undoes that, unless it was already live.
 */
function ServiceVisibility({ path }: { path: string }) {
  const id = useId();
  const loaded = useContent();
  const { value: service, set } = useField<Service>(path);
  const wasLive = loaded.services.some((s) => s.slug === service.slug && s.published);
  const hide = (hidden: boolean) => {
    const { hidden: _h, published: _p, ...rest } = service;
    set({
      ...rest,
      ...(hidden ? { hidden: true } : {}),
      ...(!hidden || wasLive ? { published: true } : {}),
    });
  };
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-[14px] text-ink">
        <input
          id={id}
          type="checkbox"
          className="size-4 accent-[var(--color-olive-deep)]"
          checked={Boolean(service.hidden)}
          onChange={(event) => hide(event.target.checked)}
        />
        הסתרת השירות מהאתר
      </label>
      <p className="ms-6 text-[12.5px] leading-snug text-ink/65">
        {service.published
          ? "הכרטיס, הקישורים בתחתית האתר ועמוד השירות עצמו לא יוצגו. אפשר להחזיר בכל רגע"
          : "שירות חדש מתחיל מוסתר. כשהכול מוכן (שם, תמונה, פסקה, סרטונים בלשונית 'עמודי שירות'), מורידים את הסימון ושומרים, והשירות עולה לאתר"}
      </p>
    </div>
  );
}

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

/** Every video already on the site (service pages and the landing page), once each. */
function siteVideos(draft: ReturnType<typeof useDraft>) {
  const found: { video: Video; source: string }[] = [];
  const seen = new Set<string>();
  const add = (video: Video | undefined, source: string) => {
    if (!video?.youtubeId || seen.has(video.youtubeId)) return;
    seen.add(video.youtubeId);
    found.push({ video, source });
  };
  const landing = draft.barMitzvahLanding;
  const landingName = "דף הנחיתה: בר/בת מצווה";
  for (const v of landing.clips.items) add(v, landingName);
  add(landing.story.video, landingName);
  for (const s of draft.services) for (const v of s.videos) add(v, s.title || "שירות");
  return found;
}

/**
 * וידאו קליפים: the selected works, their own list. A video already on the site can be copied
 * in (title, link and cover), so nothing has to be typed twice; the copy is then independent.
 */
function WorksVideos() {
  const draft = useDraft();
  const { value: videos, set } = useField<Video[]>("videos");
  const list = videos ?? [];
  const inList = new Set(list.map((v) => v.youtubeId));
  const full = list.length >= MAX_FEATURED_VIDEOS;
  const [open, setOpen] = useState(false);
  const existing = siteVideos(draft);

  return (
    <>
      <List<Video>
        path="videos"
        itemTitle={(i, v) => `${i + 1}. ${v.title || "סרטון"}`}
        grid
        editable={{
          min: 1,
          max: MAX_FEATURED_VIDEOS,
          create: newVideo,
          addLabel: "הוספת סרטון חדש",
        }}
      >
        {(p) => <VideoFields path={p} />}
      </List>
      <div className="rounded-lg border border-dashed border-ink/25 p-3">
        <button
          type="button"
          className="admin-btn"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          disabled={full}
        >
          {open ? "סגירת הרשימה" : "הוספה מסרטון שכבר באתר"}
        </button>
        <p className="mt-2 text-[13px] leading-snug text-ink/65">
          {full
            ? `יש כבר ${MAX_FEATURED_VIDEOS} סרטונים. כדי להוסיף, מוחקים קודם סרטון מהרשימה`
            : "מעתיק סרטון מעמודי השירות או מדף הנחיתה: השם, הקישור והכריכה. אחר כך אפשר לשנות אותו כאן בלי שישתנה שם"}
        </p>
        {open && !full && (
          <ul className="m-0 mt-3 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3">
            {existing.map(({ video, source }) => {
              const added = inList.has(video.youtubeId);
              return (
                <li key={video.youtubeId}>
                  <button
                    type="button"
                    disabled={added}
                    onClick={() => {
                      const { title, youtubeId, thumb } = video;
                      set([...list, { title, youtubeId, ...(thumb ? { thumb } : {}) }]);
                      if (list.length + 1 >= MAX_FEATURED_VIDEOS) setOpen(false);
                    }}
                    className="flex w-full cursor-pointer flex-col gap-1.5 rounded-lg border border-ink/12 bg-white p-2 text-start disabled:cursor-default disabled:opacity-55"
                  >
                    <img
                      src={
                        video.thumb ? photoFile(video.thumb.name, 480) : ytCover(video.youtubeId)
                      }
                      alt=""
                      className="aspect-[16/10] w-full rounded-md bg-beige object-cover"
                    />
                    <span className="text-[13.5px] font-medium leading-snug text-ink">
                      {video.title || "סרטון"}
                    </span>
                    <span className="text-[12px] leading-snug text-ink/60">
                      {added ? "כבר ברשימה" : source}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

/** Places 2 and 6 of the mosaic are narrow and tall on phones. */
const TALL_ON_PHONES = new Set([1, 5]);

/**
 * סטילס: the homepage mosaic, its own places (up to 9), each filled by an upload or from the
 * photo library. A photo from the stills gallery brings its type of shot along.
 */
function StillsMosaic() {
  const { value: gallery } = useField<StillPhoto[]>("photos");
  const labelOf = (name: string) => (gallery ?? []).find((p) => p.name === name)?.label ?? "";
  return (
    <>
      <List<StillPhoto>
        path="mosaic"
        itemTitle={(i, p) => `מקום ${i + 1}${p.label ? `: ${p.label}` : ""}`}
        grid
        editable={{ min: 1, max: MAX_FEATURED_STILLS }}
      >
        {(p, i) => (
          <>
            <PhotoInput
              path={p}
              label="תמונה"
              aspect="1 / 1"
              withRatio
              {...(TALL_ON_PHONES.has(i)
                ? { hint: "בטלפון המקום הזה גבוה וצר: מתאים לתמונה לאורך" }
                : {})}
            />
            <Text path={`${p}.label`} label="סוג הצילום" hint="מוצג בתצוגה המוגדלת" />
          </>
        )}
      </List>
      <AddPhotoButton<StillPhoto>
        path="mosaic"
        max={MAX_FEATURED_STILLS}
        make={({ name, ratio }) => ({ name, ratio, alt: "", label: labelOf(name) })}
      />
    </>
  );
}

/** The stills gallery (the stills service page). */
function StillsGallery() {
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

/**
 * A service page's work: its videos, then its photos. The page shows whichever it has; the
 * stills page's photos are the stills gallery, edited in its own card.
 */
function ServiceGallery({ path, stills }: { path: string; stills: boolean }) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h4 className="text-[14px] font-medium text-ink">סרטונים</h4>
        <List<Video>
          path={`${path}.videos`}
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
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="text-[14px] font-medium text-ink">תמונות</h4>
        {stills ? (
          <p className="admin-note">
            התמונות בעמוד הזה נמצאות בכרטיס 'גלריית צילומי סטילס' שמתחת לרשימת העמודים.
          </p>
        ) : (
          <>
            <p className="text-[12.5px] leading-snug text-ink/65">
              מוצגות מתחת לסרטונים, בגלריה כמו בעמוד צילומי הסטילס. עמוד בלי סרטונים מציג רק תמונות
            </p>
            <List<StillPhoto>
              path={`${path}.photos`}
              itemTitle={(i, ph) => `${i + 1}. ${ph.label || "תמונה"}`}
              grid
              editable={{ min: 0, max: 60 }}
            >
              {(ph) => (
                <>
                  <PhotoInput path={ph} label="תמונה" withRatio />
                  <Text path={`${ph}.label`} label="סוג הצילום" hint="מוצג בתצוגה המוגדלת" />
                </>
              )}
            </List>
            <AddPhotoButton<StillPhoto>
              path={`${path}.photos`}
              max={60}
              make={({ name, ratio }) => ({ name, ratio, alt: "", label: "" })}
            />
          </>
        )}
      </div>
    </>
  );
}

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
            hint={`הסרטון שמתנגן ברקע, הכותרת שעליו והתמונה שמוצגת עד שהוא נטען. ${CONSENT}`}
          >
            <Lines path="title" label="כותרת" />
            <VideoFileInput
              path="video"
              posterPath="poster"
              label="סרטון רקע"
              hint="לולאה קצרה בלי קול (הסרטון מושתק), MP4 עד 8MB ועד דקה וחצי. כל גולש מוריד אותו כשהאתר נפתח, אז עדיפה לולאה של כמה שניות ב־1080p. העלאה מחליפה גם את תמונת הפתיחה בתמונה מהסרטון"
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
              title="הסרטונים בקרוסלה"
              hint={`עד ${MAX_FEATURED_VIDEOS} סרטונים, בסדר שבו הם מופיעים בדף הבית: החיצים משנים את הסדר. מוסיפים סרטון חדש עם קישור מיוטיוב, או מעתיקים סרטון שכבר מופיע בעמודי השירות או בדף הנחיתה. ${CONSENT}`}
            >
              <WorksVideos />
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
              title="התמונות בדף הבית"
              hint={`עד ${MAX_FEATURED_STILLS} תמונות, 3 שורות של 3, בסדר שבו הן מופיעות: החיצים משנים את הסדר. מעלים תמונה חדשה, או בוחרים מתמונות שכבר הועלו, מכל עמוד באתר. ${CONSENT}`}
            >
              <StillsMosaic />
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
            hint={`השירותים בסדר שבו הם מופיעים באתר: החיצים משנים את הסדר. אפשר להוסיף שירות (עד ${MAX_SERVICES}) ולמחוק כל שירות, כל עוד נשאר לפחות אחד גלוי`}
          >
            <List<Service>
              path=""
              itemTitle={serviceTitle}
              grid
              editable={{
                min: 1,
                max: MAX_SERVICES,
                create: newService,
                addLabel: "הוספת שירות",
                confirmRemove: (_, s) =>
                  `למחוק את השירות "${s.title.trim() || "בלי שם"}"? הכרטיס, העמוד והסרטונים שבו יימחקו מהאתר אחרי השמירה. אי אפשר לשחזר אחרי השמירה`,
              }}
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
              {(p, i) => (
                <>
                  {/* Same shape as the card on the homepage (16:9). */}
                  <PhotoInput
                    path={`${p}.image`}
                    label="תמונת הכרטיס"
                    aspect="16 / 9"
                    decorative
                    removable="הסרת התמונה"
                    empty={{
                      // The card's own colour on the site: plain sage, like the last card.
                      preview: (
                        <span
                          aria-hidden="true"
                          className="svc-card svc-card-plain absolute inset-0"
                        />
                      ),
                      note: "בלי תמונה: הכרטיס באתר בצבע ירוק, כמו הכרטיס האחרון",
                    }}
                  />
                  <Text path={`${p}.title`} label="שם השירות" />
                  <Text path={`${p}.meta`} label="שורה קטנה מתחת לשם" />
                  <ServiceDestination path={p} index={i} />
                  <ServiceVisibility path={p} />
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
            <Card title="הצגה באתר">
              <Toggle
                path="hidden"
                label="הסתרת אזור ההמלצות"
                hint="האזור והקישור אליו בתפריט לא יוצגו באתר. ההמלצות נשמרות כאן, ומופיעות שוב כשמבטלים את הסימון ושומרים. כדאי לעדכן גם את המספר בתווית של לשונית 'שאלות' (למשל 06 ל־05)"
              />
            </Card>
            <Card title="טקסט">
              <Caption />
              <Text path="title" label="כותרת" />
            </Card>
            <Card
              title="ההמלצות"
              hint="רק המלצות אמיתיות, במילים של הלקוח, ועם אישור שלו לפרסם את השם והתפקיד"
            >
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
            hint={`בין 3 ל־8 תמונות. רוחב כל תמונה נקבע לפי הצורה שלה. ${CONSENT}`}
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
            hint={`הפסקה בראש העמוד והעבודות שבו: סרטונים, תמונות או שניהם. עמוד בלי עבודות מציג 'עבודות לדוגמה יעלו לכאן בקרוב'. את שם השירות משנים בלשונית 'שירותים'. ${CONSENT}`}
          >
            <List<Service> path="" itemTitle={serviceTitle} collapsible>
              {(p) => {
                return (
                  <>
                    <LinkedAwayNote path={p} />
                    <Text path={`${p}.lead`} label="פסקה בראש העמוד" multiline />
                    <ServiceSearchFields path={p} />
                    <StillsPageCheck path={p}>
                      {(stills) => <ServiceGallery path={p} stills={stills} />}
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
            hint={`כל התמונות בעמוד 'צילומי סטילס'. את התמונות בדף הבית בוחרים בלשונית 'סטילס'. ${CONSENT}`}
          >
            <StillsGallery />
          </Card>
        ),
      },
      {
        key: "servicePage",
        render: () => (
          <Card title="טקסטים שחוזרים בכל עמודי השירות">
            <Text path="cta" label="משפט לפני הכפתור" hint="אותו משפט בכל עמודי השירות" />
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
    key: "landing-bar-mitzvah",
    label: "דף נחיתה: בר/בת מצווה",
    group: "pages",
    docs: [{ key: "barMitzvahLanding", render: () => <BarMitzvahLandingFields /> }],
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
            <Card title="פרטי קשר" hint="מופיעים בתחתית כל עמוד ובטופס יצירת הקשר">
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
            <Text path="home.title" label="כותרת" hint="עד כ־60 תווים נראים בגוגל" />
            <Text
              path="home.description"
              label="תיאור"
              hint="עד כ־155 תווים נראים בגוגל"
              multiline
              rows={3}
            />
            <HomeSearchPreview />
          </Card>
        ),
      },
    ],
  },
];
