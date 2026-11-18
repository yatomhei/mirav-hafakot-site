import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { ExternalLink, LogOut, RotateCcw, Save, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContent } from "@/content/context";
import {
  DOC_KEYS,
  defaultContent,
  getDoc,
  setDoc,
  validateDoc,
  type SiteContent,
} from "@/content/docs";
import type { DocKey } from "@/content/schema";
import { getBackend, type AdminBackend } from "./backend";
import { Doc, DraftContext } from "./fields";
import { TABS } from "./tabs";
import { getAdminState, signOut, type AdminState } from "./auth/auth-fns";
import { LoginScreen, UnavailableScreen } from "./auth/SignIn";
import { AdminsPanel } from "./auth/AdminsPanel";
import { SIGNED_OUT } from "./auth/session";

/**
 * The content editor: one tab per section, one Save for all changes. Admins sign in with a
 * Google account on the allowed list (auth/), and the server checks the sign-in again on every
 * save and upload.
 */
export function AdminApp() {
  const [backend, setBackend] = useState<AdminBackend | null | undefined>(undefined);
  const [auth, setAuth] = useState<AdminState | "error" | undefined>(undefined);
  // Why the last Google sign-in came back without signing in (see google.server.ts).
  const [reason, setReason] = useState<string>();
  const checkAuth = () =>
    getAdminState()
      .then(setAuth)
      .catch(() => setAuth("error"));
  useEffect(() => {
    const url = new URL(window.location.href);
    const signin = url.searchParams.get("signin");
    if (signin) {
      setReason(signin);
      url.searchParams.delete("signin");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
    const found = getBackend();
    setBackend(found);
    if (found) void checkAuth();
  }, []);

  if (backend === undefined || (backend && auth === undefined)) {
    return (
      <Screen>
        <p className="text-ink/65">טוען…</p>
      </Screen>
    );
  }
  if (backend === null) {
    return (
      <Screen>
        <p className="max-w-sm text-center text-ink">ממשק הניהול עדיין לא מחובר לאחסון באתר.</p>
      </Screen>
    );
  }
  if (auth === "error") {
    return (
      <Screen>
        <p className="max-w-sm text-center text-ink">משהו השתבש. כדאי לרענן את הדף.</p>
      </Screen>
    );
  }
  if (auth?.state === "unavailable") {
    return <UnavailableScreen missing={backend.local ? auth.missing : undefined} />;
  }
  if (auth?.state !== "signed-in") return <LoginScreen reason={reason} />;
  return <Dashboard backend={backend} me={auth.email} onSignedOut={checkAuth} />;
}

/** The admins tab: not a content section, so it sits after the section tabs. */
const ADMINS_TAB = "admins";

function Screen({ children }: { children: ReactNode }) {
  return (
    <main dir="rtl" className="flex min-h-dvh items-center justify-center bg-cream px-4">
      {children}
    </main>
  );
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Turns a schema problem into something Merav can act on. */
function describeIssue(
  key: DocKey,
  issue: { path: PropertyKey[]; code: string; message: string; origin?: string },
  currentTab: string,
) {
  // A record can sit in two tabs (the services); name the open one when it is one of them.
  const tabs = TABS.filter((t) => t.docs.some((d) => d.key === key));
  const tab = (tabs.find((t) => t.key === currentTab) ?? tabs[0])?.label ?? key;
  const last = issue.path[issue.path.length - 1];
  if (last === "whatsapp") return `${tab}: מספר הוואטסאפ צריך להכיל ספרות בלבד, למשל 972501234567`;
  if (last === "youtubeId") return `${tab}: לאחד הסרטונים חסר קישור תקין ליוטיוב`;
  if (["youtubeUrl", "facebookUrl", "instagramUrl", "tiktokUrl"].includes(String(last))) {
    return `${tab}: הקישור צריך להתחיל ב־https://`;
  }
  if (last === "name") return `${tab}: חסרה תמונה`;
  // A multi-line heading: more lines than the design holds, or left empty.
  if (["title", "lead", "ctaText", "body"].includes(String(last)) && issue.origin === "array") {
    return `${tab}: ${issue.message}`;
  }
  if (issue.code === "too_big") return `${tab}: אחד הטקסטים ארוך מדי`;
  if (issue.code === "too_small") return `${tab}: צריך להשאיר לפחות פריט אחד ברשימה`;
  return `${tab}: ${issue.message}`;
}

function Dashboard({
  backend,
  me,
  onSignedOut,
}: {
  backend: AdminBackend;
  me: string;
  onSignedOut: () => void;
}) {
  const router = useRouter();
  const loaded = useContent();
  const [baseline, setBaseline] = useState<SiteContent>(loaded);
  const [draft, setDraft] = useState<SiteContent>(loaded);
  const [tabKey, setTabKey] = useState(TABS[0]?.key ?? "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const dirtyDocs = useMemo(
    () => DOC_KEYS.filter((key) => !same(getDoc(draft, key), getDoc(baseline, key))),
    [draft, baseline],
  );
  const dirty = dirtyDocs.length > 0;

  // Leaving with unsaved changes asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    const problems = dirtyDocs.flatMap((key) => {
      const result = validateDoc(key, getDoc(draft, key));
      return result.success
        ? []
        : result.error.issues.slice(0, 3).map((i) => describeIssue(key, i, tabKey));
    });
    setErrors([...new Set(problems)]);
    // The list of what to fix sits at the top; bring it into view (Save may be at the bottom).
    if (problems.length) return window.scrollTo({ top: 0, behavior: "smooth" });

    setSaving(true);
    try {
      await backend.save(Object.fromEntries(dirtyDocs.map((key) => [key, getDoc(draft, key)])));
      setBaseline(draft);
      setSavedAt(new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }));
      await router.invalidate();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);
      // Signed out meanwhile (a new password elsewhere, or the session ran out): the changes
      // stay on screen, and signing in again in another tab lets this one save them.
      setErrors([
        message === SIGNED_OUT
          ? "החיבור לניהול נותק. כדי לא לאבד את השינויים: פותחים את ניהול האתר בלשונית חדשה, נכנסים שם, וחוזרים לכאן ללחוץ על שמירה"
          : `השמירה נכשלה: ${message}`,
      ]);
    } finally {
      setSaving(false);
    }
  }

  /** Back to the last saved version. Asks first: it drops the edits in every tab. */
  function discard() {
    if (!window.confirm("לבטל את כל השינויים שלא נשמרו, בכל הלשוניות?")) return;
    setDraft(baseline);
    setErrors([]);
  }

  async function leave() {
    if (dirty && !window.confirm("יש שינויים שלא נשמרו. לצאת בכל זאת?")) return;
    await signOut();
    onSignedOut();
  }

  const onAdmins = tabKey === ADMINS_TAB;
  const tab = onAdmins ? undefined : (TABS.find((t) => t.key === tabKey) ?? TABS[0]);
  const tabDirty = (key: string) =>
    TABS.find((t) => t.key === key)?.docs.some((d) => dirtyDocs.includes(d.key)) ?? false;

  return (
    <div dir="rtl" className="admin min-h-dvh bg-cream pb-24 text-ink">
      <header className="top-0 z-20 border-b border-ink/12 bg-white sm:sticky">
        <div className="mx-auto flex w-[min(1000px,calc(100%-32px))] flex-wrap items-center gap-x-3 gap-y-2 py-3">
          <h1 className="text-[22px] font-medium">ניהול האתר</h1>
          {backend.local && (
            <span className="rounded bg-olive-soft px-2 py-0.5 text-[12.5px]">
              מצב פיתוח: נשמר במחשב הזה בלבד
            </span>
          )}
          <div className="ms-auto flex flex-wrap items-center gap-2">
            <span className="text-[13.5px] text-ink/65" aria-live="polite">
              {dirty ? "יש שינויים שלא נשמרו" : savedAt ? `נשמר ב־${savedAt}` : ""}
            </span>
            <button
              type="button"
              className="admin-btn"
              disabled={!dirty || saving}
              onClick={discard}
            >
              <RotateCcw size={16} aria-hidden="true" />
              <span className="max-sm:sr-only">ביטול שינויים</span>
            </button>
            <button
              type="button"
              className="admin-btn-primary"
              disabled={!dirty || saving}
              onClick={save}
            >
              <Save size={16} aria-hidden="true" />
              {saving ? "שומר…" : "שמירה"}
            </button>
            <a href="/" target="_blank" rel="noopener noreferrer" className="admin-btn">
              <ExternalLink size={16} aria-hidden="true" />
              <span className="max-sm:sr-only">צפייה באתר</span>
            </a>
            <button type="button" className="admin-btn" onClick={() => void leave()} title={me}>
              <LogOut size={16} aria-hidden="true" />
              <span className="max-sm:sr-only">יציאה</span>
            </button>
          </div>
        </div>

        <nav
          aria-label="אזורי האתר"
          className="mx-auto flex w-[min(1000px,calc(100%-32px))] gap-1 overflow-x-auto pb-2"
        >
          {TABS.map((item, index) => (
            <span key={item.key} className="flex shrink-0 items-center gap-1">
              {index > 0 && TABS[index - 1]?.group !== item.group && (
                <span aria-hidden="true" className="mx-1 h-5 w-px bg-ink/15" />
              )}
              <button
                type="button"
                aria-current={item.key === tab?.key ? "page" : undefined}
                onClick={() => setTabKey(item.key)}
                className={cn(
                  "relative cursor-pointer rounded-md px-3 py-2 text-[14.5px] whitespace-nowrap transition-colors",
                  item.key === tab?.key ? "bg-olive-deep text-cream" : "hover:bg-ink/5",
                )}
              >
                {item.label}
                {tabDirty(item.key) && (
                  <span
                    className="absolute top-1.5 left-1.5 size-1.5 rounded-full bg-red-600"
                    aria-label="(לא נשמר)"
                  />
                )}
              </button>
            </span>
          ))}
          <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 self-center bg-ink/15" />
          <button
            type="button"
            aria-current={onAdmins ? "page" : undefined}
            onClick={() => setTabKey(ADMINS_TAB)}
            className={cn(
              "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-[14.5px] whitespace-nowrap transition-colors",
              onAdmins ? "bg-olive-deep text-cream" : "hover:bg-ink/5",
            )}
          >
            <Users size={15} aria-hidden="true" />
            מנהלים
          </button>
        </nav>
      </header>

      <main className="mx-auto mt-6 flex w-[min(1000px,calc(100%-32px))] flex-col gap-5">
        {errors.length > 0 && (
          <div
            role="alert"
            className="rounded-xl border border-red-300 bg-red-50 p-4 text-[14px] text-red-800"
          >
            <p className="font-medium">לא נשמר. צריך לתקן:</p>
            <ul className="mt-1 list-disc ps-5">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {onAdmins && <AdminsPanel me={me} />}

        <DraftContext.Provider
          value={{
            draft,
            update: (key, value) => setDraft((current) => setDoc(current, key, value)),
          }}
        >
          {tab?.docs.map((doc) => (
            <Doc
              key={`${tab.key}-${doc.key}`}
              backend={backend}
              value={getDoc(draft, doc.key)}
              onChange={(next) => setDraft((current) => setDoc(current, doc.key, next))}
            >
              <div className="flex flex-col gap-5">{doc.render()}</div>
            </Doc>
          ))}
        </DraftContext.Provider>

        {tab?.key === "settings" && (
          <section className="rounded-xl border border-ink/12 bg-white p-4 sm:p-6">
            <h2 className="text-[18px] font-medium">חזרה לתוכן המקורי</h2>
            <p className="mt-1 text-[13.5px] text-ink/65">
              מחזיר את כל הטקסטים, התמונות והסרטונים באתר למצב שבו האתר עלה. השינוי נכנס לתוקף רק
              אחרי לחיצה על שמירה.
            </p>
            <button
              type="button"
              className="admin-btn mt-4 text-red-700"
              onClick={() => {
                if (window.confirm("להחזיר את כל התוכן למצב המקורי?")) setDraft(defaultContent);
              }}
            >
              <RotateCcw size={16} aria-hidden="true" />
              החזרת כל התוכן למקור
            </button>
          </section>
        )}
      </main>

      {/* Phones: the header scrolls away, so Save waits at the bottom while there are changes. */}
      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-2 border-t border-ink/12 bg-white px-4 py-3 sm:hidden">
          <span className="text-[13.5px] text-ink/65">יש שינויים שלא נשמרו</span>
          <button
            type="button"
            className="admin-btn ms-auto"
            disabled={saving}
            aria-label="ביטול שינויים"
            onClick={discard}
          >
            <RotateCcw size={16} aria-hidden="true" />
          </button>
          <button type="button" className="admin-btn-primary" disabled={saving} onClick={save}>
            <Save size={16} aria-hidden="true" />
            {saving ? "שומר…" : "שמירה"}
          </button>
        </div>
      )}
    </div>
  );
}
