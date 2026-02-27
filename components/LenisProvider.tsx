"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";

const LenisContext = createContext<Lenis | null>(null);

export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    // Skip smooth scroll if user prefers reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const instance = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      autoResize: true,
    });

    setLenis(instance);

    // Demand-driven rAF: only loop while Lenis is actively animating.
    // Lenis emits "scroll" on every interpolated frame and stops when
    // the lerp settles, so we use it to start the loop and let it
    // self-terminate when isScrolling becomes false.
    let running = false;

    function raf(time: number) {
      instance.raf(time);
      if (instance.isScrolling) {
        rafId.current = requestAnimationFrame(raf);
      } else {
        running = false;
      }
    }

    function startLoop() {
      if (!running) {
        running = true;
        rafId.current = requestAnimationFrame(raf);
      }
    }

    // Kick the loop on every new scroll input
    instance.on("scroll", startLoop);
    // Also start on wheel/touch so the first frame isn't missed
    window.addEventListener("wheel", startLoop, { passive: true });
    window.addEventListener("touchstart", startLoop, { passive: true });

    // Listen for changes to prefers-reduced-motion
    function onChange(e: MediaQueryListEvent) {
      if (e.matches) {
        instance.destroy();
        cancelAnimationFrame(rafId.current);
        setLenis(null);
      }
    }
    mq.addEventListener("change", onChange);

    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("wheel", startLoop);
      window.removeEventListener("touchstart", startLoop);
      cancelAnimationFrame(rafId.current);
      instance.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
