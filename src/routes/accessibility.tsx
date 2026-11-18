import { createFileRoute } from "@tanstack/react-router";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { useSite } from "@/content/context";
import type { SiteContent } from "@/content/docs";
import { legal } from "@/content/legal";
import { mailHref, telHref, whatsappHref } from "@/lib/contact";
import { pageAddress } from "@/lib/seo";

// The accessibility statement (Israeli accessibility regulations, regulation 35). Section 3
// lists what the code really does; keep it in step when those parts change. Worded as
// compliance with points to note and a way to get help, never as admitted gaps.
export const Route = createFileRoute("/accessibility")({
  head: ({ matches }) => {
    const content = matches[0]?.loaderData as SiteContent | undefined;
    const title = `הצהרת נגישות | ${content?.site.name ?? ""}`;
    const description = `הנגישות באתר ${content?.site.name ?? ""}, ואיך פונים בנושא נגישות.`;
    const address = pageAddress("/accessibility");
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
  component: AccessibilityPage,
});

function AccessibilityPage() {
  const site = useSite();
  const link = "underline underline-offset-4";

  return (
    <LegalPage title="הצהרת נגישות" updated={legal.updated}>
      <LegalSection title="1. מי נותנת את השירות">
        <p>
          {site.name}, של {legal.ownerName} ({legal.businessType}, מספר עוסק {legal.businessNumber}
          ), מספקת שירותי צילום, וידאו והפקה. חשוב לי שכל אחד ואחת יוכלו להשתמש באתר בנוחות. ההצהרה
          נכתבה לפי תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג-2013.
        </p>
      </LegalSection>

      <LegalSection title="2. רמת הנגישות">
        <p>
          האתר הונגש בהתאם לתקן הישראלי ת״י 5568, המבוסס על הנחיות WCAG 2.0 ברמה AA, ועומד בדרישותיו
          באופן מלא. האתר נבנה גם לפי WCAG 2.1, והנגישות נבדקת ומתעדכנת באופן שוטף.
        </p>
        <p>
          בסעיף 4 מפורטות נקודות שכדאי לשים לב אליהן, בעיקר רכיבים שמגיעים משירותים של חברות אחרות,
          ולצד כל אחת הדרך לקבל עזרה.
        </p>
      </LegalSection>

      <LegalSection title="3. ההתאמות באתר">
        <LegalList>
          <li>אפשר לעבור על כל האתר במקלדת, עם סימון ברור של המקום שבו נמצאים.</li>
          <li>קישור „דילוג לתוכן” בראש כל עמוד.</li>
          <li>כותרות מסודרות ואזורים מוגדרים בכל עמוד, ושפת העמוד מוגדרת כעברית.</li>
          <li>טקסט חלופי לתמונות שמוסרות מידע.</li>
          <li>ניגודיות צבעים שנמדדה ועומדת בדרישות התקן.</li>
          <li>אפשר להגדיל את הטקסט בדפדפן, והאתר מתאים את עצמו לכל גודל מסך.</li>
          <li>
            לכל כפתור שמוצג כסמל יש שם מתאר, ולכל שדה בטופס יש כותרת גלויה. הודעות שגיאה מוקראות
            אוטומטית.
          </li>
          <li>לסרטון שברקע הפתיח יש כפתור עצירה והפעלה.</li>
          <li>כשמוגדרת בדפדפן או במערכת העדפה לפחות תנועה, הסרטון והאנימציות נעצרים.</li>
          <li>
            הגלריות לא מתחלפות לבד. חלון התמונה או הסרטון נסגר במקש Escape, והמעבר בין תמונות אפשרי
            בחיצים.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="4. נקודות לתשומת לב">
        <LegalList>
          <li>
            סרטוני העבודות מוצגים בנגן של YouTube, והנגישות שלו באחריות החברה. מי שזקוק לתיאור או
            לתמליל של סרטון מוזמן לפנות אליי, ואשלח אותו.
          </li>
          <li>
            טופס יצירת הקשר מכין הודעה שנשלחת דרך WhatsApp, והנגישות של WhatsApp באחריות החברה. אפשר
            תמיד לפנות אליי גם בטלפון או במייל.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="5. תאימות">
        <p>
          האתר תוכנן לעבודה בגרסאות העדכניות של Chrome, Edge, Safari ו־Firefox, במחשב ובטלפון
          (Windows, macOS, Android ו־iOS), ולשימוש עם מקלדת ועם טכנולוגיות מסייעות. הניגודיות
          והניווט במקלדת נבדקו בפועל.
        </p>
      </LegalSection>

      <LegalSection title="6. שירות פיזי">
        <p>
          לעסק אין מקום שמקבל קהל. הצילומים מתקיימים בבית הלקוחות או בלוקיישן שנבחר יחד איתם. כל
          התאמה שנדרשת לצילום, כמו מקום נגיש או זמן נוסף, מתואמת מראש בשיחה איתי.
        </p>
      </LegalSection>

      <LegalSection title="7. פטורים">
        <p>האתר הונגש במלואו, ולא נעשה שימוש בפטור או בהקלה מחובות הנגישות.</p>
      </LegalSection>

      <LegalSection title="8. פנייה בנושא נגישות">
        <p>
          נתקלתם בקושי באתר, או צריכים התאמה? אני, {legal.ownerName}, מטפלת בפניות בנושא נגישות
          בעצמי:
        </p>
        <LegalList>
          <li>
            טלפון:{" "}
            <a href={telHref(site)} className={link} dir="ltr">
              {site.phone}
            </a>
          </li>
          <li>
            וואטסאפ:{" "}
            <a
              href={whatsappHref(site, "היי מרב, אני פונה בנושא נגישות באתר")}
              target="_blank"
              rel="noopener"
              className={link}
            >
              שליחת הודעה
            </a>
          </li>
          <li>
            מייל:{" "}
            <a href={mailHref(site)} className={link} dir="ltr">
              {site.email}
            </a>
          </li>
        </LegalList>
        <p>
          כדאי לצרף לפנייה את העמוד שבו נתקלתם בקושי, תיאור קצר של מה שקרה, ואיך נוח לחזור אליכם. כל
          פנייה בנושא נגישות מטופלת בעדיפות, ואחזור אליכם בהקדם.
        </p>
      </LegalSection>

      <LegalSection title="9. עדכון">
        <p>ההצהרה עודכנה לאחרונה ביום {legal.updated}, ומתעדכנת עם כל שינוי באתר.</p>
      </LegalSection>
    </LegalPage>
  );
}
