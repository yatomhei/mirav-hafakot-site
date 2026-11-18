import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

// The content editor. Never indexed, not linked from the site, and loaded only here (its
// code stays out of the public pages). Admins sign in with email and password (src/admin/auth),
// and every save and upload checks that sign-in on the server.
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "ניהול האתר" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: lazyRouteComponent(() => import("@/admin/AdminApp"), "AdminApp"),
});
