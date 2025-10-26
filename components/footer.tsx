"use client";

import { motion } from "motion/react";
import { useCallback, useState, useEffect } from "react";
import { TextScramble } from "@/components/ui/text-scramble";
import { Separator } from "@/components/ui/separator";
import Analytics from "@/lib/analytics";

interface FooterProps {
  brand?: {
    name: string;
    tagline?: string;
  };
  contact?: {
    location?: string;
    link?: {
      text: string;
      url: string;
    };
  };
  accessibility?: {
    hours?: string;
    availability?: string;
  };
  legal?: Array<{
    name: string;
    url: string;
  }>;
  copyright?: string;
}

// Animated Link Component
function AnimatedLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldTriggerScramble, setShouldTriggerScramble] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setShouldTriggerScramble(true);

    // Auto-stop scramble after short duration like in contact section
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

  const handleClick = useCallback(() => {
    Analytics.trackLinkClick(String(children), href, 'internal');
  }, [children, href]);

  return (
    <motion.a
      href={href}
      className={`inline-block relative border-b transition-colors duration-300 ${
        isHovered ? "border-primary" : "border-transparent"
      } ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileHover={{ x: 2 }}
    >
      <TextScramble
        trigger={shouldTriggerScramble}
        duration={0.8}
        speed={0.04}
        onScrambleComplete={handleScrambleComplete}
        as="span"
      >
        {String(children)}
      </TextScramble>
    </motion.a>
  );
}

export function Footer({
  brand = {
    name: "Gerald.",
    tagline: "Digital Designer & Developer",
  },
  contact = {
    location: "Based in 54295, Trier",
    link: {
      text: "make contact",
      url: "#contact",
    },
  },
  accessibility = {
    hours: "Mon & Fri: 8:00 - 18:00",
    availability: "24/7 WhatsApp & Email",
  },
  legal = [
    { name: "Imprint", url: "/imprint" },
    { name: "Data protection", url: "/privacy" },
  ],
  copyright,
}: FooterProps) {
  const [copyrightText, setCopyrightText] = useState<string>(
    copyright || ""
  );

  useEffect(() => {
    // Update copyright with current year on client-side only
    if (!copyright) {
      const currentYear = new Date().getFullYear();
      setCopyrightText(`©${currentYear} Alexander Klimenko | All rights reserved.`);
    } else {
      setCopyrightText(copyright);
    }
  }, [copyright]);

  return (
    <footer className="bg-black text-white">
      {/* Separator line */}
      <div className="flex justify-center pt-24 pb-4">
        <Separator className="bg-white/50 max-w-7xl" />
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-semibold mb-3">{brand.name}</h2>
            {brand.tagline && (
              <p className="text-base text-gray-400">{brand.tagline}</p>
            )}
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-medium mb-4">contact</h3>
            <div className="space-y-2">
              {contact.location && (
                <p className="text-base text-gray-400">{contact.location}</p>
              )}
              {contact.link && (
                <AnimatedLink
                  href={contact.link.url}
                  className="text-base text-gray-400 hover:text-white transition-colors duration-300"
                >
                  {contact.link.text}
                </AnimatedLink>
              )}
            </div>
          </motion.div>

          {/* Accessibility */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-medium mb-4">Accessibility</h3>
            <div className="space-y-2">
              {accessibility.hours && (
                <p className="text-base text-gray-400">{accessibility.hours}</p>
              )}
              {accessibility.availability && (
                <p className="text-base text-gray-400">
                  {accessibility.availability}
                </p>
              )}
            </div>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-medium mb-4">Legal</h3>
            <div className="space-y-2">
              {legal.map((link) => (
                <div key={link.name}>
                  <AnimatedLink
                    href={link.url}
                    className="text-base text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </AnimatedLink>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 pt-8"
        >
          <p className="text-base text-gray-500">{copyrightText}</p>
        </motion.div>
      </div>
    </footer>
  );
}
