import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DOC_KEYS, defaultContent, getDoc, type SiteContent } from "@/content/docs";
import type { DocKey } from "@/content/schema";
import { photoFile } from "@/lib/asset";
import type { AdminBackend } from "./backend";
import { photosIn } from "./PhotoLibrary";
import { TABS } from "./tabs";

// The "תמונות שהועלו" tab: the same photos as the photo library (every upload in storage,
// then the site's original photos), where each one is used, and a way to delete uploads the
// site no longer uses. Original photos are part of the code, so they can't be deleted. A photo
// the saved content or the unsaved draft uses can't be deleted; the server checks the saved
// content again before deleting.

type Stored = { name: string; uploaded: number };
/** `uploaded` is set for a photo in storage (an upload that can be deleted). */
type Row = { name: string; uploaded?: number };

/** The admin tab that edits a section, for "used in". */
const tabOf = (key: DocKey) => TABS.find((t) => t.docs.some((d) => d.key === key))?.label ?? key;

/** Where each photo is used: the tab names, from the saved content and the draft. */
function usage(saved: SiteContent, draft: SiteContent) {
  const where = new Map<string, Set<string>>();
  for (const content of [saved, draft]) {
    for (const key of DOC_KEYS) {
      for (const name of photosIn(getDoc(content, key)).keys()) {
        if (!where.has(name)) where.set(name, new Set());
        where.get(name)!.add(tabOf(key));
      }
    }
  }
  return where;
}

const dateOf = (ms: number) =>
  new Date(ms).toLocaleDateString("he-IL", { day: "numeric", month: "numeric", year: "numeric" });

