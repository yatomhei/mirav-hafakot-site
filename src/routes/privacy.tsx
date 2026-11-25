import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { useContent, useSite } from "@/content/context";
import type { SiteContent } from "@/content/docs";
import { lastUpdated, legal } from "@/content/legal";
import { adsEnabled } from "@/lib/ads";
import { mailHref, telHref } from "@/lib/contact";
import { pageAddress } from "@/lib/seo";

// The privacy policy. Every statement here describes how this site actually works: the form
// builds a WhatsApp message on the visitor's device and sends nothing to the site's server;
// visits are counted by Cloudflare Web Analytics (no cookies, nothing stored on the device,
// injected by Cloudflare); there are no visitor cookies or ads (except the landing page's ad pixels, and only
// while the admin has a pixel ID set: section 4 then says so); the font and video thumbnails
// are served from the site; YouTube loads only when a video is played. Change it with the code.
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
  const site = useSite();
  const { ads } = useContent().barMitzvahLanding;
  const pixels = adsEnabled(ads);
  const meta = Boolean(ads.metaPixelId.trim());
  const google = Boolean(ads.googleAdsId.trim());
  const platforms = [meta && "Meta (פייסבוק ואינסטגרם)", google && "Google Ads"]
    .filter(Boolean)
    .join(" ו־");
  const phone = (
    <a href={telHref(site)} className="underline underline-offset-4" dir="ltr">
      {site.phone}
    </a>
  );
  const email = (
    <a href={mailHref(site)} className="underline underline-offset-4" dir="ltr">
      {site.email}
    </a>
  );

  return (
    <LegalPage
      title="מדיניות פרטיות"
      updated={lastUpdated(pixels ? ads.enabledOn : undefined)}
      intro={
        <p>
          האתר של {site.name} אוסף רק את מה שצריך כדי לחזור אליכם. כאן מוסבר מה נמסר כשפונים אליי,
          לאן זה מגיע, ומה הזכויות שלכם.
        </p>
      }
    >
      <LegalSection title="1. מי אחראית על המידע">
        <p>
          האתר מופעל על ידי {legal.ownerName}, {site.name} ({legal.businessType}, מספר עוסק{" "}
          {legal.businessNumber}). לכל שאלה או בקשה בנושא פרטיות: טלפון {phone}, מייל {email}.
        </p>
      </LegalSection>

      <LegalSection title="2. טופס יצירת הקשר">
        <p>
          הטופס מבקש שם וטלפון, כדי שאוכל לחזור אליכם. אפשר להוסיף גם נושא והודעה, וזה לפי בחירתכם.
          אין חובה חוקית למסור את הפרטים. בלי שם וטלפון אי אפשר לשלוח את הטופס, ואפשר תמיד לפנות
          אליי ישירות בטלפון או במייל.
        </p>
        <p>
          הטופס לא שולח את הפרטים לאתר ולא שומר אותם בו. הוא מכין הודעת וואטסאפ בטלפון או במחשב
          שלכם, ואתם מחליטים אם לשלוח אותה. הודעה שנשלחה עוברת דרך WhatsApp ונשמרת אצלי בוואטסאפ.
        </p>
        <p>
          אני משתמשת בפרטים רק כדי לחזור אליכם, לתאם ולתת את השירות. אני לא מוכרת אותם, לא מעבירה
          אותם לאחרים לשיווק, ולא שולחת אליכם פרסומות.
        </p>
      </LegalSection>

      <LegalSection title="3. פנייה ישירה">
        <p>
          כשפונים אליי בטלפון, בוואטסאפ או במייל, אני מקבלת את מה שבחרתם לכתוב או לומר, ומשתמשת בזה
          לאותן מטרות בדיוק.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="4. עוגיות, אנליטיקה ופרסום">
        {pixels ? (
          <>
            <p>רוב דפי האתר לא שומרים עוגיות אצל הגולשים. הגופן ותמונות האתר נטענים מהאתר עצמו.</p>
            <p>
              היוצא מן הכלל הוא דף הקליפים לבר ובת מצווה (
              <Link to="/bar-mitzvah-clips" className="underline underline-offset-4">
                <span dir="ltr">/bar-mitzvah-clips</span>
              </Link>
              ), שאליו מגיעים גם ממודעות. בדף הזה, ורק אם אישרתם בהודעה שמופיעה בו, נטען הפיקסל של{" "}
              {platforms}. הפיקסל שומר עוגיות בדפדפן שלכם ושולח לחברה פרטים על הביקור: הדף, הדפדפן
              והמכשיר, כתובת ה־IP, ואם שלחתם את הטופס או לחצתם על וואטסאפ או על הטלפון. תוכן הטופס
              עצמו, השם והטלפון, לא נשלח. עוגיות הפיקסל (כמו <span dir="ltr">_fbp</span> של Meta ו־
              <span dir="ltr">_gcl_au</span> של Google) נשמרות כ־90 יום.
            </p>
            <p>
              המטרה: לדעת אילו מודעות מביאות פניות, ולהציג מודעות לאנשים שביקרו בדף. הבסיס לכך הוא
              ההסכמה שלכם. החברה עשויה לקשר את הביקור לחשבון שלכם אצלה, לפי מדיניות הפרטיות שלה. בלי
              אישור הפיקסל לא נטען, ואפשר להשתמש בדף כרגיל. הבחירה נשמרת בדפדפן שלכם, ואפשר לשנות
              אותה בכל עת בקישור "הגדרות עוגיות" בתחתית אותו דף. ביטול האישור מוחק את עוגיות הפיקסל
              מהדפדפן.
            </p>
          </>
        ) : (
          <p>
            האתר לא שומר עוגיות אצל הגולשים, ולא משתמש בפיקסלים או בפרסום ממוקד. הגופן ותמונות האתר
            נטענים מהאתר עצמו.
          </p>
        )}
        <p>
          לספירת ביקורים האתר משתמש בכלי הסטטיסטיקה של Cloudflare (Web Analytics), שמאחסנת את האתר.
          הכלי לא שומר עוגיות ולא שום מידע במכשיר שלכם, ולא מזהה גולשים או עוקב אחריהם בין אתרים:
          הוא סופר כמה ביקורים היו, באילו דפים, מאיזו מדינה ומאיזה אתר הגיעו, וכמה מהר הדף נטען.
        </p>
        <p>
          כמו בכל אתר, שרתי האחסון מקבלים את כתובת ה־IP ופרטים טכניים על הדפדפן, כדי להציג את האתר
          ולהגן עליו מפני שימוש לרעה.
        </p>
      </LegalSection>

      <LegalSection title="5. סרטונים מיוטיוב">
        <p>
          הסרטונים באתר מאוחסנים ביוטיוב. הנגן נטען רק כשלוחצים על סרטון, בגרסה של YouTube שלא שומרת
          עוגיות לפני הצפייה (youtube-nocookie). מרגע הלחיצה, Google מקבלת את פרטי הצפייה לפי
          מדיניות הפרטיות שלה. תמונות התצוגה של הסרטונים מאוחסנות באתר, ואם לסרטון אין תמונה משלו
          היא נטענת משרתי YouTube.
        </p>
      </LegalSection>

      <LegalSection title="6. שירותים שמקבלים מידע, והעברה לחו״ל">
        <LegalList>
          <li>
            Cloudflare: אחסון האתר, הגנה עליו וספירת ביקורים (בלי עוגיות). מקבלת נתונים טכניים, כמו
            כתובת IP.
          </li>
          <li>WhatsApp (Meta): העברת ההודעה ששלחתם מהטופס או ישירות.</li>
          <li>Google: מייל (Gmail) כשפונים אליי במייל, ונגן YouTube כשמפעילים סרטון.</li>
          {meta && (
            <li>
              Meta: הפיקסל בדף הקליפים לבר ובת מצווה, רק אם אישרתם. מקבלת את פרטי הביקור שבסעיף 4.
            </li>
          )}
          {google && (
            <li>
              Google Ads: התג בדף הקליפים לבר ובת מצווה, רק אם אישרתם. מקבלת את פרטי הביקור שבסעיף
              4.
            </li>
          )}
        </LegalList>
        <p>
          החברות האלה פועלות מחוץ לישראל, בעיקר בארצות הברית, והמידע עשוי להישמר בשרתים שלהן שם או
          במדינות אחרות. ההעברה נעשית לפי ההתחייבויות החוזיות ואמצעי ההגנה של כל חברה
          {pixels ? ", ובמקרה של הפיקסל גם לפי ההסכמה שלכם" : ""}.
        </p>
      </LegalSection>

      <LegalSection title="7. תמונות וסרטונים של לקוחות">
        <p>
          תמונות וסרטונים של לקוחות מתפרסמים באתר רק בהסכמת המצולמים, וכשמצולמים ילדים, בהסכמת
          ההורים. מי שמופיע באתר ומבקש להסיר תמונה, סרטון או שם, מוזמן לפנות אליי, ואסיר אותם בהקדם.
        </p>
        <p>
          המלצות של לקוחות, גם כצילומי מסך של הודעות, מתפרסמות בהסכמת מי שכתב אותן, ופרטים מזהים כמו
          שם, מספר טלפון ותמונת פרופיל מוסרים מהן. מי שמזהה הודעה שלו ומבקש להסיר אותה, מוזמן לפנות
          אליי, ואסיר אותה בהקדם.
        </p>
      </LegalSection>

      <LegalSection title="8. ממשק הניהול">
        <p>
          לממשק עריכת התוכן נכנסים רק מנהלי האתר, עם חשבון Google שאושר מראש. לצורך הכניסה נשמרת
          בדפדפן של המנהל עוגייה חתומה עם כתובת המייל שלו, ורשימת המיילים המורשים שמורה באחסון של
          האתר. זה לא נוגע לגולשים באתר.
        </p>
      </LegalSection>

      <LegalSection title="9. אבטחה ושמירה">
        <p>
          האתר מוגש בחיבור מוצפן (HTTPS), ולא מחזיק מאגר של פרטי גולשים. הודעות ומיילים שמגיעים אליי
          נשמרים כל עוד הם נחוצים לטיפול בפנייה ולמתן השירות, וכפי שהדין מחייב לשמור מסמכים.
        </p>
      </LegalSection>

      <LegalSection title="10. הזכויות שלכם">
        <p>
          אתם זכאים לעיין במידע שלכם שנמצא אצלי, לבקש לתקן אותו או למחוק אותו. אפשר לפנות בטלפון{" "}
          {phone} או במייל {email}. אענה לבקשת עיון תוך 30 יום. אם לא אוכל לבצע בקשה, אסביר בכתב
          למה. אפשר גם לפנות לרשות להגנת הפרטיות.
        </p>
      </LegalSection>

      <LegalSection title="11. ילדים">
        <p>האתר מיועד למבוגרים שמזמינים שירותי צילום והפקה. פנייה בשם ילד נעשית על ידי ההורה.</p>
      </LegalSection>

      <LegalSection title="12. שינויים במדיניות">
        <p>
          כשהאתר משתנה, המדיניות מתעדכנת, ותאריך העדכון מופיע בראש העמוד. ראו גם את{" "}
          <Link to="/accessibility" className="underline underline-offset-4">
            הצהרת הנגישות
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
