import { useEffect, useRef } from "react";
import { hero } from "@/content/home";
import { site } from "@/content/site";
import { asset, image } from "@/lib/asset";
import { HomeLink } from "@/components/ui/HomeLink";
import { ArrowLeft, Play } from "@/components/ui/icons";

/**
 * Desktop: rounded full-height frame, looping video under a 40% dark-blue overlay, cream
 * logo, title and buttons centred on top. ≤760px: text and buttons first on cream, then the
 * video as a 16:9 rounded rectangle, brightened, without the overlay. Reduced motion → poster.
 */
export function Hero() {
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);

  // As the hero leaves, its lower part shrinks in: the frame tilts back from its top edge.
  useEffect(() => {
    const el = frame.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const desktop = window.matchMedia("(min-width: 761px)");
    let raf = 0;
    const update = () => {
      raf = 0;
      if (!desktop.matches) {
        el.style.transform = "";
        return;
      }
      const r = el.getBoundingClientRect();
      // Untransformed height: scale is anchored at the top, so r.top is unaffected.
      const p = Math.min(1, Math.max(0, -r.top / el.offsetHeight));
      // Tilt back from the top edge so the lower part narrows (a slight trapezoid).
      el.style.transform = p
        ? `perspective(1400px) rotateX(${(-10 * p).toFixed(2)}deg) scale(${(1 - 0.04 * p).toFixed(4)})`
        : "";
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

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    v.play().catch(() => {});
  }, []);

  const poster = image(`${hero.poster}-1600.webp`);

  return (
    <section className="px-[clamp(8px,1.4vw,20px)]">
      <div ref={frame} className="hero">
        <div className="hero-vid" aria-hidden="true" style={{ backgroundImage: `url(${poster})` }}>
          <video
            ref={video}
            className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
            src={asset(hero.video)}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            tabIndex={-1}
          />
        </div>
        <div className="hero-ov" aria-hidden="true" />
        <div className="hero-body">
          <img
            className="hero-logo"
            src={image("logo-cream.webp")}
            alt={`${site.name} — ${site.tagline}`}
            fetchPriority="high"
          />
          <h1 className="display">
            {hero.title[0]}
            <br />
            {hero.title[1]}
          </h1>
          <div className="flex flex-wrap justify-center gap-3">
            <HomeLink hash="contact" className="btn hero-primary !min-h-[54px]">
              {hero.primary}
              <ArrowLeft />
            </HomeLink>
            <HomeLink hash="clips" className="btn hero-ghost !min-h-[54px]">
              <Play />
              {hero.secondary}
            </HomeLink>
          </div>
        </div>
      </div>
    </section>
  );
}
