import { Link } from "@tanstack/react-router";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { useContent, useHome } from "@/content/context";
import type { Video } from "@/content/types";
import { contact as launchContact } from "@/content/home";
import { DEFAULT_MESSAGE_TEMPLATE, fillMessage } from "@/content/whatsapp-message";
import { useRise } from "@/hooks/useRise";
import { image, photoFile } from "@/lib/asset";
import { isPlaceholder, useContactLinks } from "@/lib/contact";
import { BrokenLines } from "@/components/ui/BrokenLines";
import { Picture, VideoThumb } from "@/components/ui/Picture";
import { useVideoLink } from "@/components/ui/VideoPlayer";
import { adsEnabled, reopenConsent, trackCall, trackLead } from "@/lib/ads";
import { altText, PORTRAIT_FALLBACK, SCREENSHOT_FALLBACK } from "@/lib/alt";
import { FINALE_ICON, MaskIcon, stepIcon } from "./step-icons";
import { Facebook, Instagram, Phone, TikTok, WhatsApp, YouTube } from "@/components/ui/icons";

/**
 * The bar/bat mitzvah landing page, standalone: no site header or footer, its own short
 * footer, and links back to the rest of the site (the logos and "more about me"). Layout,
 * colours and sizes follow the approved design (canvas version 2); every text, clip and photo
 * comes from the admin's landing page tab.
 *
 * Motion (all off under reduced motion): the opening rises in on load and its clip settles
 * from a slight zoom; sections rise in as they scroll into view (data-reveal); clips, photos
 * and steps follow one after another (useRise); each worry plays like a short chat, the
 * question first and then Merav's answer; the "spoiler alert" line gives a small shake.
 */
export function BarMitzvahLanding() {
  return (
    <div className="lp">
      <Hero />
      <Idea />
      <Clips />
      <Worries />
      <Story />
      <Experience />
      <Testimonials />
      <Process />
      <Contact />
      <About />
    </div>
  );
}

const useLanding = () => useContent().barMitzvahLanding;

const H2 =
  "m-0 font-light text-[clamp(36px,5vw,72px)] leading-[1.08] tracking-[-0.02em] text-balance";
const H2_SMALL =
  "m-0 font-light text-[clamp(36px,4.6vw,64px)] leading-[1.1] tracking-[-0.02em] text-balance";
const ACCENT = "m-0 font-normal text-olive-deep";
const BODY = "m-0 text-[clamp(18px,1.6vw,21px)] leading-[1.75]";
const SECTION = "px-[var(--gutter)] py-[var(--section-pad)]";

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

function PlayTriangle({ size = 18 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <path d="M18 12L8 6v12z" />
    </svg>
  );
}

/** A pill button to the form at the bottom of the page. */
function ToForm({ children, big }: { children: ReactNode; big?: boolean }) {
  return (
    <a
      href="#lp-contact"
      className={`btn btn-primary lp-btn ${big ? "!min-h-[62px] !px-10 !text-[19px] !font-normal" : "!min-h-[58px] !px-[34px] !text-[18px]"}`}
    >
      {children}
      <Arrow />
    </a>
  );
}

/** The logo, linking to the rest of Merav's site. */
function HomeLogo({ className }: { className: string }) {
  const { site } = useContent();
  return (
    <Link to="/" className="lp-logo inline-block rounded-lg" aria-label={`${site.name}: לאתר`}>
      {/* Shown up to 256px wide: the small file on ordinary screens, the large one on sharp
          ones. */}
      <img
        src={image("logo-color.webp")}
        srcSet={`${image("logo-color.webp")} 288w, ${image("logo-color-lg.webp")} 768w`}
        sizes="(max-width: 900px) 180px, 256px"
        width={768}
        height={384}
        alt=""
        className={`block w-auto ${className}`}
      />
    </Link>
  );
}

/** A clip's cover: plays in the site's video lightbox (or on YouTube with a modifier key). */
function ClipLink({
  video,
  children,
  className,
}: {
  video: Video;
  children: ReactNode;
  className: string;
}) {
  const link = useVideoLink(video);
  return (
    <a {...link} className={`lp-clip ${className}`} aria-label={`צפייה: ${video.title}`}>
      {children}
    </a>
  );
}

// ---------- 01 Opening ----------

