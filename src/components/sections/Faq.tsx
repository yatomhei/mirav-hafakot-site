import { useState } from "react";
import { faq } from "@/content/home";
import { HomeLink } from "@/components/ui/HomeLink";
import { ArrowLeft, Minus, Plus } from "@/components/ui/icons";

/** One answer open at a time; the icon fills olive while open. */
export function Faq() {
  const [open, setOpen] = useState(-1);

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="bg-paper px-[clamp(16px,4vw,48px)] py-[clamp(80px,10vw,140px)] text-ink"
    >
      <div
        data-reveal
        className="mx-auto grid max-w-[960px] grid-cols-1 items-start gap-[clamp(32px,6vw,96px)]"
      >
        <div className="mx-auto max-w-[860px] text-center">
          <p className="caption mb-6">{faq.caption}</p>
          <h2 id="faq-title" className="heading-section mb-[18px]">
            {faq.title}
          </h2>
          <p className="lead">{faq.lead}</p>
        </div>
        <div>
          {faq.items.map((f, k) => {
            const isOpen = open === k;
            return (
              <div key={k} className="border-b border-beige">
                <h3 className="m-0">
                  <button
                    type="button"
                    id={`faq-q-${k}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${k}`}
                    onClick={() => setOpen(isOpen ? -1 : k)}
                    className="faq-q flex min-h-[76px] w-full cursor-pointer items-center justify-between gap-6 border-0 bg-transparent py-5 text-right text-[clamp(18px,1.5vw,21px)] leading-[1.4] font-medium text-ink"
                  >
                    {f.q}
                    <span
                      aria-hidden="true"
                      className={`faq-icon inline-flex h-12 w-12 flex-none items-center justify-center rounded-full border border-olive ${isOpen ? "bg-olive text-cream" : "text-ink"}`}
                    >
                      {isOpen ? <Minus /> : <Plus />}
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-a-${k}`}
                  role="region"
                  aria-labelledby={`faq-q-${k}`}
                  hidden={!isOpen}
                  className="max-w-[62ch] pb-7 text-[clamp(17px,1.3vw,19px)] leading-[1.75] font-light"
                >
                  {f.a}
                </div>
              </div>
            );
          })}
          <div className="mt-[clamp(36px,4vw,52px)] flex justify-center">
            <HomeLink hash="contact" className="btn btn-outline !px-7 !font-normal">
              {faq.cta}
              <ArrowLeft />
            </HomeLink>
          </div>
        </div>
      </div>
    </section>
  );
}
