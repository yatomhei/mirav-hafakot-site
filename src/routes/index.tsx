import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Hero } from "@/components/sections/Hero";
import { WorksBand } from "@/components/sections/WorksBand";
import { Services } from "@/components/sections/Services";
import { About } from "@/components/sections/About";
import { Process } from "@/components/sections/Process";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { PhotoStrip } from "@/components/sections/PhotoStrip";
import type { SiteContent } from "@/content/docs";
import { photoFile } from "@/lib/asset";
import { homeJsonLd, pageAddress } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: ({ matches }) => {
    const content = matches[0]?.loaderData as SiteContent | undefined;
    const address = pageAddress("/");
    return {
      meta: [
        ...address.meta,
        // The shared-link image is the hero poster (set for every page in __root.tsx).
        { property: "og:image:width", content: "1600" },
        { property: "og:image:height", content: "900" },
      ],
      links: [
        ...address.links,
        // The hero's poster is the first thing on screen: fetch it before the CSS asks for it.
        ...(content
          ? [
              {
                rel: "preload",
                as: "image",
                href: photoFile(content.home.hero.poster.name, 1600),
                fetchPriority: "high" as const,
              },
            ]
          : []),
      ],
      scripts: content ? [homeJsonLd(content)] : [],
    };
  },
  component: HomePage,
});

function HomePage() {
  return (
    <PageShell>
      <Hero />
      <WorksBand />
      <Services />
      <About />
      <Process />
      <Testimonials />
      <Faq />
      <PhotoStrip />
    </PageShell>
  );
}
