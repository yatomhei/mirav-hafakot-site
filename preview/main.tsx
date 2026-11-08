// Shareable preview: the real routes and components, rendered in the browser alone (no
// server), for a claude.ai page the client can open. Navigation stays in memory, so links
// work wherever the page is hosted and a reload simply starts again at the homepage.
import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";

// claude.ai pages block web-font downloads, so the preview carries Rubik inside its own
// script and registers it with the FontFace API (no font request for the page's rules to
// block). The real site keeps the Google Fonts link.
import heb300 from "@fontsource/rubik/files/rubik-hebrew-300-normal.woff2?inline";
import heb400 from "@fontsource/rubik/files/rubik-hebrew-400-normal.woff2?inline";
import heb500 from "@fontsource/rubik/files/rubik-hebrew-500-normal.woff2?inline";
import lat300 from "@fontsource/rubik/files/rubik-latin-300-normal.woff2?inline";
import lat400 from "@fontsource/rubik/files/rubik-latin-400-normal.woff2?inline";
import lat500 from "@fontsource/rubik/files/rubik-latin-500-normal.woff2?inline";
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
// claude.ai pages can't embed YouTube, so video links open YouTube in a new tab instead.
(window as { __NO_VIDEO_EMBED__?: boolean }).__NO_VIDEO_EMBED__ = true;
document.documentElement.dir = "rtl";

const HEBREW = "U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F";
const LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const bytes = (dataUri: string) =>
  Uint8Array.from(atob(dataUri.slice(dataUri.indexOf(",") + 1)), (c) => c.charCodeAt(0)).buffer;
(
  [
    [heb300, "300", HEBREW],
    [heb400, "400", HEBREW],
    [heb500, "500", HEBREW],
    [lat300, "300", LATIN],
    [lat400, "400", LATIN],
    [lat500, "500", LATIN],
  ] as const
).forEach(([src, weight, unicodeRange]) => {
  const face = new FontFace("Rubik", bytes(src), { weight, unicodeRange, display: "swap" });
  document.fonts.add(face);
  face.load().catch(() => {});
});

const el = document.getElementById("app");
if (el) {
  createRoot(el).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
