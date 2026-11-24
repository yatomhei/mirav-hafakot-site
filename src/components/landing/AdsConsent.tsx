import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { adsEnabled, loadPixels, setConsent, useConsent, type AdsIds } from "@/lib/ads";

/**
 * The landing page's cookie banner, shown only while an ad pixel ID is set in the admin, and
 * until the visitor chooses. Agreeing loads the pixels; declining leaves the page as it is.
 * Both answers are equally easy, nothing is pre-ticked, and the page stays usable meanwhile.
 */
export function AdsConsent({ ids }: { ids: AdsIds }) {
  const enabled = adsEnabled(ids);
  const { consent, open } = useConsent();

  useEffect(() => {
    if (enabled && consent === "granted") loadPixels(ids);
  }, [enabled, consent, ids]);

  if (!enabled || !open) return null;
  const platforms = [ids.metaPixelId.trim() && "Meta", ids.googleAdsId.trim() && "Google"]
    .filter(Boolean)
    .join(" ו־");

  return (
    <section
      aria-label="הסכמה לעוגיות"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 max-[640px]:px-2 max-[640px]:pb-2"
    >
      <div className="mx-auto flex max-w-[980px] items-center gap-x-6 gap-y-4 rounded-[18px] border border-[rgb(46_49_40/0.16)] bg-cream px-6 py-5 text-ink shadow-[0_12px_40px_rgb(46_49_40/0.18)] max-[760px]:flex-col max-[760px]:items-stretch max-[760px]:px-5">
        <p className="m-0 flex-1 text-[15.5px] leading-[1.6]">
          אפשר להשתמש בעוגיות של {platforms}, כדי למדוד אילו מודעות הביאו אתכם לכאן ולהציג מודעות
          מתאימות? בלי אישור, הן לא נטענות והדף עובד כרגיל.{" "}
          <Link to="/privacy" hash="cookies" className="underline underline-offset-4">
            פרטים במדיניות הפרטיות
          </Link>
        </p>
        <div className="flex shrink-0 gap-3 max-[760px]:[&>*]:flex-1">
          <button
            type="button"
            className="btn btn-primary !min-h-12 !px-6"
            onClick={() => setConsent("granted")}
          >
            מאשרים
          </button>
          <button
            type="button"
            className="btn btn-outline !min-h-12 !px-6"
            onClick={() => setConsent("denied")}
          >
            לא, תודה
          </button>
        </div>
      </div>
    </section>
  );
}
