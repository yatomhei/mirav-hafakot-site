import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { ServicePage } from "@/components/service/ServicePage";
import { useContent } from "@/content/context";
import type { SiteContent } from "@/content/docs";
import { getService } from "@/content/services";

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
    return {
      meta: [
        { title },
        { name: "description", content: s.lead },
        { property: "og:title", content: title },
        { property: "og:description", content: s.lead },
      ],
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
