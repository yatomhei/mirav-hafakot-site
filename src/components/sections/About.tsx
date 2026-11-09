import { Fragment } from "react";
import { about } from "@/content/home";
import { Picture } from "@/components/ui/Picture";
import { HomeLink } from "@/components/ui/HomeLink";
import { ArrowLeft } from "@/components/ui/icons";

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

export function About() {
  return (
    // Desktop: portrait beside the text (portrait on the right, the reading start in RTL).
    // ≤900px: stacked and centred, portrait below the text. Phones: square portrait with the
    // contact button under it, both the same width.
    <section id="about">
      <div
        data-reveal
        className="mx-auto grid max-w-[var(--content-max)] grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-[clamp(40px,6vw,96px)] px-[var(--gutter)] pt-[clamp(120px,15vw,220px)] pb-[clamp(72px,10vw,120px)] max-[760px]:pt-[60px] text-right max-[900px]:grid-cols-1 max-[900px]:text-center"
      >
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[460px] overflow-hidden rounded-[clamp(12px,1.2vw,18px)] bg-beige max-[900px]:order-last max-[900px]:w-[clamp(220px,65vw,340px)] max-[760px]:aspect-square max-[760px]:w-[min(100%,300px)]">
          <Picture photo={about.portrait} sizes="(max-width: 900px) 65vw, 460px" />
        </div>
        {/* Phones: the contact button sits under the portrait. */}
        <div className="order-last hidden flex-col items-center gap-4 max-[760px]:flex">
          <p className="text-[18px] leading-[1.4] font-normal">{about.ctaText}</p>
          <HomeLink
            hash="contact"
            className="btn btn-primary w-[min(100%,300px)] !min-h-[50px] !px-5 !text-[15px] !font-normal"
          >
            {about.ctaMobile}
            <ArrowLeft />
          </HomeLink>
        </div>
        <div>
          <p className="caption mb-8">{about.caption}</p>
          <h2 className="about-title mb-10 font-light leading-none tracking-[-0.015em]">
            {about.title[0]}
            <br /> {about.title[1]}
          </h2>
          <p className="max-w-[940px] text-[clamp(20px,2.1vw,27px)] leading-[1.65] font-light max-[900px]:mx-auto">
            <RichText text={about.body} />
          </p>
          {/* On phones a question with a shorter button sits under the portrait instead (above). */}
          <HomeLink
            hash="contact"
            className="btn btn-primary mt-10 !min-h-[62px] !px-10 !text-[19px] !font-normal max-[760px]:!hidden"
          >
            {about.cta}
            <ArrowLeft />
          </HomeLink>
        </div>
      </div>
    </section>
  );
}
