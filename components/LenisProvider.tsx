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

    function raf(time: number) {
      instance.raf(time);
      rafId.current = requestAnimationFrame(raf);
    }
    rafId.current = requestAnimationFrame(raf);

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
      cancelAnimationFrame(rafId.current);
      instance.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
