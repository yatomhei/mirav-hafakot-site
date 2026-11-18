import { localStoreEnabled } from "@/content/backend-config";
import { isAllowed } from "./allowlist";
import {
  emailStore,
  googleSettings,
  ownerEmails,
  sessionCookie,
  sessionSecret,
} from "./auth.server";
import { randomToken } from "./encoding";
import {
  CALLBACK_PATH,
  GOOGLE_TOKEN_URL,
  emailFromIdToken,
  googleAuthUrl,
  pkceChallenge,
} from "./google";
import { readSignedValue, serializeCookie, signValue } from "./session";

// The two steps of signing in with Google, run by the /admin/auth/google and
// /admin/auth/callback addresses. Between them, a short-lived signed cookie remembers what
// this browser started, so a code that arrives from anywhere else is ignored.

const FLOW_COOKIE = "mirav_google";
const FLOW_MINUTES = 10;

interface Flow {
  state: string;
  nonce: string;
  verifier: string;
  exp: number;
}

const secure = () => !localStoreEnabled();

/** A redirect that also sets cookies. */
function redirect(location: string, cookies: string[] = []) {
  const headers = new Headers({ Location: location, "Cache-Control": "no-store" });
  for (const cookie of cookies) headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 302, headers });
}

/** Back to the admin, optionally with a reason the sign-in screen explains. */
const back = (origin: string, error?: string, cookies: string[] = []) =>
  redirect(`${origin}/admin${error ? `?signin=${error}` : ""}`, cookies);

/** Ends the in-between cookie. */
const clearFlow = () =>
  serializeCookie(FLOW_COOKIE, "", {
    path: "/admin/auth",
    maxAge: 0,
    sameSite: "Lax",
    secure: secure(),
  });

const redirectUri = (origin: string) => `${origin}${CALLBACK_PATH}`;

export async function startGoogleSignIn(request: Request) {
  const origin = new URL(request.url).origin;
  const [google, secret] = await Promise.all([googleSettings(), sessionSecret()]);
  if (!google || !secret) return back(origin, "unavailable");

  const flow: Flow = {
    state: randomToken(),
    nonce: randomToken(),
    verifier: randomToken(48),
    exp: Date.now() + FLOW_MINUTES * 60000,
  };
  // Lax, not Strict: the browser must send it back when Google redirects here.
  const cookie = serializeCookie(FLOW_COOKIE, await signValue(secret, flow), {
    path: "/admin/auth",
    maxAge: FLOW_MINUTES * 60,
    sameSite: "Lax",
    secure: secure(),
  });
  const url = googleAuthUrl({
    clientId: google.clientId,
    redirectUri: redirectUri(origin),
    state: flow.state,
    nonce: flow.nonce,
    challenge: await pkceChallenge(flow.verifier),
  });
  return redirect(url, [cookie]);
}

export async function finishGoogleSignIn(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const [google, secret, store, owners] = await Promise.all([
    googleSettings(),
    sessionSecret(),
    emailStore(),
    ownerEmails(),
  ]);
  if (!google || !secret || !store) return back(origin, "unavailable");

  const flow = (await readSignedValue(secret, readCookie(request, FLOW_COOKIE))) as Flow | null;
  const done = [clearFlow()];
  // Cancelled on Google's screen.
  if (url.searchParams.get("error")) return back(origin, undefined, done);
  const code = url.searchParams.get("code");
  if (!flow || !code || flow.exp < Date.now() || url.searchParams.get("state") !== flow.state) {
    return back(origin, "expired", done);
  }

  let idToken: string | undefined;
  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: google.clientId,
        client_secret: google.clientSecret,
        redirect_uri: redirectUri(origin),
        grant_type: "authorization_code",
        code_verifier: flow.verifier,
      }),
    });
    if (response.ok) idToken = ((await response.json()) as { id_token?: string }).id_token;
    else console.error("Google sign-in: token exchange failed", response.status);
  } catch (error) {
    console.error("Google sign-in: token exchange failed", error);
  }
  const email = idToken
    ? emailFromIdToken(idToken, { clientId: google.clientId, nonce: flow.nonce })
    : null;
  if (!email) return back(origin, "failed", done);
  if (!(await isAllowed(store, owners, email))) return back(origin, "not-allowed", done);

  return back(origin, undefined, [...done, await sessionCookie(secret, email)]);
}

function readCookie(request: Request, name: string) {
  for (const part of (request.headers.get("cookie") ?? "").split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq) === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return undefined;
}