function Hero() {
  const { hero } = useLanding();
  return (
    <section
      aria-labelledby="lp-title"
      className="px-[var(--gutter)] pt-[clamp(56px,7vw,110px)] pb-[clamp(56px,7vw,100px)] text-center"
    >
      <div className="mx-auto flex max-w-[960px] flex-col items-center gap-[22px]">
        <div className="lp-in mb-[clamp(16px,3vw,48px)]" style={{ "--d": "0ms" } as CSSProperties}>
          <HomeLogo className="h-[clamp(80px,9vw,128px)]" />
        </div>
        <h1
          id="lp-title"
          className="lp-in m-0 text-[clamp(42px,6vw,84px)] font-light leading-[1.15] tracking-[-0.02em] text-balance"
          style={{ "--d": "120ms" } as CSSProperties}
        >
          <BrokenLines lines={hero.title} />
        </h1>
        <p
          className="lp-in m-0 mt-2 max-w-[36em] text-[clamp(18px,1.7vw,22px)] leading-[1.6]"
          style={{ "--d": "300ms" } as CSSProperties}
        >
          {hero.lead}
          {hero.leadAccent && (
            <>
              {" "}
              <span className="font-medium text-olive-deep">{hero.leadAccent}</span>
            </>
          )}
        </p>
        <div
          className="lp-in mt-[clamp(16px,2.4vw,32px)] flex flex-wrap items-center justify-center gap-x-7 gap-y-3 max-[640px]:w-full max-[640px]:flex-col max-[640px]:items-stretch"
          style={{ "--d": "360ms" } as CSSProperties}
        >
          <ToForm>{hero.cta}</ToForm>
          <a
            href="#lp-clips"
            className="lp-link inline-flex min-h-11 items-center justify-center gap-2 text-[17px] font-normal text-ink no-underline"
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            >
              <path d="M17 12L8 6.5v11z" />
            </svg>
            {hero.clipsLink}
          </a>
        </div>
      </div>
      {hero.video.youtubeId && (
        <div className="lp-hero-clip mx-auto mt-[clamp(56px,7vw,104px)] max-w-[1120px]">
          <ClipLink
            video={hero.video}
            className="relative block aspect-video overflow-hidden rounded-[clamp(16px,2vw,28px)] bg-beige"
          >
            <span className="lp-settle absolute inset-0 block">
              <VideoThumb video={hero.video} sizes="(max-width: 1200px) 92vw, 1120px" priority />
            </span>
            <span aria-hidden="true" className="absolute inset-0 bg-[rgb(46_49_40/0.15)]" />
            <span
              aria-hidden="true"
              className="lp-play absolute top-1/2 left-1/2 flex h-[88px] w-[88px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgb(250_240_235/0.9)] text-cream"
            >
              <PlayTriangle size={26} />
            </span>
          </ClipLink>
        </div>
      )}
    </section>
  );
}

// ---------- 02 The idea ----------

function Idea() {
  const { idea } = useLanding();
  return (
    <section
      aria-labelledby="lp-idea"
      className="px-[var(--gutter)] pt-[clamp(24px,4vw,48px)] pb-[var(--section-pad)]"
    >
      <div
        data-reveal
        className="mx-auto flex max-w-[860px] flex-col items-center gap-6 text-center"
      >
        <h2 id="lp-idea" className={`${H2_SMALL} max-w-[700px]`}>
          {idea.title}
        </h2>
        {idea.question && (
          <p className={`${ACCENT} max-w-[30em] text-[clamp(20px,2vw,26px)] leading-[1.5]`}>
            {idea.question}
          </p>
        )}
        {idea.text.length > 0 && (
          <p className={`${BODY} max-w-[600px]`}>
            <BrokenLines lines={idea.text} />
          </p>
        )}
      </div>
    </section>
  );
}

// ---------- 03 Sample clips ----------

function Clips() {
  const { clips } = useLanding();
  const grid = useRise<HTMLDivElement>(".lp-clip-item", { delay: (k) => (k % 2) * 120 });
  return (
    <section id="lp-clips" aria-labelledby="lp-clips-title" className={`bg-olive-soft ${SECTION}`}>
      <div className="mx-auto max-w-[var(--content-max)]">
        <div
          data-reveal
          className="mx-auto mb-[clamp(40px,5vw,64px)] flex max-w-[760px] flex-col gap-[18px] text-center"
        >
          <h2 id="lp-clips-title" className={H2}>
            {clips.title}
          </h2>
          {clips.lead && (
            <p className="m-0 text-[clamp(18px,1.7vw,22px)] leading-[1.6]">{clips.lead}</p>
          )}
        </div>
        <div
          ref={grid}
          className="grid grid-cols-2 gap-x-[clamp(16px,2vw,28px)] gap-y-[clamp(32px,4vw,52px)] max-[640px]:grid-cols-1"
        >
          {clips.items.map((video, i) => (
            <div key={`${video.youtubeId}-${i}`} className="lp-clip-item">
              <ClipLink
                video={video}
                className="flex flex-col gap-[14px] rounded-[clamp(12px,1.2vw,18px)] text-ink no-underline"
              >
                <span className="relative block aspect-[16/10] overflow-hidden rounded-[clamp(12px,1.2vw,18px)] bg-beige">
                  <VideoThumb video={video} sizes="(max-width: 640px) 92vw, 46vw" />
                  <span aria-hidden="true" className="absolute inset-0 bg-[rgb(46_49_40/0.18)]" />
                  <span
                    aria-hidden="true"
                    className="lp-play absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgb(250_240_235/0.9)] text-cream"
                  >
                    <PlayTriangle />
                  </span>
                </span>
                <span className="px-0.5 text-[clamp(18px,1.5vw,22px)] font-medium leading-[1.3]">
                  {video.title}
                </span>
              </ClipLink>
            </div>
          ))}
        </div>
        <div className="mt-[clamp(48px,6vw,72px)] flex justify-center">
          <ToForm big>{clips.cta}</ToForm>
        </div>
      </div>
    </section>
  );
}

// ---------- 04 Worries: what kids and parents ask before they start ----------

/** Wide enough screens to pin the questions section (both columns fit on screen). */
const PIN_WORRIES = "(min-width: 40.01rem) and (min-height: 720px)";

/**
 * The questions section's sequence. Pinned (wide screens): each [data-at] element turns on
 * (.is-on) once the section's scroll progress passes its value, so the visitor can't scroll
 * past before every answer is in, and scrolling is never blocked. Elsewhere (phones): each
 * one turns on as it scrolls into view. Off under reduced motion; without this script, all
 * of it simply shows.
 */
