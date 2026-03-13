import Image from "next/image";
import Link from "next/link";

/**
 * HeroContent - Server Component (zero JS cost)
 *
 * Renders all static hero HTML: image, title, description, CTA.
 * CSS animations (reveal-up, reveal-up-title, scroll-hero-scale) work
 * without JavaScript. TextScramble and GridPattern are progressive
 * enhancements added by hero-enhancements.tsx after hydration.
 */
export default function HeroContent({
  cssScrollSupported,
}: {
  cssScrollSupported?: boolean;
}) {
  return (
    <section
      className="relative min-h-screen overflow-hidden bg-hero-bg"
      style={{
        contain: "layout style paint",
      }}
      role="banner"
    >
      {/* Profile Background Image - scales on scroll */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div
          data-hero-scale
          className={`relative w-full h-full${cssScrollSupported !== false ? " scroll-hero-scale" : ""}`}
          style={
            cssScrollSupported === false
              ? { transform: "scale(1) translateZ(0)" }
              : undefined
          }
        >
          <Image
            src="/hero-image.webp"
            alt="Gerald Bahati - Product Software Engineer"
            fill
            priority
            fetchPriority="high"
            className="object-cover sm:object-contain sm:mix-blend-screen"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 1920px"
            quality={60}
          />
        </div>
      </div>

      {/* Edge Fade Overlay - Gentle vignette effect */}
      <div
        className="absolute inset-0 z-5"
        style={{
          background:
            "linear-gradient(to right, var(--hero-overlay) 0%, transparent 20%, transparent 80%, var(--hero-overlay) 100%)",
        }}
      />
      <div
        className="absolute inset-0 z-5"
        style={{
          background:
            "linear-gradient(to bottom, var(--hero-overlay) 0%, transparent 20%, transparent 80%, var(--hero-overlay) 100%)",
        }}
      />

      {/* GridPattern placeholder - the actual GridPattern mounts here via hero-enhancements */}
      <div data-grid-pattern-slot className="absolute inset-0 z-10" />

      {/* Hero Content - Renders immediately for fast LCP */}
      <div className="relative z-10 min-h-screen flex items-end justify-center lg:justify-end px-4 sm:px-6 lg:px-8 sm:pb-12 pb-16 short:pb-8 pointer-events-none">
        <div className="w-full max-w-7xl mx-auto text-center lg:text-left">
          {/* Name section - Static text, TextScramble overlays after hydration */}
          <div className="mb-8 short:mb-4 overflow-hidden">
            <div className="reveal-up" data-hero-name-wrapper>
              <p
                data-hero-name-static
                className="text-xs sm:text-sm lg:text-base font-light text-primary tracking-[0.2em] sm:tracking-[0.3em] uppercase"
              >
                Gerald Bahati
              </p>
              <div data-hero-name-portal className="hidden" />
            </div>
          </div>

          {/* Main Title - Clip reveal animation */}
          <div className="mb-8 sm:mb-10 lg:mb-12 short:mb-6">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl short:text-6xl font-thin leading-tight sm:leading-none tracking-tight grid-interaction-blocked pointer-events-auto text-white"
              style={{ fontSize: "clamp(2.25rem, 6vw, 5rem)" }}
            >
              <span className="inline-block overflow-hidden align-bottom">
                <span className="inline-block font-medium reveal-up-title">
                  Product
                </span>
              </span>
              <span className="inline-block overflow-hidden align-bottom">
                <span
                  className="inline-block mx-2 sm:mx-3 reveal-up-title text-white"
                  aria-hidden="true"
                >
                  /
                </span>
              </span>
              <span className="inline-block overflow-hidden align-bottom">
                <span className="inline-block text-transparent [text-stroke:1px_white] [-webkit-text-stroke:1px_white] reveal-up-title italic pr-[0.15em]">
                  Software Engineer
                </span>
              </span>
            </h1>
          </div>

          {/* Description and CTA */}
          <div className="flex flex-col items-center lg:items-start lg:flex-row lg:justify-between gap-6 sm:gap-8">
            <div className="max-w-xl lg:max-w-2xl overflow-hidden">
              <p className="text-sm sm:text-base lg:text-lg short:text-base text-muted-foreground font-light leading-relaxed tracking-wide grid-interaction-blocked pointer-events-auto reveal-up">
                Building edge-first e-commerce and real-time systems with
                multi-layer caching, AI recommendations, and M-Pesa payment
                integrations.
              </p>
            </div>

            <div className="shrink-0 overflow-hidden">
              <div className="reveal-up" data-hero-cta-wrapper>
                <div data-hero-cta-static>
                  <Link
                    href="/contact"
                    className="inline-block pointer-events-auto"
                    prefetch={true}
                  >
                    <span
                      className="shrink-0 cursor-pointer relative inline-block border-b border-muted-foreground/50 hover:border-primary transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="text-white font-light text-sm sm:text-base uppercase tracking-[0.2em]">
                        Request a project
                      </span>
                    </span>
                  </Link>
                </div>
                <div data-hero-cta-portal className="hidden" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
