"use client";

import { m } from "motion/react";
import { useState } from "react";
import { TextScramble } from "@/components/ui/text-scramble";
import { trackContactChannelClicked } from "@/lib/analytics";

interface ContactLinksProps {
  phoneNumber?: string;
  whatsappNumber?: string;
  className?: string;
}

function handleCall() {
  trackContactChannelClicked({ channel: "phone", surface: "contact_page" });
}

function handleWhatsApp() {
  trackContactChannelClicked({
    channel: "whatsapp",
    surface: "contact_page",
  });
}

// Animated Contact Button Component
function AnimatedContactButton({
  href,
  onClick,
  children,
  className = "",
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldTriggerScramble, setShouldTriggerScramble] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setShouldTriggerScramble(true);

    // Auto-stop scramble after short duration like in footer
    setTimeout(() => {
      setShouldTriggerScramble(false);
    }, 500);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShouldTriggerScramble(false);
  };

  const handleScrambleComplete = () => {
    setShouldTriggerScramble(false);
  };

  return (
    <m.a
      href={href}
      onClick={onClick}
      // TextScramble randomises the visible characters while animating; without
      // this a screen reader can read out a scrambled phone number.
      aria-label={String(children)}
      className={`inline-block relative border-b transition-colors duration-300 cursor-pointer ${
        isHovered ? "border-primary" : "border-transparent"
      } ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      <TextScramble
        trigger={shouldTriggerScramble}
        duration={0.8}
        speed={0.04}
        onScrambleComplete={handleScrambleComplete}
        as="span"
        className="text-gray-800 font-medium"
      >
        {String(children)}
      </TextScramble>
    </m.a>
  );
}

export function ContactLinks({
  phoneNumber = "0704713070",
  whatsappNumber = "254704713070", // Include country code for WhatsApp
  className = "",
}: ContactLinksProps) {
  const normalizedPhoneNumber = phoneNumber.replace(/\s/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <div className={`flex flex-col items-start gap-4 ${className}`}>
      <AnimatedContactButton
        href={`tel:${normalizedPhoneNumber}`}
        onClick={handleCall}
      >
        {phoneNumber}
      </AnimatedContactButton>

      <AnimatedContactButton href={whatsappUrl} onClick={handleWhatsApp}>
        WhatsApp message
      </AnimatedContactButton>
    </div>
  );
}
