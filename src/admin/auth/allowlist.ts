import { z } from "zod";

// Who may open the admin: Google accounts by email. The owners come from the site's settings
// (ADMIN_EMAILS) and can't be removed in the admin, so the list never ends up empty; anyone
// signed in can add or remove the other emails.

/** Where the added emails are kept: a file on this computer now, Cloudflare D1 at deploy. */
export interface EmailStore {
  all(): Promise<string[]>;
  add(email: string): Promise<void>;
  remove(email: string): Promise<void>;
}

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("כתובת המייל לא תקינה").max(200));

/** "a@x.com, B@y.com" → ["a@x.com", "b@y.com"], skipping anything that isn't an email. */
export function parseOwners(setting: string | undefined) {
  return (setting ?? "")
    .split(/[,\s]+/)
    .map((e) => emailSchema.safeParse(e))
    .flatMap((r) => (r.success ? [r.data] : []));
}

export interface Admin {
  email: string;
  owner: boolean;
}

export async function listAdmins(store: EmailStore, owners: string[]): Promise<Admin[]> {
  const added = (await store.all()).filter((e) => !owners.includes(e));
  return [
    ...owners.map((email) => ({ email, owner: true })),
    ...added.sort().map((email) => ({ email, owner: false })),
  ];
}

export async function isAllowed(store: EmailStore, owners: string[], email: string) {
  const normal = email.trim().toLowerCase();
  return owners.includes(normal) || (await store.all()).includes(normal);
}

export async function addEmail(store: EmailStore, owners: string[], email: string) {
  if (await isAllowed(store, owners, email)) throw new Error("המייל הזה כבר ברשימה");
  await store.add(email);
}

export async function removeEmail(store: EmailStore, owners: string[], email: string, by: string) {
  if (owners.includes(email)) throw new Error("את בעלי האתר אי אפשר להסיר כאן");
  if (email === by) throw new Error("אי אפשר להסיר את עצמך");
  if (!(await store.all()).includes(email)) throw new Error("המייל הזה לא ברשימה");
  await store.remove(email);
}
