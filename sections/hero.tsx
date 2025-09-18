"use client";

import GridPattern from "@/components/ui/shadcn-io/grid-pattern";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div>
      {/* Grid Pattern Background */}
      <GridPattern
        className="absolute inset-0 opacity-20"
        width={36}
        height={36}
      />

      {/* Hero Content */}
      <div className="relative z-10 min-h-screen flex items-end justify-end px-4 pb-10 pointer-events-none">
        <div className=" max-w-6xl mx-auto">
          {/* Name */}
          <div
            className={`mb-12 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <p className="text-sm md:text-base font-light text-primary tracking-[0.3em] uppercase">
              Gerald Bahati
            </p>
          </div>

          {/* Main Title */}
          <div
            className={`mb-10 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-thin leading-none tracking-tight pointer-events-auto">
              <span className="inline-block font-bold">Webdesign</span>
              <span className="text-muted-foreground mx-3">/</span>
              <span className="inline-block text-transparent font-thin transition-all duration-300 outline-text">
                Digital Marketing
              </span>
            </h1>
          </div>

          {/* Description and CTA Button */}
          <div
            className={`flex flex-col md:flex-row md:items-center md:justify-between gap-8 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            {/* Description */}
            <div className="flex-1">
              <p className="text-sm md:text-base text-muted-foreground font-light max-w-2xl leading-relaxed tracking-wide pointer-events-auto">
                Design meets Performance – creative web design and digital
                marketing delivered precisely.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex-shrink-0">
              <button className="pointer-events-auto group relative inline-flex items-center px-10 py-4 bg-transparent border border-white text-white font-light text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-500 overflow-hidden">
                <span className="relative z-10 transition-all duration-300">
                  Start Project
                </span>
                <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .outline-text {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.5);
          text-stroke: 1px rgba(255, 255, 255, 0.5);
        }

        .outline-text:hover {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.8);
          text-stroke: 1px rgba(255, 255, 255, 0.8);
        }

        @media (max-width: 768px) {
          .outline-text {
            -webkit-text-stroke: 0.5px rgba(255, 255, 255, 0.5);
            text-stroke: 0.5px rgba(255, 255, 255, 0.5);
          }
        }
      `}</style>
    </div>
  );
}
