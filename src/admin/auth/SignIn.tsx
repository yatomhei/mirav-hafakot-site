import type { ReactNode } from "react";
import { image } from "@/lib/asset";

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main
      dir="rtl"
      className="admin flex min-h-dvh items-center justify-center bg-cream px-4 py-10"
    >
      <div className="w-full max-w-[400px] rounded-xl border border-ink/12 bg-white p-6 sm:p-8">
        <img
          src={image("logo-color.webp")}
          alt=""
          width={96}
          height={48}
          className="mb-5 h-12 w-auto"
        />
        <h1 className="text-[22px] font-medium text-ink">{title}</h1>
        <div className="mt-4">{children}</div>
      </div>
    </main>
  );
}

/** Why the last attempt came back without signing in (?signin= from the callback). */
const REASONS: Record<string, string> = {
  "not-allowed":
    "לחשבון Google הזה אין גישה לניהול האתר. אפשר לנסות עם חשבון אחר, או לבקש ממנהל להוסיף אותו.",
  expired: "הכניסה לקחה יותר מדי זמן. כדאי לנסות שוב.",
  failed: "Google לא אישר את הכניסה. כדאי לנסות שוב בעוד רגע.",
  unavailable: "הכניסה עם Google עדיין לא מוגדרת באתר.",
};

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 7l7.4 5.7c4.3-4 6.9-9.9 6.9-17.2z"
      />
      <path
        fill="#FBBC05"
        d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.9-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

export function LoginScreen({ reason }: { reason?: string | undefined }) {
  const message = reason ? REASONS[reason] : undefined;
  return (
    <Shell title="כניסה לניהול האתר">
      <p className="text-[14px] leading-snug text-ink/65">
        נכנסים עם חשבון Google שקיבל גישה לניהול האתר.
      </p>
      {message && (
        <p role="alert" className="mt-4 text-[14px] font-medium text-red-700">
          {message}
        </p>
      )}
      {/* A full page visit, not a client-side link: the server sends the browser to Google. */}
      <a
        href="/admin/auth/google"
        className="mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-ink/20 bg-white px-4 text-[15.5px] font-medium text-ink transition-colors hover:bg-ink/5"
      >
        <GoogleMark />
        כניסה עם Google
      </a>
    </Shell>
  );
}

/** Google sign-in isn't configured yet. Locally, names the settings that are missing. */
export function UnavailableScreen({ missing }: { missing?: string[] | undefined }) {
  return (
    <Shell title="ניהול האתר">
      <p className="text-[14px] leading-snug text-ink">הכניסה עם Google עדיין לא מוגדרת באתר.</p>
      {missing && missing.length > 0 && (
        <p className="mt-3 text-[13.5px] leading-snug text-ink/65">
          חסר בקובץ <code dir="ltr">.env.local</code>:{" "}
          <span dir="ltr" className="font-mono text-[12.5px]">
            {missing.join(", ")}
          </span>
        </p>
      )}
    </Shell>
  );
}
