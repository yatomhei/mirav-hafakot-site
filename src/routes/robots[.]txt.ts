import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { absUrl } from "@/lib/seo";

// Before launch (siteConfig.indexable false) every crawler is turned away, including on
// preview addresses. After launch: everything but the admin, and where the sitemap is.
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const sitemap = absUrl("/sitemap.xml");
        const body = siteConfig.indexable
          ? [
              "User-agent: *",
              "Allow: /",
              "Disallow: /admin",
              ...(sitemap ? ["", `Sitemap: ${sitemap}`] : []),
            ]
          : ["User-agent: *", "Disallow: /"];
        return new Response(`${body.join("\n")}\n`, {
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      },
    },
  },
});
