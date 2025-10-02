"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { Facebook, Globe, Instagram, Linkedin, Twitter } from "lucide-react";

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

// FAQ Accordion Component (modified from provided code)
interface FaqsAccordionProps {
  faqs?: Array<{
    question: string;
    answer: string | React.ReactNode;
  }>;
}

function FaqsAccordion({
  faqs = [
    {
      question: "HOW DOES THE COLLABORATION WITH YOU WORK?",
      answer: (
        <div className="space-y-3 text-foreground-muted">
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-primary mr-3 mt-1">•</span>
              <div>
                <strong className="text-white">Enquiries & Contact:</strong>
                <span className="block mt-1">
                  By phone, contact form or WhatsApp – with specific ideas or to
                  arrange an appointment for a consultation
                </span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3 mt-1">•</span>
              <div>
                <strong className="text-white">Personal meeting:</strong>
                <span className="block mt-1">
                  Discussion of ideas, goals and review of the collaboration
                </span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3 mt-1">•</span>
              <div>
                <strong className="text-white">Analysis:</strong>
                <span className="block mt-1">
                  Assessment of the status quo and identification of potential
                </span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3 mt-1">•</span>
              <div>
                <strong className="text-white">Offer creation:</strong>
                <span className="block mt-1">
                  Creation of an individual offer based on the findings
                </span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3 mt-1">•</span>
              <div>
                <strong className="text-white">Concept & Design:</strong>
                <span className="block mt-1">
                  Determination of the appropriate strategy and selection of
                  suitable instruments
                </span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3 mt-1">•</span>
              <div>
                <strong className="text-white">
                  Implementation, maintenance and reporting
                </strong>
              </div>
            </li>
          </ul>
        </div>
      ),
    },
    {
      question: "WHY SHOULD PEOPLE WORK WITH YOU?",
      answer:
        "With over a decade of experience in digital design and development, we bring a unique blend of creativity and technical expertise. Our commitment to quality, attention to detail, and client-focused approach ensures that every project exceeds expectations.",
    },
    {
      question: "WHAT IS SYNERGISTIC MARKETING?",
      answer:
        "Synergistic marketing is an integrated approach that combines multiple marketing channels and strategies to create a cohesive brand experience. This method amplifies your message across platforms, ensuring maximum impact and consistent brand presence.",
    },
    {
      question: "DO YOU ALSO OFFER INDIVIDUAL SERVICES?",
      answer:
        "Yes, we offer flexible service options tailored to your needs. Whether you need a complete solution or specific services like branding, web design, or digital marketing, we can customize our offerings to match your requirements and budget.",
    },
    {
      question: "HOW MUCH DOES A WEBSITE COST?",
      answer:
        "Website costs vary based on complexity, features, and scope. A basic website starts from $5,000, while more complex e-commerce or custom solutions can range from $15,000 to $50,000+. We provide detailed quotes after understanding your specific requirements.",
    },
    {
      question:
        "DO YOU ALSO OFFER WEBSITE MAINTENANCE AND SUPPORT AFTER LAUNCH?",
      answer:
        "Absolutely. We offer comprehensive maintenance packages that include regular updates, security monitoring, performance optimization, and ongoing support. Our team ensures your website remains secure, fast, and up-to-date with the latest standards.",
    },
    {
      question: "CAN I MANAGE AND UPDATE MY WEBSITE MYSELF LATER?",
      answer:
        "Yes, we build websites with user-friendly content management systems that allow you to easily update content, add new pages, and manage your site independently. We also provide training and documentation to ensure you're comfortable managing your website.",
    },
  ],
}: FaqsAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-0">
      {faqs.map((faq, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: index * 0.05 }}
          viewport={{ once: true }}
          className="border-t border-primary/20 last:border-b last:border-primary/20"
        >
          <motion.button
            onClick={() => toggleAccordion(index)}
            className="flex w-full items-center justify-between py-6 text-left transition-colors hover:text-gray-300"
            aria-expanded={openIndex === index}
            aria-controls={`faq-answer-${index}`}
          >
            <h3 className="text-white text-base font-light tracking-wider pr-4 uppercase">
              {faq.question}
            </h3>
            <motion.div
              animate={{ rotate: openIndex === index ? 45 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-shrink-0 text-gray-400"
              aria-hidden="true"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 6v12m6-6H6"
                />
              </svg>
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                id={`faq-answer-${index}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <motion.div
                  initial={{ y: -10 }}
                  animate={{ y: 0 }}
                  exit={{ y: -10 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  className="pb-6"
                >
                  <div className="text-gray-400 text-base leading-relaxed max-w-3xl">
                    {typeof faq.answer === "string" ? (
                      <p>{faq.answer}</p>
                    ) : (
                      faq.answer
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
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
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="container mx-auto max-w-7xl px-6 lg:px-16 pt-20 mb-16"
      >
        <div className="flex items-center justify-between pb-6 border-b border-primary/20">
          <h2 className="text-white text-sm font-light tracking-wider uppercase">
            WHY YOU SHOULD WORK WITH ME
          </h2>
          <span className="text-gray-500 text-sm tracking-wider">(04)</span>
        </div>
      </motion.div>

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
            <FaqsAccordion />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
