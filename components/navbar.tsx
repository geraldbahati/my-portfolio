"use client";

import React, { memo, useEffect, useState, useCallback, useRef } from "react";
import { Linkedin, Github, Instagram } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Analytics from "@/lib/analytics";
import { useLenis } from "@/components/LenisProvider";

// ============================================================================
// TYPES
// ============================================================================

interface NavBarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface MenuButtonProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface MenuOverlayProps {
  isOpen: boolean;
  isClosing: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// ============================================================================
// STATIC DATA - Hoisted to module scope to prevent recreation
// ============================================================================

const MENU_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
] as const;

const SOCIAL_LINKS = [
  {
    id: "instagram",
    href: "https://www.instagram.com/ace._gb/",
    label: "Instagram",
  },
  {
    id: "linkedin",
    href: "https://www.linkedin.com/in/geraldbahati/",
    label: "LinkedIn",
  },
  { id: "x", href: "https://x.com/gerald_baha", label: "X" },
  {
    id: "whatsapp",
    href: "https://wa.me/254704713070",
    label: "WhatsApp",
  },
  { id: "github", href: "https://github.com/geraldbahati", label: "GitHub" },
] as const;

// Stagger delays for menu items (enter)
const ITEM_ENTER_DELAYS = [0.3, 0.4, 0.5] as const; // delayChildren 0.3 + stagger 0.1
// Stagger delays for menu items (exit) - reverse order
const ITEM_EXIT_DELAYS = [0.1, 0.05, 0] as const; // reverse stagger 0.05

// Stagger delays for social links
const SOCIAL_ENTER_DELAYS = [0.3, 0.4, 0.5, 0.6, 0.7] as const;
const SOCIAL_EXIT_DELAYS = [0.2, 0.15, 0.1, 0.05, 0] as const;

// Exit animation duration (longest exit animation to wait for before unmount)
const EXIT_DURATION_MS = 800;

// ============================================================================
// ICON COMPONENTS - Memoized
// ============================================================================

const WhatsAppIcon = memo(function WhatsAppIcon({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      className={`bi bi-whatsapp ${className || ""}`}
      viewBox="0 0 16 16"
    >
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
    </svg>
  );
});

const XIcon = memo(function XIcon({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      className={`bi bi-twitter-x ${className || ""}`}
      viewBox="0 0 16 16"
    >
      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
    </svg>
  );
});

// Icon map for social links
const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  x: XIcon,
  whatsapp: WhatsAppIcon,
  github: Github,
};

// ============================================================================
// MAIN NAVBAR COMPONENT
// ============================================================================

const Navbar = memo(function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const lenis = useLenis();
  const exitTimerRef = useRef<NodeJS.Timeout>(null);

  // Handle open/close with exit animation delay
  const handleSetIsOpen = useCallback(
    (open: boolean) => {
      // Block clicks while an animation is in progress
      if (isAnimating) return;

      // Always cancel any pending exit timer
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }

      setIsAnimating(true);

      if (open) {
        // Opening: render immediately, then trigger enter
        setShouldRender(true);
        setIsClosing(false);
        setIsOpen(true);
        // Unlock after enter animation completes
        exitTimerRef.current = setTimeout(() => {
          setIsAnimating(false);
        }, 600); // matches nav-overlay-enter duration
      } else {
        // Closing: trigger exit animations, then unmount after delay
        setIsClosing(true);
        setIsOpen(false);
        exitTimerRef.current = setTimeout(() => {
          setShouldRender(false);
          setIsClosing(false);
          setIsAnimating(false);
        }, EXIT_DURATION_MS);
      }
    },
    [isAnimating],
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  // Prevent body scroll when menu is open
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
});

// ============================================================================
// NAVBAR HEADER
// ============================================================================

