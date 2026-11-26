import { describe, expect, it } from "vitest";
import { waNumber } from "@/lib/contact";
import {
  absUrl,
  internationalPhone,
  jsonLd,
  pageAddress,
  serviceAreas,
  serviceJsonLd,
} from "@/lib/seo";
import { hebrewDate, lastUpdated, legal } from "@/content/legal";
import { altText, SCREENSHOT_FALLBACK, stillFallback } from "@/lib/alt";
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

  it("describe a service on the landing page that replaces its service page", () => {
    const service = { slug: "bar-bat-mitzvah", title: "קליפים לבר ובת מצווה", lead: "תיאור" };
    const graph = JSON.parse(serviceJsonLd(defaultContent, service, "/bar-mitzvah-clips").children)[
      "@graph"
    ];
    const [offer, crumbs] = graph;
    expect(offer["@type"]).toBe("Service");
    expect(offer.name).toBe("קליפים לבר ובת מצווה");
    expect(offer.description).toBe("תיאור");
    expect(offer.provider.name).toBe(defaultContent.site.name);
    expect(crumbs.itemListElement.map((c: { name: string }) => c.name)).toEqual([
      defaultContent.site.name,
      "קליפים לבר ובת מצווה",
    ]);
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
    expect(known.title).toBe("צילום שירת המונים (קולולם) לבתי ספר וקהילות | הפקת המרב");
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
    expect(blank.title).toBe("צילום שירת המונים (קולולם) לבתי ספר וקהילות | הפקת המרב");

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

describe("checker fixes (2026-11-24)", () => {
  it("accept only site photos and uploaded sets as photo addresses", () => {
    const about = defaultContent.home.about;
    const withPhoto = (name: string) => ({ ...about, portrait: { ...about.portrait, name } });
    for (const ok of ["about-portrait", "/uploads/u-0000000a-aaaa-bbbb-cccc-dddddddddddd"])
      expect(validateDoc("home.about", withPhoto(ok)).success, ok).toBe(true);
    for (const bad of ["https://other.example/x", "/images/../x", "//evil.example/x", ""])
      expect(validateDoc("home.about", withPhoto(bad)).success, bad).toBe(false);
  });

  it("accept only a real email address (or empty, or a placeholder)", () => {
    const site = defaultContent.site;
    for (const ok of ["Meravi2340@gmail.com", "", "[מייל]"])
      expect(validateDoc("site", { ...site, email: ok }).success, ok).toBe(true);
    for (const bad of ["x@y.com?bcc=z@w.com", "not an email", "a@b"])
      expect(validateDoc("site", { ...site, email: bad }).success, bad).toBe(false);
  });

  it("write the phone in international form for structured data", () => {
    expect(internationalPhone("058-770-2937")).toBe("+972-58-770-2937");
    expect(internationalPhone("972587702937")).toBe("+972587702937");
    expect(internationalPhone("+972-58-770-2937")).toBe("+972-58-770-2937");
  });

  it("date the legal pages by their review, or by the day the pixels went on if later", () => {
    expect(lastUpdated()).toBe(hebrewDate(legal.updatedOn));
    expect(lastUpdated("2020-01-01")).toBe(hebrewDate(legal.updatedOn));
    expect(lastUpdated("2099-03-05")).toBe(hebrewDate("2099-03-05"));
    expect(hebrewDate("2026-11-24")).toContain("2026");
  });
});

describe("photo descriptions with a fallback", () => {
  it("use the written description, or a general one when it's empty", () => {
    expect(altText("ילדה על שפת הים", "צילום סטילס")).toBe("ילדה על שפת הים");
    expect(altText("   ", "צילום סטילס")).toBe("צילום סטילס");
    expect(altText(undefined, SCREENSHOT_FALLBACK)).toBe("צילום מסך של המלצה בוואטסאפ");
    expect(stillFallback("משפחה")).toBe("צילום משפחה");
    expect(stillFallback("")).toBe("צילום סטילס");
  });
});

describe("service areas for search", () => {
  it("lists each place on its own, splitting a last item joined with ו", () => {
    expect(serviceAreas("יד בנימין, גדרה והסביבה,\nקריית מלאכי, חבל לכיש ואשדוד")).toEqual([
      "יד בנימין",
      "גדרה",
      "קריית מלאכי",
      "חבל לכיש",
      "אשדוד",
    ]);
  });
  it("keeps a single name with ו whole", () => {
    expect(serviceAreas("גבעת ורדים")).toEqual(["גבעת ורדים"]);
  });
});