function useWorriesSequence<T extends HTMLElement>() {
  const root = useRef<T>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pinned = window.matchMedia(PIN_WORRIES);
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-at]")).map((node) => ({
      node,
      at: Number(node.dataset["at"]),
    }));
    el.classList.add("lp-armed");
    const stick = el.firstElementChild as HTMLElement | null;
    /** Pinned only where the whole section fits on screen; otherwise it scrolls normally. */
    const fits = () => {
      const first = stick?.firstElementChild;
      const last = stick?.lastElementChild;
      if (!stick || !first || !last) return false;
      const pad = parseFloat(getComputedStyle(stick).paddingTop) * 2;
      const need = last.getBoundingClientRect().bottom - first.getBoundingClientRect().top + pad;
      return need <= window.innerHeight;
    };
    let frame = 0;
    const update = () => {
      frame = 0;
      const pin = pinned.matches && fits();
      el.classList.toggle("lp-nopin", !pin);
      const rect = el.getBoundingClientRect();
      const start = window.innerHeight * 0.35;
      const progress = (start - rect.top) / Math.max(1, start + rect.height - window.innerHeight);
      for (const { node, at } of items) {
        const on = pin
          ? progress >= at
          : node.getBoundingClientRect().top < window.innerHeight * 0.85;
        node.classList.toggle("is-on", on);
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
      el.classList.remove("lp-armed", "lp-nopin");
    };
  }, []);
  return root;
}

