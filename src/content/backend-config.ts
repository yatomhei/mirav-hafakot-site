// Where saved content lives. For now only local development saves anything: the admin
// writes to files on this computer (see dev-store.server.ts) and the site reads them back.
// At deploy, Cloudflare D1 (content and admins) and R2 (images) take over.

/** Local development: the admin saves to files on this computer. */
export const localStoreEnabled = () => import.meta.env.DEV;