export function UploadsPanel({
  backend,
  saved,
  draft,
}: {
  backend: AdminBackend;
  saved: SiteContent;
  draft: SiteContent;
}) {
  const [stored, setStored] = useState<Stored[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onlyUnused, setOnlyUnused] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    backend
      .listPhotos()
      .then(setStored)
      .catch((caught: unknown) => {
        setError(
          `לא הצלחנו לטעון את התמונות (${caught instanceof Error ? caught.message : String(caught)})`,
        );
        setStored([]);
      });
  }, [backend]);

  const where = useMemo(() => usage(saved, draft), [saved, draft]);
  // A photo's description, from wherever it's used (or was, in the saved content).
  const alts = useMemo(() => photosIn(draft, photosIn(saved)), [saved, draft]);
  // Storage first (newest first), then photos the content names that aren't in storage: the
  // originals, in the content and the launch content (as the photo library lists them).
  const all = useMemo<Row[]>(() => {
    if (!stored) return [];
    const seen = new Set(stored.map((p) => p.name));
    const rest: Row[] = [];
    for (const content of [draft, saved, defaultContent]) {
      for (const name of photosIn(content).keys()) {
        if (seen.has(name)) continue;
        seen.add(name);
        rest.push({ name });
      }
    }
    return [...stored, ...rest];
  }, [stored, draft, saved]);
  const uploadsCount = stored?.length ?? 0;
  const unusedCount = (stored ?? []).filter((p) => !where.has(p.name)).length;
  const shown = all.filter((p) => !onlyUnused || !where.has(p.name));

  async function remove(photo: Row) {
    if (
      !window.confirm(
        "למחוק את התמונה מהאחסון לצמיתות? אי אפשר לשחזר אותה אחר כך, ואם תצטרכו אותה שוב צריך להעלות אותה מחדש.",
      )
    )
      return;
    setDeleting(photo.name);
    setError(null);
    try {
      await backend.deletePhoto(photo.name);
      setStored((current) => (current ?? []).filter((p) => p.name !== photo.name));
    } catch (caught) {
      setError(`המחיקה נכשלה: ${caught instanceof Error ? caught.message : String(caught)}`);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <section className="rounded-xl border border-ink/12 bg-white p-4 sm:p-6">
        <h2 className="text-[18px] font-medium">תמונות שהועלו</h2>
        <p className="mt-1 text-[13.5px] leading-snug text-ink/65">
          אותן תמונות שמופיעות ב'בחירה מתמונות שהועלו': קודם מה שהועלה בממשק הניהול (החדשות
          ראשונות), ואחריהן התמונות המקוריות של האתר. תמונה שהוסרה מהאתר נשארת כאן, ואפשר להחזיר
          אותה בכפתור 'בחירה מתמונות שהועלו' שליד כל העלאה. תמונה שהועלתה ולא בשימוש אפשר למחוק
          לצמיתות. תמונות מקוריות הן חלק מקוד האתר, ולכן אי אפשר למחוק אותן.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-[14px]">
            <input
              type="checkbox"
              className="size-4 accent-[var(--color-olive-deep)]"
              checked={onlyUnused}
              onChange={(event) => setOnlyUnused(event.target.checked)}
            />
            רק תמונות שלא בשימוש
          </label>
          {stored && (
            <span className="text-[13.5px] text-ink/65">
              {all.length} תמונות: {uploadsCount} שהועלו ({unusedCount} מהן לא בשימוש), והשאר
              מקוריות
            </span>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-3 text-[13.5px] text-red-700">
            {error}
          </p>
        )}

        {!stored ? (
          <p className="py-10 text-center text-[14px] text-ink/60">טוען…</p>
        ) : shown.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-ink/60">
            {onlyUnused ? "כל התמונות שהועלו בשימוש באתר" : "עדיין לא הועלו תמונות"}
          </p>
        ) : (
          <ul className="m-0 mt-4 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-4">
            {shown.map((photo) => {
              const tabs = where.get(photo.name);
              const alt = alts.get(photo.name);
              return (
                <li
                  key={photo.name}
                  className="flex flex-col gap-1.5 rounded-lg border border-ink/12 bg-cream/40 p-2"
                >
                  <img
                    src={photoFile(photo.name, 480)}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-md bg-beige/60 object-contain"
                  />
                  {alt && (
                    <span className="line-clamp-2 text-[12.5px] leading-snug text-ink/80">
                      {alt}
                    </span>
                  )}
                  <span className="text-[12px] leading-snug text-ink/60">
                    {tabs ? `בשימוש: ${[...tabs].join(", ")}` : "לא בשימוש"}
                    {" · "}
                    {photo.uploaded !== undefined
                      ? `הועלתה ב־${dateOf(photo.uploaded)}`
                      : photo.name.startsWith("/")
                        ? "לא נמצאה באחסון"
                        : "תמונה מקורית של האתר"}
                  </span>
                  {!tabs && photo.uploaded !== undefined && (
                    <button
                      type="button"
                      className="admin-btn mt-auto self-start !text-red-700"
                      disabled={deleting !== null}
                      onClick={() => void remove(photo)}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      {deleting === photo.name ? "מוחק…" : "מחיקה"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <UploadedVideos backend={backend} saved={saved} draft={draft} />
    </>
  );
}

type StoredVideo = { name: string; uploaded: number; size: number };

/** Where each video address is used: the tab names, from the saved content and the draft. */
function videoUsage(name: string, saved: SiteContent, draft: SiteContent) {
  const quoted = JSON.stringify(name);
  const tabs = new Set<string>();
  for (const content of [saved, draft]) {
    for (const key of DOC_KEYS) {
      if (JSON.stringify(getDoc(content, key)).includes(quoted)) tabs.add(tabOf(key));
    }
  }
  return tabs;
}

const megabytes = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)}MB`;

/**
 * The videos uploaded in the admin (the homepage's background video): where each is used, and
 * deleting the ones the site no longer uses. The site's original video is part of the code.
 */
function UploadedVideos({
  backend,
  saved,
  draft,
}: {
  backend: AdminBackend;
  saved: SiteContent;
  draft: SiteContent;
}) {
  const [videos, setVideos] = useState<StoredVideo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    backend
      .listVideos()
      .then(setVideos)
      .catch((caught: unknown) => {
        setError(
          `לא הצלחנו לטעון את הסרטונים (${caught instanceof Error ? caught.message : String(caught)})`,
        );
        setVideos([]);
      });
  }, [backend]);

  async function remove(video: StoredVideo) {
    if (
      !window.confirm(
        "למחוק את הסרטון מהאחסון לצמיתות? אי אפשר לשחזר אותו אחר כך, ואם תצטרכו אותו שוב צריך להעלות אותו מחדש.",
      )
    )
      return;
    setDeleting(video.name);
    setError(null);
    try {
      await backend.deleteVideo(video.name);
      setVideos((current) => (current ?? []).filter((v) => v.name !== video.name));
    } catch (caught) {
      setError(`המחיקה נכשלה: ${caught instanceof Error ? caught.message : String(caught)}`);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section className="rounded-xl border border-ink/12 bg-white p-4 sm:p-6">
      <h2 className="text-[18px] font-medium">סרטונים שהועלו</h2>
      <p className="mt-1 text-[13.5px] leading-snug text-ink/65">
        סרטוני הרקע שהועלו בלשונית 'פתיח', החדשים ראשונים. סרטון שהוחלף נשאר כאן עד שמוחקים אותו.
        סרטון שלא בשימוש אפשר למחוק לצמיתות. הסרטון המקורי של האתר הוא חלק מהקוד ולא מופיע כאן.
      </p>

      {error && (
        <p role="alert" className="mt-3 text-[13.5px] text-red-700">
          {error}
        </p>
      )}

      {!videos ? (
        <p className="py-8 text-center text-[14px] text-ink/60">טוען…</p>
      ) : videos.length === 0 ? (
        <p className="py-8 text-center text-[14px] text-ink/60">עדיין לא הועלו סרטונים</p>
      ) : (
        <ul className="m-0 mt-4 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 md:grid-cols-3">
          {videos.map((video) => {
            const tabs = videoUsage(video.name, saved, draft);
            return (
              <li
                key={video.name}
                className="flex flex-col gap-1.5 rounded-lg border border-ink/12 bg-cream/40 p-2"
              >
                <video
                  src={video.name}
                  muted
                  playsInline
                  preload="metadata"
                  controls
                  className="aspect-video w-full rounded-md bg-ink/80 object-cover"
                />
                <span className="text-[12px] leading-snug text-ink/60">
                  {tabs.size ? `בשימוש: ${[...tabs].join(", ")}` : "לא בשימוש"}
                  {" · "}
                  הועלה ב־{dateOf(video.uploaded)}
                  {video.size ? ` · ${megabytes(video.size)}` : ""}
                </span>
                {!tabs.size && (
                  <button
                    type="button"
                    className="admin-btn mt-auto self-start !text-red-700"
                    disabled={deleting !== null}
                    onClick={() => void remove(video)}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    {deleting === video.name ? "מוחק…" : "מחיקה"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
