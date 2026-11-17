/**
 * The WhatsApp message the contact form prepares, written by the admin with placeholders
 * for what the visitor typed. A line whose placeholders are all empty is left out (no
 * "מתעניינ/ת ב:" line when nothing was picked).
 */
export const MESSAGE_FIELDS = {
  name: "{שם}",
  phone: "{טלפון}",
  service: "{נושא}",
  message: "{הודעה}",
} as const;

export type MessageValues = Record<keyof typeof MESSAGE_FIELDS, string>;

/** The fields the message cannot do without. */
export const REQUIRED_FIELDS = [MESSAGE_FIELDS.name, MESSAGE_FIELDS.phone];

export const DEFAULT_MESSAGE_TEMPLATE = [
  "היי מרב, הגעתי מהאתר",
  `שם: ${MESSAGE_FIELDS.name}`,
  `טלפון: ${MESSAGE_FIELDS.phone}`,
  `מתעניינ/ת ב: ${MESSAGE_FIELDS.service}`,
  "",
  MESSAGE_FIELDS.message,
].join("\n");

export function fillMessage(template: string, values: MessageValues): string {
  const entries = Object.entries(MESSAGE_FIELDS) as [keyof MessageValues, string][];
  return template
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .flatMap((line) => {
      const used = entries.filter(([, token]) => line.includes(token));
      if (used.length > 0 && used.every(([key]) => !values[key].trim())) return [];
      return [used.reduce((out, [key, token]) => out.replaceAll(token, values[key].trim()), line)];
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
