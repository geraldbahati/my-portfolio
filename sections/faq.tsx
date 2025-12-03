"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Instagram, Linkedin, Github, MessageCircle } from "lucide-react";
import { SectionDivider } from "@/components/section-divider";
import { FaqAccordion } from "@/components/faq-accordion";
import { FAQ_DATA } from "@/constants/faq-data";

// Social Links Component
const WhatsAppIcon = ({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) => (
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

const XIcon = ({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) => (
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

function SocialSidebar() {
  const socialLinks = [
    {
      icon: Instagram,
      href: "https://www.instagram.com/ace._gb/",
      label: "Instagram",
    },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/in/gerald-bahati-b1865a242/",
      label: "LinkedIn",
    },
    { icon: XIcon, href: "https://x.com/gerald_baha", label: "X" },
    {
      icon: WhatsAppIcon,
      href: "https://wa.me/254704713070",
      label: "WhatsApp",
    },
    { icon: Github, href: "https://github.com/geraldbahati", label: "GitHub" },
  ];

  return (
    <div className="hidden lg:flex flex-col gap-6">
      {socialLinks.map((social, index) => {
        const Icon = social.icon;
        return (
          <motion.a
            key={social.label}
            href={social.href}
            aria-label={social.label}
            className="text-gray-400 hover:text-white transition-colors duration-300"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon size={20} />
          </motion.a>
        );
      })}
    </div>
  );
}

// Main Section Component
export default function ExpertiseFaqSection() {
  return (
    <section
      data-section-id="ExpertiseFaqSection"
      className="min-h-screen text-white relative"
    >
      {/* FAQ Section Header */}
      <div className="container mx-auto max-w-7xl px-6 lg:px-16 pt-20 mb-16">
        <SectionDivider
          label="WHY YOU SHOULD WORK WITH ME"
          counter="(04)"
          duration={2}
          className="text-white"
          dividerColor="bg-primary/50"
        />
      </div>

      {/* Two Column Layout */}
      <div className="container mx-auto max-w-7xl px-6 lg:px-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32">
          {/* Left: Image with Social Sidebar */}
          <div className="flex items-end gap-6">
            <SocialSidebar />
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative w-full max-w-[540px] overflow-hidden rounded-lg"
            >
              <Image
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=540&h=350&fit=crop&crop=faces&auto=format&q=75"
                alt="Professional consultation meeting"
                width={540}
                height={350}
                className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 540px"
                priority
                quality={75}
              />
            </motion.div>
          </div>

          {/* Right: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="max-w-xl"
          >
            <h2 className="text-3xl font-light mb-8 tracking-tight">
              Trust in the expertise
            </h2>
            <p className="text-gray-400 text-base leading-relaxed font-light">
              Honesty and transparency throughout the entire project are
              essential for success. It&apos;s important to define goals and
              options right from the start. This is the only way to develop a
              functioning concept and a sustainable strategy.
            </p>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl ml-auto flex justify-end"
        >
          <div className="w-full">
            <FaqAccordion faqs={FAQ_DATA} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
