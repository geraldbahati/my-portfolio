"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AdaptiveLink } from "@/components/AdaptiveLink";
import { trackMenuToggled, trackNavigationClicked } from "@/lib/analytics";
import { useLenis } from "@/components/LenisProvider";

interface NavBarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface MenuButtonProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const EXIT_DURATION_MS = 800;

function handleLogoClick() {
  trackNavigationClicked({
    label: "Logo",
    destination: "/",
    surface: "navbar",
  });
}

const MenuOverlay = dynamic(
  () =>
    import("@/components/navbar-menu-overlay").then((mod) => ({
      default: mod.NavbarMenuOverlay,
    })),
  {
    loading: () => null,
  },
);

const Navbar = function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const lenis = useLenis();
  const exitTimerRef = useRef<NodeJS.Timeout>(null);

  const handleSetIsOpen = (open: boolean) => {
    if (isAnimating) {
      return;
    }

    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    setIsAnimating(true);

    if (open) {
      setShouldRender(true);
      setIsClosing(false);
      setIsOpen(true);
      exitTimerRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 600);
      return;
    }

    setIsClosing(true);
    setIsOpen(false);
    exitTimerRef.current = setTimeout(() => {
      setShouldRender(false);
      setIsClosing(false);
      setIsAnimating(false);
    }, EXIT_DURATION_MS);
  };

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      lenis?.stop();
    } else {
      document.body.style.overflow = "unset";
      lenis?.start();
    }

    return () => {
      document.body.style.overflow = "unset";
      lenis?.start();
    };
  }, [isOpen, lenis]);

  return (
    <>
      <NavBar isOpen={isOpen} setIsOpen={handleSetIsOpen} />
      {shouldRender && (
        <MenuOverlay
          isOpen={isOpen}
          isClosing={isClosing}
          setIsOpen={handleSetIsOpen}
        />
      )}
    </>
  );
};

const NavBar = function NavBar({ isOpen, setIsOpen }: NavBarProps) {
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 ${
        isOpen ? "" : "mix-blend-difference"
      }`}
    >
      <div className="relative mx-auto px-6 lg:px-12">
        <div className="relative flex items-center justify-between py-6 short:py-3">
          <AdaptiveLink
            href="/"
            className="relative block cursor-pointer animate-nav-slide-down hover:scale-105 active:scale-95 transition-transform duration-200"
            style={{ animationDelay: "0.2s" }}
            aria-label="Home"
            onClick={handleLogoClick}
          >
            <Image
              src="/logo.webp"
              alt="Portfolio Logo"
              width={80}
              height={80}
              priority
              sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, (max-width: 1024px) 56px, (max-width: 1280px) 64px, 80px"
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 short:w-14 short:h-14 invert brightness-0 transition-[color,background-color,border-color,opacity,transform,box-shadow,filter] duration-300"
            />
          </AdaptiveLink>

          <MenuButton isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      </div>
    </nav>
  );
};

const MenuButton = function MenuButton({ isOpen, setIsOpen }: MenuButtonProps) {
  const handleMenuToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    trackMenuToggled({ state: newState ? "opened" : "closed" });
  };

  return (
    <button
      type="button"
      className="relative z-50 w-12 h-12 flex flex-col items-center justify-center animate-nav-slide-down hover:scale-110 active:scale-90 transition-transform duration-200"
      style={{ animationDelay: "0.3s" }}
      onClick={handleMenuToggle}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <div className="relative w-8 h-6 flex flex-col justify-center">
        <span
          className="absolute h-0.5 w-full bg-white transition-transform duration-300 ease-in-out"
          style={{
            transform: isOpen
              ? "rotate(45deg) translateY(0)"
              : "rotate(0deg) translateY(-4px)",
          }}
        />
        <span
          className="absolute h-0.5 w-full bg-white transition-transform duration-300 ease-in-out"
          style={{
            transform: isOpen
              ? "rotate(-45deg) translateY(0)"
              : "rotate(0deg) translateY(4px)",
          }}
        />
      </div>
    </button>
  );
};

export { Navbar };
