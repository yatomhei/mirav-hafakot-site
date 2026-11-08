import { useEffect, useRef, useState } from "react";
import { Works } from "./Works";
import { Stills } from "./Stills";

/**
 * The works and stills sections share one background: cream at first, switching straight
 * to olive-soft (no fade) once the works section's top reaches the top of the screen — and
 * back to cream when scrolling up past that point.
 */
export function WorksBand() {
  const band = useRef<HTMLDivElement>(null);
  const [olive, setOlive] = useState(false);

  useEffect(() => {
    const section = band.current?.querySelector<HTMLElement>("#clips");
    if (!section) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      setOlive(section.getBoundingClientRect().top <= 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
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
