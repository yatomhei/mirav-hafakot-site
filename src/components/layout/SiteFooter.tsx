import { Link } from "@tanstack/react-router";
import { site } from "@/content/site";
import { services } from "@/content/services";
import { image } from "@/lib/asset";
import { isPlaceholder, mailHref, telHref } from "@/lib/contact";
import { ArrowUp, Facebook, YouTube } from "@/components/ui/icons";

/** Cream footer with dark ink (never the blue). Three columns, centred on mobile. */
export function SiteFooter() {
  const socials = [
    { label: "יוטיוב", href: site.youtubeUrl, Icon: YouTube },
    { label: "פייסבוק", href: site.facebookUrl, Icon: Facebook },
  ];

  return (
    <footer data-reveal className="bg-cream px-[var(--gutter)] pt-16 pb-[108px] text-ink">
      <div
        aria-hidden="true"
        className="mx-auto mb-12 hidden max-w-[var(--content-max)] border-t border-[rgb(46_49_40/0.18)] max-[760px]:block"
      />
      <div className="mx-auto grid max-w-[var(--content-max)] grid-cols-3 items-start gap-x-[clamp(24px,4vw,64px)] gap-y-10 max-[760px]:grid-cols-1 max-[760px]:text-center">
        <div>
          <Link to="/" aria-label={`${site.name} — לדף הבית`} className="inline-block">
            <img
              src={image("logo-color.webp")}
              alt={site.name}
              className="h-[clamp(96px,10vw,128px)] w-auto max-[760px]:mx-auto"
              loading="lazy"
            />
          </Link>
        </div>

        <nav aria-labelledby="f-svc-h">
          <h2
            id="f-svc-h"
            className="mb-[18px] text-[17px] font-light leading-[1.4] tracking-[0.06em]"
          >
            הפקות סרטים וצילום אמנותי:
          </h2>
          <ul className="footer-svc m-0 flex max-w-[320px] list-none flex-col p-0 max-[760px]:max-w-none max-[760px]:flex-row max-[760px]:flex-wrap max-[760px]:justify-center max-[760px]:gap-y-1">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="footer-link inline-flex min-h-8 items-center text-[15px] font-light no-underline max-[760px]:min-h-11 max-[760px]:text-[16px]"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-[18px] text-[17px] font-light leading-[1.4] tracking-[0.06em]">
            יצירת קשר:
          </h2>
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0 max-[760px]:items-center">
            <li>
              <a
                href={telHref()}
                dir="ltr"
                className="footer-link inline-flex min-h-9 items-center text-[16px] font-light no-underline"
              >
                {site.phone}
              </a>
            </li>
            <li>
              <a
                href={mailHref()}
                className="footer-link inline-flex min-h-9 items-center text-[16px] font-light no-underline"
              >
                {site.email}
              </a>
            </li>
            <li className="mt-2.5 flex gap-2.5 max-[760px]:justify-center">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={isPlaceholder(href) ? "#" : href}
                  target={isPlaceholder(href) ? undefined : "_blank"}
                  rel="noopener"
                  aria-label={label}
                  className="social-btn inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgb(46_49_40/0.5)] text-ink"
                >
                  <Icon />
                </a>
              ))}
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-[var(--content-max)] flex-wrap items-center justify-between gap-4 border-t border-[rgb(46_49_40/0.18)] pt-9 max-[760px]:flex-col max-[760px]:justify-center max-[760px]:text-center">
        <p className="text-[13px] text-[rgb(46_49_40/0.78)]">
          © {new Date().getFullYear()} {site.name} · {site.tagline}
        </p>
        <a href="#top" className="inline-flex min-h-11 items-center gap-2 text-[14px] text-ink">
          חזרה למעלה
          <ArrowUp />
        </a>
      </div>
    </footer>
  );
}
