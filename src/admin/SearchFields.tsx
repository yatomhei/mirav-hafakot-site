import { autoServiceSeo, serviceSeoFor } from "@/content/seo-pages";
import type { Service } from "@/content/types";
import { Text, useDraftContext, useField } from "./fields";

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
        <div aria-label="תצוגה מקדימה בגוגל" className="rounded-lg bg-white p-4">
          <p className="text-[12px] text-ink/60">תצוגה מקדימה</p>
          <p className="mt-1 text-[18px] leading-snug text-[#1a0dab]">{shown.title}</p>
          <p className="mt-1 text-[14px] leading-relaxed text-ink/75">{shown.description}</p>
        </div>
      </div>
    </details>
  );
}
