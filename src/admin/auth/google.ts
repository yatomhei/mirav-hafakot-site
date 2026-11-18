import { toBase64Url } from "./encoding";

// "Sign in with Google" (OpenID Connect, authorization code with PKCE). The site sends the
// visitor to Google, Google sends them back to /admin/auth/callback with a one-time code, and
// the server trades that code with Google for the visitor's verified email.

export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const CALLBACK_PATH = "/admin/auth/callback";

export async function pkceChallenge(verifier: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return toBase64Url(new Uint8Array(digest));
}

export function googleAuthUrl(opts: {
  clientId: string;
  redirectUri: string;
  state: string;
  nonce: string;
  challenge: string;
}) {
  const url = new URL(GOOGLE_AUTH_URL);
  url.search = new URLSearchParams({
    client_id: opts.clientId,
    redirect_uri: opts.redirectUri,
    response_type: "code",
    scope: "openid email",
    state: opts.state,
    nonce: opts.nonce,
    code_challenge: opts.challenge,
    code_challenge_method: "S256",
    // Always ask which account, so a different Google account can be picked.
    prompt: "select_account",
  }).toString();
  return url.toString();
}

/** The middle part of a JWT, read as JSON. */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const binary = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const json = new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * The verified email in Google's ID token, or null. The token comes straight from Google's
 * token address over HTTPS, in answer to the server's own request, which Google documents as
 * enough to trust it without checking its signature; its fields are still checked here.
 */
export function emailFromIdToken(
  idToken: string,
  expected: { clientId: string; nonce: string },
  now = Date.now(),
): string | null {
  const claims = decodeJwtPayload(idToken);
  if (!claims) return null;
  const issuerOk =
    claims["iss"] === "https://accounts.google.com" || claims["iss"] === "accounts.google.com";
  const aud = claims["aud"];
  const audienceOk =
    aud === expected.clientId || (Array.isArray(aud) && aud.includes(expected.clientId));
  const exp = claims["exp"];
  const fresh = typeof exp === "number" && exp * 1000 > now;
  const email = claims["email"];
  if (!issuerOk || !audienceOk || !fresh || claims["nonce"] !== expected.nonce) return null;
  if (claims["email_verified"] !== true || typeof email !== "string" || !email) return null;
  return email.trim().toLowerCase();
}
