"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Lenis from "lenis";

type LenisListener = () => void;

const lenisListeners = new Set<LenisListener>();
let lenisSnapshot: Lenis | null = null;

function subscribe(listener: LenisListener) {
  lenisListeners.add(listener);
  return () => {
    lenisListeners.delete(listener);
  };
}

function getSnapshot() {
  return lenisSnapshot;
}

function getServerSnapshot() {
  return null;
}

function publishLenis(next: Lenis | null) {
  if (lenisSnapshot === next) return;
  lenisSnapshot = next;
  lenisListeners.forEach((listener) => listener());
}

export function useLenis(): Lenis | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const unsubscribeScrollRef = useRef<(() => void) | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let running = false;

    const stopLoop = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      running = false;
    };

    function raf(time: number) {
      const instance = lenisRef.current;
      if (!instance) {
        stopLoop();
        return;
      }

      instance.raf(time);
      if (instance.isScrolling) {
        rafIdRef.current = requestAnimationFrame(raf);
      } else {
        stopLoop();
      }
    }

    function startLoop() {
      if (running || !lenisRef.current) return;
      running = true;
      rafIdRef.current = requestAnimationFrame(raf);
    }

    const destroyInstance = () => {
      stopLoop();
      unsubscribeScrollRef.current?.();
      unsubscribeScrollRef.current = null;
      lenisRef.current?.destroy();
      lenisRef.current = null;
      publishLenis(null);
    };

    const ensureInstance = () => {
      if (mq.matches || lenisRef.current) return;

      const instance = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        autoResize: true,
      });

      lenisRef.current = instance;
      publishLenis(instance);
      unsubscribeScrollRef.current = instance.on("scroll", startLoop);
    };

    function onChange(event: MediaQueryListEvent) {
      if (event.matches) {
        destroyInstance();
      } else {
        ensureInstance();
      }
    }

    ensureInstance();
    window.addEventListener("wheel", startLoop, { passive: true });
    window.addEventListener("touchstart", startLoop, { passive: true });
    mq.addEventListener("change", onChange);

    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("wheel", startLoop);
      window.removeEventListener("touchstart", startLoop);
      destroyInstance();
    };
  }, []);

  return children;
}
