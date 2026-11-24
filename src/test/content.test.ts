import { isExternalHref, serviceHref, visibleServices } from "@/content/services";
import { serviceLinkProblem } from "@/content/schema";
import { sitemapPaths } from "@/lib/sitemap";
import { DEFAULT_MESSAGE_TEMPLATE, fillMessage } from "@/content/whatsapp-message";
import { adsEnabled } from "@/lib/ads";
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

  it("keeps the selected videos as their own list, 1 to 6", () => {
    const works = defaultContent.home.works;
    const video = (i: number) => ({ title: `v${i}`, youtubeId: `abcdefghij${i}` });
    const withVideos = (n: number) => ({
      ...works,
      videos: Array.from({ length: n }, (_, k) => video(k)),
    });
    expect(validateDoc("home.works", withVideos(6)).success).toBe(true);
    expect(validateDoc("home.works", withVideos(7)).success).toBe(false);
    expect(validateDoc("home.works", withVideos(0)).success).toBe(false);
  });

  it("keeps the homepage mosaic as its own places, 1 to 9", () => {
    const stills = defaultContent.home.stills;
    expect(stills.mosaic).toHaveLength(9);
    const photo = stills.photos[0]!;
    const withMosaic = (n: number) => ({
      ...stills,
      mosaic: Array.from({ length: n }, () => photo),
    });
    expect(validateDoc("home.stills", withMosaic(9)).success).toBe(true);
    expect(validateDoc("home.stills", withMosaic(10)).success).toBe(false);
    expect(validateDoc("home.stills", withMosaic(0)).success).toBe(false);
  });

  it("converts a mosaic saved the old way (marked in the stills gallery, ordered by name)", () => {
    const { mosaic: _mosaic, photos, ...text } = defaultContent.home.stills;
    // The old record: photos 3, 1 and 5 marked, in that order.
    const marked = new Set([0, 2, 4]);
    const saved = {
      ...text,
      photos: photos.map((p, i) => ({ ...p, featured: marked.has(i) })),
      order: [photos[2]!.name, photos[0]!.name, photos[4]!.name],
    };
    const stills = assembleContent({ "home.stills": saved }).home.stills;
    expect(stills.mosaic.map((p) => p.name)).toEqual(saved.order);
    expect(stills.photos).toHaveLength(photos.length);
    expect([...stills.mosaic, ...stills.photos].some((p) => "featured" in p)).toBe(false);
  });

  it("converts selected videos saved the old way (marked in the galleries, ordered by id)", () => {
    const { videos: launchVideos, ...text } = defaultContent.home.works;
    const ids = launchVideos.map((v) => v.youtubeId);
    // The old services record: the launch videos marked, plus one unmarked.
    const services = defaultContent.services.map((s, i) =>
      i === 1
        ? {
            ...s,
            videos: [
              ...launchVideos.map((v) => ({ ...v, featured: true })),
              { title: "לא נבחר", youtubeId: "zzzzzzzzzzz", featured: false },
            ],
          }
        : s,
    );
    const reversed = [...ids].reverse();
    const content = assembleContent({
      services,
      "home.works": { ...text, title: "כותרת שנשמרה", order: reversed },
    });
    expect(content.home.works.title).toBe("כותרת שנשמרה");
    expect(content.home.works.videos.map((v) => v.youtubeId)).toEqual(reversed);
    expect(content.home.works.videos.some((v) => "featured" in v)).toBe(false);
    // The services record itself still loads, its old marks dropped.
    expect(validateDoc("services", services).success).toBe(true);
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

describe("service links (landing pages)", () => {
  const withLink = (link: string) =>
    defaultContent.services.map((s) => (s.slug === "bar-bat-mitzvah" ? { ...s, link } : s));

  it("leads to the regular page by default", () => {
    expect(serviceHref({ slug: "kululam" })).toBe("/services/kululam");
    expect(serviceHref({ slug: "kululam", link: "  " })).toBe("/services/kululam");
  });

  it("accepts a page of this site or another https site", () => {
    for (const link of ["/bar-mitzvah", "/landing/bat-mitzvah", "https://example.co.il/page"]) {
      expect(validateDoc("services", withLink(link)).success, link).toBe(true);
    }
    const content = assembleContent({ services: withLink("/bar-mitzvah") });
    expect(serviceHref(content.services[0]!)).toBe("/bar-mitzvah");
    expect(isExternalHref("https://example.co.il/page")).toBe(true);
    expect(isExternalHref("/bar-mitzvah")).toBe(false);
  });

  it("rejects service pages, the admin, http and bad addresses", () => {
    for (const link of [
      "/services/kululam",
      "/services",
      "/admin",
      "/Bar Mitzvah",
      "/",
      "bar-mitzvah",
      "http://example.co.il",
      "https://",
      "javascript:alert(1)",
    ]) {
      expect(serviceLinkProblem(link), link).not.toBeNull();
      expect(validateDoc("services", withLink(link)).success, link).toBe(false);
    }
  });
});

describe("sitemap", () => {
  const lead = (slug: string, link: string) =>
    defaultContent.services.map((s) => (s.slug === slug ? { ...s, link } : s));

  it("lists every visible service page by default", () => {
    const paths = sitemapPaths(defaultContent);
    expect(paths).toContain("/services/bar-bat-mitzvah");
    expect(paths.slice(0, 1)).toEqual(["/"]);
    expect(paths.slice(-2)).toEqual(["/privacy", "/accessibility"]);
  });

  it("lists a landing page in place of the service it replaces", () => {
    const content = assembleContent({ services: lead("bar-bat-mitzvah", "/bar-mitzvah") });
    const paths = sitemapPaths(content);
    expect(paths).toContain("/bar-mitzvah");
    expect(paths).not.toContain("/services/bar-bat-mitzvah");
  });

  it("leaves out outside sites, hidden services and duplicates", () => {
    const services = lead("kululam", "https://example.co.il/page").map((s) =>
      s.slug === "stills" ? { ...s, hidden: true } : s,
    );
    const paths = sitemapPaths(assembleContent({ services }), ["/standalone", "/privacy"]);
    expect(paths.some((p) => p.includes("example") || p.includes("kululam"))).toBe(false);
    expect(paths).not.toContain("/services/stills");
    expect(paths).toContain("/standalone");
    expect(paths.filter((p) => p === "/privacy")).toHaveLength(1);
  });
});

describe("testimonials can be hidden", () => {
  it("accepts and applies the hidden switch", async () => {
    const { assembleContent, defaultContent } = await import("@/content/docs");
    const saved = { ...defaultContent.home.testimonials, hidden: true };
    expect(assembleContent({ "home.testimonials": saved }).home.testimonials.hidden).toBe(true);
    expect(assembleContent({}).home.testimonials.hidden).toBe(false);
  });
});

describe("bar/bat mitzvah landing page", () => {
  it("its launch content passes its schema, and a hidden testimonials switch is kept", async () => {
    const { assembleContent, defaultContent, validateDoc } = await import("@/content/docs");
    const launch = defaultContent.barMitzvahLanding;
    expect(validateDoc("barMitzvahLanding", launch).success).toBe(true);
    const saved = { ...launch, testimonials: { ...launch.testimonials, hidden: true } };
    expect(
      assembleContent({ barMitzvahLanding: saved }).barMitzvahLanding.testimonials.hidden,
    ).toBe(true);
  });

  it("refuses a clip with a bad YouTube link or more than 5 strip photos", async () => {
    const { defaultContent, validateDoc } = await import("@/content/docs");
    const launch = defaultContent.barMitzvahLanding;
    const badClip = {
      ...launch,
      clips: { ...launch.clips, items: [{ title: "x", youtubeId: "not-an-id" }] },
    };
    expect(validateDoc("barMitzvahLanding", badClip).success).toBe(false);
    const sixPhotos = {
      ...launch,
      story: { ...launch.story, photos: [...launch.story.photos, launch.story.photos[0]] },
    };
    expect(validateDoc("barMitzvahLanding", sixPhotos).success).toBe(false);
  });
});

describe("a record saved before the code gained a field", () => {
  it("keeps its edits and takes the new field from the launch content", async () => {
    const { assembleContent, defaultContent } = await import("@/content/docs");
    const launch = defaultContent.barMitzvahLanding;
    // Saved before "finale" and "experience.cta" existed, with an edited title.
    const { finale: _f, ...oldProcess } = launch.process;
    const { cta: _c, ...oldExperience } = launch.experience;
    const saved = {
      ...launch,
      hero: { ...launch.hero, cta: "כפתור ערוך" },
      process: oldProcess,
      experience: oldExperience,
    };
    const page = assembleContent({ barMitzvahLanding: saved }).barMitzvahLanding;
    expect(page.hero.cta).toBe("כפתור ערוך");
    expect(page.process.finale.title).toBe(launch.process.finale.title);
    expect(page.experience.cta).toBe(launch.experience.cta);
  });

  it("leaves a valid record exactly as saved (a removed cover stays removed)", async () => {
    const { assembleContent, defaultContent } = await import("@/content/docs");
    const launch = defaultContent.barMitzvahLanding;
    const { thumb: _t, ...video } = launch.hero.video;
    const saved = { ...launch, hero: { ...launch.hero, video } };
    const page = assembleContent({ barMitzvahLanding: saved }).barMitzvahLanding;
    expect(page.hero.video.thumb).toBeUndefined();
  });
});

describe("landing page ad pixels", () => {
  const launch = defaultContent.barMitzvahLanding;
  const withAds = (ads: Partial<typeof launch.ads>) => ({
    ...launch,
    ads: { ...launch.ads, ...ads },
  });

  it("start switched off", () => {
    expect(adsEnabled(launch.ads)).toBe(false);
  });

  it("switch on with either platform's ID", () => {
    expect(adsEnabled({ ...launch.ads, metaPixelId: "123456789012345" })).toBe(true);
    expect(adsEnabled({ ...launch.ads, googleAdsId: "AW-123456789" })).toBe(true);
    expect(adsEnabled({ ...launch.ads, metaPixelId: "   " })).toBe(false);
  });

  it("accept real-looking IDs and reject mistakes", () => {
    const ok = withAds({
      metaPixelId: "123456789012345",
      googleAdsId: "AW-123456789",
      googleAdsLabel: "AbC-D_efG-h12",
    });
    expect(validateDoc("barMitzvahLanding", ok).success).toBe(true);
    expect(validateDoc("barMitzvahLanding", withAds({ metaPixelId: "fb-123" })).success).toBe(
      false,
    );
    expect(validateDoc("barMitzvahLanding", withAds({ googleAdsId: "123456789" })).success).toBe(
      false,
    );
    expect(validateDoc("barMitzvahLanding", withAds({ googleAdsLabel: "<script>" })).success).toBe(
      false,
    );
  });

  it("are filled in (switched off) for a record saved before they existed", () => {
    const { ads: _ads, ...older } = launch;
    expect(assembleContent({ barMitzvahLanding: older }).barMitzvahLanding.ads).toEqual(launch.ads);
  });
});
