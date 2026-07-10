import { describe, expect, it } from "vitest";
import { escapeHtml } from "./contactForm";

describe("contact email HTML escaping", () => {
  it("escapes every HTML-significant character", () => {
    expect(escapeHtml(`<img src="x" onerror='alert(1)'> & goodbye`)).toBe(
      "&lt;img src=&quot;x&quot; onerror=&#x27;alert(1)&#x27;&gt; &amp; goodbye",
    );
  });
});
