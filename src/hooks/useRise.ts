import { useEffect, useRef } from "react";

/**
 * Quick rise-up for a list of items as each one scrolls in. Each matching item is measured
 * (it never moves) and its first child is what rises, so the measurement never includes
 * the movement. An item rises once its top passes `at` (fraction of the screen height).
 * `delay(k)` staggers items that arrive together. Plays once; nothing is hidden until this
 * has run, and never under reduced motion. Styles: .rise / .rise-card / .is-up in styles.css.
 */
export function useRise<T extends HTMLElement>(
  selector: string,
  { at = 0.9, delay = () => 0 }: { at?: number; delay?: (k: number) => number } = {},
) {
  const root = useRef<T>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let pending = Array.from(el.querySelectorAll<HTMLElement>(selector)).map((item, k) => {
      const mover = (item.firstElementChild as HTMLElement | null) ?? item;
      mover.style.transitionDelay = `${delay(k)}ms`;
      mover.classList.add("rise", "rise-card");
      return [item, mover] as const;
    });

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * at;
      pending = pending.filter(([item, mover]) => {
        if (item.getBoundingClientRect().top > line) return true;
        mover.classList.add("is-up");
        return false;
      });
      if (!pending.length) stop();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const stop = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      stop();
    };
    // Options are read once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector]);

  return root;
}
