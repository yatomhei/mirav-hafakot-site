import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Film,
  Home,
  ImageUp,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { asset, photoFile } from "@/lib/asset";
import { YOUTUBE_ID } from "@/content/schema";
import type { Photo } from "@/content/types";
import { getDoc, type SiteContent } from "@/content/docs";
import type { DocKey } from "@/content/schema";
import type { AdminBackend } from "./backend";

// Field components for the editor tabs. A <Doc> provides one saved record; every field
// inside it names its place in that record with a dotted path ("portrait.alt",
// "items.2.title"), so the tabs read as a list of fields rather than state plumbing.

type Path = string;

function getIn(value: unknown, path: Path): unknown {
  if (!path) return value;
  return path.split(".").reduce<unknown>((node, key) => {
    if (node == null) return undefined;
    return (node as Record<string, unknown>)[key];
  }, value);
}

function setIn(value: unknown, path: Path, next: unknown): unknown {
  if (!path) return next;
  const [key, ...rest] = path.split(".") as [string, ...string[]];
  const restPath = rest.join(".");
  if (Array.isArray(value)) {
    const copy = [...value];
    copy[Number(key)] = setIn(copy[Number(key)], restPath, next);
    return copy;
  }
  const record = (value ?? {}) as Record<string, unknown>;
  const child = setIn(record[key], restPath, next);
  // Optional fields left empty are dropped rather than saved as "".
  if (child === undefined) {
    const { [key]: _removed, ...others } = record;
    return others;
  }
  return { ...record, [key]: child };
}

type DocContextValue = {
  value: unknown;
  onChange: (next: unknown) => void;
  backend: AdminBackend;
};

const DocContext = createContext<DocContextValue | null>(null);

export function useField<T>(path: Path) {
  const context = useContext(DocContext);
  if (!context) throw new Error("Field used outside <Doc>");
  return {
    value: getIn(context.value, path) as T,
    set: (next: T | undefined) => context.onChange(setIn(context.value, path, next)),
    backend: context.backend,
  };
}

/**
 * The whole draft, for fields that look across sections (how many items are featured), and
 * a way to edit another record from inside one (see SubDoc).
 */
export const DraftContext = createContext<{
  draft: SiteContent;
  update: (key: DocKey, value: unknown) => void;
} | null>(null);
export function useDraftContext() {
  const context = useContext(DraftContext);
  if (!context) throw new Error("Used outside the admin");
  return context;
}
export const useDraft = () => useDraftContext().draft;

/** Fields of another record, placed inside this one's layout. */
export function SubDoc({ docKey, children }: { docKey: DocKey; children: ReactNode }) {
  const { draft, update } = useDraftContext();
  const parent = useContext(DocContext);
  if (!parent) throw new Error("SubDoc used outside <Doc>");
  return (
    <Doc
      value={getDoc(draft, docKey)}
      onChange={(next) => update(docKey, next)}
      backend={parent.backend}
    >
      {children}
    </Doc>
  );
}

/** Provides one saved record to the fields inside it. */
export function Doc(props: DocContextValue & { children: ReactNode }) {
  const { children, ...value } = props;
  return <DocContext.Provider value={value}>{children}</DocContext.Provider>;
}

