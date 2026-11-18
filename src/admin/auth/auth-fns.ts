import { createServerFn } from "@tanstack/react-start";
import { emailSchema, type Admin } from "./allowlist";

// What the admin page asks the server about signing in and the allowed list. Expected refusals
// (already on the list, an owner) come back as answers, not errors, so the page can say why.

const server = () => import("./auth.server");
const allowlist = () => import("./allowlist");

export type AdminState =
  /** Google sign-in isn't configured here yet; `missing` names what to add. */
  | { state: "unavailable"; missing: string[] }
  | { state: "signed-out" }
  | { state: "signed-in"; email: string };

export const getAdminState = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminState> => {
    const { emailStore, googleSettings, ownerEmails, sessionSecret, currentAdmin } = await server();
    const [store, google, owners, secret] = await Promise.all([
      emailStore(),
      googleSettings(),
      ownerEmails(),
      sessionSecret(),
    ]);
    const missing = [
      ...(google ? [] : ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]),
      ...(owners.length ? [] : ["ADMIN_EMAILS"]),
      ...(secret ? [] : ["ADMIN_SESSION_SECRET"]),
      ...(store ? [] : ["D1"]),
    ];
    if (missing.length) return { state: "unavailable", missing };
    const email = await currentAdmin();
    return email ? { state: "signed-in", email } : { state: "signed-out" };
  },
);

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const { endSession } = await server();
  endSession();
});

/** Every call below checks the sign-in first. */
async function signedIn() {
  const { emailStore, ownerEmails, requireAdmin } = await server();
  const email = await requireAdmin();
  const store = await emailStore();
  if (!store) throw new Error("ההתחברות עדיין לא פעילה באתר");
  return { email, store, owners: await ownerEmails() };
}

export const listAdmins = createServerFn({ method: "GET" }).handler(async (): Promise<Admin[]> => {
  const { store, owners } = await signedIn();
  const { listAdmins: list } = await allowlist();
  return list(store, owners);
});

export type ChangeAnswer = { ok: true } | { ok: false; message: string };

async function attempt(work: () => Promise<void>): Promise<ChangeAnswer> {
  try {
    await work();
    return { ok: true };
  } catch (caught) {
    return { ok: false, message: caught instanceof Error ? caught.message : String(caught) };
  }
}

export const allowEmail = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string }) => input)
  .handler(async ({ data }): Promise<ChangeAnswer> => {
    const { store, owners } = await signedIn();
    const parsed = emailSchema.safeParse(data.email);
    if (!parsed.success) return { ok: false, message: "כתובת המייל לא תקינה" };
    const { addEmail } = await allowlist();
    return attempt(() => addEmail(store, owners, parsed.data));
  });

export const disallowEmail = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string }) => input)
  .handler(async ({ data }): Promise<ChangeAnswer> => {
    const { email: me, store, owners } = await signedIn();
    const parsed = emailSchema.safeParse(data.email);
    if (!parsed.success) return { ok: false, message: "כתובת המייל לא תקינה" };
    const { removeEmail } = await allowlist();
    return attempt(() => removeEmail(store, owners, parsed.data, me));
  });
