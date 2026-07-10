import { describe, expect, it } from "vitest";
import { sanitizeMediaPreviewUrl } from "./media-utils";

describe("sanitizeMediaPreviewUrl", () => {
  it("allows trusted media hosts", () => {
    expect(
      sanitizeMediaPreviewUrl(
        "https://media.geraldbahati.dev/projects/image/test.webp",
      ),
    ).toBe("https://media.geraldbahati.dev/projects/image/test.webp");
    expect(
      sanitizeMediaPreviewUrl(
        "https://customer-pdxnd9di8ybc2kur.cloudflarestream.com/abc/manifest/video.m3u8",
      ),
    ).toBe(
      "https://customer-pdxnd9di8ybc2kur.cloudflarestream.com/abc/manifest/video.m3u8",
    );
  });

  it("allows blob previews created during upload", () => {
    expect(sanitizeMediaPreviewUrl("blob:https://example.com/abc")).toBe(
      "blob:https://example.com/abc",
    );
  });

  it("rejects javascript and untrusted hosts", () => {
    expect(sanitizeMediaPreviewUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeMediaPreviewUrl("https://evil.com/image.png")).toBeNull();
    expect(
      sanitizeMediaPreviewUrl(
        "https://evil.com/?cloudflarestream.com/fake.m3u8",
      ),
    ).toBeNull();
  });
});
