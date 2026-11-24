import { describe, expect, it, vi } from "vitest";
import { contentTypeOf, signatureMatches, UPLOAD_NAME } from "@/content/uploads.server";

const bytes = (...parts: (string | number[])[]) =>
  new Uint8Array(
    parts.flatMap((p) => (typeof p === "string" ? [...p].map((c) => c.charCodeAt(0)) : p)),
  );

describe("uploads", () => {
  it("accepts only the names the admin makes", () => {
    expect(UPLOAD_NAME.test("u-13b851d3-99a1-4755-a7b4-53f4e99a1d8a-480.webp")).toBe(true);
    expect(UPLOAD_NAME.test("u-13b851d3-99a1-4755-a7b4-53f4e99a1d8a.mp4")).toBe(true);
    for (const bad of [
      "../evil.webp",
      "u-short-480.webp",
      "u-13b851d3-99a1-4755-a7b4-53f4e99a1d8a-500.webp",
      "u-13b851d3-99a1-4755-a7b4-53f4e99a1d8a.html",
      "u-13b851d3-99a1-4755-a7b4-53f4e99a1d8a.webp",
    ]) {
      expect(UPLOAD_NAME.test(bad), bad).toBe(false);
    }
  });

  it("serves each file with the type its name says", () => {
    expect(contentTypeOf("x-480.webp")).toBe("image/webp");
    expect(contentTypeOf("x.mp4")).toBe("video/mp4");
    expect(contentTypeOf("x.webm")).toBe("video/webm");
    expect(contentTypeOf("x.html")).toBeNull();
  });

  it("checks the file's first bytes against its type", () => {
    const webp = bytes("RIFF", [1, 2, 3, 4], "WEBPVP8 ");
    const mp4 = bytes([0, 0, 0, 24], "ftypisom");
    const webm = bytes([0x1a, 0x45, 0xdf, 0xa3, 0]);
    const page = bytes("<html><script>alert(1)</script>");
    expect(signatureMatches("a-480.webp", webp)).toBe(true);
    expect(signatureMatches("a.mp4", mp4)).toBe(true);
    expect(signatureMatches("a.webm", webm)).toBe(true);
    expect(signatureMatches("a-480.webp", page)).toBe(false);
    expect(signatureMatches("a.mp4", webp)).toBe(false);
    expect(signatureMatches("a.webm", mp4)).toBe(false);
  });
});

describe("photo library", () => {
  it("lists each stored photo once, newest first, without videos (live storage)", async () => {
    vi.resetModules();
    vi.doMock("@/content/backend-config", () => ({ localStoreEnabled: () => false }));
    const id = (n: number) => `u-0000000${n}-aaaa-bbbb-cccc-dddddddddddd`;
    const keys = [
      ...[480, 960, 1600].map((w) => ({ key: `${id(1)}-${w}.webp`, uploaded: new Date(1000) })),
      ...[480, 960, 1600].map((w) => ({ key: `${id(2)}-${w}.webp`, uploaded: new Date(3000) })),
      { key: `${id(3)}.mp4`, uploaded: new Date(5000) },
    ];
    // Two pages, as R2 returns a long list.
    const bucket = {
      list: async ({ cursor }: { cursor?: string }) =>
        cursor
          ? { objects: keys.slice(4), truncated: false }
          : { objects: keys.slice(0, 4), truncated: true, cursor: "next" },
    };
    (globalThis as { __env__?: unknown }).__env__ = { UPLOADS: bucket };
    try {
      const { listStoredPhotos } = await import("@/content/uploads.server");
      expect(await listStoredPhotos()).toEqual([
        { name: `/uploads/${id(2)}`, uploaded: 3000 },
        { name: `/uploads/${id(1)}`, uploaded: 1000 },
      ]);
    } finally {
      delete (globalThis as { __env__?: unknown }).__env__;
      vi.doUnmock("@/content/backend-config");
      vi.resetModules();
    }
  });
});

