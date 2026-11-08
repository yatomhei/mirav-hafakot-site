import { stills } from "@/content/home";
import { Picture } from "@/components/ui/Picture";

/** Stills band under the works: text column (1/3) + dense photo grid (2/3). */
export function Stills() {
  return (
    <section
      id="stills"
      aria-label="צילומי סטילס"
      className="bg-olive-soft pt-[clamp(72px,11vw,120px)] pb-[clamp(72px,11vw,140px)]"
    >
      <div data-reveal className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
        <div className="stills-wrap grid items-center gap-[clamp(32px,5vw,80px)]">
          <div>
            <h3 className="heading-section mb-5 !leading-[0.95]">{stills.title}</h3>
            <p className="lead">{stills.text}</p>
          </div>
          <StillsGrid />
        </div>
      </div>
    </section>
  );
}

export function StillsGrid() {
  return (
    <ul className="stills-grid m-0 list-none p-0" aria-label="דוגמאות לצילומי סטילס">
      {stills.photos.map((p) => (
        <li
          key={p.name}
          className={`still img-zoom relative overflow-hidden rounded-[clamp(12px,1.2vw,18px)] bg-beige ${p.tall ? "row-span-2" : ""} ${p.last ? "still-last" : ""}`}
        >
          <figure className="m-0 h-full">
            <Picture photo={p} sizes="(max-width: 640px) 50vw, (max-width: 820px) 33vw, 22vw" />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 z-[1] h-[45%] bg-gradient-to-t from-[rgb(46_49_40/0.55)] to-transparent"
            />
            <figcaption className="absolute inset-0 z-[2] flex items-end justify-start px-[clamp(12px,1.4vw,18px)] py-[clamp(10px,1.2vw,16px)] text-right text-[clamp(14px,1.1vw,17px)] leading-[1.4] font-light text-cream opacity-[0.92] [text-shadow:0_1px_10px_rgb(0_0_0/0.3)]">
              {p.label}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
