import { createFileRoute } from "@tanstack/react-router";
import { AdsConsent } from "@/components/landing/AdsConsent";
import { BarMitzvahLanding, LandingFooter } from "@/components/landing/BarMitzvahLanding";
import { VideoPlayerProvider } from "@/components/ui/VideoPlayer";
import { useContent } from "@/content/context";
import type { SiteContent } from "@/content/docs";
import { photoFile } from "@/lib/asset";
import { absImage, pageAddress, serviceJsonLd } from "@/lib/seo";

// The bar/bat mitzvah landing page: a standalone page (no site header or footer) for ads and
// shared links. Once the service's card leads here ("דף אחר" in the admin), the sitemap
// lists it in place of /services/bar-bat-mitzvah, which forwards here. It also carries that
// service's structured data (the service, offered by the business, and the breadcrumb), since
// the service page itself is no longer shown.
const ADDRESS = "/bar-mitzvah-clips";
const SERVICE_SLUG = "bar-bat-mitzvah";
export const Route = createFileRoute("/bar-mitzvah-clips")({
  head: ({ matches }) => {
    const content = matches[0]?.loaderData as SiteContent | undefined;
    if (!content) return {};
    const { seo, hero } = content.barMitzvahLanding;
    const address = pageAddress(ADDRESS);
    // The service as the homepage card names it (the page's own title is written for ads).
    const card = content.services.find((s) => s.slug === SERVICE_SLUG);
    const service = {
      slug: SERVICE_SLUG,
      title: card?.title.trim() || "קליפים לבר ובת מצווה",
      lead: seo.description,
    };
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
      scripts: [serviceJsonLd(content, service, ADDRESS)],
    };
  },
  component: LandingRoute,
});

function LandingRoute() {
  const { ads } = useContent().barMitzvahLanding;
  return (
    <VideoPlayerProvider>
      <a href="#main" className="skip-link">
        דילוג לתוכן
      </a>
      <main id="main" tabIndex={-1} className="outline-none">
        <BarMitzvahLanding />
      </main>
      <LandingFooter />
      <AdsConsent ids={ads} />
    </VideoPlayerProvider>
  );
}
