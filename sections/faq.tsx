"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Facebook, Globe, Instagram, Linkedin, Twitter } from "lucide-react";
import { SectionDivider } from "@/components/section-divider";
import { FaqAccordion } from "@/components/faq-accordion";
import { FAQ_DATA } from "@/constants/faq-data";

// Social Links Component
function SocialSidebar() {
  const socialLinks = [
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "X (Twitter)" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Globe, href: "#", label: "Behance" }, // Using Globe as Behance substitute
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
