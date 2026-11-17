import { Fragment } from "react";
import { useHome } from "@/content/context";
import { Picture } from "@/components/ui/Picture";
import { BrokenLines } from "@/components/ui/BrokenLines";

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

/** About Merav, below the services: portrait beside the text on desktop, stacked below it on smaller screens. */
export function About() {
  const { about } = useHome();
  return (
    // Desktop: portrait beside the text (portrait on the right, the reading start in RTL).
    // ≤900px: stacked and centred, portrait below the text; phones: a square portrait.
    <section id="about">
      <div
        data-reveal
        className="mx-auto grid max-w-[var(--content-max)] grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-[clamp(40px,6vw,96px)] px-[var(--gutter)] py-[clamp(88px,11vw,150px)] text-right max-[900px]:grid-cols-1 max-[900px]:text-center"
      >
        <div className="portrait-frame relative mx-auto aspect-[3/4] w-full max-w-[460px] overflow-hidden rounded-[clamp(12px,1.2vw,18px)] bg-beige max-[900px]:order-last max-[900px]:w-[clamp(220px,65vw,340px)] max-[760px]:aspect-square max-[760px]:w-[min(100%,300px)]">
          <Picture photo={about.portrait} sizes="(max-width: 900px) 65vw, 460px" />
        </div>
        <div>
          <p className="caption mb-8">{about.caption}</p>
          <h2 className="about-title mb-10 font-light leading-none tracking-[-0.015em]">
            <BrokenLines lines={about.title} />
          </h2>
          <div className="flex max-w-[940px] flex-col gap-[0.9em] text-[clamp(19px,1.8vw,24px)] leading-[1.65] font-light max-[900px]:mx-auto">
            {about.body.map((p, i) => (
              <p key={i}>
                <RichText text={p} />
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