function Worries() {
  const { worries } = useLanding();
  const section = useWorriesSequence<HTMLElement>();
  const n = worries.items.length;
  if (!n) return null;
  // Pinned: as the section arrives the questions pop in one after another on a timer
  // (styles.css staggers them by --i), then the answers come in one by one with the scroll
  // (0.3 to 0.9 of the pinned stretch).
  const aAt = (i: number) => 0.3 + (0.6 * i) / Math.max(1, n);
  return (
    <section ref={section} aria-labelledby="lp-worries" className="lp-pin2">
      <div className="lp-pin2-stick">
        <h2
          id="lp-worries"
          data-reveal
          className={`${H2} mx-auto mb-[clamp(48px,min(7vw,10svh),96px)] max-w-[900px] text-center`}
        >
          <span className="block">
            <BrokenLines lines={worries.title} />
          </span>
        </h2>
        <div className="mx-auto grid w-full max-w-[1240px] grid-cols-2 gap-x-[clamp(32px,5vw,80px)] gap-y-[clamp(40px,min(6vw,9svh),88px)] max-[640px]:grid-cols-1">
          {worries.items.map((w, i) => (
            // A short chat: the question bubble on the right, Merav's answer on the left.
            <div key={i} className="flex flex-col gap-3">
              <h3
                data-at="0"
                style={{ "--i": i } as CSSProperties}
                className="lp-q m-0 max-w-[88%] self-start rounded-[24px] bg-olive px-[clamp(18px,2vw,26px)] py-[clamp(12px,1.4vw,18px)] text-[clamp(20px,1.9vw,26px)] font-light leading-[1.25] tracking-[-0.01em] text-balance text-cream [border-end-start-radius:6px]"
              >
                {w.q}
              </h3>
              <p
                data-at={aAt(i).toFixed(3)}
                className="lp-a m-0 max-w-[88%] self-end rounded-[24px] bg-olive-soft px-[clamp(18px,2vw,26px)] py-[clamp(12px,1.4vw,18px)] text-[clamp(16px,1.35vw,18px)] leading-[1.55] text-ink [border-end-end-radius:6px]"
              >
                {w.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- 05 Gefen's story ----------

function Story() {
  const { story } = useLanding();
  const strip = useRise<HTMLDivElement>(".lp-strip-item", { delay: (k) => k * 90 });
  return (
    <section aria-labelledby="lp-story" className={`bg-olive text-cream ${SECTION}`}>
      <div
        data-reveal
        className="mx-auto flex max-w-[760px] flex-col items-center gap-[22px] text-center"
      >
        {story.caption && (
          <p className="m-0 text-[clamp(18px,1.8vw,24px)] font-medium tracking-[0.04em] text-cream">
            {story.caption}
          </p>
        )}
        <h2 id="lp-story" className={`${H2_SMALL} mb-2 text-cream`}>
          {story.title}
        </h2>
        <div className="flex flex-col items-center gap-[18px] text-[clamp(17px,1.5vw,20px)] leading-[1.75]">
          {story.body.map((p, i) => (
            <p key={i} className="m-0 max-w-[650px]">
              {p}
            </p>
          ))}
        </div>
      </div>
      {story.photos.length > 0 && (
        // Five frames edge to edge across the page; phones: inside the gutter, one wide then 2x2.
        <div
          ref={strip}
          className="lp-strip mx-[calc(-1*var(--gutter))] mt-[clamp(56px,7vw,96px)] grid gap-[clamp(8px,1vw,14px)] max-[640px]:mx-0"
          style={{ "--n": story.photos.length } as CSSProperties}
        >
          {story.photos.map((photo, i) => (
            <div key={`${photo.name}-${i}`} className="lp-strip-item">
              <div className="lp-strip-photo img-zoom relative aspect-[3/2] overflow-hidden rounded-[clamp(10px,1vw,16px)] bg-[#7C8366]">
                <Picture
                  photo={photo}
                  sizes="(max-width: 640px) 46vw, 20vw"
                  fallbackAlt={story.caption ? `תמונה מתוך ${story.caption}` : "תמונה מתוך הסיפור"}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {story.video.youtubeId && story.cta && (
        <div className="mt-[clamp(40px,5vw,64px)] flex justify-center">
          <StoryVideoButton video={story.video}>{story.cta}</StoryVideoButton>
        </div>
      )}
    </section>
  );
}

function StoryVideoButton({ video, children }: { video: Video; children: ReactNode }) {
  const link = useVideoLink(video);
  return (
    <a {...link} className="btn btn-ghost-light lp-btn !min-h-[54px] !font-normal">
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      >
        <path d="M17 12L8 6.5v11z" />
      </svg>
      <span>{children}</span>
    </a>
  );
}

// ---------- 06 The experience ----------

/**
 * Scroll-driven steps for a pinned section: each element with data-step="from to" gets --t,
 * from 0 to 1 as the section's progress moves through that range. Progress starts as the
 * section reaches the middle of the screen and ends when its pinned stretch is scrolled
 * through, so the visitor can't scroll past before everything has appeared, and scrolling
 * is never blocked. The "spoiler alert" line shakes each time it finishes zooming in.
 * Pinned only where the whole content fits on the screen (not on a short screen or at a high
 * zoom): elsewhere it's a plain section with everything shown. Nothing happens under reduced
 * motion (the section then isn't pinned, see styles.css).
 */
function usePinnedSteps<T extends HTMLElement>() {
  const root = useRef<T>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const steps = Array.from(el.querySelectorAll<HTMLElement>("[data-step]")).map((node) => {
      const [from = 0, to = 1] = (node.dataset["step"] ?? "").split(" ").map(Number);
      return { node, from, to };
    });
    const kicker = el.querySelector<HTMLElement>(".lp-kicker");
    const stick = el.firstElementChild as HTMLElement | null;
    /** The content's own height (transforms aside) plus the sticky padding fits the screen. */
    const fits = () => {
      const content = stick?.firstElementChild as HTMLElement | null;
      if (!stick || !content) return false;
      const pad = parseFloat(getComputedStyle(stick).paddingTop) * 2;
      return content.offsetHeight + pad <= window.innerHeight;
    };
    let frame = 0;
    const update = () => {
      frame = 0;
      const pin = fits();
      el.classList.toggle("lp-nopin", !pin);
      if (!pin) {
        for (const { node } of steps) node.style.setProperty("--t", "1");
        kicker?.classList.remove("is-shaking");
        return;
      }
      const rect = el.getBoundingClientRect();
      const start = window.innerHeight * 0.5;
      const span = start + rect.height - window.innerHeight;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / Math.max(1, span)));
      for (const { node, from, to } of steps) {
        const t = Math.min(1, Math.max(0, (progress - from) / (to - from)));
        node.style.setProperty("--t", t.toFixed(3));
      }
      if (kicker) {
        const done = Number(kicker.style.getPropertyValue("--t")) >= 1;
        kicker.classList.toggle("is-shaking", done);
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
      el.classList.remove("lp-nopin");
    };
  }, []);
  return root;
}

function Experience() {
  const { experience } = useLanding();
  const pin = usePinnedSteps<HTMLElement>();
  return (
    // Pinned while scrolling: "Spoiler alert!" zooms in and shakes, then the title, the
    // paragraphs and the button appear one by one; only then does the page move on.
    <section ref={pin} aria-labelledby="lp-exp" className="lp-pin">
      <div className="lp-pin-stick">
        <div className="mx-auto flex max-w-[860px] flex-col items-center gap-6 text-center">
          <h2 id="lp-exp" className={H2_SMALL}>
            {experience.kicker && (
              <span className="mb-4 block">
                <span data-step="0 0.2" className="lp-kicker inline-block font-medium">
                  {experience.kicker}
                </span>
              </span>
            )}
            {/* Keeps the two lines apart for screen readers and text extraction. */}{" "}
            <span data-step="0.32 0.46" className="block">
              {experience.title}
            </span>
          </h2>
          {experience.lead && (
            <p
              data-step="0.44 0.57"
              className={`${ACCENT} max-w-[30em] text-[clamp(20px,2vw,26px)] leading-[1.5]`}
            >
              {experience.lead}
            </p>
          )}
          <div className="flex flex-col items-center gap-[22px]">
            {experience.text && (
              <p data-step="0.55 0.68" className={`${BODY} max-w-[650px]`}>
                {experience.text}
              </p>
            )}
            {experience.closing && (
              <p
                data-step="0.66 0.79"
                className="m-0 max-w-[650px] text-[clamp(22px,2.2vw,30px)] font-light leading-[1.45] text-balance"
              >
                {experience.closing}
              </p>
            )}
          </div>
          <div data-step="0.78 0.9" className="mt-[clamp(16px,2vw,28px)] flex justify-center">
            <ToForm big>{experience.cta}</ToForm>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- 07 Testimonials ----------

/** The quote between Hebrew quote marks, whatever marks were typed around it in the admin. */
const quoted = (text: string) =>
  `״${text
    .trim()
    .replace(/^["'״“”„]+|["'״“”„]+$/g, "")
    .trim()}״`;

function Testimonials() {
  const { testimonials } = useLanding();
  const shots = useRise<HTMLDivElement>(".lp-shot", { delay: (k) => (k % 3) * 100 });
  if (testimonials.hidden) return null;
  return (
    <section aria-labelledby="lp-quotes" className={`bg-olive-soft ${SECTION}`}>
      <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-[clamp(32px,4vw,48px)] text-center">
        <h2 id="lp-quotes" data-reveal className={H2}>
          <span className="block">{testimonials.title}</span>
        </h2>
        {testimonials.quote && (
          <figure
            data-reveal
            className="m-0 my-[clamp(16px,2.4vw,32px)] flex flex-col items-center gap-[22px]"
          >
            <blockquote className="m-0 text-[clamp(26px,3vw,42px)] font-light leading-[1.4] text-olive-deep text-balance">
              {quoted(testimonials.quote)}
            </blockquote>
            {testimonials.author.trim() && (
              <figcaption className="text-[15px] font-medium text-olive-deep">
                {testimonials.author}
              </figcaption>
            )}
          </figure>
        )}
        {testimonials.shots.length > 0 && (
          // Masonry: each screenshot at its own shape, straight on the section's background,
          // with a thin frame; three columns, two on phones.
          <div
            ref={shots}
            className="w-full columns-3 gap-[clamp(12px,2vw,28px)] text-start max-[640px]:columns-2"
          >
            {testimonials.shots.map((photo, i) => (
              <div
                key={`${photo.name}-${i}`}
                className="lp-shot mb-[clamp(12px,2vw,28px)] break-inside-avoid"
              >
                <img
                  src={photoFile(photo.name, 960)}
                  srcSet={[480, 960, 1600]
                    .map((w) => `${photoFile(photo.name, w)} ${w}w`)
                    .join(", ")}
                  sizes="(max-width: 640px) 46vw, 30vw"
                  alt={altText(photo.alt, SCREENSHOT_FALLBACK)}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full rounded-[clamp(10px,1vw,16px)] border border-[rgb(46_49_40/0.22)]"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ---------- 08 Process ----------

/** The site's palette, for the confetti. */
const CONFETTI_COLORS = ["#656C51", "#A2A58F", "#A98A78", "#D5C9BF", "#FAF0EB", "#E8E8DD"];

/**
 * Confetti bursting from the last card ("your clip is ready!") as it pops in: once per visit,
 * never under reduced motion. The library loads only then, so it costs nothing until the
 * visitor gets there. It draws on its own canvas over the page, without a worker (so the
 * content policy needs no exception).
 */
function useFinaleConfetti<T extends HTMLElement>(enabled: boolean) {
  const card = useRef<T>(null);
  useEffect(() => {
    const el = card.current;
    if (!enabled || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    let again = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        // Just as the card finishes popping in.
        timer = window.setTimeout(async () => {
          const { default: confetti } = await import("canvas-confetti");
          const fire = confetti.create(undefined, {
            resize: true,
            useWorker: false,
            disableForReducedMotion: true,
          });
          // A burst from each side of the card and one straight up from its middle; then a
          // second, slightly smaller round a moment later.
          const burst = (size: number) => {
            const box = el.getBoundingClientRect();
            const y = (box.top + box.height / 2) / window.innerHeight;
            const shared = { colors: CONFETTI_COLORS, ticks: 260, gravity: 0.9, scalar: 1.05 };
            void fire({
              ...shared,
              particleCount: Math.round(70 * size),
              angle: 120,
              spread: 60,
              startVelocity: 48,
              origin: { x: box.left / window.innerWidth, y },
            });
            void fire({
              ...shared,
              particleCount: Math.round(70 * size),
              angle: 60,
              spread: 60,
              startVelocity: 48,
              origin: { x: box.right / window.innerWidth, y },
            });
            void fire({
              ...shared,
              particleCount: Math.round(60 * size),
              angle: 90,
              spread: 100,
              startVelocity: 40,
              origin: { x: (box.left + box.width / 2) / window.innerWidth, y },
            });
          };
          burst(1);
          again = window.setTimeout(() => burst(0.7), 650);
        }, 500);
      },
      { threshold: 0.35 },
    );
    // The card itself starts at zero size (it pops in), so watch the row it sits in.
    io.observe(el.parentElement ?? el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
      window.clearTimeout(again);
    };
  }, []);
  return card;
}

function Process() {
  const { process } = useLanding();
  // In order: the title counts down as it moves up the screen ("3," as it enters, then "2,
  // 1... אקשן!"), and the subtitle is complete by the time the title reaches the upper third;
  // then the first card rises, the others as they come into view, and the last one ("your
  // clip is ready!") as soon as it peeks in.
  const header = useHeaderSteps<HTMLDivElement>();
  const list = useRise<HTMLOListElement>(".lp-step", {
    at: (k) => (k === 0 ? 0.55 : k === process.steps.length ? 0.97 : 0.9),
    delay: (k) => (k === 0 ? 300 : 0),
  });
  const finale = useFinaleConfetti<HTMLDivElement>(!process.finale.noConfetti);
  return (
    <section aria-labelledby="lp-process" className={SECTION}>
      <div className="mx-auto max-w-[var(--content-max)]">
        <div
          ref={header}
          className="lp-hs mx-auto mb-[clamp(64px,8vw,112px)] flex max-w-[760px] flex-col gap-[18px] text-center"
        >
          <CountdownTitle id="lp-process" text={process.title} />
          {process.lead && (
            <p
              data-step="0.75 1"
              className={`${ACCENT} text-[clamp(22px,2.4vw,32px)] leading-[1.4] text-balance`}
            >
              {process.lead}
            </p>
          )}
        </div>
        {/* A zigzag timeline: the line runs down the middle with a dot beside each step, and
            the square cards alternate sides, the first on the right (where reading starts).
            Phones: the line runs down the right edge and the cards stack beside it. */}
        <ol ref={list} className="lp-tl m-0 list-none p-0">
          {process.steps.map((step, i) => (
            <li key={i} className="lp-step lp-tl-item">
              <div className="lp-tl-body">
                <span aria-hidden="true" className="lp-tl-line" />
                <span aria-hidden="true" className="lp-tl-dot" />
                <div className="lp-tl-card lp-step-card relative flex flex-col justify-center gap-[clamp(16px,1.8vw,24px)] rounded-[clamp(16px,1.6vw,22px)] border border-beige bg-white p-[clamp(24px,3vw,40px)]">
                  {/* The step's number, in a circle in the upper left corner. */}
                  <span
                    aria-hidden="true"
                    className="absolute top-[clamp(16px,2vw,24px)] left-[clamp(16px,2vw,24px)] flex h-[clamp(40px,3.6vw,48px)] w-[clamp(40px,3.6vw,48px)] items-center justify-center rounded-full border border-brown text-[clamp(15px,1.3vw,17px)] font-medium text-brown tabular-nums"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <StepIcon index={i} />
                  <div className="flex flex-col gap-2.5">
                    <h3 className="m-0 text-[clamp(24px,2.2vw,30px)] font-light leading-[1.2]">
                      {step.title}
                    </h3>
                    <p className="m-0 text-[17px] leading-[1.7]">{step.text}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {process.finale.title && (
            // The end of the line: centred on it, no number, in olive, and it pops in.
            <li className="lp-step lp-tl-item lp-tl-finale">
              <div className="lp-tl-body">
                <span aria-hidden="true" className="lp-tl-line" />
                <div
                  ref={finale}
                  className="lp-tl-card lp-step-card flex flex-col items-center justify-center gap-[clamp(12px,1.4vw,18px)] rounded-[clamp(18px,1.8vw,26px)] bg-olive p-[clamp(28px,3.6vw,48px)] text-center text-cream"
                >
                  <MaskIcon name={FINALE_ICON} className="text-cream" />
                  <h3 className="m-0 text-[clamp(30px,3vw,42px)] font-light leading-[1.15] text-cream">
                    {process.finale.title}
                  </h3>
                  {process.finale.text && (
                    <p className="m-0 max-w-[28em] text-[clamp(17px,1.5vw,19px)] leading-[1.6]">
                      {process.finale.text}
                    </p>
                  )}
                </div>
              </div>
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}

/**
 * Scroll-driven steps for a header, without pinning (.lp-hs in styles.css): as the header's
 * top moves up the screen, from 85% of its height to 30%, each element with data-step="from
 * to" gets --t, 0 to 1, as that progress goes through its range. Tied to the scroll, so the
 * header is always complete by the time it reaches the upper third, however fast the page is
 * scrolled. Nothing happens under reduced motion (everything simply shows).
 */
function useHeaderSteps<T extends HTMLElement>() {
  const root = useRef<T>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const steps = Array.from(el.querySelectorAll<HTMLElement>("[data-step]")).map((node) => {
      const [from = 0, to = 1] = (node.dataset["step"] ?? "").split(" ").map(Number);
      return { node, from, to };
    });
    el.classList.add("lp-hs-armed");
    let frame = 0;
    const update = () => {
      frame = 0;
      const start = window.innerHeight * 0.85;
      const end = window.innerHeight * 0.3;
      const progress = (start - el.getBoundingClientRect().top) / (start - end);
      for (const { node, from, to } of steps) {
        const t = Math.min(1, Math.max(0, (progress - from) / (to - from)));
        node.style.setProperty("--t", t.toFixed(3));
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
      el.classList.remove("lp-hs-armed");
    };
  }, []);
  return root;
}

/**
 * The process title as a countdown ("3, 2, 1... אקשן!"): each word appears in turn as the
 * page scrolls (a data-step range each, see useHeaderSteps), and the last one pops in larger.
 * Works for any title the admin writes (word by word). The full title is in the page from the
 * start, so screen readers and search engines read it whole; without motion it simply shows.
 */
function CountdownTitle({ id, text }: { id: string; text: string }) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  // The first word shows as the title enters; the others share the way up to 0.7, and the
  // subtitle follows (useHeaderSteps).
  const step = (i: number) => {
    if (i === 0) return "-1 0";
    const slot = 0.7 / Math.max(1, words.length - 1);
    return `${((i - 1) * slot + 0.04).toFixed(3)} ${(i * slot).toFixed(3)}`;
  };
  return (
    <h2 id={id} className={`${H2} lp-countdown`}>
      {words.map((word, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span
            data-step={step(i)}
            className={`lp-count ${i === words.length - 1 ? "lp-count-last" : ""}`}
          >
            {word}
          </span>
        </Fragment>
      ))}
    </h2>
  );
}

function StepIcon({ index }: { index: number }) {
  return <MaskIcon name={stepIcon(index)} className="text-olive-deep" />;
}

// ---------- 09 About ----------

function About() {
  const { about } = useLanding();
  return (
    <section aria-labelledby="lp-about" className={`bg-paper ${SECTION}`}>
      <div
        data-reveal
        className="mx-auto grid max-w-[var(--content-max)] grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-[clamp(40px,6vw,96px)] max-[900px]:grid-cols-1"
      >
        <div className="portrait-frame relative mx-auto aspect-[3/4] w-full max-w-[460px] overflow-hidden rounded-[clamp(12px,1.2vw,18px)] bg-beige max-[900px]:order-last max-[900px]:max-w-[320px]">
          <Picture
            photo={about.photo}
            sizes="(max-width: 900px) 320px, 460px"
            fallbackAlt={PORTRAIT_FALLBACK}
          />
        </div>
        <div className="flex flex-col gap-[22px]">
          <h2
            id="lp-about"
            className="m-0 text-[clamp(36px,4.6vw,64px)] font-light leading-[1.08] tracking-[-0.02em]"
          >
            {about.title}
          </h2>
          {about.subtitle && (
            <p className={`${ACCENT} text-[clamp(20px,2vw,26px)] leading-[1.4]`}>
              {about.subtitle}
            </p>
          )}
          <div className="flex max-w-[40em] flex-col gap-[18px] text-[clamp(18px,1.6vw,21px)] leading-[1.75]">
            {about.body.map((p, i) => (
              <p key={i} className="m-0">
                {p}
              </p>
            ))}
          </div>
          {/* The way to the rest of Merav's site. */}
          <Link
            to="/"
            className="lp-link inline-flex min-h-11 items-center gap-2.5 self-start text-[18px] font-medium text-ink no-underline"
          >
            {about.link}
            <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---------- 10 Contact ----------

/**
 * Like the site's contact form: nothing is sent to a server. The form writes a WhatsApp
 * message (the template from the admin's contact tab, with this page's subject) and opens
 * the chat, so the visitor sees it and sends it themselves.
 */
/**
 * The contact section starts in the page's cream, like the section above it, and turns its
 * brown once its title reaches the middle of the screen (back to cream when scrolled back
 * up). Without the script, or under reduced motion, it is simply brown.
 */
function useContactTint<T extends HTMLElement>() {
  const root = useRef<T>(null);
  useEffect(() => {
    const el = root.current;
    const title = el?.querySelector("h2");
    if (!el || !title || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.add("lp-tint");
    let frame = 0;
    const update = () => {
      frame = 0;
      // Where the title sits on the page, ignoring its rise-in animation's offset.
      let top = 0;
      for (
        let node: HTMLElement | null = title;
        node;
        node = node.offsetParent as HTMLElement | null
      ) {
        top += node.offsetTop;
      }
      const middle = top - window.scrollY + title.offsetHeight / 2;
      el.classList.toggle("is-lit", middle <= window.innerHeight / 2);
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
      el.classList.remove("lp-tint", "is-lit");
    };
  }, []);
  return root;
}

function Contact() {
  const { contact, footer } = useLanding();
  const tint = useContactTint<HTMLElement>();
  const home = useHome();
  const links = useContactLinks();
  const [error, setError] = useState("");
  /** The field the error is about, marked invalid and described by the error. */
  const [badField, setBadField] = useState<"name" | "phone" | null>(null);
  const [sent, setSent] = useState(false);
  const [fallback, setFallback] = useState("");
  /** Set for a moment after WhatsApp opens, so a double click doesn't open it twice. */
  const justSent = useRef(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (justSent.current) return;
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const fail = (field: "name" | "phone", message: string) => {
      setError(message);
      setBadField(field);
      (e.currentTarget.elements.namedItem(field) as HTMLInputElement)?.focus();
    };
    if (!name || !phone) {
      fail(name ? "phone" : "name", "נא למלא שם וטלפון כדי שאוכל לחזור אליכם.");
      return;
    }
    // Digits with the usual separators only, 9 to 12 digits: a landline or a mobile, with or
    // without +972.
    const digits = phone.replace(/\D/g, "").length;
    if (!/^[\d\s()+-]+$/.test(phone) || digits < 9 || digits > 12) {
      fail("phone", "נא להזין מספר טלפון תקין, למשל 050-1234567.");
      return;
    }
    setError("");
    setBadField(null);
    justSent.current = true;
    window.setTimeout(() => (justSent.current = false), 2000);
    const text = fillMessage(home.contact.message ?? DEFAULT_MESSAGE_TEMPLATE, {
      name,
      phone,
      service: contact.interest,
      message: "",
    });
    const href = links.whatsapp(text);
    trackLead();
    const win = window.open(href, "_blank");
    if (win) win.opener = null;
    setFallback(win ? "" : href);
    setSent(true);
  };

  return (
    <section
      ref={tint}
      id="lp-contact"
      aria-labelledby="lp-contact-title"
      className="bg-brown px-[clamp(16px,4vw,48px)] py-[clamp(80px,11vw,150px)] text-ink-deep"
    >
      <div
        data-reveal
        className="mx-auto flex max-w-[900px] flex-col items-center gap-[clamp(36px,4vw,56px)] text-center"
      >
        <div className="flex flex-col items-center gap-[22px]">
          <h2
            id="lp-contact-title"
            className="m-0 text-[clamp(44px,6vw,84px)] font-light leading-[1.1] text-balance"
          >
            {contact.title}
          </h2>
          {contact.text.map((p, i) => (
            <p key={i} className="m-0 max-w-[34em] text-[clamp(18px,1.7vw,22px)] leading-[1.6]">
              {p}
            </p>
          ))}
        </div>
        <form
          noValidate
          onSubmit={onSubmit}
          aria-describedby="lp-contact-note"
          className="grid w-full max-w-[640px] grid-cols-2 gap-3 max-[640px]:grid-cols-1"
        >
          <label className="text-start">
            <span className="field-label">שם מלא (חובה)</span>
            <input
              className="field"
              type="text"
              name="name"
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={badField === "name" || undefined}
              aria-describedby={badField === "name" ? "lp-contact-error" : undefined}
            />
          </label>
          <label className="text-start">
            <span className="field-label">טלפון (חובה)</span>
            <input
              className="field"
              type="tel"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              placeholder="050-1234567"
              required
              aria-required="true"
              aria-invalid={badField === "phone" || undefined}
              aria-describedby={badField === "phone" ? "lp-contact-error" : undefined}
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary submit-btn lp-btn col-span-full mt-1.5 !min-h-[58px] !text-[18px]"
          >
            {contact.submit}
            <Arrow />
          </button>
          {error && (
            <p
              id="lp-contact-error"
              role="alert"
              className="col-span-full m-0 text-[15px] font-medium"
            >
              {error}
            </p>
          )}
          <p role="status" className="col-span-full m-0 text-[15px] empty:hidden">
            {sent && (home.contact.sent ?? launchContact.sent)}
            {fallback && (
              <>
                {" "}
                <a
                  href={fallback}
                  target="_blank"
                  rel="noopener"
                  className="underline underline-offset-4"
                >
                  פתיחת וואטסאפ
                </a>
              </>
            )}
          </p>
        </form>
        <div id="lp-contact-note" className="-mt-4 flex flex-col items-center gap-2 text-[15px]">
          {/* The homepage form's note (edited in the admin's "צור קשר" tab), word for word. */}
          <p className="m-0 leading-[1.6]">
            {home.contact.privacy ?? launchContact.privacy}
            <Link
              to="/privacy"
              className="inline-block py-3 -my-3 text-ink-deep underline underline-offset-4"
            >
              מדיניות הפרטיות
            </Link>
            .
          </p>
          {!isPlaceholder(links.site.phone) && footer.call && (
            <p className="m-0 leading-[1.6]">
              {footer.call}{" "}
              <a
                href={links.tel}
                onClick={trackCall}
                className="inline-block py-3 -my-3 font-medium text-ink-deep underline underline-offset-4"
              >
                <span dir="ltr">{links.site.phone}</span>
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ---------- This page's own footer, simpler than the site's (outside <main>) ----------

/** Phone, site and email: the icon on the left, beside the English and digits it marks. */
const CONTACT_LINK =
  "lp-link inline-flex min-h-11 flex-row-reverse items-center gap-2.5 text-ink no-underline";

/**
 * The footer's question: on wide screens the first sentence (up to its question mark) keeps
 * to one line and the rest starts on the next; on phones it simply wraps.
 */
function FooterTitle({ text }: { text: string }) {
  const [first, rest] = text.split(/(?<=\?)\s+/, 2);
  if (!rest) return <>{text}</>;
  return (
    <>
      <span className="min-[761px]:whitespace-nowrap">{first}</span>
      <br className="max-[760px]:hidden" /> {rest}
    </>
  );
}

export function LandingFooter() {
  const { footer, ads } = useLanding();
  const { site, tel, mail, whatsapp } = useContactLinks();
  const socials = [
    { label: "יוטיוב", href: site.youtubeUrl, Icon: YouTube },
    { label: "פייסבוק", href: site.facebookUrl, Icon: Facebook },
    { label: "אינסטגרם", href: site.instagramUrl, Icon: Instagram },
    { label: "טיקטוק", href: site.tiktokUrl, Icon: TikTok },
  ].filter((s) => !isPlaceholder(s.href));
  const hasPhone = !isPlaceholder(site.phone);
  return (
    <footer className="bg-cream px-[var(--gutter)] pt-[clamp(64px,8vw,112px)] pb-10 text-center text-ink">
      <div className="mx-auto flex max-w-[var(--content-max)] flex-col items-center">
        {/* A last invitation: the question, WhatsApp, or a call. */}
        <div
          data-reveal
          className="flex max-w-[1120px] flex-col items-center gap-[clamp(20px,2.4vw,28px)]"
        >
          {footer.title && (
            <p className="m-0 text-[clamp(32px,4.7vw,64px)] leading-[1.12] font-light tracking-[-0.02em]">
              <FooterTitle text={footer.title} />
            </p>
          )}
          <div className="flex flex-col items-center gap-[clamp(22px,2.6vw,34px)]">
            <a
              href={whatsapp()}
              target="_blank"
              rel="noopener"
              onClick={trackLead}
              className="btn btn-primary lp-btn !min-h-[60px] !px-9 !text-[18px]"
            >
              <WhatsApp size={22} />
              {footer.button}
              <span className="sr-only-he"> (נפתח בכרטיסייה חדשה)</span>
            </a>
            {hasPhone && footer.call && (
              <p className="m-0 text-[17px]">
                {footer.call}{" "}
                <a
                  href={tel}
                  onClick={trackCall}
                  className="lp-link inline-block py-3 -my-3 font-medium text-ink no-underline max-[640px]:mt-1 max-[640px]:block max-[640px]:my-0"
                >
                  <span dir="ltr">{site.phone}</span>
                </a>
              </p>
            )}
          </div>
        </div>
        <div className="mt-[clamp(48px,6vw,72px)] flex w-full justify-center border-t border-[rgb(46_49_40/0.18)] pt-[clamp(40px,5vw,64px)]">
          <HomeLogo className="h-[clamp(80px,8vw,110px)]" />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[17px]">
          {!isPlaceholder(site.email) && (
            <a href={mail} className={CONTACT_LINK}>
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
              <span dir="ltr">{site.email}</span>
            </a>
          )}
          {hasPhone && (
            <a href={tel} onClick={trackCall} className={CONTACT_LINK}>
              <Phone size={18} />
              <span dir="ltr">{site.phone}</span>
            </a>
          )}
        </div>
        {socials.length > 0 && (
          <div className="mt-5 flex gap-2.5">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener"
                aria-label={`${label} (נפתח בכרטיסייה חדשה)`}
                className="social-btn inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgb(46_49_40/0.5)] text-ink"
              >
                <Icon />
              </a>
            ))}
          </div>
        )}
      </div>
      <p className="mx-auto mt-10 mb-0 max-w-[var(--content-max)] border-t border-[rgb(46_49_40/0.18)] pt-7 text-center text-[13px] text-[rgb(46_49_40/0.78)]">
        © {new Date().getFullYear()} {site.name} · {site.tagline}
        {" · "}
        <Link
          to="/privacy"
          className="inline-block py-3 -my-3 whitespace-nowrap text-inherit underline-offset-4 hover:underline"
        >
          מדיניות פרטיות
        </Link>
        {" · "}
        <Link
          to="/accessibility"
          className="inline-block py-3 -my-3 whitespace-nowrap text-inherit underline-offset-4 hover:underline"
        >
          הצהרת נגישות
        </Link>
        {adsEnabled(ads) && (
          <>
            {" · "}
            <button
              type="button"
              onClick={reopenConsent}
              className="inline-block cursor-pointer border-0 bg-transparent px-0 py-3 -my-3 whitespace-nowrap text-inherit underline-offset-4 hover:underline"
            >
              הגדרות עוגיות
            </button>
          </>
        )}
      </p>
    </footer>
  );
}
