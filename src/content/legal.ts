/**
 * Facts the legal pages state about the business (privacy policy, accessibility statement).
 * Contact details come from the saved site settings, so they stay in step with the admin.
 */
export const legal = {
  ownerName: "מרב ורנר",
  /** Tax status as confirmed by Merav. */
  businessType: "עוסקת פטורה",
  /** Her עוסק number, as given by Merav. */
  businessNumber: "302502711",
  /** The date both documents were last reviewed (YYYY-MM-DD). Update it with every change. */
  updatedOn: "2026-11-24",
};

/** A YYYY-MM-DD date as the legal pages show it, e.g. "24 בנובמבר 2026". */
export const hebrewDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/**
 * When a legal page last changed: its review date, or the day the landing page's ad pixels
 * were switched on, if later (the privacy policy's text changes with them).
 */
export const lastUpdated = (pixelsOn?: string) =>
  hebrewDate(pixelsOn && pixelsOn > legal.updatedOn ? pixelsOn : legal.updatedOn);
