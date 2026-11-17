import { visibleServices } from "@/content/services";
import { featuredStills, featuredVideos } from "@/content/featured";
import { DEFAULT_MESSAGE_TEMPLATE, fillMessage } from "@/content/whatsapp-message";
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
    expect(content.services.find((s) => s.slug === "stills")?.gallery).toBe("stills");
  });

  it("keeps a saved service order and each page's linked gallery", () => {
    const reversed = [...defaultContent.services]
      .reverse()
      .map((s) => ({ ...s, gallery: undefined }));
    const content = assembleContent({ services: reversed });
    expect(content.services.map((s) => s.slug)).toEqual(reversed.map((s) => s.slug));
    expect(content.services.find((s) => s.slug === "stills")?.gallery).toBe("stills");
    const unknown = reversed.map((s, i) => (i === 0 ? { ...s, slug: "other" } : s));
    expect(validateDoc("services", unknown).success).toBe(false);
  });

  it("lets services be hidden, but not all of them", () => {
    const services = defaultContent.services;
    const oneHidden = services.map((s, i) => (i === 2 ? { ...s, hidden: true } : s));
    expect(validateDoc("services", oneHidden).success).toBe(true);
    expect(visibleServices(oneHidden)).toHaveLength(services.length - 1);
    const allHidden = services.map((s) => ({ ...s, hidden: true }));
    expect(validateDoc("services", allHidden).success).toBe(false);
  });

  it("limits and orders the homepage picks from the service galleries", () => {
    const services = defaultContent.services;
    const video = (i: number) => ({ title: `v${i}`, youtubeId: `abcdefghij${i}`, featured: true });
    const withFeatured = (n: number) =>
      services.map((s, i) =>
        i === 1 ? { ...s, videos: Array.from({ length: n }, (_, k) => video(k)) } : s,
      );
    // The bar/bat mitzvah page already has 5 featured videos at launch.
    expect(validateDoc("services", withFeatured(1)).success).toBe(true);
    expect(validateDoc("services", withFeatured(2)).success).toBe(false);
    const none = services.map((s) => ({
      ...s,
      videos: s.videos.map((v) => ({ ...v, featured: false })),
    }));
    expect(validateDoc("services", none).success).toBe(false);

    const launch = featuredVideos(services, defaultContent.home.works.order);
    expect(launch.map((v) => v.youtubeId)).toEqual(defaultContent.home.works.order);
    const reversed = [...defaultContent.home.works.order].reverse();
    expect(featuredVideos(services, reversed).map((v) => v.youtubeId)).toEqual(reversed);

    const stills = defaultContent.home.stills;
    expect(featuredStills(stills.photos, stills.order)).toHaveLength(9);
    const allFeatured = stills.photos.map((p) => ({ ...p, featured: true }));
    expect(validateDoc("home.stills", { ...stills, photos: allFeatured }).success).toBe(false);
  });

  it("fills the WhatsApp message and drops lines left empty", () => {
    const filled = fillMessage(DEFAULT_MESSAGE_TEMPLATE, {
      name: "דנה",
      phone: "050",
      service: "",
      message: "",
    });
    expect(filled).toBe("היי מרב, הגעתי מהאתר\nשם: דנה\nטלפון: 050");
    const full = fillMessage(DEFAULT_MESSAGE_TEMPLATE, {
      name: "דנה",
      phone: "050",
      service: "קליפים",
      message: "שלום",
    });
    expect(full).toBe("היי מרב, הגעתי מהאתר\nשם: דנה\nטלפון: 050\nמתעניינ/ת ב: קליפים\n\nשלום");

    const contact = defaultContent.home.contact;
    expect(validateDoc("home.contact", { ...contact, message: "היי {שם}" }).success).toBe(false);
    const { message: _m, ...older } = contact;
    expect(validateDoc("home.contact", older).success).toBe(true);
  });

  it("rejects a bad WhatsApp number", () => {
    expect(validateDoc("site", { ...defaultContent.site, whatsapp: "050-123" }).success).toBe(
      false,
    );
  });
});
