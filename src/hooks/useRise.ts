import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

/**
 * Quick rise-up for a list of items as each one scrolls in. Each matching item is measured
 * (it never moves) and its first child is what rises, so the measurement never includes
 * the movement. An item rises once its top passes `at` (fraction of the screen height; or a
 * function giving each item its own).
 * `delay(k)` staggers items that arrive together. Plays once; nothing is hidden until this
 * has run, and never under reduced motion. Styles: .rise / .rise-card / .is-up in styles.css.
 *
 * `hold`: the items are hidden, waiting, until it turns false (for example until a heading's
 * own animation has played); they then rise as usual.
 *
 * Arriving from another page, the first check waits until the router has moved the new page
 * to the top: until then the old page's scroll position applies, and every item would count
 * as already passed (shown at once, without its rise).
 */
export function useRise<T extends HTMLElement>(
  selector: string,
  {
    at = 0.9,
    delay = () => 0,
    hold = false,
  }: {
    at?: number | ((k: number) => number);
    delay?: (k: number) => number;
    hold?: boolean;
  } = {},
) {
  const root = useRef<T>(null);
  const router = useRouter();

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let pending = Array.from(el.querySelectorAll<HTMLElement>(selector)).map((item, k) => {
      const mover = (item.firstElementChild as HTMLElement | null) ?? item;
      mover.style.transitionDelay = `${delay(k)}ms`;
      mover.classList.add("rise", "rise-card");
      return [item, mover, typeof at === "function" ? at(k) : at] as const;
    });
    // Hidden and waiting: this runs again once `hold` is lifted.
    if (hold) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      pending = pending.filter(([item, mover, point]) => {
        if (item.getBoundingClientRect().top > window.innerHeight * point) return true;
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
    const start = () => {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      update();
    };
    // Mid-navigation the router hasn't yet recorded the new address as shown (it does that,
    // and resets the scroll, once the page has rendered). A fallback timer covers a render
    // event that never comes.
    let unsubscribe = () => {};
    let fallback = 0;
    if (router.stores.resolvedLocation.get()?.href !== router.latestLocation.href) {
      const go = () => {
        unsubscribe();
        window.clearTimeout(fallback);
        start();
      };
      unsubscribe = router.subscribe("onRendered", go);
      fallback = window.setTimeout(go, 1000);
    } else {
      start();
    }
    return () => {
      unsubscribe();
      window.clearTimeout(fallback);
      cancelAnimationFrame(frame);
      stop();
    };
    // Options are read once on mount (and again when `hold` is lifted).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, hold]);

  return root;
}
