import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { servicesIntro } from "@/content/home";
import { services } from "@/content/services";
import { Picture } from "@/components/ui/Picture";
import { HomeLink } from "@/components/ui/HomeLink";
import { ArrowLeft, ArrowUpLeft } from "@/components/ui/icons";

/**
 * Six service cards in two columns under a dark olive veil; each opens its service page.
 * The section starts in the works band's olive-soft and fades to cream once its title has
 * risen past the middle of the screen (and back again when scrolling up).
 */
export function Services() {
  const title = useRef<HTMLHeadingElement>(null);
  const [cream, setCream] = useState(false);

  useEffect(() => {
    const el = title.current;
    if (!el) return;
    // Cream once the title's top has crossed the middle of the screen.
    let frame = 0;
    const check = () => {
      frame = 0;
      setCream(el.getBoundingClientRect().top < window.innerHeight / 2);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      id="services"
      className={`${cream ? "bg-cream" : "bg-olive-soft"} px-[var(--gutter)] py-[clamp(88px,11vw,120px)] transition-colors duration-700 ease-out`}
    >
      <div data-reveal className="mx-auto w-full max-w-[var(--content-max)]">
        <div className="mb-[52px] flex flex-col gap-[18px] text-center">
          <p className="caption">{servicesIntro.caption}</p>
          <h2 ref={title} className="heading-section">
            {servicesIntro.title}
          </h2>
          <p className="lead mx-auto max-w-[36em]">{servicesIntro.lead}</p>
        </div>

        <ul className="svc-grid m-0 grid list-none grid-cols-2 gap-x-[clamp(16px,2vw,28px)] gap-y-[clamp(36px,4vw,56px)] p-0 max-[640px]:grid-cols-1">
          {services.map((s) => (
            <li key={s.slug}>
              <Link
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="svc-card relative block aspect-video overflow-hidden rounded-[clamp(12px,1.2vw,18px)] bg-beige text-cream no-underline"
              >
                <Picture photo={s.image} decorative sizes="(max-width: 640px) 92vw, 46vw" />
                <span className="svc-veil absolute inset-0" aria-hidden="true" />
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-[clamp(16px,2vw,28px)] text-center">
                  <h3 className="text-[clamp(24px,2.4vw,36px)] leading-[1.15] font-light text-cream [text-shadow:0_1px_12px_rgb(0_0_0/0.25)]">
                    {s.title}
                  </h3>
                  <span className="text-[clamp(14px,1.1vw,17px)] font-light opacity-[0.92]">
                    {s.meta}
                  </span>
                </span>
                <span
                  className="svc-arrow absolute bottom-[clamp(12px,1.4vw,20px)] left-[clamp(12px,1.4vw,20px)] inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgb(250_240_235/0.85)] text-cream"
                  aria-hidden="true"
                >
                  <ArrowUpLeft />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-[clamp(48px,6vw,72px)] flex flex-col items-center gap-5 text-center">
          <p className="text-[clamp(22px,2.2vw,30px)] leading-[1.3] font-light">
            {servicesIntro.ctaText[0]}
            <br className="min-[761px]:hidden" /> {servicesIntro.ctaText[1]}
          </p>
          <HomeLink hash="contact" className="btn btn-primary !font-normal">
            {servicesIntro.cta}
            <ArrowLeft />
          </HomeLink>
        </div>
      </div>
    </section>
  );
}
