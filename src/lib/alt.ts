/**
 * Alternative text with a fallback. Merav may leave a photo's "תיאור התמונה" empty; the site
 * then says something general about it (the type of shot, the section it's in), so no photo
 * that carries information is ever read out as nothing. The accessibility statement promises
 * exactly that: a detailed description where there is one, a general one otherwise.
 */
export const altText = (alt: string | undefined, fallback: string) => alt?.trim() || fallback;

/** A stills photo's general description, from its type of shot ("צילום משפחה"). */
export const stillFallback = (label: string | undefined) =>
  label?.trim() ? `צילום ${label.trim()}` : "צילום סטילס";

export const SCREENSHOT_FALLBACK = "צילום מסך של המלצה בוואטסאפ";
export const PORTRAIT_FALLBACK = "מרב ורנר, צלמת ועורכת וידאו";
export const WORK_PHOTO_FALLBACK = "תמונה מעבודות הצילום של מרב ורנר";
