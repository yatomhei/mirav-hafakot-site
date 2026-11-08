import { useEffect, useRef, useState } from "react";
import { process } from "@/content/home";
import { Minus, Plus } from "@/components/ui/icons";

/** 0 → 1 as `top` travels from `from` to `to` (fractions of the viewport height). */
const progress = (top: number, vh: number, from: number, to: number) =>
  Math.min(1, Math.max(0, (vh * from - top) / (vh * (from - to))));

/**
 * Scroll-linked entrance: the band rises into place as it scrolls in, and each row rises
 * after it, both following the scroll position (scrubbed, so they run backwards on the way
 * up). Static wrappers are measured and their inner layer moves, so the measurement never
 * includes the movement. Off under reduced motion.
 */
function useScrollRise() {
  const band = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const outer = band.current;
    if (!outer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const inner = outer.firstElementChild as HTMLElement;
    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const p = progress(outer.getBoundingClientRect().top, vh, 1, 0.3);
      inner.style.transform = `translateY(${((1 - p) * 180).toFixed(1)}px)`;
      for (const row of rows.current) {
        if (!row) continue;
        const r = progress(row.getBoundingClientRect().top, vh, 1, 0.72);
        const el = row.firstElementChild as HTMLElement;
        el.style.transform = `translateY(${((1 - r) * 90).toFixed(1)}px)`;
        el.style.opacity = String(r);
      }
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

  return { band, rows };
}

/** "הרבה מעבר לצילום": olive band (#656C51), cream text, numbered rows that open one at a time. */
export function Process() {
  const [open, setOpen] = useState(-1);
  const { band, rows } = useScrollRise();

  return (
    <div ref={band}>
      <section
        id="process"
        aria-labelledby="process-title"
        className="bg-olive px-[var(--gutter)] py-[clamp(88px,11vw,150px)] text-cream will-change-transform"
      >
        <div className="mx-auto max-w-[var(--content-max)]">
          <div className="mx-auto mb-[clamp(48px,6vw,88px)] max-w-[820px] text-center">
            <p className="caption mb-6 !text-cream">{process.caption}</p>
            <h2 id="process-title" className="heading-section-lg mb-6">
              {process.title[0]}
              <br />
              {process.title[1]}
            </h2>
            <p className="lead">
              {process.lead[0]}
              <br className="max-[760px]:hidden" /> {process.lead[1]}
            </p>
          </div>

          <div className="border-t border-[rgb(250_240_235/0.25)]">
            {process.items.map((it, k) => {
              const isOpen = open === k;
              return (
                <div
                  key={it.num}
                  ref={(el) => {
                    rows.current[k] = el;
                  }}
                >
                  <div className="border-b border-[rgb(250_240_235/0.25)]">
                    <h3 className="m-0">
                      <button
                        type="button"
                        id={`incl-btn-${k}`}
                        aria-expanded={isOpen}
                        aria-controls={`incl-panel-${k}`}
                        onClick={() => setOpen(isOpen ? -1 : k)}
                        className="incl-head grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-[clamp(16px,3vw,40px)] border-0 bg-transparent py-[clamp(28px,3.6vw,52px)] text-right text-inherit max-[760px]:grid-cols-[auto_minmax(0,1fr)_auto]"
                      >
                        <span
                          aria-hidden="true"
                          className="text-[13px] tracking-[0.14em] tabular-nums"
                        >
                          {it.num}
                        </span>
                        <span className="text-[clamp(26px,4.4vw,56px)] leading-[1.1] font-light tracking-[-0.015em]">
                          {it.title}
                        </span>
                        <span
                          aria-hidden="true"
                          className="text-[16px] font-light max-[760px]:hidden"
                        >
                          {it.meta}
                        </span>
                        <span
                          aria-hidden="true"
                          className="incl-icon inline-flex h-12 w-12 flex-none items-center justify-center rounded-full border border-[rgb(250_240_235/0.6)]"
                        >
                          {isOpen ? <Minus /> : <Plus />}
                        </span>
                      </button>
                    </h3>
                    <div
                      id={`incl-panel-${k}`}
                      role="region"
                      aria-labelledby={`incl-btn-${k}`}
                      className="grid transition-[grid-template-rows] duration-[450ms] ease-[cubic-bezier(.2,.7,.2,1)]"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <p
                          className="body-text max-w-[720px] pr-[clamp(36px,5.4vw,72px)] pb-[clamp(32px,4vw,56px)]"
                          style={{ visibility: isOpen ? "visible" : "hidden" }}
                        >
                          {it.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
