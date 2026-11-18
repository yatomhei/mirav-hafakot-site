import { describe, expect, it } from "vitest";
import { waNumber } from "@/lib/contact";
import { absUrl, jsonLd, pageAddress } from "@/lib/seo";
import { validateDoc, defaultContent } from "@/content/docs";
import { SEO_AREA, serviceSeoFor } from "@/content/seo-pages";

describe("WhatsApp number", () => {
  it("repairs the usual slips and keeps a correct number", () => {
    expect(waNumber("9720587702937")).toBe("972587702937");
    expect(waNumber("058-770-2937")).toBe("972587702937");
    expect(waNumber("972587702937")).toBe("972587702937");
    expect(waNumber("+972 58 770 2937")).toBe("972587702937");
    expect(waNumber("")).toBe("");
  });

  it("saves only the wa.me form of an Israeli number", () => {
    const site = defaultContent.site;
    const ok = (whatsapp: string) => validateDoc("site", { ...site, whatsapp }).success;
    expect(ok("972587702937")).toBe(true);
    expect(ok("")).toBe(true);
    expect(ok("9720587702937")).toBe(false);
    expect(ok("0587702937")).toBe(false);
  });
});

describe("search tags", () => {
  it("leave out page addresses until the domain is set", () => {
    expect(absUrl("/")).toBeNull();
    expect(pageAddress("/privacy")).toEqual({ meta: [], links: [] });
  });

  it("escape saved text inside structured data", () => {
    const tag = jsonLd({ name: "</script><script>alert(1)</script>" });
    expect(tag.children).not.toContain("</script>");
    expect(JSON.parse(tag.children).name).toBe("</script><script>alert(1)</script>");
  });
});

describe("social links", () => {
  it("accept only https addresses", () => {
    const site = defaultContent.site;
    expect(validateDoc("site", { ...site, facebookUrl: "https://facebook.com/x" }).success).toBe(
      true,
    );
    expect(validateDoc("site", { ...site, facebookUrl: "http://facebook.com/x" }).success).toBe(
      false,
    );
    expect(validateDoc("site", { ...site, facebookUrl: "javascript:alert(1)" }).success).toBe(
      false,
    );
  });
});

describe("service page titles for search", () => {
  it("use the written wording, or fall back to the name and area", () => {
    const known = serviceSeoFor({ slug: "kululam", title: "קולולם", lead: "x" }, "הפקת המרב");
    expect(known.title).toBe("צילום קולולם לבית ספר ולקהילה | הפקת המרב");
    const other = serviceSeoFor({ slug: "new", title: "שירות חדש", lead: "תיאור" }, "הפקת המרב");
    expect(other).toEqual({ title: `שירות חדש - ${SEO_AREA} | הפקת המרב`, description: "תיאור" });
  });

  it("prefer what Merav typed in the admin, ignoring blank fields", () => {
    const base = { slug: "kululam", title: "קולולם", lead: "x" };
    const typed = serviceSeoFor(
      { ...base, seoTitle: "קולולם בגדרה", seoDescription: "תיאור שלי" },
      "הפקת המרב",
    );
    expect(typed).toEqual({ title: "קולולם בגדרה | הפקת המרב", description: "תיאור שלי" });
    const blank = serviceSeoFor({ ...base, seoTitle: "  ", seoDescription: "" }, "הפקת המרב");
    expect(blank.title).toBe("צילום קולולם לבית ספר ולקהילה | הפקת המרב");

    const services = defaultContent.services;
    const withTitle = services.map((s, i) => (i === 0 ? { ...s, seoTitle: "כותרת" } : s));
    expect(validateDoc("services", withTitle).success).toBe(true);
    const tooLong = services.map((s, i) => (i === 0 ? { ...s, seoTitle: "א".repeat(121) } : s));
    expect(validateDoc("services", tooLong).success).toBe(false);
  });

  it("follow a renamed service: its new name and its opening paragraph", () => {
    const renamed = serviceSeoFor(
      { slug: "kululam", title: "קליפ קולולם", lead: "הפסקה החדשה" },
      "הפקת המרב",
    );
    expect(renamed).toEqual({
      title: `קליפ קולולם - ${SEO_AREA} | הפקת המרב`,
      description: "הפסקה החדשה",
    });
    // What she types still wins over the automatic wording.
    const typed = serviceSeoFor(
      { slug: "kululam", title: "קליפ קולולם", lead: "x", seoTitle: "שלי" },
      "הפקת המרב",
    );
    expect(typed.title).toBe("שלי | הפקת המרב");
  });

  it("cover every service the site has", () => {
    for (const s of defaultContent.services) {
      expect(serviceSeoFor(s, "x").description).not.toBe(s.lead);
    }
  });
});
