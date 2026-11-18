// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  addEmail,
  isAllowed,
  listAdmins,
  parseOwners,
  removeEmail,
  type EmailStore,
} from "@/admin/auth/allowlist";
import { toBase64Url } from "@/admin/auth/encoding";
import { emailFromIdToken, googleAuthUrl, pkceChallenge } from "@/admin/auth/google";
import { readSession, signSession, signValue } from "@/admin/auth/session";

function memoryStore(): EmailStore {
  let emails: string[] = [];
  return {
    all: async () => emails,
    add: async (e) => void (emails = [...emails, e]),
    remove: async (e) => void (emails = emails.filter((x) => x !== e)),
  };
}

const OWNERS = parseOwners(" Merav@Example.com,  owner2@example.com , not-an-email");

describe("allowed emails", () => {
  it("reads the owners from the setting, normalized", () => {
    expect(OWNERS).toEqual(["merav@example.com", "owner2@example.com"]);
    expect(parseOwners(undefined)).toEqual([]);
  });

  it("lets in owners and added emails only", async () => {
    const store = memoryStore();
    expect(await isAllowed(store, OWNERS, "MERAV@example.com")).toBe(true);
    expect(await isAllowed(store, OWNERS, "helper@example.com")).toBe(false);
    await addEmail(store, OWNERS, "helper@example.com");
    expect(await isAllowed(store, OWNERS, "helper@example.com")).toBe(true);
    await expect(addEmail(store, OWNERS, "helper@example.com")).rejects.toThrow();
    await expect(addEmail(store, OWNERS, "merav@example.com")).rejects.toThrow();
    expect(await listAdmins(store, OWNERS)).toEqual([
      { email: "merav@example.com", owner: true },
      { email: "owner2@example.com", owner: true },
      { email: "helper@example.com", owner: false },
    ]);
  });

  it("removes added emails, but never an owner or yourself", async () => {
    const store = memoryStore();
    await addEmail(store, OWNERS, "helper@example.com");
    await addEmail(store, OWNERS, "other@example.com");
    await expect(
      removeEmail(store, OWNERS, "merav@example.com", "helper@example.com"),
    ).rejects.toThrow();
    await expect(
      removeEmail(store, OWNERS, "helper@example.com", "helper@example.com"),
    ).rejects.toThrow();
    await removeEmail(store, OWNERS, "helper@example.com", "merav@example.com");
    expect(await isAllowed(store, OWNERS, "helper@example.com")).toBe(false);
  });
});

describe("admin sessions", () => {
  const secret = "s".repeat(40);

  it("reads back a signed session until it expires", async () => {
    const now = Date.now();
    const token = await signSession(secret, "a@b.co", now);
    expect(await readSession(secret, token, now)).toMatchObject({ email: "a@b.co" });
    expect(await readSession(secret, token, now + 15 * 86400_000)).toBeNull();
  });

  it("refuses a session signed with another secret or edited", async () => {
    const token = await signSession(secret, "a@b.co");
    expect(await readSession("x".repeat(40), token)).toBeNull();
    const [, signature] = token.split(".");
    const forged = toBase64Url(
      new TextEncoder().encode(JSON.stringify({ email: "evil@b.co", exp: 9e9 })),
    );
    expect(await readSession(secret, `${forged}.${signature}`)).toBeNull();
    expect(await readSession(secret, undefined)).toBeNull();
    expect(await readSession(secret, "a.b.c")).toBeNull();
  });

  it("refuses another kind of signed value, such as the Google sign-in flow", async () => {
    const flow = await signValue(secret, { typ: "flow", email: "a@b.co", exp: 9e9 });
    expect(await readSession(secret, flow)).toBeNull();
    const untyped = await signValue(secret, { email: "a@b.co", exp: 9e9 });
    expect(await readSession(secret, untyped)).toBeNull();
  });
});

describe("Google sign-in", () => {
  const clientId = "client-123.apps.googleusercontent.com";
  const idToken = (claims: Record<string, unknown>) =>
    [
      "e30",
      toBase64Url(
        new TextEncoder().encode(
          JSON.stringify({
            iss: "https://accounts.google.com",
            aud: clientId,
            exp: Math.floor(Date.now() / 1000) + 3600,
            nonce: "n1",
            email: "Merav@Example.com",
            email_verified: true,
            ...claims,
          }),
        ),
      ),
      "sig",
    ].join(".");

  it("asks Google for the email only, with PKCE and a fresh account choice", async () => {
    const url = new URL(
      googleAuthUrl({
        clientId,
        redirectUri: "http://localhost:5174/admin/auth/callback",
        state: "s1",
        nonce: "n1",
        challenge: await pkceChallenge("verifier"),
      }),
    );
    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(url.searchParams.get("scope")).toBe("openid email");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("prompt")).toBe("select_account");
    // RFC 7636 example: verifier → challenge.
    expect(await pkceChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });

  it("takes the verified email from Google's token", () => {
    expect(emailFromIdToken(idToken({}), { clientId, nonce: "n1" })).toBe("merav@example.com");
  });

  it("refuses tokens for another app, another sign-in, expired or unverified", () => {
    const expected = { clientId, nonce: "n1" };
    expect(emailFromIdToken(idToken({ aud: "other-app" }), expected)).toBeNull();
    expect(emailFromIdToken(idToken({ nonce: "n2" }), expected)).toBeNull();
    expect(emailFromIdToken(idToken({ iss: "https://evil.example" }), expected)).toBeNull();
    expect(emailFromIdToken(idToken({ exp: 1 }), expected)).toBeNull();
    expect(emailFromIdToken(idToken({ email_verified: false }), expected)).toBeNull();
    expect(emailFromIdToken("garbage", expected)).toBeNull();
  });
});
