import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

// The content editor. Never indexed, not linked from the site, and loaded only here (its
// code stays out of the public pages). On the live site Cloudflare Access guards /admin.
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "ניהול האתר" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: lazyRouteComponent(() => import("@/admin/AdminApp"), "AdminApp"),
});
