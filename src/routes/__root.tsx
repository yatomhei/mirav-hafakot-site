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
import { seo, site } from "@/content/site";
import { useScrollReveal } from "@/hooks/useScrollReveal";

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
  head: () => ({
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
      { property: "og:image", content: "/images/hero-poster-1600.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon-32.png", sizes: "32x32" },
      { rel: "icon", type: "image/png", href: "/favicon-192.png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500&display=swap",
      },
    ],
  }),
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
  useScrollReveal();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. */}
      <Outlet />
    </QueryClientProvider>
  );
}