describe("deleting an uploaded photo (live storage)", () => {
  const id = "u-0000000a-aaaa-bbbb-cccc-dddddddddddd";
  const other = "u-0000000b-aaaa-bbbb-cccc-dddddddddddd";

  async function setup(savedValues: string[]) {
    vi.resetModules();
    vi.doMock("@/content/backend-config", () => ({ localStoreEnabled: () => false }));
    const deleted: string[][] = [];
    const db = {
      prepare: () => ({ all: async () => ({ results: savedValues.map((value) => ({ value })) }) }),
    };
    const bucket = { delete: async (keys: string[]) => void deleted.push(keys) };
    (globalThis as { __env__?: unknown }).__env__ = { DB: db, UPLOADS: bucket };
    const { deleteStoredPhoto } = await import("@/content/uploads.server");
    return { deleteStoredPhoto, deleted };
  }

  const cleanup = () => {
    delete (globalThis as { __env__?: unknown }).__env__;
    vi.doUnmock("@/content/backend-config");
    vi.resetModules();
  };

  it("removes all three sizes of a photo nothing uses", async () => {
    try {
      const { deleteStoredPhoto, deleted } = await setup([
        JSON.stringify({ photo: { name: `/uploads/${other}`, alt: "" } }),
      ]);
      await deleteStoredPhoto(`/uploads/${id}`);
      expect(deleted).toEqual([[`${id}-480.webp`, `${id}-960.webp`, `${id}-1600.webp`]]);
    } finally {
      cleanup();
    }
  });

  it("refuses a photo the saved content uses, even in a section that no longer parses", async () => {
    try {
      const { deleteStoredPhoto, deleted } = await setup([`{"broken": "/uploads/${id}", `]);
      await expect(deleteStoredPhoto(`/uploads/${id}`)).rejects.toThrow("בשימוש");
      expect(deleted).toEqual([]);
    } finally {
      cleanup();
    }
  });

  it("refuses a photo the saved content names in another form (a full address)", async () => {
    try {
      const { deleteStoredPhoto, deleted } = await setup([
        JSON.stringify({ photo: { name: `https://hafakathamerav.co.il/uploads/${id}`, alt: "" } }),
      ]);
      await expect(deleteStoredPhoto(`/uploads/${id}`)).rejects.toThrow("בשימוש");
      expect(deleted).toEqual([]);
    } finally {
      cleanup();
    }
  });

  it("refuses anything but an uploaded photo's address", async () => {
    try {
      const { deleteStoredPhoto, deleted } = await setup([]);
      for (const bad of ["/images/still-brit", "/uploads/../secret", `/uploads/${id}.mp4`, id]) {
        await expect(deleteStoredPhoto(bad), bad).rejects.toThrow();
      }
      expect(deleted).toEqual([]);
    } finally {
      cleanup();
    }
  });
});

describe("uploaded videos (live storage)", () => {
  const vid = "u-0000000c-aaaa-bbbb-cccc-dddddddddddd";

  async function setup(
    savedValues: string[],
    keys: { key: string; uploaded: Date; size: number }[],
  ) {
    vi.resetModules();
    vi.doMock("@/content/backend-config", () => ({ localStoreEnabled: () => false }));
    const deleted: string[][] = [];
    const db = {
      prepare: () => ({ all: async () => ({ results: savedValues.map((value) => ({ value })) }) }),
    };
    const bucket = {
      list: async () => ({ objects: keys, truncated: false }),
      delete: async (k: string[]) => void deleted.push(k),
    };
    (globalThis as { __env__?: unknown }).__env__ = { DB: db, UPLOADS: bucket };
    const mod = await import("@/content/uploads.server");
    return { ...mod, deleted };
  }
  const cleanup = () => {
    delete (globalThis as { __env__?: unknown }).__env__;
    vi.doUnmock("@/content/backend-config");
    vi.resetModules();
  };

  it("lists only videos, newest first, with their size", async () => {
    try {
      const { listStoredVideos } = await setup(
        [],
        [
          { key: `${vid}.mp4`, uploaded: new Date(1000), size: 5_000_000 },
          { key: `${vid}-480.webp`, uploaded: new Date(2000), size: 10 },
          { key: "u-0000000d-aaaa-bbbb-cccc-dddddddddddd.webm", uploaded: new Date(3000), size: 7 },
        ],
      );
      expect(await listStoredVideos()).toEqual([
        { name: "/uploads/u-0000000d-aaaa-bbbb-cccc-dddddddddddd.webm", uploaded: 3000, size: 7 },
        { name: `/uploads/${vid}.mp4`, uploaded: 1000, size: 5_000_000 },
      ]);
    } finally {
      cleanup();
    }
  });

  it("deletes an unused video, and refuses one the saved content uses", async () => {
    try {
      const unused = await setup([JSON.stringify({ video: "video/hero.mp4" })], []);
      await unused.deleteStoredVideo(`/uploads/${vid}.mp4`);
      expect(unused.deleted).toEqual([[`${vid}.mp4`]]);
      cleanup();
      const used = await setup([JSON.stringify({ video: `/uploads/${vid}.mp4` })], []);
      await expect(used.deleteStoredVideo(`/uploads/${vid}.mp4`)).rejects.toThrow("בשימוש");
      await expect(used.deleteStoredVideo("/uploads/../x.mp4")).rejects.toThrow();
      expect(used.deleted).toEqual([]);
    } finally {
      cleanup();
    }
  });
});
