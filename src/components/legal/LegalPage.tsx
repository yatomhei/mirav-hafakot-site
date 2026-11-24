import type { ReactNode } from "react";
import { PageShell } from "@/components/layout/PageShell";

/**
 * A legal document page (privacy policy, accessibility statement): a readable column of
 * numbered sections under the title, with the date it was last updated.
 */
export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  /** Hebrew date text, e.g. "18 בנובמבר 2026". */
  updated: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <PageShell>
      <article className="legal mx-auto max-w-[760px] px-[var(--gutter)] py-[clamp(64px,9vw,130px)] text-right">
        <h1 className="page-title mb-4">{title}</h1>
        <p className="mb-10 text-[15px] text-ink/75">עודכן לאחרונה: {updated}</p>
        {intro && <div className="lead mb-10">{intro}</div>}
        <div className="flex flex-col gap-10">{children}</div>
      </article>
    </PageShell>
  );
}

/** One section: a heading and its paragraphs or list. */
export function LegalSection({
  title,
  id,
  children,
}: {
  title: string;
  /** An anchor, for links straight to this section. */
  id?: string;
  children: ReactNode;
}) {
  return (
    <section {...(id ? { id } : {})}>
      <h2 className="mb-3 text-[clamp(20px,1.8vw,24px)] font-medium leading-snug">{title}</h2>
      <div className="flex flex-col gap-3 text-[17px] leading-[1.75] font-light">{children}</div>
    </section>
  );
}

/** A bulleted list inside a section. */
export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="flex list-disc flex-col gap-2 ps-6">{children}</ul>;
}
