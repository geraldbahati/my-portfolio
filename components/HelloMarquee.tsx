"use client";

import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { useMediaQuery } from "@/hooks/use-media-query";

const greetings = [
  { id: "en-1", text: "Hello", lang: "en", dir: "ltr" },
  { id: "ja", text: "こんにちは", lang: "ja", dir: "ltr" }, // Japanese
  { id: "ar", text: "مرحبًا", lang: "ar", dir: "rtl" }, // Arabic
  { id: "en-2", text: "Hello", lang: "en", dir: "ltr" },
  { id: "es", text: "Hola", lang: "es", dir: "ltr" }, // Spanish
  { id: "fr", text: "Bonjour", lang: "fr", dir: "ltr" }, // French
  { id: "en-3", text: "Hello", lang: "en", dir: "ltr" },
  { id: "zh", text: "你好", lang: "zh", dir: "ltr" }, // Chinese
  { id: "de", text: "Hallo", lang: "de", dir: "ltr" }, // German
  { id: "en-4", text: "Hello", lang: "en", dir: "ltr" },
  { id: "it", text: "Ciao", lang: "it", dir: "ltr" }, // Italian
  { id: "ko", text: "안녕하세요", lang: "ko", dir: "ltr" }, // Korean
];

export default function HelloMarquee() {
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // If user prefers reduced motion, show static version
  if (prefersReducedMotion) {
    return (
      <div
        className="w-full py-8 bg-white border-t-2 border-b-2 border-black"
        aria-hidden="true"
      >
        <div className="text-center">
          <div className="text-6xl md:text-8xl lg:text-9xl font-bold text-black select-none">
            <span className="inline-flex items-center gap-4">
              <span lang="en">Hello</span>
              <span className="text-black text-4xl">■</span>
              <span lang="ja">こんにちは</span>
              <span className="text-black text-4xl">■</span>
              <span lang="ar" dir="rtl">
                مرحبًا
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden py-8 bg-white border-t-2 border-b-2 border-black">
      {/* Hidden accessible content for screen readers */}
      <div className="sr-only">
        Decorative scrolling text showing multilingual greetings:{" "}
        {greetings.map((g) => g.text).join(", ")}
      </div>

      {/* Visual marquee */}
      <div aria-hidden="true">
        <InfiniteSlider
          speed={50}
          speedOnHover={25}
          gap={32}
          direction="horizontal"
          className="text-6xl md:text-8xl lg:text-9xl font-bold text-black select-none"
        >
          {greetings.map((greeting) => (
            <span
              key={greeting.id}
              className="whitespace-nowrap flex items-center"
              lang={greeting.lang}
              dir={greeting.dir}
              style={{
                fontFamily:
                  greeting.lang === "zh"
                    ? 'system-ui, "Noto Sans CJK SC", sans-serif'
                    : greeting.lang === "ar"
                      ? 'system-ui, "Noto Sans Arabic", sans-serif'
                      : greeting.lang === "ja"
                        ? 'system-ui, "Noto Sans CJK JP", sans-serif'
                        : greeting.lang === "ko"
                          ? 'system-ui, "Noto Sans CJK KR", sans-serif'
                          : "inherit",
              }}
            >
              {greeting.text}
              <span className="mx-4 text-black text-4xl" aria-hidden="true">
                ■
              </span>
            </span>
          ))}
        </InfiniteSlider>
      </div>
    </div>
  );
}
