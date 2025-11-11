"use client";

import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { TextScramble } from "@/components/ui/text-scramble";
import Analytics from "@/lib/analytics";

interface ContactLinksProps {
  phoneNumber?: string;
  whatsappNumber?: string;
  className?: string;
}

// Animated Contact Button Component
function AnimatedContactButton({
  onClick,
  children,
  className = "",
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldTriggerScramble, setShouldTriggerScramble] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setShouldTriggerScramble(true);

    // Auto-stop scramble after short duration like in footer
    setTimeout(() => {
      setShouldTriggerScramble(false);
    }, 500);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShouldTriggerScramble(false);
  }, []);

  const handleScrambleComplete = useCallback(() => {
    setShouldTriggerScramble(false);
  }, []);

  return (
    <motion.button
      onClick={onClick}
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
    </motion.button>
  );
}

export function ContactLinks({
  phoneNumber = "0651 17089399",
  whatsappNumber = "4965117089399", // Include country code for WhatsApp
  className = "",
}: ContactLinksProps) {
  const handleCall = () => {
    Analytics.trackPhoneClick("Contact Page");
    window.location.href = `tel:${phoneNumber.replace(/\s/g, "")}`;
  };

  const handleWhatsApp = () => {
    Analytics.trackOutboundLink(`https://wa.me/${whatsappNumber}`, "WhatsApp Chat - Contact Page");
    window.location.href = `https://wa.me/${whatsappNumber}`;
  };

  return (
    <div className={`flex flex-col items-start gap-4 ${className}`}>
      <AnimatedContactButton onClick={handleCall}>
        {phoneNumber}
      </AnimatedContactButton>

      <AnimatedContactButton onClick={handleWhatsApp}>
        24/7 WhatsApp Chat
      </AnimatedContactButton>
    </div>
  );
}
