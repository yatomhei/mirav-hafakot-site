import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { ServicePage } from "@/components/service/ServicePage";
import { useContent } from "@/content/context";
import { defaultContent, type SiteContent } from "@/content/docs";
import { absImage, pageAddress, serviceJsonLd } from "@/lib/seo";
import { serviceSeoFor } from "@/content/seo-pages";
import { photoFile } from "@/lib/asset";

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ params, parentMatchPromise }) => {
    // The saved content holds every service, including ones Merav added; a deleted or hidden
    // one answers "not found".
    const content = (await parentMatchPromise).loaderData as SiteContent | undefined;
    const service = (content?.services ?? defaultContent.services).find(
      (s) => s.slug === params.slug,
    );
    if (!service) throw notFound();
    // A service that leads to its own page (a landing page) forwards its old address there
    // for good, so shared links and Google's results move with it, even while its card is
    // hidden (the landing page is still there).
    const link = service.link?.trim();
    if (link) throw redirect({ href: link, statusCode: 301 });
    if (service.hidden) throw notFound();
    return { slug: service.slug };
  },
  head: ({ loaderData, matches }) => {
    // Titles come from the saved content, which the root route loaded.
    const content = matches[0]?.loaderData as SiteContent | undefined;
    const s = content?.services.find((x) => x.slug === loaderData?.slug);
    if (!content || !s) return {};
    const { site } = content;
    // Search wording per service (seo-pages.ts); the page itself keeps the short name.
    const { title, description } = serviceSeoFor(s, site.name);
    const address = pageAddress(`/services/${s.slug}`);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        // The service's own photo when it has one (otherwise the site-wide hero image).
        ...(s.image
          ? [
              { property: "og:image", content: absImage(photoFile(s.image.name, 1600)) },
              { property: "og:image:alt", content: s.image.alt || s.title },
            ]
          : []),
        ...address.meta,
      ],
      links: address.links,
      scripts: [serviceJsonLd(content, s)],
    };
  },
  component: ServiceRoute,
});

function ServiceRoute() {
  const { slug } = Route.useLoaderData();
  const service = useContent().services.find((s) => s.slug === slug)!;
  return (
    <PageShell>
      <ServicePage key={slug} service={service} />
    </PageShell>
  );
}
