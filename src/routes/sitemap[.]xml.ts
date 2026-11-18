import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { absUrl } from "@/lib/seo";

// The public pages, at the same addresses as their canonical tags: the homepage, every
// service that isn't hidden, and the privacy and accessibility pages. Empty until the site
// is indexable and its domain is set (siteConfig).
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let paths: string[] = [];
        if (siteConfig.indexable && absUrl("/")) {
          const { readStoredDocs } = await import("@/content/store.server");
          const { assembleContent } = await import("@/content/docs");
          const content = assembleContent(await readStoredDocs());
          paths = [
            "/",
            ...content.services.filter((s) => !s.hidden).map((s) => `/services/${s.slug}`),
            "/privacy",
            "/accessibility",
          ];
        }
        const urls = paths.map((p) => `  <url><loc>${absUrl(p)}</loc></url>`).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
        return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
      },
    },
  },
});
