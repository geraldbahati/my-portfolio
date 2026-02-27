"use client";

import React, { memo, useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Linkedin, Github, MessageCircle, Instagram } from "lucide-react";
import Image from "next/image";
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

// ============================================================================
// ANIMATION VARIANTS - Hoisted to module scope to prevent recreation
// ============================================================================

const OVERLAY_VARIANTS = {
  initial: {
    clipPath: "inset(0% 0% 100% 0%)",
  },
  animate: {
    clipPath: "inset(0% 0% 0% 0%)",
    transition: {
      duration: 0.6,
      ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
    },
  },
  exit: {
    clipPath: "inset(0% 0% 100% 0%)",
    transition: {
      duration: 0.8,
      ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
    },
  },
};

const CONTAINER_VARIANTS = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const ITEM_VARIANTS = {
  initial: {
    y: 100,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
    },
  },
  exit: {
    y: 100,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
    },
  },
};

const SOCIAL_VARIANTS = {
  initial: {
    y: 20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
  exit: {
    y: 20,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

const IMAGE_VARIANTS = {
  initial: {
    y: 200,
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1,
      delay: 0.8,
      ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
    },
  },
  exit: {
    y: 200,
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.4,
      ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
    },
  },
};

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
  const lenis = useLenis();

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
      <NavBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <AnimatePresence>
        {isOpen && <MenuOverlay isOpen={isOpen} setIsOpen={setIsOpen} />}
      </AnimatePresence>
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
        <div className="relative flex items-center justify-between py-6">
          {/* Logo */}
          <motion.a
            href="/"
            className="relative block cursor-pointer"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Home"
            onClick={handleLogoClick}
          >
            <Image
              src="/logo.png"
              alt="Portfolio Logo"
              width={80}
              height={80}
              priority
              sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, (max-width: 1024px) 56px, (max-width: 1280px) 64px, 80px"
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 invert brightness-0 transition-all duration-300"
            />
          </motion.a>

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
    <motion.button
      className="relative z-50 w-12 h-12 flex flex-col items-center justify-center"
      onClick={handleMenuToggle}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.8,
        delay: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <div className="relative w-8 h-6 flex flex-col justify-center">
        <motion.span
          className="absolute h-0.5 w-full bg-white"
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 0 : -4,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute h-0.5 w-full bg-white"
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? 0 : 4,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>
    </motion.button>
  );
});

// ============================================================================
// MENU OVERLAY
// ============================================================================

const MenuOverlay = memo(function MenuOverlay({ setIsOpen }: MenuOverlayProps) {
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

  return (
    <motion.div
      className="fixed inset-0 bg-black z-40"
      variants={OVERLAY_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="container mx-auto px-6 lg:px-12 h-full flex">
        <div className="flex flex-col lg:flex-row w-full h-full py-12 sm:py-16 lg:py-32">
          {/* Left Section - Menu Items */}
          <div className="flex-1 flex flex-col justify-center items-center lg:items-start lg:relative">
            {/* Menu Items */}
            <motion.nav
              className="w-full flex justify-center lg:justify-start mb-8 lg:mb-0"
              variants={CONTAINER_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ul className="space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left">
                {MENU_ITEMS.map((item) => (
                  <motion.li key={item.label} variants={ITEM_VARIANTS}>
                    <motion.a
                      href={item.href}
                      className="text-white hover:text-primary text-3xl sm:text-4xl lg:text-6xl xl:text-8xl font-medium block cursor-pointer transition-colors duration-300"
                      onClick={() => handleMenuItemClick(item.label, item.href)}
                      initial={{ letterSpacing: "0em" }}
                      whileHover={{
                        letterSpacing: "0.1em",
                        transition: {
                          duration: 0.3,
                          ease: "easeOut",
                        },
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.label}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>

            {/* Social Links - Desktop only */}
            <motion.div
              className="hidden lg:flex gap-4 absolute bottom-0 left-0"
              variants={CONTAINER_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {SOCIAL_LINKS.map((social) => {
                const Icon = ICON_MAP[social.id];
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-white hover:opacity-70 transition-opacity duration-300 cursor-pointer"
                    variants={SOCIAL_VARIANTS}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSocialClick(social.label, "navbar")}
                  >
                    <Icon size={24} />
                  </motion.a>
                );
              })}
            </motion.div>
          </div>

          {/* Right Section - Image & Mobile Social Links */}
          <div className="flex-1 flex flex-col items-center justify-center mt-8 lg:mt-0 relative">
            <motion.div
              className="relative w-64 h-80 sm:w-72 sm:h-88 md:w-80 md:h-96 lg:w-[500px] lg:h-[600px] xl:w-[600px] xl:h-[700px]"
              variants={IMAGE_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="relative w-full h-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/40" />
                <Image
                  src="/man-sitting.jpeg"
                  alt="Profile"
                  fill
                  sizes="(max-width: 640px) 256px, (max-width: 768px) 288px, (max-width: 1024px) 320px, 500px"
                  className="object-cover filter grayscale"
                />
                <motion.div
                  className="absolute inset-0 bg-black"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0 }}
                  whileHover={{ opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                />
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
            </motion.div>

            {/* Social Links - Mobile only */}
            <motion.div
              className="flex lg:hidden gap-4 mt-6 justify-center w-full"
              variants={CONTAINER_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {SOCIAL_LINKS.map((social) => {
                const Icon = ICON_MAP[social.id];
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-white hover:opacity-70 transition-opacity duration-300 cursor-pointer"
                    variants={SOCIAL_VARIANTS}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      handleSocialClick(social.label, "navbar-mobile")
                    }
                  >
                    <Icon size={24} />
                  </motion.a>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export { Navbar };
