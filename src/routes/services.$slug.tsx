import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { ServicePage } from "@/components/service/ServicePage";
import { useContent } from "@/content/context";
import type { SiteContent } from "@/content/docs";
import { getService } from "@/content/services";
import { absImage, pageAddress, serviceJsonLd } from "@/lib/seo";
import { photoFile } from "@/lib/asset";

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ params, parentMatchPromise }) => {
    const service = getService(params.slug);
    if (!service) throw notFound();
    const content = (await parentMatchPromise).loaderData as SiteContent | undefined;
    if (content?.services.find((s) => s.slug === service.slug)?.hidden) throw notFound();
    return { slug: service.slug };
  },
  head: ({ loaderData, matches }) => {
    // Titles come from the saved content, which the root route loaded.
    const content = matches[0]?.loaderData as SiteContent | undefined;
    const s = content?.services.find((x) => x.slug === loaderData?.slug);
    if (!content || !s) return {};
    const { site } = content;
    const title = `${s.title} | ${site.name}`;
    const address = pageAddress(`/services/${s.slug}`);
    return {
      meta: [
        { title },
        { name: "description", content: s.lead },
        { property: "og:title", content: title },
        { property: "og:description", content: s.lead },
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
