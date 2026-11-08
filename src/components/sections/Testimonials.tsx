import { useEffect, useRef, useState } from "react";
import { testimonials } from "@/content/home";
import { Picture } from "@/components/ui/Picture";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";

/**
 * Quote carousel over a photo with the 46% dark-blue overlay, cream text. Advances every 7s;
 * pauses on hover/focus and while the tab is hidden, and never autoplays under reduced motion.
 */
export function Testimonials() {
  const items = testimonials.items;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const go = (n: number) => setI((n + items.length) % items.length);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      if (!document.hidden) setI((x) => (x + 1) % items.length);
    }, 7000);
    return () => clearInterval(t);
  }, [paused, items.length]);

  // Photo first, then text: while the section above scrolls away, the photo layer is held
  // still against the screen (so it is uncovered, not scrolled in). Once the section reaches
  // the top of the screen the photo is released and scrolls away with the text. The text
  // rises in only after the photo is (almost) fully revealed.
  const section = useRef<HTMLElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = section.current;
    const layer = photo.current;
    const text = content.current;
    if (!sec || !layer || !text) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) text.classList.add("is-revealed");
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      // Pin with the whole section on screen; if it is taller than the screen, pin it with
      // its bottom edge at the screen's bottom instead of its top at the top.
      sec.style.top = `${Math.min(0, vh - sec.offsetHeight)}px`;
      const top = sec.getBoundingClientRect().top;
      // Only while the section is entering from below: hold the photo at the screen's top.
      const hold = top > 0 && top < vh ? -top : 0;
      layer.style.transform = reduce ? "" : `translate3d(0, ${hold.toFixed(1)}px, 0)`;
      if (top <= vh * 0.2) text.classList.add("is-revealed");
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    // The spacer after the section (CSS .t-spacer) is the hold distance, so the
    // full-screen section pins at the top for a moment before it scrolls away.
    <div className="t-hold bg-olive-deep">
      <section
        ref={section}
        id="testimonials"
        aria-labelledby="t-title"
        className="t-pin overflow-hidden bg-olive-deep py-[clamp(56px,7vw,96px)]"
      >
        <div
          ref={photo}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-full min-h-[100vh] will-change-transform"
        >
          <Picture
            photo={{ name: testimonials.background, alt: "", pos: "center 60%" }}
            decorative
            sizes="100vw"
            className="brightness-[0.8] contrast-[1.05] saturate-[0.95] sepia-[0.06]"
          />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-[rgb(52_68_74/0.46)]" />

        <div
          ref={content}
          data-reveal="late"
          className="relative mx-auto w-full max-w-[var(--content-max)] px-[var(--gutter)]"
        >
          <p className="caption mb-6 text-center !text-beige">{testimonials.caption}</p>
          <h2 id="t-title" className="heading-testimonials mb-14 text-center text-cream">
            {testimonials.title}
          </h2>

          <div
            role="region"
            aria-roledescription="קרוסלה"
            aria-label="המלצות לקוחות"
            className="mx-auto max-w-[980px]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onTouchStart={(e) => {
              touchX.current = e.touches[0]!.clientX;
            }}
            onTouchEnd={(e) => {
              if (touchX.current == null) return;
              const dx = e.changedTouches[0]!.clientX - touchX.current;
              touchX.current = null;
              if (Math.abs(dx) > 40) go(i + (dx > 0 ? 1 : -1));
            }}
          >
            <div className="overflow-hidden" aria-live={paused ? "polite" : "off"}>
              <div
                className="flex transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)]"
                style={{ transform: `translateX(${i * 100}%)` }}
              >
                {items.map((t, k) => (
                  <figure
                    key={k}
                    aria-roledescription="שקופית"
                    aria-label={`${k + 1} מתוך ${items.length}`}
                    aria-hidden={k !== i || undefined}
                    className="m-0 box-border flex flex-[0_0_100%] flex-col items-center gap-9 px-[clamp(24px,7vw,96px)] py-[clamp(36px,6vw,80px)] text-center text-cream"
                  >
                    <blockquote className="m-0 text-[clamp(22px,2.6vw,34px)] leading-[1.55] font-light tracking-[-0.005em]">
                      {t.quote}
                    </blockquote>
                    <figcaption className="flex flex-col gap-1.5 text-[16px]">
                      <strong className="font-medium">{t.name}</strong>
                      <span>{t.role}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>

            <div className="mt-7 flex items-center justify-between gap-5">
              <button
                type="button"
                className="icon-btn t-prev text-cream"
                aria-label="ההמלצה הקודמת"
                onClick={() => go(i - 1)}
              >
                <ArrowRight size={20} />
              </button>
              <div className="flex items-center gap-1">
                {items.map((_, k) => (
                  <button
                    key={k}
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center"
                    aria-label={`המלצה ${k + 1} מתוך ${items.length}`}
                    aria-current={k === i || undefined}
                    onClick={() => go(k)}
                  >
                    <span
                      className="block h-[3px] rounded-sm transition-[width,background-color] duration-[400ms]"
                      style={{
                        width: k === i ? 28 : 12,
                        background: k === i ? "var(--beige)" : "rgb(250 240 235 / 0.5)",
                      }}
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="icon-btn t-next !border-0 bg-cream text-ink"
                aria-label="ההמלצה הבאה"
                onClick={() => go(i + 1)}
              >
                <ArrowLeft size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>
      <div className="t-spacer" aria-hidden="true" />
    </div>
  );
}
