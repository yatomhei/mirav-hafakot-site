/**
 * URL of a file in public/. Uses Vite's base, which is "/" on the real site and "./"
 * in the shareable preview build, so the same content works in both.
 */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

/** URL of a site image in public/images/. */
export const image = (name: string) => asset(`images/${name}`);

/**
 * One width of a photo set: `<name>-<width>.webp`. A name that is already an address (an
 * admin upload, "/local-uploads/…" or a storage URL) is used as is; anything else is a
 * file in public/images.
 */
export const photoFile = (name: string, width: number) =>
  /^(\/|https?:)/.test(name) ? `${name}-${width}.webp` : image(`${name}-${width}.webp`);