/** A titled white card grouping the fields of one part of a section. */
export function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-ink/12 bg-white p-4 sm:p-6">
      <h2 className="text-[18px] font-medium text-ink">{title}</h2>
      {hint && <p className="mt-1 text-[13.5px] leading-snug text-ink/65">{hint}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function FieldLabel({ htmlFor, label, hint }: { htmlFor: string; label: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block">
      <span className="block text-[14px] font-medium text-ink">{label}</span>
      {hint && <span className="block text-[13px] leading-snug text-ink/65">{hint}</span>}
    </label>
  );
}

type TextProps = {
  path: Path;
  label: string;
  hint?: string;
  /** English, a number or an address: typed left to right. */
  ltr?: boolean;
  /** Grey example text while the field is empty. */
  placeholder?: string;
  /** Several lines; Enter starts a new line on the site. */
  multiline?: boolean;
  rows?: number;
  inputMode?: "numeric" | "tel" | "url" | "email";
};

export function Text({
  path,
  label,
  hint,
  ltr,
  multiline,
  rows = 3,
  inputMode,
  placeholder,
}: TextProps) {
  const id = useId();
  const { value, set } = useField<string | undefined>(path);
  const common = {
    id,
    value: value ?? "",
    dir: ltr ? "ltr" : "rtl",
    className: cn("admin-input", ltr && "text-left"),
    onChange: (event: { target: { value: string } }) => set(event.target.value),
    ...(placeholder ? { placeholder } : {}),
  } as const;
  return (
    <div>
      <FieldLabel htmlFor={id} label={label} {...(hint ? { hint } : {})} />
      {multiline ? (
        <textarea rows={rows} {...common} />
      ) : (
        <input type="text" {...(inputMode ? { inputMode } : {})} {...common} />
      )}
    </div>
  );
}

const toLines = (raw: string) =>
  raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

/**
 * A heading in one box where Enter starts a new line on the site (saved as one string per
 * line). Blank lines are dropped, so a stray Enter at the end changes nothing.
 */
export function Lines({
  path,
  label,
  hint,
  max = 3,
  rows: minRows,
}: {
  path: Path;
  label: string;
  hint?: string;
  max?: number;
  /** A taller box for paragraphs of text (it can also be resized). */
  rows?: number;
}) {
  const id = useId();
  const { value, set } = useField<string[]>(path);
  const saved = (value ?? []).join("\n");
  // Paragraphs are shown with a blank line between them, so they are easy to tell apart.
  const shown = (value ?? []).join(minRows ? "\n\n" : "\n");
  // The box keeps what is typed (a trailing Enter, spaces) while the record keeps clean lines.
  const [raw, setRaw] = useState(shown);
  useEffect(() => {
    // Follow outside changes (revert, restore) without fighting the typing.
    if (toLines(raw).join("\n") !== saved) setRaw(shown);
  }, [saved]); // eslint-disable-line react-hooks/exhaustive-deps
  const rows = minRows ?? Math.max(2, raw.split("\n").length);
  return (
    <div>
      <FieldLabel
        htmlFor={id}
        label={label}
        hint={hint ?? `Enter מתחיל שורה חדשה באתר (עד ${max} שורות)`}
      />
      <textarea
        id={id}
        rows={rows}
        className={cn("admin-input", minRows ? "resize-y" : "resize-none")}
        value={raw}
        onChange={(event) => {
          setRaw(event.target.value);
          set(toLines(event.target.value));
        }}
      />
    </div>
  );
}

/** Reads a YouTube video id out of a link (or takes the id itself). */
export function parseYouTube(input: string): string | null {
  const value = input.trim();
  if (YOUTUBE_ID.test(value)) return value;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^(www\.|m\.)/, "");
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0] ?? null;
    else if (host.endsWith("youtube.com")) {
      id =
        url.searchParams.get("v") ??
        url.pathname.match(/\/(shorts|embed|live)\/([^/?]+)/)?.[2] ??
        null;
    }
    return id && YOUTUBE_ID.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** A YouTube link: paste any link to the video and the id is kept. */
