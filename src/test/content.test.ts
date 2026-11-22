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

  it("restores the launch services' linked gallery and locked addresses", () => {
    const saved = defaultContent.services.map(({ published: _p, ...s }) => ({
      ...s,
      gallery: undefined,
    }));
    const content = assembleContent({ services: saved });
    expect(content.services.find((s) => s.slug === "stills")?.gallery).toBe("stills");
    expect(content.services.every((s) => s.published)).toBe(true);
  });

  it("keeps a saved service order and each page's linked gallery", () => {
    const reversed = [...defaultContent.services]
      .reverse()
      .map((s) => ({ ...s, gallery: undefined }));
    const content = assembleContent({ services: reversed });
    expect(content.services.map((s) => s.slug)).toEqual(reversed.map((s) => s.slug));
    expect(content.services.find((s) => s.slug === "stills")?.gallery).toBe("stills");
  });

  const newService = {
    slug: "wedding-clips",
    num: "",
    title: "קליפים לחתונה",
    meta: "",
    desc: "",
    lead: "פסקה",
    videos: [],
    hidden: true,
  };

  it("adds a new service, hidden, with videos and no gallery", () => {
    const saved = [...defaultContent.services, { ...newService, gallery: "stills" as const }];
    expect(validateDoc("services", saved).success).toBe(true);
    const added = assembleContent({ services: saved }).services.at(-1);
    expect(added?.slug).toBe("wedding-clips");
    expect(added?.gallery).toBeUndefined();
    expect(added?.published).toBeUndefined();
    expect(visibleServices([added!])).toHaveLength(0);
  });

  it("publishes a new service once it is shown", () => {
    const shown = { ...newService, hidden: undefined, published: true };
    const content = assembleContent({ services: [...defaultContent.services, shown] });
    expect(visibleServices(content.services).map((s) => s.slug)).toContain("wedding-clips");
  });

  it("gives any service its own photos alongside its videos", () => {
    const photo = { name: "still-brit", alt: "", label: "ברית", ratio: 1.5 };
    const withPhotos = { ...newService, photos: [photo] };
    const saved = [...defaultContent.services, withPhotos];
    expect(validateDoc("services", saved).success).toBe(true);
    expect(assembleContent({ services: saved }).services.at(-1)?.photos).toEqual([photo]);
    const tooMany = { ...newService, photos: Array.from({ length: 61 }, () => photo) };
    expect(validateDoc("services", [...defaultContent.services, tooMany]).success).toBe(false);
  });

  it("refuses a bad, missing or duplicate address", () => {
    const check = (slug: string) =>
      validateDoc("services", [...defaultContent.services, { ...newService, slug }]).success;
    expect(check("")).toBe(false);
    expect(check("Wedding")).toBe(false);
    expect(check("חתונה")).toBe(false);
    expect(check("wedding--clips")).toBe(false);
    expect(check("-wedding")).toBe(false);
    expect(check("a".repeat(41))).toBe(false);
    expect(check("kululam")).toBe(false); // already a launch service
    expect(check("clips-2027")).toBe(true);
  });

  it("refuses showing a service with no name", () => {
    const unnamed = { ...newService, title: " " };
    expect(validateDoc("services", [...defaultContent.services, unnamed]).success).toBe(true);
    const shown = { ...unnamed, hidden: undefined };
    expect(validateDoc("services", [...defaultContent.services, shown]).success).toBe(false);
  });

  it("deletes any service, launch ones included, within 1 to 12", () => {
    const withoutKululam = defaultContent.services.filter((s) => s.slug !== "kululam");
    expect(validateDoc("services", withoutKululam).success).toBe(true);
    const content = assembleContent({ services: withoutKululam });
    expect(content.services.some((s) => s.slug === "kululam")).toBe(false);
    expect(validateDoc("services", []).success).toBe(false);
    const thirteen = [
      ...defaultContent.services,
      ...Array.from({ length: 6 }, (_, i) => ({ ...newService, slug: `extra-${i}` })),
    ];
    expect(validateDoc("services", thirteen).success).toBe(false);
    expect(validateDoc("services", thirteen.slice(0, 12)).success).toBe(true);
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
