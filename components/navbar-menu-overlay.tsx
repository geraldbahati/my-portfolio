"use client";

import { memo, useCallback, type ComponentType } from "react";
import { Github, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import { AdaptiveLink } from "@/components/AdaptiveLink";
import Analytics from "@/lib/analytics";

interface NavbarMenuOverlayProps {
  isOpen: boolean;
  isClosing: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

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

const ITEM_ENTER_DELAYS = [0.3, 0.4, 0.5] as const;
const ITEM_EXIT_DELAYS = [0.1, 0.05, 0] as const;
const SOCIAL_ENTER_DELAYS = [0.3, 0.4, 0.5, 0.6, 0.7] as const;
const SOCIAL_EXIT_DELAYS = [0.2, 0.15, 0.1, 0.05, 0] as const;

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

const ICON_MAP: Record<string, ComponentType<{ size?: number }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  x: XIcon,
  whatsapp: WhatsAppIcon,
  github: Github,
};

export const NavbarMenuOverlay = memo(function NavbarMenuOverlay({
  isOpen,
  isClosing,
  setIsOpen,
}: NavbarMenuOverlayProps) {
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
          <div className="flex-1 flex flex-col justify-center items-center lg:items-start lg:relative">
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
                    <AdaptiveLink
                      href={item.href}
                      className="text-white hover:text-primary hover:tracking-[0.1em] text-3xl sm:text-4xl lg:text-6xl xl:text-8xl short:text-5xl font-medium block cursor-pointer transition-all duration-300"
                      prefetchOnViewport={false}
                      onClick={() => handleMenuItemClick(item.label, item.href)}
                    >
                      {item.label}
                    </AdaptiveLink>
                  </li>
                ))}
              </ul>
            </nav>

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

              <div
                className="absolute inset-0 mix-blend-screen opacity-30 animate-glitch-shimmer"
                style={{
                  background:
                    "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                  backgroundSize: "200% 200%",
                }}
              />
            </div>

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
