import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Trash2, UserPlus } from "lucide-react";
import type { Admin } from "./allowlist";
import { allowEmail, disallowEmail, listAdmins } from "./auth-fns";

/**
 * The admins tab: the Google accounts that can sign in. The site's owners are fixed in its
 * settings; anyone signed in can add or remove the others.
 */
export function AdminsPanel({ me }: { me: string }) {
  const [admins, setAdmins] = useState<Admin[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setAdmins(await listAdmins());
      setLoadError("");
    } catch {
      setLoadError("לא הצלחנו לטעון את רשימת המנהלים. כדאי לרענן את הדף");
    }
  }, []);
  useEffect(() => void refresh(), [refresh]);

  async function remove(email: string) {
    if (!window.confirm(`להסיר את ${email}? הוא/היא לא יוכל/תוכל יותר להיכנס לניהול האתר.`)) return;
    setError("");
    const answer = await disallowEmail({ data: { email } });
    if (answer.ok) setNotice(`${email} הוסר/ה מהרשימה`);
    else setError(answer.message);
    await refresh();
  }

  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") ?? "")
      .trim()
      .toLowerCase();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const answer = await allowEmail({ data: { email } });
      if (answer.ok) {
        form.reset();
        setNotice(`${email} נוסף/ה. מעכשיו אפשר להיכנס עם חשבון ה־Google הזה`);
        await refresh();
      } else setError(answer.message);
    } catch {
      setError("משהו השתבש. כדאי לנסות שוב");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-ink/12 bg-white p-4 sm:p-6">
      <h2 className="text-[18px] font-medium">מנהלי האתר</h2>
      <p className="mt-1 text-[13.5px] leading-snug text-ink/65">
        חשבונות Google שיכולים להיכנס ולערוך את האתר. מי שמוסר/ת מהרשימה מנותק/ת מיד.
      </p>
      {loadError && <p className="mt-3 text-[14px] text-red-700">{loadError}</p>}
      <ul className="mt-4 flex flex-col divide-y divide-ink/10 border-y border-ink/10">
        {admins?.map(({ email, owner }) => (
          <li key={email} className="flex min-h-14 flex-wrap items-center gap-2 py-2">
            <span dir="ltr" className="text-[15px] font-medium">
              {email}
            </span>
            {email === me && (
              <span className="rounded bg-olive-soft px-2 py-0.5 text-[12.5px]">את/ה</span>
            )}
            {owner ? (
              <span className="ms-auto text-[12.5px] text-ink/60">בעלי האתר</span>
            ) : (
              email !== me && (
                <button
                  type="button"
                  className="admin-btn ms-auto text-red-700"
                  onClick={() => void remove(email)}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  <span className="max-sm:sr-only">הסרה</span>
                </button>
              )
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="mt-5">
        <label htmlFor="add-admin" className="mb-1 block text-[14px] font-medium">
          הוספת מנהל
        </label>
        <p className="mb-2 text-[13px] text-ink/65">
          המייל של חשבון ה־Google שלו (לא חייב להיות Gmail)
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            id="add-admin"
            name="email"
            type="email"
            required
            dir="ltr"
            autoComplete="off"
            className="admin-input min-w-0 flex-1 basis-60"
          />
          <button type="submit" className="admin-btn-primary" disabled={busy}>
            <UserPlus size={16} aria-hidden="true" />
            {busy ? "מוסיף…" : "הוספה"}
          </button>
        </div>
      </form>
      <p className="mt-3 text-[14px]" role="status" aria-live="polite">
        {notice}
      </p>
      {error && (
        <p role="alert" className="mt-1 text-[14px] font-medium text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
