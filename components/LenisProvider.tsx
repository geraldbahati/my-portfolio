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
  const hasActivatedRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let running = false;
    let idleId: number | null = null;
    let idleTimeoutId: number | null = null;
    const supportsIdleCallback =
      typeof window.requestIdleCallback === "function";

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
      if (mq.matches || lenisRef.current || hasActivatedRef.current) return;

      hasActivatedRef.current = true;

      const instance = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        autoResize: true,
      });

      lenisRef.current = instance;
      publishLenis(instance);
      unsubscribeScrollRef.current = instance.on("scroll", startLoop);
    };

    const clearIdleSetup = () => {
      if (idleId !== null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
        idleId = null;
      }

      if (idleTimeoutId !== null) {
        window.clearTimeout(idleTimeoutId);
        idleTimeoutId = null;
      }
    };

    const activateLenis = () => {
      clearIdleSetup();
      ensureInstance();
    };

    function onChange(event: MediaQueryListEvent) {
      if (event.matches) {
        destroyInstance();
        hasActivatedRef.current = false;
        clearIdleSetup();
      } else {
        if (supportsIdleCallback) {
          idleId = window.requestIdleCallback(activateLenis, {
            timeout: 1800,
          });
          return;
        }

        idleTimeoutId = window.setTimeout(activateLenis, 1200);
      }
    }

    const passiveInteractionEvents = ["wheel", "touchstart", "pointerdown"] as const;

    if (supportsIdleCallback) {
      idleId = window.requestIdleCallback(activateLenis, {
        timeout: 1800,
      });
    } else {
      idleTimeoutId = window.setTimeout(activateLenis, 1200);
    }

    passiveInteractionEvents.forEach((eventName) => {
      window.addEventListener(eventName, activateLenis, { passive: true });
    });
    window.addEventListener("keydown", activateLenis);
    window.addEventListener("wheel", startLoop, { passive: true });
    window.addEventListener("touchstart", startLoop, { passive: true });
    mq.addEventListener("change", onChange);

    return () => {
      clearIdleSetup();
      mq.removeEventListener("change", onChange);
      window.removeEventListener("wheel", startLoop);
      window.removeEventListener("touchstart", startLoop);
      passiveInteractionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, activateLenis);
      });
      window.removeEventListener("keydown", activateLenis);
      destroyInstance();
      hasActivatedRef.current = false;
    };
  }, []);

  return children;
}
