/**
 * Site-wide switches that are not content. Content (copy, images, contact details) lives
 * in src/content and becomes admin-editable in phase 3; design lives in src/styles.css.
 */
export const siteConfig = {
  /** false until launch: every page gets noindex (meta + X-Robots-Tag header). */
  indexable: false,
  locale: "he_IL",
  /** Public URL once the domain is connected (used for canonical / og:url). */
  url: "",
} as const;
