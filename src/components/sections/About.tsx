import { Fragment } from "react";
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

export function About() {
  return (
    <section id="about" className="bg-cream">
      <div
        data-reveal
        className="mx-auto max-w-[1080px] px-[clamp(16px,4vw,48px)] pt-[clamp(120px,15vw,220px)] pb-[clamp(72px,10vw,120px)] text-center"
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
