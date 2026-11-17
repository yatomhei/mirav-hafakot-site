import { describe, expect, it } from "vitest";
import { DOC_KEYS, assembleContent, defaultContent, getDoc, validateDoc } from "@/content/docs";

describe("saved content", () => {
  it("accepts every launch section as it is", () => {
    for (const key of DOC_KEYS) {
      const result = validateDoc(key, getDoc(defaultContent, key));
      expect(result.success, `${key}: ${result.error?.issues[0]?.message}`).toBe(true);
    }
  });

  it("applies a valid saved section", () => {
    const intro = { ...defaultContent.home.intro, text: "טקסט חדש" };
    expect(assembleContent({ "home.intro": intro }).home.intro.text).toBe("טקסט חדש");
  });

  it("ignores an invalid section and keeps the rest", () => {
    const content = assembleContent({
      "home.intro": { text: 5 },
      "home.faq": { ...defaultContent.home.faq, title: "כותרת" },
    });
    expect(content.home.intro).toEqual(defaultContent.home.intro);
    expect(content.home.faq.title).toBe("כותרת");
  });

  it("keeps service addresses and linked galleries from the code", () => {
    const saved = defaultContent.services.map((s) => ({
      ...s,
      slug: "hacked",
      gallery: undefined,
    }));
    const content = assembleContent({ services: saved });
    expect(content.services.map((s) => s.slug)).toEqual(defaultContent.services.map((s) => s.slug));
    expect(content.services[0]?.gallery).toBe("works");
  });

  it("rejects a bad WhatsApp number", () => {
    expect(validateDoc("site", { ...defaultContent.site, whatsapp: "050-123" }).success).toBe(
      false,
    );
  });
});
