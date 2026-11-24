import { useSyncExternalStore } from "react";

/**
 * Ad measurement on the landing page: the visitor's consent, and the Meta and Google Ads pixels
 * that load only after it. Nothing here runs unless the admin has an ID set, and no pixel
 * loads before the visitor agrees. The choice is kept in this browser (not a cookie) and can be
 * changed from the page's footer.
 */

export type AdsIds = { metaPixelId: string; googleAdsId: string; googleAdsLabel: string };
export type Consent = "granted" | "denied";

const KEY = "mirav-ads-consent";

/** Whether any platform is switched on in the admin. */
export const adsEnabled = (ids: AdsIds) => Boolean(ids.metaPixelId.trim() || ids.googleAdsId.trim());

// ---------- The visitor's choice ----------

const listeners = new Set<() => void>();
/** Set when the visitor asks to see the banner again (the footer's "cookie settings"). */
let reopened = false;

function readConsent(): Consent | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null; // Storage blocked: ask on every visit, load nothing until asked.
  }
}

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The visitor's saved choice, and whether the banner should show. Null on the server. */
export function useConsent() {
  const consent = useSyncExternalStore(subscribe, readConsent, () => null);
  const open = useSyncExternalStore(
    subscribe,
    () => reopened || readConsent() === null,
    () => false,
  );
  return { consent, open };
}

/** Cookies the pixels leave (Meta's _fbp, Google's _gcl_*), removed when consent is withdrawn. */
const AD_COOKIES = /^(_fbp|_fbc|_gcl_\w+)$/;

function clearAdCookies() {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.replace(/^www\./, "")}`];
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0]?.trim();
    if (!name || !AD_COOKIES.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

export function setConsent(choice: Consent) {
  const before = readConsent();
  try {
    window.localStorage.setItem(KEY, choice);
  } catch {
    // Storage blocked: the choice holds for this page view only.
  }
  reopened = false;
  notify();
  // A pixel that already ran can't be unloaded: clear its cookies and start the page afresh.
  if (choice === "denied" && before === "granted") {
    clearAdCookies();
    window.location.reload();
  }
}

/** Shows the banner again, to change the choice. */
export function reopenConsent() {
  reopened = true;
  notify();
}

// ---------- The pixels ----------

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: Fbq;
  loaded: boolean;
  version: string;
  disablePushState?: boolean;
};
type AdsWindow = Window & { fbq?: Fbq; _fbq?: Fbq; dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };

let loaded: AdsIds | null = null;

function addScript(src: string) {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

/** Meta's standard pixel snippet, without inline script (so the content policy stays strict). */
function loadMeta(id: string) {
  const w = window as AdsWindow;
  if (!w.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    // Only this page: no page views when the visitor moves on to the rest of the site.
    fbq.disablePushState = true;
    w.fbq = fbq;
    w._fbq = fbq;
    addScript("https://connect.facebook.net/en_US/fbevents.js");
  }
  w.fbq("init", id);
  w.fbq("track", "PageView");
}

function loadGoogle(id: string) {
  const w = window as AdsWindow;
  if (!w.gtag) {
    w.dataLayer = w.dataLayer ?? [];
    w.gtag = function () {
      // gtag reads the arguments object itself, as Google's snippet passes it.
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
    w.gtag("js", new Date());
    addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
  }
  w.gtag("config", id);
}

/** Loads the pixels that have an ID (once per page view). Call only after consent. */
export function loadPixels(ids: AdsIds) {
  if (loaded) return;
  loaded = { ...ids };
  const meta = ids.metaPixelId.trim();
  const google = ids.googleAdsId.trim();
  if (meta) loadMeta(meta);
  if (google) loadGoogle(google);
}

/**
 * A contact from the page (the form opened WhatsApp, or the WhatsApp button): Meta's "Lead" and
 * the Google Ads conversion. Does nothing unless the pixels were loaded with consent.
 */
export function trackLead() {
  if (!loaded) return;
  const w = window as AdsWindow;
  if (loaded.metaPixelId && w.fbq) w.fbq("track", "Lead");
  const google = loaded.googleAdsId.trim();
  const label = loaded.googleAdsLabel.trim();
  if (google && label && w.gtag) w.gtag("event", "conversion", { send_to: `${google}/${label}` });
}

/** A tap on the phone number: Meta's "Contact" event. */
export function trackCall() {
  if (!loaded) return;
  const w = window as AdsWindow;
  if (loaded.metaPixelId && w.fbq) w.fbq("track", "Contact");
}
