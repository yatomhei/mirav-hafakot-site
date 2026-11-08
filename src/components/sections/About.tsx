import { Fragment } from "react";
import { about } from "@/content/home";
import { Picture } from "@/components/ui/Picture";

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
    <section id="about">
      <div
        data-reveal
        className="mx-auto max-w-[1080px] px-[clamp(16px,4vw,48px)] pt-[clamp(120px,15vw,220px)] pb-[clamp(72px,10vw,120px)] text-center"
      >
        <div className="relative mx-auto mb-10 aspect-[3/4] w-[clamp(180px,20vw,280px)] overflow-hidden rounded-[clamp(12px,1.2vw,18px)] bg-beige">
          <Picture photo={about.portrait} sizes="(max-width: 760px) 50vw, 280px" />
        </div>
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
