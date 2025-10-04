"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe } from "lucide-react";
import Image from "next/image";

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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <NavBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <AnimatePresence>
        {isOpen && <MenuOverlay isOpen={isOpen} setIsOpen={setIsOpen} />}
      </AnimatePresence>
    </>
  );
};

const NavBar = ({ isOpen, setIsOpen }: NavBarProps) => {
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 ${
        isOpen ? "" : "mix-blend-difference"
      }`}
    >
      <div className="mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between py-6">
          {/* Logo */}
          <motion.div
            className="relative text-white"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl font-bold tracking-tighter">AK</span>
          </motion.div>

          {/* Menu Button */}
          <MenuButton isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      </div>
    </nav>
  );
};

const MenuButton = ({ isOpen, setIsOpen }: MenuButtonProps) => {
  return (
    <motion.button
      className="relative z-50 w-12 h-12 flex flex-col items-center justify-center"
      onClick={() => setIsOpen(!isOpen)}
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
};

const MenuOverlay = ({ setIsOpen }: MenuOverlayProps) => {
  // Animation variants
  const overlayVariants = {
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

  const containerVariants = {
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

  const itemVariants = {
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

  const socialVariants = {
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

  const imageVariants = {
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

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "/contact" },
  ];

  const socialLinks = [
    { Icon: Globe, href: "#", label: "LinkedIn" },
    { Icon: Globe, href: "#", label: "Twitter" },
    { Icon: Globe, href: "#", label: "Instagram" },
    { Icon: Globe, href: "#", label: "Facebook" },
    { Icon: Globe, href: "#", label: "Behance" },
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-black z-40"
      variants={overlayVariants}
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
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ul className="space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left">
                {menuItems.map((item) => (
                  <motion.li key={item.label} variants={itemVariants}>
                    <motion.a
                      href={item.href}
                      className="text-white hover:text-primary text-3xl sm:text-4xl lg:text-6xl xl:text-8xl font-medium block cursor-pointer transition-colors duration-300"
                      onClick={() => setIsOpen(false)}
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
              className="hidden lg:flex gap-4 absolute bottom-24 left-6 xl:left-12"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="text-white hover:opacity-70 transition-opacity duration-300"
                  variants={socialVariants}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.Icon size={24} />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Right Section - Image & Mobile Social Links */}
          <div className="flex-1 flex flex-col items-center justify-center mt-8 lg:mt-0 relative">
            <motion.div
              className="relative w-64 h-80 sm:w-72 sm:h-88 md:w-80 md:h-96 lg:w-[500px] lg:h-[600px] xl:w-[600px] xl:h-[700px]"
              variants={imageVariants}
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

              {/* Glitch effect overlay */}
              <motion.div
                className="absolute inset-0 mix-blend-screen opacity-30"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }}
                style={{
                  background:
                    "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                  backgroundSize: "200% 200%",
                }}
              />
            </motion.div>

            {/* Social Links - Mobile only, positioned below image */}
            <motion.div
              className="flex lg:hidden gap-4 mt-6 justify-center w-full"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="text-white hover:opacity-70 transition-opacity duration-300"
                  variants={socialVariants}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.Icon size={24} />
                </motion.a>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export { Navbar };
