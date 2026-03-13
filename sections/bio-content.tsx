import Link from "next/link";
import { CutoutMaskImage } from "@/components/ui/cutout-image-mask";

const tagline = "Shipping Production Impact";
const mainText =
  "Full-stack engineer building edge-first web applications. From multi-layer caching strategies to AI-powered recommendation engines, I architect systems that are fast, scalable, and impactful";
const numberText = "(01)";

/**
 * BioContent - Server Component (zero JS cost)
 *
 * Renders all static bio HTML. CSS scroll-driven animations handle
 * image entrance, CTA entrance, and background opacity.
 * Per-character text reveal is handled by bio-text-animator.tsx.
 */
export default function BioContent({
  cssScrollSupported,
}: {
  cssScrollSupported?: boolean;
}) {
  // Build character data for data attributes
  const taglineChars = tagline.split("");
  const numberChars = numberText.split("");
  const mainChars = mainText.split("");
  const totalChars =
    taglineChars.length + numberChars.length + mainChars.length;

  // Build word-level spans for tagline
  const taglineWords = tagline.split(" ");
  const taglineWordOffsets = taglineWords.map((_, i) =>
    taglineWords.slice(0, i).reduce((acc, w) => acc + w.length + 1, 0),
  );

  const numberOffset = taglineChars.length;

  const mainTextWords = mainText.split(" ");
  const charOffset = taglineChars.length + numberChars.length;
  const mainWordOffsets = mainTextWords.map((_, i) =>
    mainTextWords.slice(0, i).reduce((acc, w) => acc + w.length + 1, 0),
  );

  return (
    <section
      className="relative h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-white to-gray-50 rounded-t-xl sm:rounded-t-2xl lg:rounded-t-4xl overflow-y-auto"
      style={{ contain: "layout style paint" }}
      data-bio-section
      data-total-chars={totalChars}
    >
      {/* Subtle background elements */}
      <div
        className={`absolute inset-0 overflow-hidden pointer-events-none${cssScrollSupported !== false ? " scroll-bio-bg" : ""}`}
        data-bio-bg
        style={cssScrollSupported === false ? { opacity: 0.3 } : undefined}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-purple-100/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-blue-100/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[210px_1fr] gap-12 lg:gap-24 short:gap-12 items-center">
          {/* Left: Cutout Mask Image */}
          <div
            className={`flex justify-center lg:justify-start${cssScrollSupported !== false ? " scroll-bio-image" : ""}`}
            data-bio-image
            style={
              cssScrollSupported === false
                ? {
                    transform: "translateY(100px) scale(0.6) translateZ(0)",
                    opacity: 0,
                  }
                : undefined
            }
          >
            <CutoutMaskImage
              imageUrl="/man-sitting.webp"
              clickToChangeImage={false}
              maxWidth={282}
              className="w-full max-w-[282px]"
              alt="Profile portrait"
              priority={true}
              quality={75}
              sizes="(max-width: 640px) 282px, (max-width: 1024px) 400px, 500px"
            />
          </div>

          {/* Right: Text Content */}
          <div className="space-y-8 short:space-y-4">
            {/* Tagline and Number */}
            <div className="flex justify-between items-start">
              <div className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-gray-600">
                {taglineWords.map((word, wordIdx) => {
                  const wordOffset = taglineWordOffsets[wordIdx];
                  return (
                    <span
                      key={`tag-word-${wordIdx}`}
                      className="inline-block whitespace-nowrap"
                    >
                      {word.split("").map((char, charIdx) => {
                        const idx = wordOffset + charIdx;
                        return (
                          <span
                            key={`tag-${idx}`}
                            className="inline-block"
                            data-char-index={idx}
                            style={{ opacity: 0.2 }}
                          >
                            {char}
                          </span>
                        );
                      })}
                      {wordIdx < taglineWords.length - 1 && (
                        <span
                          className="inline-block"
                          style={{ width: "0.25em" }}
                        >
                          {" "}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>

              <div className="text-xs sm:text-sm font-light text-gray-400 whitespace-nowrap">
                {numberChars.map((char, i) => {
                  const idx = numberOffset + i;
                  return (
                    <span
                      key={`num-${idx}`}
                      className="inline-block"
                      data-char-index={idx}
                      style={{ opacity: 0.2 }}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Main Text */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl short:text-3xl leading-tight font-light text-gray-900">
              {mainTextWords.map((word, wordIdx) => {
                const wordOffset = charOffset + mainWordOffsets[wordIdx];
                return (
                  <span
                    key={`main-word-${wordIdx}`}
                    className="inline-block whitespace-nowrap"
                  >
                    {word.split("").map((char, charIdx) => {
                      const idx = wordOffset + charIdx;
                      return (
                        <span
                          key={`main-${idx}`}
                          className="inline-block"
                          data-char-index={idx}
                          style={{ opacity: 0.2 }}
                        >
                          {char}
                        </span>
                      );
                    })}
                    {wordIdx < mainTextWords.length - 1 && (
                      <span
                        className="inline-block"
                        style={{ width: "0.25em" }}
                      >
                        {" "}
                      </span>
                    )}
                  </span>
                );
              })}
            </h2>

            {/* CTA Button */}
            <div
              className={
                cssScrollSupported !== false ? "scroll-bio-cta" : undefined
              }
              data-bio-cta
              style={
                cssScrollSupported === false
                  ? { opacity: 0, transform: "translateY(20px)" }
                  : undefined
              }
            >
              <Link href="/projects" prefetch={true}>
                <button className="bio-cta-button group inline-flex items-center gap-3 text-sm font-medium tracking-wider uppercase text-gray-900 transition-colors hover:text-gray-600">
                  <span className="relative">
                    View Selected Work
                    <span className="absolute bottom-0 left-0 w-full h-px bg-gray-900 origin-left transition-transform duration-300 scale-x-100 group-hover:scale-x-0" />
                  </span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
