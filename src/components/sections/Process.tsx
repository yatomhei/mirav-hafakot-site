import { useEffect, useRef, useState } from "react";
import { process } from "@/content/home";
import { Minus, Plus } from "@/components/ui/icons";

/**
 * Rise-up entrance: the band rises quickly into place when its top passes 85% of the
 * screen height, and each row rises (with a fade) when it passes 90%, a beat after the one
 * before. Plays once. Static wrappers are measured; their inner layer moves, so the
 * measurement never includes the movement. Content is only hidden once this has run, and
 * never under reduced motion.
 */
function useScrollRise() {
  const band = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const outer = band.current;
    if (!outer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets: [HTMLElement, HTMLElement, number][] = [
      [outer, outer.firstElementChild as HTMLElement, 0.85],
      ...rows.current
        .filter((r): r is HTMLDivElement => !!r)
        .map((r, k): [HTMLElement, HTMLElement, number] => {
          const el = r.firstElementChild as HTMLElement;
          el.style.transitionDelay = `${k * 90}ms`;
          return [r, el, 0.9];
        }),
    ];
    targets[0]![1].classList.add("rise", "rise-band");
    targets.slice(1).forEach(([, el]) => el.classList.add("rise", "rise-row"));

    let frame = 0;
    let pending = targets;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      pending = pending.filter(([measure, el, at]) => {
        if (measure.getBoundingClientRect().top > vh * at) return true;
        el.classList.add("is-up");
        return false;
      });
      if (!pending.length) stop();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const stop = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      stop();
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
        className="bg-olive px-[var(--gutter)] py-[clamp(88px,11vw,150px)] text-cream"
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
