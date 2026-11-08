import { useState } from "react";
import { process } from "@/content/home";
import { Minus, Plus } from "@/components/ui/icons";

/** "הרבה מעבר לצילום": olive band (#656C51), cream text, numbered rows that open one at a time. */
export function Process() {
  const [open, setOpen] = useState(-1);

  return (
    <section
      id="process"
      aria-labelledby="process-title"
      className="bg-olive px-[var(--gutter)] py-[clamp(88px,11vw,150px)] text-cream"
    >
      <div data-reveal className="mx-auto max-w-[var(--content-max)]">
        <div className="mx-auto mb-[clamp(48px,6vw,88px)] max-w-[820px] text-center">
          <p className="caption mb-6 !text-cream">{process.caption}</p>
          <h2 id="process-title" className="heading-section-lg mb-6">
            {process.title[0]}
            <br />
            {process.title[1]}
          </h2>
          <p className="lead">
            {process.lead[0]}
            <br className="max-[760px]:hidden" /> {process.lead[1]}
          </p>
        </div>

        <div className="border-t border-[rgb(250_240_235/0.25)]">
          {process.items.map((it, k) => {
            const isOpen = open === k;
            return (
              <div key={it.num} className="border-b border-[rgb(250_240_235/0.25)]">
                <h3 className="m-0">
                  <button
                    type="button"
                    id={`incl-btn-${k}`}
                    aria-expanded={isOpen}
                    aria-controls={`incl-panel-${k}`}
                    onClick={() => setOpen(isOpen ? -1 : k)}
                    className="incl-head grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-[clamp(16px,3vw,40px)] border-0 bg-transparent py-[clamp(28px,3.6vw,52px)] text-right text-inherit max-[760px]:grid-cols-[auto_minmax(0,1fr)_auto]"
                  >
                    <span aria-hidden="true" className="text-[13px] tracking-[0.14em] tabular-nums">
                      {it.num}
                    </span>
                    <span className="text-[clamp(26px,4.4vw,56px)] leading-[1.1] font-light tracking-[-0.015em]">
                      {it.title}
                    </span>
                    <span aria-hidden="true" className="text-[16px] font-light max-[760px]:hidden">
                      {it.meta}
                    </span>
                    <span
                      aria-hidden="true"
                      className="incl-icon inline-flex h-12 w-12 flex-none items-center justify-center rounded-full border border-[rgb(250_240_235/0.6)]"
                    >
                      {isOpen ? <Minus /> : <Plus />}
                    </span>
                  </button>
                </h3>
                <div
                  id={`incl-panel-${k}`}
                  role="region"
                  aria-labelledby={`incl-btn-${k}`}
                  className="grid transition-[grid-template-rows] duration-[450ms] ease-[cubic-bezier(.2,.7,.2,1)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p
                      className="body-text max-w-[720px] pr-[clamp(36px,5.4vw,72px)] pb-[clamp(32px,4vw,56px)]"
                      style={{ visibility: isOpen ? "visible" : "hidden" }}
                    >
                      {it.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
