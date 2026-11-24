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
