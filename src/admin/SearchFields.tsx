import { autoServiceSeo, serviceSeoFor } from "@/content/seo-pages";
import type { Service } from "@/content/types";
import { Text, useDraftContext, useField } from "./fields";

const DOMAIN = "hafakathamerav.co.il";

/**
 * How a page shows in Google's results: the site's address (with the page's path), the title
 * in blue and the description. Google cuts a title at about 60 characters and a description
 * at about 155, so the preview does too, with "...".
 */
export function SearchPreview({
  title,
  description,
  path = "/",
}: {
  title: string;
  description: string;
  /** The page's address on the site, "/" for the homepage. */
  path?: string;
}) {
  const cut = (text: string, max: number) =>
    text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}...` : text;
  const parts = path.startsWith("/") ? path.split("/").filter(Boolean) : [];
  return (
    <div aria-label="תצוגה מקדימה בגוגל" className="rounded-lg border border-ink/12 bg-white p-4">
      <p className="text-[12px] text-ink/60">תצוגה מקדימה בגוגל</p>
      <p dir="ltr" className="mt-2 text-end text-[13px] text-ink/70">
        {[DOMAIN, ...parts].join(" › ")}
      </p>
      <p className="mt-0.5 text-[19px] leading-snug text-[#1a0dab]">{cut(title, 60)}</p>
      <p className="mt-1 text-[14px] leading-relaxed text-ink/75">{cut(description, 155)}</p>
    </div>
  );
}

/**
 * Optional search wording for one service page, with a preview of the Google result. Left
 * empty, the automatic wording (shown in grey) is used; the page itself never changes.
 */
export function ServiceSearchFields({ path }: { path: string }) {
  const { value: service } = useField<Service>(path);
  const { draft } = useDraftContext();
  const auto = autoServiceSeo(service);
  const shown = serviceSeoFor(service, draft.site.name);

  return (
    <details className="rounded-lg border border-ink/12 bg-cream/40 px-4 py-3">
      <summary className="cursor-pointer text-[14px] font-medium">
        איך העמוד מופיע בגוגל (לא חובה)
      </summary>
      <div className="mt-3 flex flex-col gap-4">
        <p className="admin-note">
          לא מופיע בעמוד עצמו, רק בתוצאות החיפוש, בלשונית הדפדפן ובתצוגה של קישור ששולחים. כששדה
          ריק, משתמשים בנוסח האפור.
        </p>
        <Text
          path={`${path}.seoTitle`}
          label="כותרת בגוגל"
          hint="עד כ־60 תווים נראים בגוגל. שם העסק מתווסף בסוף לבד"
          placeholder={auto.title}
        />
        <Text
          path={`${path}.seoDescription`}
          label="תיאור בגוגל"
          hint="משפט או שניים, עם סוג השירות והאזור"
          placeholder={auto.description}
          multiline
          rows={2}
        />
        <SearchPreview
          title={shown.title}
          description={shown.description}
          path={service.link?.trim() || `/services/${service.slug}`}
        />
      </div>
    </details>
  );
}

/**
 * The landing page's search wording (title and description), styled like a service page's,
 * with a preview of the Google result. Here the title is written in full, business name
 * included, and both fields are required.
 */
export function LandingSearchFields() {
  const { value: title } = useField<string>("seo.title");
  const { value: description } = useField<string>("seo.description");

  return (
    <details className="rounded-lg border border-ink/12 bg-cream/40 px-4 py-3">
      <summary className="cursor-pointer text-[14px] font-medium">איך העמוד מופיע בגוגל</summary>
      <div className="mt-3 flex flex-col gap-4">
        <p className="admin-note">
          לא מופיע בעמוד עצמו, רק בתוצאות החיפוש, בלשונית הדפדפן ובתצוגה של קישור ששולחים.
        </p>
        <Text
          path="seo.title"
          label="כותרת בגוגל"
          hint="עד כ־60 תווים נראים בגוגל. כותבים גם את שם העסק, בסוף"
        />
        <Text
          path="seo.description"
          label="תיאור בגוגל"
          hint="עד כ־155 תווים: משפט או שניים, עם סוג השירות והאזור"
          multiline
          rows={2}
        />
        <SearchPreview title={title} description={description} path="/bar-mitzvah-clips" />
      </div>
    </details>
  );
}
