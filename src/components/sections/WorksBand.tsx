import { useEffect, useRef, useState } from "react";
import { Works } from "./Works";
import { Stills } from "./Stills";

/**
 * The works and stills sections share one background: cream at first, turning olive-soft
 * (fading over 700ms) once the works title reaches the top of the screen — and back to
 * cream when scrolling up past that point.
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
      setOlive(title.getBoundingClientRect().top <= 0);
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
    <div
      ref={band}
      className={`${olive ? "bg-olive-soft" : "bg-cream"} transition-colors duration-700 ease-out`}
    >
      <Works />
      <Stills />
    </div>
  );
}
