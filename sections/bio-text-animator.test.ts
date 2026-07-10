import { describe, expect, it } from "vitest";
import { getBioCharOpacity } from "../lib/bio-char-opacity";

describe("bio character opacity", () => {
  it("preserves the original staggered reveal curve", () => {
    expect(getBioCharOpacity(0, 0, 100)).toBe(0.2);
    expect(getBioCharOpacity(0.015, 0, 100)).toBeCloseTo(0.6);
    expect(getBioCharOpacity(0.03, 0, 100)).toBe(1);
    expect(getBioCharOpacity(0, 50, 100)).toBe(0.2);
    expect(getBioCharOpacity(1, 99, 100)).toBeCloseTo(0.4667, 3);
  });

  it("fully reveals malformed empty character sets", () => {
    expect(getBioCharOpacity(0, 0, 0)).toBe(1);
  });
});