export function YouTubeInput({ path }: { path: Path }) {
  const id = useId();
  const { value, set } = useField<string>(path);
  const [typed, setTyped] = useState<string | null>(null);
  const shown = typed ?? (value ? `https://youtu.be/${value}` : "");
  const bad = typed !== null && typed.trim() !== "" && !parseYouTube(typed);
  return (
    <div>
      <FieldLabel
        htmlFor={id}
        label="קישור לסרטון ביוטיוב"
        hint="מעתיקים את הקישור מכפתור 'שיתוף' ביוטיוב ומדביקים כאן"
      />
      <input
        id={id}
        type="text"
        dir="ltr"
        inputMode="url"
        className={cn("admin-input text-left", bad && "border-red-600")}
        value={shown}
        placeholder="https://youtu.be/…"
        onChange={(event) => {
          setTyped(event.target.value);
          set(parseYouTube(event.target.value) ?? "");
        }}
        onBlur={() => !bad && setTyped(null)}
      />
      {bad && <p className="mt-1 text-[13px] text-red-700">זה לא נראה כמו קישור לסרטון ביוטיוב</p>}
    </div>
  );
}

function useUpload(backend: AdminBackend) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      return await backend.uploadPhoto(file);
    } catch (caught) {
      setError(`ההעלאה נכשלה: ${caught instanceof Error ? caught.message : String(caught)}`);
      return null;
    } finally {
      setBusy(false);
    }
  }
  return { upload, busy, error };
}

function UploadButton({
  onFile,
  busy,
  label,
}: {
  onFile: (file: File) => void;
  busy: boolean;
  label: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        className="admin-btn"
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        <ImageUp size={16} aria-hidden="true" />
        {busy ? "מעלה ומכווץ…" : label}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onFile(file);
        }}
      />
    </>
  );
}

const KEYWORDS: Record<string, number> = { left: 0, top: 0, center: 50, right: 100, bottom: 100 };
/** "center 40%" / "55% center" / "30% 70%" → a point in percent. */
function parsePosition(pos: string | undefined) {
  const [a = "center", b = "center"] = (pos ?? "center").trim().split(/\s+/);
  const read = (token: string) => KEYWORDS[token] ?? (Number.parseFloat(token) || 50);
  return { x: read(a), y: read(b) };
}

type PhotoProps = {
  path: Path;
  label: string;
  hint?: string;
  /** Thumbnail shape, matching how the site crops it. */
  aspect?: string;
  /** Decorative: no description for screen readers. */
  decorative?: boolean;
  /** The photo can be removed (the site then shows its fallback). */
  removable?: string;
  /** The photo carries its own shape (`ratio`, width ÷ height), updated on upload. */
  withRatio?: boolean;
  /** What the site shows when there is no photo (e.g. the YouTube cover). */
  fallback?: string;
};

