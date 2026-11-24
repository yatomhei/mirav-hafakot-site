import { Images, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { defaultContent, type SiteContent } from "@/content/docs";
import { photoFile } from "@/lib/asset";
import type { AdminBackend } from "./backend";

// The photo library: every photo already on the site, to use again without uploading it a
// second time. It lists what's in storage (the admin's uploads, including ones removed from
// the site since) and the site's own original photos. Choosing one only reuses its name.

export type PickedPhoto = { name: string; ratio: number; alt: string };

type Entry = { name: string; alt: string; used: boolean; uploaded: number };

/** Every photo the content names ({ name, alt } anywhere in it), with its description. */
function photosIn(content: unknown, found = new Map<string, string>()) {
  if (Array.isArray(content)) {
    for (const item of content) photosIn(item, found);
  } else if (content && typeof content === "object") {
    const record = content as Record<string, unknown>;
    if (typeof record["name"] === "string" && "alt" in record && record["name"]) {
      const name = record["name"];
      const alt = typeof record["alt"] === "string" ? record["alt"].trim() : "";
      if (!found.get(name)) found.set(name, alt);
    }
    for (const value of Object.values(record)) photosIn(value, found);
  }
  return found;
}

/** Storage first (newest first), then original photos still in the content or the launch. */
function libraryEntries(stored: { name: string; uploaded: number }[], draft: SiteContent) {
  const inDraft = photosIn(draft);
  const atLaunch = photosIn(defaultContent);
  const entries: Entry[] = [];
  const seen = new Set<string>();
  const add = (name: string, uploaded: number) => {
    if (seen.has(name)) return;
    seen.add(name);
    const alt = inDraft.get(name) || atLaunch.get(name) || "";
    entries.push({ name, alt, used: inDraft.has(name), uploaded });
  };
  for (const photo of stored) add(photo.name, photo.uploaded);
  // Uploads the storage list missed (it failed, or a different storage) and the originals.
  for (const name of inDraft.keys()) add(name, 0);
  for (const name of atLaunch.keys()) add(name, 0);
  return entries;
}

/** A photo's shape (width ÷ height), from its smallest size. */
function measure(name: string) {
  return new Promise<number>((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve(
        img.naturalHeight ? Math.round((img.naturalWidth / img.naturalHeight) * 1000) / 1000 : 1,
      );
    img.onerror = () => resolve(1);
    img.src = photoFile(name, 480);
  });
}

export function PhotoLibraryButton({
  backend,
  draft,
  onPick,
  label = "בחירה מתמונות שהועלו",
  disabled,
}: {
  backend: AdminBackend;
  draft: SiteContent;
  onPick: (photo: PickedPhoto) => void;
  label?: string;
  disabled?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [stored, setStored] = useState<{ name: string; uploaded: number }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onlyUnused, setOnlyUnused] = useState(false);
  const [choosing, setChoosing] = useState<string | null>(null);

  async function open() {
    dialog.current?.showModal();
    setError(null);
    try {
      setStored(await backend.listPhotos());
    } catch (caught) {
      setError(
        `לא הצלחנו לטעון את התמונות מהאחסון (${caught instanceof Error ? caught.message : String(caught)}). מוצגות רק התמונות שבאתר.`,
      );
      setStored([]);
    }
  }

  // Follows the draft, so a photo just used elsewhere shows as in use.
  const entries = useMemo(() => (stored ? libraryEntries(stored, draft) : null), [stored, draft]);

  async function choose(entry: Entry) {
    setChoosing(entry.name);
    const ratio = await measure(entry.name);
    setChoosing(null);
    dialog.current?.close();
    onPick({ name: entry.name, ratio, alt: entry.alt });
  }

  const shown = (entries ?? []).filter((e) => !onlyUnused || !e.used);

  return (
    <>
      <button type="button" className="admin-btn" disabled={disabled} onClick={open}>
        <Images size={16} aria-hidden="true" />
        {label}
      </button>
      <dialog
        ref={dialog}
        aria-label="התמונות שהועלו"
        className="m-auto max-h-[88vh] w-[min(980px,94vw)] rounded-xl border border-ink/12 bg-cream p-0 text-ink backdrop:bg-ink/45"
        onClick={(event) => {
          // A click on the backdrop (outside the panel) closes it.
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        <div className="flex max-h-[88vh] flex-col">
          <div className="flex flex-wrap items-center gap-3 border-b border-ink/12 px-5 py-4">
            <h2 className="text-[18px] font-medium">התמונות שהועלו</h2>
            <label className="flex cursor-pointer items-center gap-2 text-[14px]">
              <input
                type="checkbox"
                className="size-4 accent-[var(--color-olive-deep)]"
                checked={onlyUnused}
                onChange={(event) => setOnlyUnused(event.target.checked)}
              />
              רק תמונות שלא בשימוש באתר
            </label>
            <button
              type="button"
              className="admin-icon-btn ms-auto"
              aria-label="סגירה"
              onClick={() => dialog.current?.close()}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-4">
            <p className="mb-3 text-[13px] leading-snug text-ink/65">
              בוחרים תמונה כדי להשתמש בה כאן. היא לא מועלית שוב, ומה שכבר כתוב בתיאור שלה עובר איתה.
              כולל גם תמונות שהוסרו מהאתר, כך שאפשר להחזיר אותן.
            </p>
            {error && <p className="mb-3 text-[13px] text-red-700">{error}</p>}
            {!entries ? (
              <p className="py-10 text-center text-[14px] text-ink/60">טוען…</p>
            ) : shown.length === 0 ? (
              <p className="py-10 text-center text-[14px] text-ink/60">אין תמונות להצגה</p>
            ) : (
              <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-4">
                {shown.map((entry) => (
                  <li key={entry.name}>
                    <button
                      type="button"
                      disabled={choosing !== null}
                      onClick={() => choose(entry)}
                      className="flex w-full cursor-pointer flex-col gap-1.5 rounded-lg border border-ink/12 bg-white p-2 text-start hover:border-ink/40 disabled:cursor-wait"
                    >
                      <img
                        src={photoFile(entry.name, 480)}
                        alt=""
                        loading="lazy"
                        className="aspect-[4/3] w-full rounded-md bg-beige/60 object-contain"
                      />
                      <span className="line-clamp-2 min-h-[2.6em] text-[12.5px] leading-snug text-ink/80">
                        {choosing === entry.name ? "בוחר…" : entry.alt || "בלי תיאור"}
                      </span>
                      <span className="text-[12px] text-ink/55">
                        {entry.used ? "בשימוש באתר" : "לא בשימוש"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
