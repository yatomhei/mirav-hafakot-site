import { createFileRoute } from "@tanstack/react-router";
import { BarMitzvahLanding, LandingFooter } from "@/components/landing/BarMitzvahLanding";
import { VideoPlayerProvider } from "@/components/ui/VideoPlayer";
import type { SiteContent } from "@/content/docs";
import { photoFile } from "@/lib/asset";
import { absImage, pageAddress } from "@/lib/seo";

// The bar/bat mitzvah landing page: a standalone page (no site header or footer) for ads and
// shared links. Once the service's card leads here ("דף אחר" in the admin), the sitemap
// lists it in place of /services/bar-bat-mitzvah, which forwards here.
export const Route = createFileRoute("/bar-mitzvah-clips")({
  head: ({ matches }) => {
    const content = matches[0]?.loaderData as SiteContent | undefined;
    if (!content) return {};
    const { seo, hero } = content.barMitzvahLanding;
    const address = pageAddress("/bar-mitzvah-clips");
    const cover = hero.video.thumb;
    return {
      meta: [
        { title: seo.title },
        { name: "description", content: seo.description },
        { property: "og:title", content: seo.title },
        { property: "og:description", content: seo.description },
        ...(cover
          ? [
              { property: "og:image", content: absImage(photoFile(cover.name, 1600)) },
              { property: "og:image:alt", content: hero.video.title },
            ]
          : []),
        ...address.meta,
      ],
      links: address.links,
    };
  },
  component: LandingRoute,
});

function LandingRoute() {
  return (
    <VideoPlayerProvider>
      <a href="#main" className="skip-link">
        דילוג לתוכן
      </a>
      <main id="main" tabIndex={-1} className="outline-none">
        <BarMitzvahLanding />
      </main>
      <LandingFooter />
    </VideoPlayerProvider>
  );
}