/** A photo: thumbnail, replace, the part to keep in view, and its description. */
export function PhotoInput({
  path,
  label,
  hint,
  aspect = "4 / 3",
  decorative,
  removable,
  withRatio,
  fallback,
}: PhotoProps) {
  const { value: photo, set, backend } = useField<(Photo & { ratio?: number }) | undefined>(path);
  const { upload, busy, error } = useUpload(backend);
  const point = parsePosition(photo?.pos);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-ink/10 bg-cream/60 p-3 sm:flex-row sm:items-start">
      <div className="w-full shrink-0 sm:w-[200px]">
        {photo ? (
          <>
            <button
              type="button"
              aria-label={`${label}: לחיצה על החלק בתמונה שחייב להישאר גלוי`}
              className="relative block w-full cursor-crosshair overflow-hidden rounded-md bg-beige"
              style={{ aspectRatio: aspect }}
              onClick={(event) => {
                const box = event.currentTarget.getBoundingClientRect();
                const x = Math.round(((event.clientX - box.left) / box.width) * 100);
                const y = Math.round(((event.clientY - box.top) / box.height) * 100);
                set({ ...photo, pos: `${x}% ${y}%` });
              }}
            >
              <img
                src={photoFile(photo.name, 480)}
                alt=""
                className="size-full object-cover"
                style={{ objectPosition: photo.pos ?? "center" }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink/40 shadow"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              />
            </button>
            <p className="mt-1 text-[12.5px] leading-snug text-ink/65">
              לחיצה על התמונה קובעת איזה חלק בה יישאר גלוי כשהיא נחתכת
            </p>
          </>
        ) : fallback ? (
          <>
            <img
              src={fallback}
              alt=""
              className="w-full rounded-md bg-beige object-cover"
              style={{ aspectRatio: aspect }}
            />
            <p className="mt-1 text-[12.5px] leading-snug text-ink/65">התמונה מיוטיוב</p>
          </>
        ) : (
          <div
            className="flex w-full items-center justify-center rounded-md border border-dashed border-ink/25 text-[13px] text-ink/60"
            style={{ aspectRatio: aspect }}
          >
            אין תמונה
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div>
          <p className="text-[14px] font-medium text-ink">{label}</p>
          {hint && <p className="text-[13px] leading-snug text-ink/65">{hint}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <UploadButton
            busy={busy}
            label={photo ? "החלפת תמונה" : "העלאת תמונה"}
            onFile={async (file) => {
              const result = await upload(file);
              if (!result) return;
              // Keeps the description (and a gallery photo's label); the new photo starts centred.
              const { pos: _pos, ...rest } = photo ?? { alt: "" };
              set({ ...rest, name: result.name, ...(withRatio ? { ratio: result.ratio } : {}) });
            }}
          />
          {photo && removable && (
            <button type="button" className="admin-btn" onClick={() => set(undefined)}>
              <X size={16} aria-hidden="true" />
              {removable}
            </button>
          )}
        </div>
        {error && <p className="text-[13px] text-red-700">{error}</p>}
        {photo && !decorative && (
          <Text
            path={`${path}.alt`}
            label="תיאור התמונה"
            hint="משפט קצר שמתאר מה רואים בתמונה, לגולשים שמשתמשים בקורא מסך"
          />
        )}
      </div>
    </div>
  );
}

/**
 * The hero's background video: preview, replace. A new video also replaces the poster with
 * a still from it, so the first thing visitors see matches the video that follows.
 */
export function VideoFileInput({
  path,
  posterPath,
  label,
  hint,
}: {
  path: Path;
  posterPath: Path;
  label: string;
  hint?: string;
}) {
  const context = useContext(DocContext);
  const { value: address, backend } = useField<string>(path);
  const { value: poster } = useField<Photo | undefined>(posterPath);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function replace(file: File) {
    if (!context) return;
    setBusy(true);
    setError(null);
    try {
      const { prepareVideo } = await import("./video");
      const prepared = await prepareVideo(file);
      const [videoAddress, still] = await Promise.all([
        backend.uploadVideo(file, prepared.extension),
        backend.uploadPhoto(prepared.poster),
      ]);
      // One change for both, so neither write undoes the other.
      const withVideo = setIn(context.value, path, videoAddress);
      context.onChange(setIn(withVideo, posterPath, { ...poster, name: still.name, alt: "" }));
    } catch (caught) {
      setError(`ההעלאה נכשלה: ${caught instanceof Error ? caught.message : String(caught)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-ink/10 bg-cream/60 p-3 sm:flex-row sm:items-start">
      <div className="w-full shrink-0 sm:w-[200px]">
        <video
          key={address}
          src={asset(address)}
          poster={poster ? photoFile(poster.name, 480) : undefined}
          className="aspect-video w-full rounded-md bg-beige object-cover"
          muted
          loop
          playsInline
          controls
          preload="metadata"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div>
          <p className="text-[14px] font-medium text-ink">{label}</p>
          {hint && <p className="text-[13px] leading-snug text-ink/65">{hint}</p>}
        </div>
        <div>
          <button
            type="button"
            className="admin-btn"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            <Film size={16} aria-hidden="true" />
            {busy ? "מעלה… (סרטון גדול לוקח רגע)" : "החלפת סרטון"}
          </button>
          <input
            ref={input}
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void replace(file);
            }}
          />
        </div>
        {error && <p className="text-[13px] text-red-700">{error}</p>}
      </div>
    </div>
  );
}

type ListProps<T> = {
  path: Path;
  /** Heading for each item, e.g. (i) => `המלצה ${i + 1}`. */
  itemTitle: (index: number, item: T) => string;
  children: (itemPath: Path, index: number) => ReactNode;
  /**
   * Items can be removed and reordered within these limits, and added with `create`.
   * Photo lists leave `create` out and add through <AddPhotoButton> instead.
   */
  editable?: { min: number; max: number; create?: () => T; addLabel?: string };
  /** Lay items out two per row on wide screens. */
  grid?: boolean;
  /** Collapse each item to its title; click to open (long lists). */
  collapsible?: boolean;
  /** One more cell after the items (e.g. a card that is not part of the list). */
  extra?: ReactNode;
};

const itemPath = (path: Path, index: number) => (path ? `${path}.${index}` : `${index}`);

/** Repeated items. Fixed lists (the design needs exactly that many) show no add/remove. */
export function List<T>({
  path,
  itemTitle,
  children,
  editable,
  grid,
  collapsible,
  extra,
}: ListProps<T>) {
  const { value, set } = useField<T[]>(path);
  const items = value ?? [];

  const move = (from: number, to: number) => {
    const next = [...items];
    const [item] = next.splice(from, 1);
    if (item === undefined) return;
    next.splice(to, 0, item);
    set(next);
  };

  const controls = (index: number, item: T) =>
    editable && (
      <div className="ms-auto flex gap-1">
        <button
          type="button"
          className="admin-icon-btn"
          aria-label="הזזה למקום מוקדם יותר"
          disabled={index === 0}
          onClick={() => move(index, index - 1)}
        >
          <MoveArrow to="earlier" sideways={grid ? "lg" : undefined} />
        </button>
        <button
          type="button"
          className="admin-icon-btn"
          aria-label="הזזה למקום מאוחר יותר"
          disabled={index === items.length - 1}
          onClick={() => move(index, index + 1)}
        >
          <MoveArrow to="later" sideways={grid ? "lg" : undefined} />
        </button>
        {/* A list of fixed length can only be reordered. */}
        {editable.min < editable.max && (
          <button
            type="button"
            className="admin-icon-btn text-red-700"
            aria-label="מחיקה"
            disabled={items.length <= editable.min}
            onClick={() => {
              if (window.confirm(`למחוק את "${itemTitle(index, item)}"?`)) {
                set(items.filter((_, i) => i !== index));
              }
            }}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      <div className={cn("grid gap-3", grid && "lg:grid-cols-2")}>
        {items.map((item, index) =>
          collapsible ? (
            <details key={index} className="group rounded-lg border border-ink/12">
              <summary className="flex cursor-pointer list-none items-center gap-2 p-3">
                <span
                  aria-hidden="true"
                  className="text-ink/50 transition-transform group-open:rotate-90"
                >
                  ‹
                </span>
                <h3 className="truncate text-[15px] font-medium text-ink">
                  {itemTitle(index, item)}
                </h3>
                {controls(index, item)}
              </summary>
              <div className="flex flex-col gap-3 border-t border-ink/10 p-3">
                {children(itemPath(path, index), index)}
              </div>
            </details>
          ) : (
            <div key={index} className="rounded-lg border border-ink/12 p-3">
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-[15px] font-medium text-ink">{itemTitle(index, item)}</h3>
                {controls(index, item)}
              </div>
              <div className="flex flex-col gap-3">{children(itemPath(path, index), index)}</div>
            </div>
          ),
        )}
        {extra}
      </div>
      {editable?.create && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="admin-btn"
            disabled={items.length >= editable.max}
            onClick={() => editable.create && set([...items, editable.create()])}
          >
            <Plus size={16} aria-hidden="true" />
            {editable.addLabel}
          </button>
          <span className="text-[13px] text-ink/60">
            {items.length} מתוך {editable.max} לכל היותר
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * A short list of one-line texts (e.g. the options of a dropdown): one row per item with its
 * box, order arrows and delete, under a single heading.
 */
export function TextList({
  path,
  label,
  hint,
  min,
  max,
  addLabel,
}: {
  path: Path;
  label: string;
  hint?: string;
  min: number;
  max: number;
  addLabel: string;
}) {
  const id = useId();
  const { value, set } = useField<string[]>(path);
  const items = value ?? [];
  const move = (from: number, to: number) => {
    const next = [...items];
    const [item] = next.splice(from, 1);
    if (item === undefined) return;
    next.splice(to, 0, item);
    set(next);
  };
  return (
    <div role="group" aria-labelledby={id}>
      <p id={id} className="text-[14px] font-medium text-ink">
        {label}
      </p>
      {hint && <p className="text-[13px] leading-snug text-ink/65">{hint}</p>}
      <ol className="mt-2 flex flex-col gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <input
              type="text"
              dir="rtl"
              className="admin-input me-1 min-w-0 flex-1"
              aria-label={`${label}: אפשרות ${index + 1}`}
              value={item}
              onChange={(event) => set(items.map((v, i) => (i === index ? event.target.value : v)))}
            />
            <button
              type="button"
              className="admin-icon-btn"
              aria-label="הזזה למקום מוקדם יותר"
              disabled={index === 0}
              onClick={() => move(index, index - 1)}
            >
              <MoveArrow to="earlier" />
            </button>
            <button
              type="button"
              className="admin-icon-btn"
              aria-label="הזזה למקום מאוחר יותר"
              disabled={index === items.length - 1}
              onClick={() => move(index, index + 1)}
            >
              <MoveArrow to="later" />
            </button>
            <button
              type="button"
              className="admin-icon-btn text-red-700"
              aria-label={`מחיקת "${item || `אפשרות ${index + 1}`}"`}
              disabled={items.length <= min}
              onClick={() => set(items.filter((_, i) => i !== index))}
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="admin-btn"
          disabled={items.length >= max}
          onClick={() => set([...items, ""])}
        >
          <Plus size={16} aria-hidden="true" />
          {addLabel}
        </button>
        <span className="text-[13px] text-ink/60">
          {items.length} מתוך {max} לכל היותר
        </span>
      </div>
    </div>
  );
}

/**
 * Adds a photo to a list by uploading it straight away, so a list never holds an item
 * without an image. `make` builds the new item from the upload.
 */
export function AddPhotoButton<T>({
  path,
  max,
  make,
  label = "הוספת תמונה",
}: {
  path: Path;
  max: number;
  make: (photo: { name: string; ratio: number }) => T;
  label?: string;
}) {
  const { value, set, backend } = useField<T[]>(path);
  const { upload, busy, error } = useUpload(backend);
  const items = value ?? [];
  return (
    <div className="flex flex-wrap items-center gap-3">
      <UploadButton
        busy={busy || items.length >= max}
        label={label}
        onFile={async (file) => {
          const result = await upload(file);
          if (result) set([...items, make(result)]);
        }}
      />
      <span className="text-[13px] text-ink/60">
        {items.length} מתוך {max} לכל היותר
      </span>
      {error && <p className="w-full text-[13px] text-red-700">{error}</p>}
    </div>
  );
}

/**
 * "Show on the homepage" for one gallery item. When the homepage is full it can only be
 * turned off, and says why.
 */
export function FeatureToggle({
  path,
  label,
  full,
}: {
  path: Path;
  label: string;
  /** The homepage already shows the most it can. */
  full: string | false;
}) {
  const id = useId();
  const { value, set } = useField<boolean | undefined>(path);
  const on = Boolean(value);
  const blocked = !on && full;
  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          "flex items-center gap-2 rounded-md border px-3 py-2 text-[14px]",
          on ? "border-olive-deep bg-olive-soft" : "border-ink/15 bg-white",
          blocked ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        )}
      >
        <input
          id={id}
          type="checkbox"
          className="size-4 accent-[var(--color-olive-deep)]"
          checked={on}
          disabled={Boolean(blocked)}
          onChange={(event) => set(event.target.checked || undefined)}
        />
        <Home size={15} aria-hidden="true" className="text-ink/60" />
        {label}
      </label>
      {blocked && <p className="mt-1 text-[12.5px] text-ink/65">{full}</p>}
    </div>
  );
}

/** A plain on/off setting. */
export function Toggle({ path, label, hint }: { path: Path; label: string; hint?: string }) {
  const id = useId();
  const { value, set } = useField<boolean | undefined>(path);
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-[14px] text-ink">
        <input
          id={id}
          type="checkbox"
          className="size-4 accent-[var(--color-olive-deep)]"
          checked={Boolean(value)}
          onChange={(event) => set(event.target.checked || undefined)}
        />
        {label}
      </label>
      {hint && <p className="ms-6 text-[12.5px] leading-snug text-ink/65">{hint}</p>}
    </div>
  );
}

/**
 * The arrow on a reorder button points where the card goes. In one column that is up or
 * down; once the grid has columns (from `sideways` up) the order runs right to left, so an
 * earlier place is to the right and a later one to the left.
 */
function MoveArrow({
  to,
  sideways,
}: {
  to: "earlier" | "later";
  sideways?: "sm" | "lg" | undefined;
}) {
  const Vertical = to === "earlier" ? ArrowUp : ArrowDown;
  if (!sideways) return <Vertical size={16} aria-hidden="true" />;
  const Horizontal = to === "earlier" ? ArrowRight : ArrowLeft;
  return (
    <>
      <Vertical
        size={16}
        aria-hidden="true"
        className={sideways === "sm" ? "sm:hidden" : "lg:hidden"}
      />
      <Horizontal
        size={16}
        aria-hidden="true"
        className={sideways === "sm" ? "hidden sm:block" : "hidden lg:block"}
      />
    </>
  );
}

export type OrderItem = { id: string; src: string; title: string; note?: string };

/**
 * Arranges what the homepage shows. The items themselves are chosen and edited elsewhere
 * (the service galleries); only their order is saved here.
 */
export function OrderList({
  items,
  onReorder,
  aspect,
  empty,
}: {
  items: OrderItem[];
  onReorder: (ids: string[]) => void;
  aspect: string;
  empty: string;
}) {
  if (items.length === 0) return <p className="admin-note">{empty}</p>;
  const move = (from: number, to: number) => {
    const ids = items.map((item) => item.id);
    const [id] = ids.splice(from, 1);
    if (id === undefined) return;
    ids.splice(to, 0, id);
    onReorder(ids);
  };
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <li key={item.id} className="flex flex-col gap-2 rounded-lg border border-ink/12 p-2">
          <div
            className="relative overflow-hidden rounded-md bg-beige"
            style={{ aspectRatio: aspect }}
          >
            <img src={item.src} alt="" className="size-full object-cover" />
            <span className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-ink/75 text-[13px] text-cream">
              {i + 1}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-ink">{item.title}</p>
              {item.note && <p className="text-[12.5px] leading-snug text-ink/65">{item.note}</p>}
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                className="admin-icon-btn"
                aria-label={`${item.title}: מקום מוקדם יותר`}
                disabled={i === 0}
                onClick={() => move(i, i - 1)}
              >
                <MoveArrow to="earlier" sideways="sm" />
              </button>
              <button
                type="button"
                className="admin-icon-btn"
                aria-label={`${item.title}: מקום מאוחר יותר`}
                disabled={i === items.length - 1}
                onClick={() => move(i, i + 1)}
              >
                <MoveArrow to="later" sideways="sm" />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
