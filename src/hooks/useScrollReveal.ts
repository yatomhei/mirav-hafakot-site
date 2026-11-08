import { useEffect } from "react";

/**
 * Fades and lifts every [data-reveal] element as it scrolls into view.
 * data-reveal="late" is left to its section, which adds .is-revealed itself (testimonials).
 * IntersectionObserver rather than CSS scroll timelines: it works whatever is scrolling
 * (the page, or an embedding viewer). <html> only gets .reveal-ready once the observer
 * runs, so the content stays visible if this script never does. A MutationObserver
 * picks up elements added later (filter changes, route changes).
 */
export function useScrollReveal() {
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    const watch = (root: ParentNode) => {
      root
        .querySelectorAll<HTMLElement>('[data-reveal]:not(.is-revealed):not([data-reveal="late"])')
        .forEach((el) => {
          io.observe(el);
        });
    };

    document.documentElement.classList.add("reveal-ready");
    watch(document);

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches('[data-reveal]:not([data-reveal="late"])')) io.observe(node);
          watch(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
