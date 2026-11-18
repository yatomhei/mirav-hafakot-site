import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import type { SiteContent } from "@/content/docs";
import { pageAddress } from "@/lib/seo";

/** Placeholder: the full privacy policy is written in phase 3, before launch. */
export const Route = createFileRoute("/privacy")({
  head: ({ matches }) => {
    const content = matches[0]?.loaderData as SiteContent | undefined;
    const title = `מדיניות פרטיות | ${content?.site.name ?? ""}`;
    const description = `איך ${content?.site.name ?? "האתר"} מטפל בפרטים שנשלחים מהאתר, ובאילו שירותים הוא משתמש.`;
    const address = pageAddress("/privacy");
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...address.meta,
      ],
      links: address.links,
    };
  },
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-[760px] px-[var(--gutter)] py-[clamp(64px,9vw,130px)] text-center">
        <h1 className="page-title mb-6">מדיניות פרטיות</h1>
        <p className="lead">[מדיניות הפרטיות המלאה תתווסף לפני העלייה לאוויר]</p>
      </section>
    </PageShell>
  );
}
