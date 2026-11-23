// Where saved content lives: in local development the admin writes to files on this computer
// (see dev-store.server.ts) and the site reads them back. On the live site, Cloudflare D1
// (content and admins) and R2 (photos and videos); see cloudflare.server.ts.

/** Local development: the admin saves to files on this computer. */
export const localStoreEnabled = () => import.meta.env.DEV;