const NavBar = memo(function NavBar({ isOpen, setIsOpen }: NavBarProps) {
  const handleLogoClick = useCallback(() => {
    Analytics.trackLinkClick("Logo", "/", "internal");
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 ${
        isOpen ? "" : "mix-blend-difference"
      }`}
    >
      <div className="relative mx-auto px-6 lg:px-12">
        <div className="relative flex items-center justify-between py-6 short:py-3">
          {/* Logo */}
          <Link
            href="/"
            prefetch={true}
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
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 short:w-14 short:h-14 invert brightness-0 transition-all duration-300"
            />
          </Link>

          {/* Menu Button */}
          <MenuButton isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      </div>
    </nav>
  );
});

// ============================================================================
// MENU BUTTON
// ============================================================================

const MenuButton = memo(function MenuButton({
  isOpen,
  setIsOpen,
}: MenuButtonProps) {
  const handleMenuToggle = useCallback(() => {
    const newState = !isOpen;
    setIsOpen(newState);
    Analytics.trackButtonClick(newState ? "Open Menu" : "Close Menu", "Navbar");
  }, [isOpen, setIsOpen]);

  return (
    <button
      className="relative z-50 w-12 h-12 flex flex-col items-center justify-center animate-nav-slide-down hover:scale-110 active:scale-90 transition-transform duration-200"
      style={{ animationDelay: "0.3s" }}
      onClick={handleMenuToggle}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <div className="relative w-8 h-6 flex flex-col justify-center">
        <span
          className="absolute h-0.5 w-full bg-white transition-all duration-300 ease-in-out"
          style={{
            transform: isOpen
              ? "rotate(45deg) translateY(0)"
              : "rotate(0deg) translateY(-4px)",
          }}
        />
        <span
          className="absolute h-0.5 w-full bg-white transition-all duration-300 ease-in-out"
          style={{
            transform: isOpen
              ? "rotate(-45deg) translateY(0)"
              : "rotate(0deg) translateY(4px)",
          }}
        />
      </div>
    </button>
  );
});

// ============================================================================
// MENU OVERLAY
// ============================================================================

const MenuOverlay = memo(function MenuOverlay({
  isOpen,
  isClosing,
  setIsOpen,
}: MenuOverlayProps) {
  const router = useRouter();

  // Eagerly prefetch all menu routes when overlay mounts
  useEffect(() => {
    for (const item of MENU_ITEMS) {
      router.prefetch(item.href);
    }
  }, [router]);

  const handleMenuItemClick = useCallback(
    (label: string, href: string) => {
      Analytics.trackLinkClick(label, href, "internal");
      setIsOpen(false);
    },
    [setIsOpen],
  );

  const handleSocialClick = useCallback((label: string, source: string) => {
    Analytics.trackSocialShare(label, "profile-link", source);
  }, []);

  const isEntering = isOpen && !isClosing;

  return (
    <div
      className={`fixed inset-0 bg-black z-40 ${
        isEntering ? "nav-overlay-enter" : "nav-overlay-exit"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12 h-full flex">
        <div className="flex flex-col lg:flex-row w-full h-full py-12 sm:py-16 lg:py-32 short:py-16">
          {/* Left Section - Menu Items */}
          <div className="flex-1 flex flex-col justify-center items-center lg:items-start lg:relative">
            {/* Menu Items */}
            <nav className="w-full flex justify-center lg:justify-start mb-8 lg:mb-0">
              <ul className="space-y-4 sm:space-y-6 lg:space-y-8 short:space-y-3 text-center lg:text-left">
                {MENU_ITEMS.map((item, index) => (
                  <li
                    key={item.label}
                    className={
                      isEntering
                        ? "animate-nav-item-enter"
                        : "animate-nav-item-exit"
                    }
                    style={{
                      animationDelay: isEntering
                        ? `${ITEM_ENTER_DELAYS[index]}s`
                        : `${ITEM_EXIT_DELAYS[index]}s`,
                    }}
                  >
                    <Link
                      href={item.href}
                      prefetch={true}
                      className="text-white hover:text-primary hover:tracking-[0.1em] text-3xl sm:text-4xl lg:text-6xl xl:text-8xl short:text-5xl font-medium block cursor-pointer transition-all duration-300"
                      onClick={() => handleMenuItemClick(item.label, item.href)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Social Links - Desktop only */}
            <div className="hidden lg:flex gap-4 absolute bottom-0 left-0">
              {SOCIAL_LINKS.map((social, index) => {
                const Icon = ICON_MAP[social.id];
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`text-white hover:opacity-70 hover:scale-120 hover:rotate-5 active:scale-90 transition-all duration-300 cursor-pointer ${
                      isEntering
                        ? "animate-nav-social-enter"
                        : "animate-nav-social-exit"
                    }`}
                    style={{
                      animationDelay: isEntering
                        ? `${SOCIAL_ENTER_DELAYS[index]}s`
                        : `${SOCIAL_EXIT_DELAYS[index]}s`,
                    }}
                    onClick={() => handleSocialClick(social.label, "navbar")}
                  >
                    <Icon size={24} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right Section - Image & Mobile Social Links */}
          <div className="flex-1 flex flex-col items-center justify-center mt-8 lg:mt-0 relative">
            <div
              className={`relative w-64 h-80 sm:w-72 sm:h-88 md:w-80 md:h-96 lg:w-[500px] lg:h-[600px] xl:w-[600px] xl:h-[700px] short:w-[340px] short:h-[420px] ${
                isEntering
                  ? "animate-nav-image-enter"
                  : "animate-nav-image-exit"
              }`}
            >
              <div className="relative w-full h-full overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-gray-900/20 to-gray-900/40" />
                <Image
                  src="/man-sitting.webp"
                  alt="Profile"
                  fill
                  sizes="(max-width: 640px) 256px, (max-width: 768px) 288px, (max-width: 1024px) 320px, 500px"
                  className="object-cover filter grayscale"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </div>

              {/* Glitch effect overlay - CSS animation for better performance */}
              <div
                className="absolute inset-0 mix-blend-screen opacity-30 animate-glitch-shimmer"
                style={{
                  background:
                    "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                  backgroundSize: "200% 200%",
                }}
              />
            </div>

            {/* Social Links - Mobile only */}
            <div className="flex lg:hidden gap-4 mt-6 justify-center w-full">
              {SOCIAL_LINKS.map((social, index) => {
                const Icon = ICON_MAP[social.id];
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`text-white hover:opacity-70 hover:scale-120 hover:rotate-5 active:scale-90 transition-all duration-300 cursor-pointer ${
                      isEntering
                        ? "animate-nav-social-enter"
                        : "animate-nav-social-exit"
                    }`}
                    style={{
                      animationDelay: isEntering
                        ? `${SOCIAL_ENTER_DELAYS[index]}s`
                        : `${SOCIAL_EXIT_DELAYS[index]}s`,
                    }}
                    onClick={() =>
                      handleSocialClick(social.label, "navbar-mobile")
                    }
                  >
                    <Icon size={24} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export { Navbar };
