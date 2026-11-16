import { intro } from "@/content/home";
import { HomeLink } from "@/components/ui/HomeLink";
import { ArrowLeft } from "@/components/ui/icons";

/** Short intro right under the hero: one sentence about Merav and the contact button. */
export function Intro() {
  return (
    <section aria-label="היכרות" className="px-[var(--gutter)]">
      <div
        data-reveal
        className="mx-auto flex max-w-[900px] flex-col items-center gap-[clamp(28px,3.5vw,44px)] pt-[clamp(96px,12vw,170px)] pb-[clamp(56px,7vw,96px)] text-center max-[760px]:pt-[64px]"
      >
        <p className="text-[clamp(26px,3.2vw,44px)] leading-[1.35] font-light tracking-[-0.01em] text-balance">
          {intro.text}
        </p>
        <HomeLink
          hash="contact"
          className="btn btn-primary !min-h-[62px] !px-10 !text-[19px] !font-normal max-[760px]:!min-h-[52px] max-[760px]:!px-6 max-[760px]:!text-[16px]"
        >
          {intro.cta}
          <ArrowLeft />
        </HomeLink>
      </div>
    </section>
  );
}
