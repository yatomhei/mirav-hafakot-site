import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { site } from "@/content/site";

/** Placeholder: the full privacy policy is written in phase 3, before launch. */
export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: `מדיניות פרטיות | ${site.name}` }] }),
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
