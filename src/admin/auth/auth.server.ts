import { deleteCookie, getCookie } from "@tanstack/react-start/server";
import { localStoreEnabled } from "@/content/backend-config";
import { isAllowed, parseOwners, type EmailStore } from "./allowlist";
import { randomToken } from "./encoding";
import {
  sessionCookieName,
  SESSION_DAYS,
  SIGNED_OUT,
  readSession,
  serializeCookie,
  signSession,
} from "./session";

// Server side of the admin sign-in: the site's settings, where added emails are kept, the
// sign-in cookie, and the check every save and upload runs first.
//
// Settings (on this computer in .env.local, which git ignores; on Cloudflare as the Worker's
// variables and secrets):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET  from the OAuth client in Google Cloud Console
//   ADMIN_EMAILS                            the owners, comma separated
//   ADMIN_SESSION_SECRET                    long random text (live site only; made locally)

/** Local: .env.local, read on each call so edits apply without a restart. */
async function localSettings(): Promise<Record<string, string>> {
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  try {
    const text = await readFile(join(process.cwd(), ".env.local"), "utf8");
    const entries = text.split(/\r?\n/).flatMap((line) => {
      const match = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
      return match ? [[match[1]!, match[2]!.replace(/^(["'])(.*)\1$/, "$2")] as const] : [];
    });
    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

export async function setting(name: string): Promise<string | undefined> {
  const value = localStoreEnabled() ? (await localSettings())[name] : process.env[name];
  return value || undefined;
}

export async function ownerEmails() {
  return parseOwners(await setting("ADMIN_EMAILS"));
}

export async function googleSettings() {
  const [clientId, clientSecret] = await Promise.all([
    setting("GOOGLE_CLIENT_ID"),
    setting("GOOGLE_CLIENT_SECRET"),
  ]);
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

/** The text the sign-in cookies are signed with. */
export async function sessionSecret(): Promise<string | null> {
  if (!localStoreEnabled()) {
    const secret = process.env["ADMIN_SESSION_SECRET"];
    return secret && secret.length >= 32 ? secret : null;
  }
  // Local: a random secret made once and kept with the saved content.
  const { mkdir, readFile, writeFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const dir = join(process.cwd(), ".local-content");
  const file = join(dir, "admin-session-secret");
  try {
    return (await readFile(file, "utf8")).trim();
  } catch {
    const secret = randomToken();
    await mkdir(dir, { recursive: true });
    await writeFile(file, secret);
    return secret;
  }
}

/** Local development: added emails in a file next to the saved content (git-ignored). */
async function localEmailStore(): Promise<EmailStore> {
  const { mkdir, readFile, writeFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const dir = join(process.cwd(), ".local-content");
  const file = join(dir, "admin-emails.json");
  const all = async (): Promise<string[]> => {
    try {
      return JSON.parse(await readFile(file, "utf8")) as string[];
    } catch {
      return [];
    }
  };
  const write = async (emails: string[]) => {
    await mkdir(dir, { recursive: true });
    await writeFile(file, JSON.stringify(emails, null, 2));
  };
  return {
    all,
    add: async (email) => write([...new Set([...(await all()), email])]),
    remove: async (email) => write((await all()).filter((e) => e !== email)),
  };
}

/** Null until the live site has somewhere to keep the list (the D1 table, at deploy). */
export async function emailStore(): Promise<EmailStore | null> {
  return localStoreEnabled() ? localEmailStore() : null;
}

/** This site's sign-in cookie name (__Host- on the live site, see session.ts). */
const cookieName = () => sessionCookieName(!localStoreEnabled());

/** The sign-in cookie, set when Google confirms an allowed email. */
export async function sessionCookie(secret: string, email: string) {
  return serializeCookie(cookieName(), await signSession(secret, email), {
    path: "/",
    maxAge: SESSION_DAYS * 86400,
    sameSite: "Strict",
    secure: !localStoreEnabled(),
  });
}

export function endSession() {
  deleteCookie(cookieName(), { path: "/", secure: !localStoreEnabled() });
}

/** The signed-in admin's email while it is still on the allowed list; otherwise null. */
export async function currentAdmin(): Promise<string | null> {
  const [store, secret, owners] = await Promise.all([emailStore(), sessionSecret(), ownerEmails()]);
  if (!store || !secret) return null;
  const session = await readSession(secret, getCookie(cookieName()));
  if (!session) return null;
  return (await isAllowed(store, owners, session.email)) ? session.email : null;
}

/** Every save and upload calls this first: no valid sign-in, no change. */
export async function requireAdmin(): Promise<string> {
  const email = await currentAdmin();
  if (!email) throw new Error(SIGNED_OUT);
  return email;
}
