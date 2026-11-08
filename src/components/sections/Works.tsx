import { useEffect, useRef, useState } from "react";
import { clips, works } from "@/content/home";
import type { Video } from "@/content/types";
import { Picture } from "@/components/ui/Picture";
import { useVideoLink } from "@/components/ui/VideoPlayer";
import { ArrowLeft, ArrowRight, Play } from "@/components/ui/icons";

/** 2.5 thumbnails per view on desktop (edge to edge above 1000px), one per view at ≤640px. */
function usePerView() {
  const [pv, setPv] = useState(2.5);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const set = () => setPv(mq.matches ? 1 : 2.5);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  return pv;
}

function Slide({ clip, visible, basis }: { clip: Video; visible: boolean; basis: string }) {
  const link = useVideoLink(clip);
  return (
    <a
      {...link}
      className="car-slide flex min-w-0 flex-col gap-4 rounded-[clamp(12px,1.2vw,18px)] text-ink no-underline"
      style={{ flex: `0 0 ${basis}` }}
      aria-label={`צפייה: ${clip.title}`}
      aria-hidden={!visible || undefined}
      tabIndex={visible ? 0 : -1}
    >
      <span className="relative block aspect-[16/10] overflow-hidden rounded-[clamp(12px,1.2vw,18px)] bg-beige">
        {clip.thumb && (
          <Picture photo={clip.thumb} decorative sizes="(max-width: 640px) 92vw, 40vw" />
        )}
        <span aria-hidden="true" className="absolute inset-0 bg-[rgb(46_49_40/0.18)]" />
        <span
          aria-hidden="true"
          className="play-ring absolute top-1/2 left-1/2 flex h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgb(250_240_235/0.9)] text-cream"
        >
          <Play />
        </span>
      </span>
      <span className="item-title px-0.5">{clip.title}</span>
    </a>
  );
}

export function Works() {
  const pv = usePerView();
  const pages = Math.ceil(clips.length - pv) + 1;
  const [page, setPage] = useState(0);
  const current = Math.min(page, pages - 1);
  const step = (d: number) => setPage((p) => (Math.min(p, pages - 1) + d + pages) % pages);
  const touchX = useRef<number | null>(null);

  const gaps = Math.ceil(pv) - 1;
  const slide = `((100% - ${gaps} * var(--car-gap)) / ${pv})`;
  // RTL: the track starts at the right edge and moves right to reveal the next slides.
  const offset = `min(${current} * (${slide} + var(--car-gap)), ${clips.length} * ${slide} + ${clips.length - 1} * var(--car-gap) - 100%)`;

  return (
    <section
      id="clips"
      className="overflow-hidden bg-olive-soft pt-[clamp(72px,11vw,120px)] pb-[clamp(48px,11vw,72px)]"
    >
      <div data-reveal className="works-wrap mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
        <div className="works-head mx-auto mb-[clamp(20px,3vw,44px)] max-w-[760px] text-center">
          <p className="caption mb-6">{works.caption}</p>
          <h2 className="heading-section mb-5">{works.title}</h2>
          <p className="lead">{works.lead}</p>
        </div>

        <div
          className="car mt-[clamp(12px,2.5vw,32px)]"
          role="region"
          aria-roledescription="קרוסלה"
          aria-label="סרטים וקליפים נבחרים"
          onTouchStart={(e) => (touchX.current = e.touches[0]!.clientX)}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = e.changedTouches[0]!.clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 40) step(dx > 0 ? 1 : -1);
          }}
        >
          <div className="car-view overflow-hidden py-1.5">
            <div
              className="car-track flex gap-[var(--car-gap)]"
              style={{ transform: `translateX(calc(${offset}))` }}
            >
              {clips.map((c, k) => (
                <Slide
                  key={c.youtubeId}
                  clip={c}
                  basis={`calc${slide}`}
                  visible={k >= current && k < current + Math.ceil(pv)}
                />
              ))}
            </div>
          </div>

          <div className="car-ctrl mt-[clamp(24px,3vw,40px)] flex items-center justify-center gap-[clamp(12px,2vw,24px)] text-ink">
            <button
              type="button"
              className="icon-btn car-arrow"
              aria-label="הקודם"
              onClick={() => step(-1)}
            >
              <ArrowRight />
            </button>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: pages }, (_, k) => (
                <button
                  key={k}
                  type="button"
                  className="car-dot inline-flex h-11 w-7 items-center justify-center"
                  aria-label={`עמוד ${k + 1} מתוך ${pages}`}
                  aria-current={k === current || undefined}
                  onClick={() => setPage(k)}
                >
                  <span
                    className="block h-2 rounded-full bg-ink transition-[width,opacity] duration-300"
                    style={{ width: k === current ? 22 : 8, opacity: k === current ? 1 : 0.35 }}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              className="icon-btn car-arrow"
              aria-label="הבא"
              onClick={() => step(1)}
            >
              <ArrowLeft />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
