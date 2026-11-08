import { Fragment, useEffect, useRef } from "react";
import { about } from "@/content/home";

/** Renders **bold** spans from content text. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 ? (
          <b key={i} className="font-medium">
            {part}
          </b>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/**
 * Intro that drifts: once it nears the top of the screen it scrolls at a fraction of the
 * page's speed, so the works section (later sibling, higher z-index, opaque) catches up and
 * slides over it. routes/index.tsx clips the shared wrapper so the drifting intro never
 * shows below the works and stills. Off under reduced motion.
 */
export function About() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    const wrap = el?.parentElement;
    if (!el || !wrap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const LAG = 0.6; // share of the scroll the intro gives back: it moves at 40% speed
    let raf = 0;
    const update = () => {
      raf = 0;
      // The wrapper starts where the intro's untransformed top is.
      const start = window.innerHeight * 0.15;
      const past = Math.max(0, start - wrap.getBoundingClientRect().top);
      el.style.transform = past ? `translate3d(0, ${(past * LAG).toFixed(1)}px, 0)` : "";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={ref} id="about" className="about-pin bg-cream">
      <div
        data-reveal
        className="mx-auto max-w-[1080px] px-[clamp(16px,4vw,48px)] py-[clamp(72px,10vw,120px)] text-center"
      >
        <p className="caption mb-8">{about.caption}</p>
        <h2 className="about-title mb-10 font-light leading-none tracking-[-0.015em]">
          {about.title[0]}
          <br className="max-[760px]:hidden" /> {about.title[1]}
        </h2>
        <p className="mx-auto max-w-[940px] text-[clamp(20px,2.1vw,27px)] leading-[1.65] font-light">
          <RichText text={about.body} />
        </p>
      </div>
    </section>
  );
}
