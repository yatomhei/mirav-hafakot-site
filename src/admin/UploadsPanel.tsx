import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DOC_KEYS, getDoc, type SiteContent } from "@/content/docs";
import type { DocKey } from "@/content/schema";
import { photoFile } from "@/lib/asset";
import type { AdminBackend } from "./backend";
import { photosIn } from "./PhotoLibrary";
import { TABS } from "./tabs";

// The "תמונות שהועלו" tab: every photo uploaded in the admin, where each one is used, and a
// way to delete the ones the site no longer uses. The site's own original photos aren't
// listed: they're part of the code. A photo the saved content or the unsaved draft uses can't
// be deleted; the server checks the saved content again before deleting.

type Stored = { name: string; uploaded: number };

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
  const all = stored ?? [];
  const unusedCount = all.filter((p) => !where.has(p.name)).length;
  const shown = all.filter((p) => !onlyUnused || !where.has(p.name));

  async function remove(photo: Stored) {
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
    <section className="rounded-xl border border-ink/12 bg-white p-4 sm:p-6">
      <h2 className="text-[18px] font-medium">תמונות שהועלו</h2>
      <p className="mt-1 text-[13.5px] leading-snug text-ink/65">
        כל התמונות שהועלו בממשק הניהול, החדשות ראשונות. תמונה שהוסרה מהאתר נשארת כאן, ואפשר להחזיר
        אותה בכפתור 'בחירה מתמונות שהועלו' שליד כל העלאה. תמונה שלא בשימוש אפשר למחוק לצמיתות.
        התמונות המקוריות של האתר לא מופיעות כאן.
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
            {all.length} תמונות, {unusedCount} מהן לא בשימוש
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
                  <span className="line-clamp-2 text-[12.5px] leading-snug text-ink/80">{alt}</span>
                )}
                <span className="text-[12px] leading-snug text-ink/60">
                  {tabs ? `בשימוש: ${[...tabs].join(", ")}` : "לא בשימוש"}
                  {" · "}
                  הועלתה ב־{dateOf(photo.uploaded)}
                </span>
                {!tabs && (
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
  );
}
