import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import type { SiteContent } from "@/content/docs";

/** Placeholder: the full privacy policy is written in phase 3, before launch. */
export const Route = createFileRoute("/privacy")({
  head: ({ matches }) => {
    const content = matches[0]?.loaderData as SiteContent | undefined;
    return { meta: [{ title: `מדיניות פרטיות | ${content?.site.name ?? ""}` }] };
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
