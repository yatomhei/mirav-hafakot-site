import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { ServicePage } from "@/components/service/ServicePage";
import { getService } from "@/content/services";
import { site } from "@/content/site";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = getService(params.slug);
    if (!service) throw notFound();
    return { slug: service.slug };
  },
  head: ({ loaderData }) => {
    const s = loaderData && getService(loaderData.slug);
    if (!s) return {};
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
  const service = getService(slug)!;
  return (
    <PageShell>
      <ServicePage key={slug} service={service} />
    </PageShell>
  );
}
