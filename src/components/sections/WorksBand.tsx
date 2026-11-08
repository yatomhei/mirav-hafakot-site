import { useEffect, useRef, useState } from "react";
import { Works } from "./Works";
import { Stills } from "./Stills";

/**
 * The works and stills sections share one background: cream at first, switching straight
 * to olive-soft (no fade) once the works title's centre reaches the middle of the screen — and
 * back to cream when scrolling up past that point.
 */
export function WorksBand() {
  const band = useRef<HTMLDivElement>(null);
  const [olive, setOlive] = useState(false);

  useEffect(() => {
    const title = band.current?.querySelector<HTMLElement>("#clips h2");
    if (!title) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const r = title.getBoundingClientRect();
      setOlive(r.top + r.height / 2 <= window.innerHeight / 2);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // The title rises into place on its own; re-check once that movement ends.
    title.addEventListener("transitionend", onScroll);
    return () => {
      title.removeEventListener("transitionend", onScroll);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={band} className={olive ? "bg-olive-soft" : "bg-cream"}>
      <Works />
      <Stills />
    </div>
  );
}
