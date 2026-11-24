import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { siteConfig } from "@/config/site";
import { ContentProvider } from "@/content/context";
import { loadSiteContent } from "@/content/load";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { absImage } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="max-w-md text-center">
        <p className="caption">404</p>
        <h1 className="heading-section mt-4">הדף לא נמצא</h1>
        <p className="lead mt-4">הדף שחיפשתם אינו קיים באתר.</p>
        <div className="mt-8">
          <Link to="/" className="btn btn-primary">
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="max-w-md text-center">
        <h1 className="heading-section">הדף לא נטען</h1>
        <p className="lead mt-4">משהו השתבש. אפשר לנסות לרענן או לחזור לדף הבית.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn btn-primary"
          >
            לנסות שוב
          </button>
          <a href="/" className="btn btn-outline">
            חזרה לדף הבית
          </a>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // The saved content, loaded once and shared by every page. It only reloads when the admin
  // saves (router.invalidate), not on every page change.
  loader: () => loadSiteContent(),
  staleTime: Infinity,
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { seo, site } = loaderData;
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
        { title: seo.home.title },
        { name: "description", content: seo.home.description },
        // Not indexed until launch (siteConfig.indexable).
        ...(siteConfig.indexable ? [] : [{ name: "robots", content: "noindex, nofollow" }]),
        { name: "theme-color", content: "#FAF0EB" },
        { property: "og:title", content: seo.home.title },
        { property: "og:description", content: seo.home.description },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: site.name },
        { property: "og:locale", content: siteConfig.locale },
        // Full address once the domain is set (WhatsApp and Facebook ignore relative ones).
        // Its size is stated on the homepage only: a page with its own image (a service, the
        // landing page) would otherwise inherit the poster's size for a different photo.
        { property: "og:image", content: absImage("/images/hero-poster-1600.webp") },
        { property: "og:image:alt", content: `${site.name} - ${site.tagline}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", type: "image/png", href: "/favicon-32.png", sizes: "32x32" },
        { rel: "icon", type: "image/png", href: "/favicon-192.png", sizes: "192x192" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const content = Route.useLoaderData();
  useScrollReveal();

  return (
    <QueryClientProvider client={queryClient}>
      <ContentProvider value={content}>
        {/* Required: nested routes render here. */}
        <Outlet />
      </ContentProvider>
    </QueryClientProvider>
  );
}
