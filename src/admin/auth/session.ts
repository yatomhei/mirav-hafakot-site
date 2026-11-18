import { fromBase64Url, sameBytes, toBase64Url } from "./encoding";

// The sign-in cookie: whose Google account, and until when, signed with the site's secret
// (HMAC-SHA256). The email is checked against the allowed list on every request, so removing
// someone from the list signs them out at once.

/**
 * The cookie's name. On the live site (HTTPS) the __Host- prefix makes the browser refuse it
 * unless it is Secure, set for the whole site and from this exact host; plain HTTP on
 * localhost can't use the prefix.
 */
export const sessionCookieName = (secure: boolean) =>
  secure ? "__Host-mirav_admin" : "mirav_admin";
export const SESSION_DAYS = 7;
/** What a save or upload answers without a valid sign-in (the admin page recognizes it). */
export const SIGNED_OUT = "צריך להתחבר מחדש";

export interface Session {
  /** Which kind of signed value this is, so a sign-in cookie can't pass for another kind. */
  typ: "session";
  email: string;
  /** Expiry, in seconds since 1970. */
  exp: number;
}

const encoder = new TextEncoder();

export async function hmac(secret: string, text: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(text)));
}

/** "<data>.<signature>": data anyone can read but nobody can change without the secret. */
export async function signValue(secret: string, value: unknown) {
  const body = toBase64Url(encoder.encode(JSON.stringify(value)));
  return `${body}.${toBase64Url(await hmac(secret, body))}`;
}

export async function readSignedValue(secret: string, token: string | undefined) {
  if (!token) return null;
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra !== undefined) return null;
  try {
    if (!sameBytes(await hmac(secret, body), fromBase64Url(signature))) return null;
    return JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as unknown;
  } catch {
    return null;
  }
}

export function signSession(secret: string, email: string, now = Date.now()) {
  const session: Session = {
    typ: "session",
    email,
    exp: Math.floor(now / 1000) + SESSION_DAYS * 86400,
  };
  return signValue(secret, session);
}

/** The session when the cookie is genuine and not expired; otherwise null. */
export async function readSession(
  secret: string,
  token: string | undefined,
  now = Date.now(),
): Promise<Session | null> {
  const session = (await readSignedValue(secret, token)) as Partial<Session> | null;
  if (!session || session.typ !== "session") return null;
  if (typeof session.email !== "string" || typeof session.exp !== "number") return null;
  if (session.exp * 1000 <= now) return null;
  return { typ: "session", email: session.email, exp: session.exp };
}

/** A Set-Cookie header value. Always HttpOnly: page scripts never see sign-in cookies. */
export function serializeCookie(
  name: string,
  value: string,
  opts: { path: string; maxAge: number; sameSite: "Strict" | "Lax"; secure: boolean },
) {
  return [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${opts.path}`,
    `Max-Age=${opts.maxAge}`,
    `SameSite=${opts.sameSite}`,
    "HttpOnly",
    ...(opts.secure ? ["Secure"] : []),
  ].join("; ");
}
