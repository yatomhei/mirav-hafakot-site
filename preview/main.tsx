// Shareable preview: the real routes and components, rendered in the browser alone (no
// server), for a claude.ai page the client can open. Navigation stays in memory, so links
// work wherever the page is hosted and a reload simply starts again at the homepage.
import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";

import "@/styles.css";
import { routeTree } from "@/routeTree.gen";
import { Route as RootRoute } from "@/routes/__root";

// The root route's shell renders <html>/<head>/<body> for server rendering; here the page
// already has them, so the shell just passes its children through.
(
  RootRoute.options as { shellComponent?: (p: { children: ReactNode }) => ReactNode }
).shellComponent = ({ children }) => <>{children}</>;

const router = createRouter({
  routeTree,
  history: createMemoryHistory({ initialEntries: ["/"] }),
  context: { queryClient: new QueryClient() },
  scrollRestoration: true,
});

// In-page anchors (#contact) are handled by the browser; route changes scroll to the top.
router.subscribe("onResolved", ({ toLocation, fromLocation }) => {
  if (toLocation.pathname !== fromLocation?.pathname && !toLocation.hash) window.scrollTo(0, 0);
});

// The host page has no lang/dir of its own.
document.documentElement.lang = "he";
document.documentElement.dir = "rtl";

const el = document.getElementById("app");
if (el) {
  createRoot(el).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
